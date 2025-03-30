import {toast} from "sonner";
import {InferRequestType, InferResponseType} from "hono";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {client} from "@/lib/rpc";

// @ts-ignore
type ResponseType = InferResponseType<typeof client.api.tasks["$delete"], 200>;
// @ts-ignore
type RequestType = InferRequestType<typeof client.api.tasks["$delete"]>;

export const useDeleteTask = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async (taskId) => {
            // @ts-ignore
            const response = await client.api.tasks["$delete"]({
                json: {
                    taskId
                }
            });

            if (!response.ok) {
                throw new Error("Failed to delete task");
            }
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Task delete");
            queryClient.invalidateQueries({queryKey: ["tasks"]});
        },
        onError: () => {
            toast.error("Failed to delete task");
        },
    });
};
