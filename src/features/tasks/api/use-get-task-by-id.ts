import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/rpc";

interface UseGetTaskByIdProps {
    taskId: string;
}

export const useGetTaskById = ({
                                taskId
                            }: UseGetTaskByIdProps) => {
    return useQuery({
        queryKey: [
            "task",taskId
        ],
        queryFn: async () => {
            // @ts-ignore
            const response = await client.api.tasks.getTaskById.$get({
                query:{
                    taskId
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch task");
            }

            const {data} = await response.json();
            console.log("data", data);
            return data;
        },
    });
};
