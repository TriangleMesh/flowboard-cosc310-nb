import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseDeleteMemberProps {
    workspaceId: string;
    memberId: string;
}

export const useDeleteMember = () => {
    return useMutation({
        mutationFn: async ({ workspaceId, memberId }: UseDeleteMemberProps) => {
            // @ts-ignore
            const response = await client.api.members.$delete({
                query: { workspaceId, memberId },
            });

            if (!response.ok) {
                throw new Error("Failed to delete member");
            }

            return response.json();
        },
    });
};