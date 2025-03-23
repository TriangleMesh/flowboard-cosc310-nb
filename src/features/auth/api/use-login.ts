import {useMutation, useQueryClient} from "@tanstack/react-query";
import {InferRequestType, InferResponseType} from "hono";
import {client} from "@/lib/rpc";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
type ResponseType = InferResponseType<typeof client.api.auth.login["$post"]>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
type RequestType = InferRequestType<typeof client.api.auth.login["$post"]>;

export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();


    return useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({json}) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const response = await client.api.auth.login["$post"]({json});
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Logged in");
            router.refresh();
            queryClient.invalidateQueries({queryKey: ["current"]});
        },
        onError: () => {
            toast.error("Failed to log in");
        },
    });
}