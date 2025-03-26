import {useParams} from "next/navigation";

export const useInviteCode = () => {
    const result = useParams();
    return result.inviteCode;
};
