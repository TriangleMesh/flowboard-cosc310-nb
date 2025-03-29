import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { TaskStatus } from "../types";

interface UseGetTasksProps {
    workspaceId: string;
    projectId?: string | null;
    status?: TaskStatus | null;
    assigneeId?: string | null;
    dueDate?: string | null;
}

export const useGetTasks = ({
                                workspaceId,
                                projectId,
                                status,
                                assigneeId,
                                dueDate,
                            }: UseGetTasksProps) => {
    return useQuery({
        queryKey: [
            "tasks",
            workspaceId,
            projectId,
            status,
            assigneeId,
            dueDate,
        ],
        queryFn: async () => {
            try {
                const response = await client.api.tasks.$get({
                    query: {
                        workspaceId,
                        projectId: projectId ?? undefined,
                        status: status ?? undefined,
                        assigneeId: assigneeId ?? undefined,
                        dueDate: dueDate ?? undefined,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch tasks");
                }

                const { data } = await response.json();
                return data;
            } catch (error) {
                console.error("Error fetching tasks:", error);
                throw error;
            }
        },
    });
};