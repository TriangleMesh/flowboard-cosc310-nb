import {useQuery} from "@tanstack/react-query";

import {client} from "@/lib/rpc"; 
interface useGetProjectsProps {
workspaceId: string;
};
export const useGetProjects = ({
workspaceId,
}:useGetProjectsProps) => {
    return useQuery({
        queryKey: ["projects",workspaceId],
        queryFn: async () => {
            // TODO: to find out
            // @ts-expect-error client type is actually known
            const response = await client.api.projects.$get({
                query: {
                    workspaceId,
                },
            });

            if (!response.ok) {
                throw new Error("failed to fetch projects");
            }

            const {data} = await response.json();

            return data;
        },
    });
};
