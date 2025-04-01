import {toast} from "sonner";
import {InferRequestType, InferResponseType} from "hono";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {client} from "@/lib/rpc";
import {useRouter} from "next/navigation";

// @ts-ignore
type ResponseType = InferResponseType<typeof client.api.tasks["$patch"], 200>;
// @ts-ignore
type RequestType = InferRequestType<typeof client.api.tasks["$patch"]>;

export const useUpdateTask = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({json}) => {
            // @ts-ignore
            const response = await client.api.tasks["$patch"]({json});


            if (!response.ok) {
                if (response.status === 403){
                    toast.error("Task is locked");
                    return;
                }
                toast.error("Failed to update task");
                return;
            }
            return response.json();
        },
        onSuccess: ({data}) => {
            toast.success("Task updated");
            router.refresh();
            queryClient.invalidateQueries({queryKey: ["tasks"]});
            queryClient.invalidateQueries({queryKey: ["task",data.$id]});
        },
    });
};
