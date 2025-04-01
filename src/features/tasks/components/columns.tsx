"use client";

import {ColumnDef} from "@tanstack/react-table";
import {ArrowUpDown, MoreVertical} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ProjectAvatar} from "@/features/projects/components/project-avatar";
import {TaskDate} from "./task-date"
import {Badge} from "@/components/ui/badge";
import {TaskActions} from "./task-actions"
import {Task} from "../types";
import React from "react"
import {snakeCaseToTitleCase} from "@/lib/utils";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";
import {MemberAvatar} from "@/features/members/components/member-avatar";

export const useAssigneesData = () => {
    const workspaceId = useWorkspaceId();
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

    // Transform members into options format
    const memberOptions = members?.documents.map((member) => ({
        value: member.$id,
        label: member.name,
    })) || [];

    return { memberOptions, isLoadingMembers };
};

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: "name",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Task Name
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            );
        },
        cell: ({row}) => {
            const name = row.original.name;
            return <p className="line-clamp-1">{name}</p>;
        },
    },
    {
        accessorKey: "project",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Project
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            );
        },
        cell: ({row}) => {
            const project = row.original.project;
            return (
                <div className="flex items-center gap-x-2 text-sm font-medium">
                    <ProjectAvatar
                        className="size-6"
                        name={project?.name}
                        image={project?.ImageUrl}
                    />
                    <p className="line-clamp-1">{project?.name}</p>
                </div>
            );
        },
    }, {
        accessorKey: "assigneesId",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Assignees
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const assigneesId = row.original.assigneesId;

            // Use the custom hook to fetch assignees data
            const { memberOptions, isLoadingMembers } = useAssigneesData();

            // Handle loading state
            if (isLoadingMembers) {
                return <p>Loading assignees...</p>;
            }

            // Handle empty assigneesId
            if (!assigneesId || assigneesId.length === 0) {
                return;
            }

            // Render assignees
            return assigneesId.map((memberId) => {
                // Find the member's name from memberOptions
                const member = memberOptions.find((option) => option.value === memberId);
                const name = member?.label || "Unknown User";

                // Render the name with a unique key
                return (
                    <div className="flex items-center gap-x-2 text-sm font-medium">
                        <MemberAvatar name={name} />
                        <p className="line-clamp-1">{name}</p>
                    </div>
                );
            });
        },
    },
    {
        accessorKey: "dueDate",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Due Date
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            );
        },
        cell: ({row}) => {
            const dueDate = row.original.dueDate;
            return <TaskDate value={dueDate}/>;
        },
    },
    {
        accessorKey: "status",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            );
        },
        cell: ({row}) => {
            const status = row.original.status;
            // If using snakeCaseToTitleCase:
            return <Badge variant={status}>{snakeCaseToTitleCase(status)}</Badge>;
            //   return <Badge variant={status}>{status}</Badge>;
        },
    }, {
        accessorKey: "priority",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Priority
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            );
        },
        cell: ({row}) => {
            const priority = row.original.priority;
            if (!priority || priority === "NULL") {
                return <Badge variant="default">No Priority</Badge>;
            }
            // If using snakeCaseToTitleCase:
            return <Badge>{snakeCaseToTitleCase(priority)}</Badge>;
            //   return <Badge variant={status}>{status}</Badge>;
        },
    }, {
        accessorKey: "locked",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Lock Status
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            );
        },
        cell: ({row}) => {
            const locked = row.original.locked;
            if (locked) {
                return <Badge variant="destructive">Locked</Badge>;
            } else {
                return;
            }
        },
    }, {
        accessorKey: "description",
        header: ({column}) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Description
                    <ArrowUpDown className="ml-2 h-4 w-4"/>
                </Button>
            );
        },
        cell: ({row}) => {
            const description = row.original.description;
            if (description) {
                return <p>{description}</p>;
            } else {
                return;
            }
        },
    },
    {
        id: "actions",
        cell: ({row}) => {
            const id = row.original.$id;
            const projectId = row.original.projectId;

            return (
                <TaskActions id={id} projectId={projectId}>
                    <Button variant="ghost" className="size-8 p-0">
                        <MoreVertical className="size-4"/>
                    </Button>
                </TaskActions>
            );
        },
    },
];
