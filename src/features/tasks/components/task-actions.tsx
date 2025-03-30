import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

import {ExternalLinkIcon, PencilIcon, TrashIcon} from "lucide-react";
import {useUpdateTaskModal} from "@/features/tasks/hooks/use-update-task-modal";
import {useDeleteTask} from "@/features/tasks/api/use-delete-tasks";

interface TaskActionsProps {
    id: string;
    projectId: string;
    children: React.ReactNode;
}

export const TaskActions = ({id, projectId, children}: TaskActionsProps) => {
    const {open} = useUpdateTaskModal();

    const {mutate: deleteTask} = useDeleteTask(); // Destructure the mutation function
    const handleDeleteTask = () => {
        deleteTask(id); // Pass the task ID to the mutation
    };


    return (
        <div className="flex justify-end">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    {/* Task Details */}
                    <DropdownMenuItem onClick={() => {
                    }} className="font-medium p-[10px]">
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2"/>
                        Task Details
                    </DropdownMenuItem>

                    {/* Open Project */}
                    <DropdownMenuItem onClick={() => {
                    }} className="font-medium p-[10px]">
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2"/>
                        Open Project
                    </DropdownMenuItem>

                    {/* Edit Task */}
                    <DropdownMenuItem onClick={() => open(id)} className="font-medium p-[10px]">
                        <PencilIcon className="size-4 mr-2 stroke-2"/>
                        Edit Task
                    </DropdownMenuItem>

                    {/* Delete Task */}
                    <DropdownMenuItem
                        onClick={handleDeleteTask} // Attach the delete handler
                        className={`text-amber-700 focus:text-amber-700 font-medium p-[10px]`}
                    >
                        <TrashIcon className="size-4 mr-2 stroke-2"/>
                        Delete Task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
