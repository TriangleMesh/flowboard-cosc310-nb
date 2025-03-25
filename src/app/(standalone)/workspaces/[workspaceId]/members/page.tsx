import { getCurrent } from "@/features/auth/queries";
import { getWorkspace } from "@/features/workspaces/queries";
import { redirect } from "next/navigation";
import {MemberList} from "@/features/members/components/memberlist";
import React from "react";

interface WorkspaceIdMembersPageProps {
    params: { workspaceId: string };
}

const WorkspaceIdMembersPage = async ({ params }: WorkspaceIdMembersPageProps) => {

    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    const workspace = await getWorkspace({ workspaceId: params.workspaceId });
    if (!workspace) redirect("/not-found");

    return (
        <div className="w-full lg:max-w-xl p-6 bg-white shadow-md rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Workspace Members</h1>
            <MemberList workspaceId={params.workspaceId} />
        </div>
    );
};

export default WorkspaceIdMembersPage;