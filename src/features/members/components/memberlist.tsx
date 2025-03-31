"use client";

import { useGetMembers } from "@/features/members/api/use-get-members";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace-by-id";
import React from "react";


interface MemberListProps {
    workspaceId: string;
}

export const MemberList = ({ workspaceId }: MemberListProps) => {
    const { data: membersData, isLoading, isError, error } = useGetMembers({ workspaceId });
    const deleteMemberMutation = useDeleteMember();
    const { data: currentUser } = useCurrent();
    const { data: workspace, isLoading: isWorkspaceLoading, isError: isWorkspaceError } = useGetWorkspace(workspaceId);

    // Debugging output
    console.log("Workspace:", workspace);
    console.log("Is Workspace Loading:", isWorkspaceLoading);

    // Determine if the current user is the admin
    const isAdmin = workspace?.userId === currentUser?.$id;
    console.log("userId" + workspace?.userId);
    console.log("currentUser" + currentUser?.$id);

    if (isWorkspaceLoading || isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    if (isError || isWorkspaceError) {
        return (
            <div className="p-6 text-red-500">
                {error?.message || "Failed to fetch members or workspace"}
            </div>
        );
    }

    const members = membersData?.documents || [];

    const handleDelete = async (memberId: string) => {
        if (confirm("Are you sure you want to delete this member?")) {
            try {
                await deleteMemberMutation.mutateAsync({ workspaceId, memberId });
                alert("Member deleted successfully");
            } catch (err) {
                alert("Failed to delete member");
            }
        }
    };

    return (
        <ul>
            {members.map((member: any) => {
                const isMemberAdmin = member.role === "ADMIN";

                return (
                    <li
                        key={member.$id}
                        className="flex items-center justify-between py-3 px-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                        <div>
                            <p className="font-medium">{member.name || "Unknown User"}</p>
                            <p className="text-sm text-gray-500">{member.email || "unknown@example.com"}</p>
                            <p className="text-sm text-blue-500 capitalize">{member.role || "unknown role"}</p>
                        </div>
                        {isAdmin && !isMemberAdmin && (
                            <button
                                onClick={() => handleDelete(member.$id)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};

export default MemberList;
