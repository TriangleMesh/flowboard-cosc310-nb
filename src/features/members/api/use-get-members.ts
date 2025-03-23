import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";


interface UseGetMembersProps {
    workspaceId: string;
}

// TODO: Find a fix for client error, FB-3025 will contain actual code, this should be removed as its a boilerplate
export const useGetMembers = ({ workspaceId }: UseGetMembersProps) => {
    return useQuery({
        queryKey: ["members", workspaceId],
        queryFn: async () => {
            // @ts-ignore
            const response = await client.api.members.$get({
                query: { workspaceId },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch members");
            }

            const { data } = await response.json();
            return data;
        },
    });
};
