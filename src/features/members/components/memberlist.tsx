"use client";

import { useGetMembers } from "@/features/members/api/use-get-members";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace-by-id";
import React from "react";
import {useUpdateMemberRole} from "@/features/members/api/use-update-member-role";

interface MemberListProps {
    workspaceId: string;
}

export const MemberList = ({ workspaceId }: MemberListProps) => {
    const { data: membersData, isLoading, isError, error } = useGetMembers({ workspaceId });
    const deleteMemberMutation = useDeleteMember();
    const { data: currentUser } = useCurrent();
    const { data: workspace, isLoading: isWorkspaceLoading, isError: isWorkspaceError } = useGetWorkspace(workspaceId);
    const updateRoleMutation = useUpdateMemberRole();
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

    // Sort members so that ADMIN is at the top
    const members = membersData?.documents || [];
    const sortedMembers = [...members].sort((a, b) => {
        if (a.role === "ADMIN" && b.role !== "ADMIN") {
            return -1; // Move ADMIN to the top
        }
        if (a.role !== "ADMIN" && b.role === "ADMIN") {
            return 1; // Move non-ADMINs down
        }
        return 0; // Keep the same order for other roles
    });

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
            {sortedMembers.map((member: any) => {
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
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDelete(member.$id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await updateRoleMutation.mutateAsync({
                                                workspaceId,
                                                memberId: member.$id,
                                                role: "ADMIN",
                                            });
                                            alert("Member promoted to admin successfully");
                                        } catch (error) {
                                            alert("Failed to promote member");
                                        }
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Make Admin
                                </button>
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};

export default MemberList;