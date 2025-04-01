"use client";

import React, { useMemo } from "react";
import { Droppable, Draggable, DragDropContext } from "react-beautiful-dnd";
import { Task, TaskStatus } from "@/features/tasks/types";
import { useUpdateTask } from "../api/use-update-tasks";
import {snakeCaseToTitleCase} from "@/lib/utils";

interface KanbanViewProps {
    tasks: Task[];
}

const KanbanView = ({ tasks }: KanbanViewProps) => {
    const updateTask = useUpdateTask();

    const processedTasks = useMemo(() => {
        return tasks.map((task) => ({
            ...task,
            id: task.$id || task.id, // Ensure each task has a unique id
        }));
    }, [tasks]);

    // Group tasks by status
    const groupedTasks = useMemo(() => {
        const groups: Record<TaskStatus, Task[]> = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.DONE]: [],
        };
        processedTasks.forEach((task) => {
            const status = task.status || TaskStatus.BACKLOG; // If no status, default to "Backlog"
            if (groups[status]) {
                groups[status].push(task);
            }
        });
        return groups;
    }, [processedTasks]);

    // Callback function when dragging ends
    const onDragEnd = (result: never) => {
        const { destination, source} = result;

        // If there is no destination, return directly
        if (!destination) return;

        // If the task hasn't moved to a new position, return directly
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Get the task lists for the source and destination statuses
        const sourceStatus = source.droppableId as TaskStatus;
        const destinationStatus = destination.droppableId as TaskStatus;

        const sourceTasks = groupedTasks[sourceStatus];
        const destinationTasks = groupedTasks[destinationStatus];

        // Remove the task from the source status
        const [removedTask] = sourceTasks.splice(source.index, 1);

        // Insert the task into the new position in the destination status
        destinationTasks.splice(destination.index, 0, removedTask);

        // Call the backend API to update the task status
        updateTask.mutate(
            {
                taskId: removedTask.id,
                updates: { status: destinationStatus },
            },
            {
                onSuccess: () => {
                    console.log("Task updated successfully");
                },
                onError: () => {
                    console.error("Failed to update task");
                },
            }
        );
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {/* Set the parent container styles */}
            <div className="flex flex-nowrap overflow-x-auto p-4">
                {Object.entries(groupedTasks).map(([status, tasks]) => (
                    <Droppable key={status} droppableId={status}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex-1 min-w-[200px] bg-gray-100 rounded-lg p-4 shadow-sm m-2"
                            >
                                {/* Status title */}
                                <h3 className="text-lg font-semibold mb-4">{snakeCaseToTitleCase(status as string)}</h3>
                                {/* Task list */}
                                {tasks.map((task, index) => (
                                    <Draggable
                                        key={task.id} // Ensure task.id exists
                                        draggableId={task.id.toString()} // Ensure task.id exists
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="bg-white p-4 rounded-md shadow-sm mb-2 cursor-move"
                                            >
                                                {/* Display only the task name */}
                                                <p className="font-medium">{task.name}</p>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
};

export default KanbanView;