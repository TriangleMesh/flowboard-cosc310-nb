import {useMutation, useQueryClient} from "@tanstack/react-query";
import {InferRequestType, InferResponseType} from "hono";
import {client} from "@/lib/rpc";
import {toast} from "sonner";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["join"][$post], 200>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["join"][$post]>;

export const useJoinWorkspace = () => {
    const queryClient = useQueryClient();
    return useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({param, json}) => {
            // @ts-expect-error aa
            const response = await client.api.workspaces[":workspaceId"]["join"]["$post"]({param, json});

            if (!response.ok) {
                throw new Error("Failed to join workspace");
            }

            return await response.json();

        },
        onSuccess: (data) => {
            toast.success("Joined workspace");
            queryClient.invalidateQueries({queryKey: ["workspaces"]});
            queryClient.invalidateQueries({queryKey: ["workspace", data.$id]});
        },
        onError: () => {
            toast.error("Failed to join workspace");
        }
    });
}