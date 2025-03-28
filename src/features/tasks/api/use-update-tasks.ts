import {toast} from "sonner";
import {InferRequestType, InferResponseType} from "hono";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {client} from "@/lib/rpc";

// @ts-ignore
type ResponseType = InferResponseType<typeof client.api.tasks["$patch"], 200>;
// @ts-ignore
type RequestType = InferRequestType<typeof client.api.tasks["$patch"]>;

export const useUpdateTask = () => {
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json}) => {
            // @ts-ignore
            const response = await client.api.tasks["$patch"]({json});

            if (!response.ok) {
                throw new Error("Failed to update task");
            }
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Task updated");
            queryClient.invalidateQueries({queryKey: ["tasks"]});
            queryClient.invalidateQueries({queryKey: ["getTaskById"]});
        },
        onError: () => {
            toast.error("Failed to update task");
        },
    });
};
