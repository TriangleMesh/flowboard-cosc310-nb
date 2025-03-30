import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

export const useGetWorkspace = (workspaceId: string) => {
    return useQuery({
        queryKey: ["workspace", workspaceId],
        queryFn: async () => {
            try {
                const response = await client.api.workspaces.$get({ params: { id: workspaceId } });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }

                const { data } = await response.json();
                console.log("API Response Data:", data); // Debugging output

                // Find the workspace with matching $id
                const workspace = data.documents?.find((doc: any) => doc.$id === workspaceId);
                if (!workspace) {
                    throw new Error("Workspace not found");
                }

                return workspace;
            } catch (err) {
                console.error("Error fetching workspace:", err);
                throw err;
            }
        },
        enabled: !!workspaceId, // Only run the query if workspaceId is provided
    });
};