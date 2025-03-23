import {useMutation, useQueryClient} from "@tanstack/react-query";
import {InferResponseType} from "hono";
import {client} from "@/lib/rpc";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
type ResponseType = InferResponseType<typeof client.api.auth.logout["$post"]>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment


export const useLogout = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    return useMutation<
        ResponseType,
        Error
    >({
        mutationFn: async () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const response = await client.api.auth.logout["$post"]();
            return await response.json();
        },
        onSuccess: () => {
            toast.success("Logged out");
            router.refresh();
            queryClient.invalidateQueries({queryKey: ["current"]});
            queryClient.invalidateQueries({queryKey: ["workspaces"]});
        }, onError: () => {
            toast.error("Failed to log out");
        },
    });
};