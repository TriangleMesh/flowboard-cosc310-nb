import { useParams } from "next/navigation";

export const useInviteCode = () => {
    const params = useParams();
    return params.InviteCode as string; // Use "workspaceId", not "useWorkspaceId"
};
