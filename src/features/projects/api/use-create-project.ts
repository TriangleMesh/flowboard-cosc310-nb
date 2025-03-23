import {useMutation, useQueryClient} from "@tanstack/react-query";
import {InferRequestType, InferResponseType} from "hono";
import {client} from "@/lib/rpc";
import {toast} from "sonner";


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
type ResponseType = InferResponseType<typeof client.api.projects["$post"],200>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
type RequestType = InferRequestType<typeof client.api.projects["$post"]>;

export const useCreateProject = () => {
    const queryClient = useQueryClient();
    return useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({form}) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
                const response = await client.api.projects["$post"]({form});

                if (!response.ok) {
                    throw new Error("failed to create project");
                }
                return await response.json();
            },
        
        onSuccess: () => {
            toast.success("Project created");
            queryClient.invalidateQueries({ queryKey: ["projects"]});
        },
        onError: () => {
            toast.error("Failed to create Project");
        }
    });
}