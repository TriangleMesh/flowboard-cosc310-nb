import {useMutation, useQueryClient} from "@tanstack/react-query";
import {InferRequestType, InferResponseType} from "hono";
import {client} from "@/lib/rpc";
import {toast} from "sonner";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["$patch"], 200>;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["$patch"]>; 
export const useUpdateWorkspace = () => {
    const queryClient = useQueryClient(); 
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ form, param }) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const response = await client.api.workspaces[":workspaceId"]["$patch"]({ form, param });
            if (!response.ok) {
                throw new Error("Failed to update workspace");
            }
            return await response.json();
        },
        onSuccess: ({ data }) => {
            toast.success("Workspace updated");
            queryClient.invalidateQueries({ queryKey: ["workspaces"] }); 
            queryClient.invalidateQueries({ queryKey: ["workspace", data.$id] }); 
        },
        onError: () => {
            toast.error("Failed to update workspace"); 
        },
    });
    return mutation;
};