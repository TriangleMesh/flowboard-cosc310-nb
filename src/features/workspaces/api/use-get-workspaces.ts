import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/rpc"; // Assuming it's exported with the type above

export const useGetWorkspace = () => {
    return useQuery({
        queryKey: ["workspaces"],
        queryFn: async () => {
            // @ts-expect-error client type is actually known
            const response = await client.api.workspaces.$get();
            console.log(response);

            if (!response.ok) {
                throw new Error("failed to fetch workspaces");
            }

            const {data} = await response.json();

            return data;
        },
    });
};


// export const useGetWorkspaces = () => {
//     return useQuery({
//         queryKey: ["workspaces"],
//         queryFn: async () => {
//             // @ts-expect-error client type is actually known
//             const response = await client.api.workspaces.$get();
//             console.log(response);

//             if (!response.ok) {
//                 throw new Error("failed to fetch workspaces");
//             }

//             const {data} = await response.json();

//             return data;
//         },
//     });
// };