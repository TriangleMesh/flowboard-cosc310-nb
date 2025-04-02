"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/ui/dotted-separator";
import { PlusIcon, Loader } from "lucide-react";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useGetTasks } from "../api/use-get-tasks";
import { useQueryState } from "nuqs";
import { DataFilters } from "./data-filters";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useTaskFilters } from "../hooks/use-task-filters";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import KanbanView from "./kanban-view";
import React from "react";
import TaskProgressMetrics from "@/features/tasks/components/task-progress-metrics";


export const TaskViewSwitcher = () => {
    const [view, setView] = useQueryState("task-view", {
        defaultValue: "table",
    });

    const [{ projectId, status, assigneeId, dueDate,priority,assigneesId }] = useTaskFilters();

    const workspaceId = useWorkspaceId();
    const { open } = useCreateTaskModal();

    const { data: tasks, isLoading: isLoadingTasks, error } = useGetTasks({
        workspaceId,
        projectId,
        status,
        assigneeId,
        dueDate,
        priority,
        assigneesId
    });

    return (
        <Tabs defaultValue={view} onValueChange={setView} className="flex-1 w-full border rounded-lg">
            <div className="h-full flex flex-col overflow-auto p-4">
                {/* Tabs List */}
                <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
                    <TabsList className="w-full lg:w-auto">
                        <TabsTrigger className="h-8 w-full lg:w-auto" value="table">
                            Table
                        </TabsTrigger>
                        <TabsTrigger className="h-8 w-full lg:w-auto" value="kanban">
                            Kanban
                        </TabsTrigger>
                        <TabsTrigger className="h-8 w-full lg:w-auto" value="analytics">
                            Task Analytics
                        </TabsTrigger>
                    </TabsList>
                    <Button onClick={open} size="sm" className="w-full lg:w-auto">
                        <PlusIcon className="size-4 mr-2" />
                        New Task
                    </Button>
                </div>
                <DottedSeparator className="my-4" />
                <DataFilters />
                <DottedSeparator className="my-4" />

                {/* Content */}
                {isLoadingTasks ? (
                    <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
                        <Loader className="size-5 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center text-destructive">
                        Failed to load tasks. Please try again later.
                    </div>
                ) : tasks?.documents?.length === 0 ? (
                    <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                        No tasks found.
                    </div>
                ) : (
                    <>
                        <TabsContent value="table" className="mt-0">
                            <DataTable columns={columns} data={tasks?.documents ?? []} />
                        </TabsContent>

                        {/* Kanban View */}
                        <TabsContent value="kanban" className="mt-0">
                            <KanbanView tasks={tasks?.documents ?? []} />
                        </TabsContent>

                        {/* Task Analytics */}
                        <TabsContent value="analytics" className="mt-0">
                            <TaskProgressMetrics tasks={tasks?.documents ?? []} />
                        </TabsContent>
                    </>
                )}
            </div>
        </Tabs>
    );
};