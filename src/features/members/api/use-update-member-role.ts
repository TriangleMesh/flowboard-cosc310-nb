import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface UpdateMemberRoleParams {
    workspaceId: string;
    memberId: string;
    role: "ADMIN" | "MEMBER";
}

export const useUpdateMemberRole = () => {
    return useMutation({
        mutationFn: async ({ workspaceId, memberId, role }: UpdateMemberRoleParams) => {
            const res = await axios.patch(
                `/api/members?workspaceId=${workspaceId}&memberId=${memberId}`,
                { role }
            );
            return res.data;
        },
    });
};