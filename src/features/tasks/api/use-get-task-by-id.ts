import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/rpc";

interface UseGetTaskByIdProps {
    id: string;
}

export const useGetTaskById = ({
                                id
                            }: UseGetTaskByIdProps) => {
    return useQuery({
        queryKey: [
            "getTaskById"
        ],
        queryFn: async () => {
            // @ts-ignore
            const response = await client.api.tasks.getTaskById.$get({
                query: { id },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }

            const {data} = await response.json();
            console.log("data", data);
            return data;
        },
    });
};
