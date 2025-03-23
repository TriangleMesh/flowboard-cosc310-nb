import {useMutation, useQueryClient} from "@tanstack/react-query";
import {InferRequestType, InferResponseType} from "hono";
import {client} from "@/lib/rpc";
import {toast} from "sonner";
import { useRouter } from "next/navigation";


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
type ResponseType = InferResponseType<typeof client.api.projects[":projectId"]["$patch"],200>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
type RequestType = InferRequestType<typeof client.api.projects[":projectId"]["$patch"]>;

export const useUpdateProject = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    return useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ form, param}) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
                const response = await client.api.projects[":projectId"]["$patch"]({ form, param});

                if (!response.ok) {
                    throw new Error("failed to update project");
                }
                return await response.json();
            },
        
        onSuccess: ({ data }) => {
            toast.success("Project updated");
            router.refresh();
            queryClient.invalidateQueries({ queryKey: ["projects"]});
            queryClient.invalidateQueries({ queryKey: ["projects", data.$id]});
        },
        onError: () => {
            toast.error("Failed to update Project");
        }
    });
}