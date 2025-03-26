"use client";

import { useGetMembers } from "@/features/members/api/use-get-members";
import { useDeleteMember } from "@/features/members/api/use-delete-member";

import React from "react";

interface MemberListProps {
    workspaceId: string;
}

export const MemberList = ({ workspaceId }: MemberListProps) => {

    const { data, isLoading, isError, error } = useGetMembers({ workspaceId });
    const deleteMemberMutation = useDeleteMember();

    if (isLoading) {
        return <div className="p-6">Loading...</div>;
    }

    if (isError) {
        return <div className="p-6 text-red-500">{error?.message || "Failed to fetch members"}</div>;
    }

    const members = data?.documents || [];
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
            {members.map((member: any) => (
                <li
                    key={member.$id}
                    className="flex items-center justify-between py-3 px-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                    <div>
                        <p className="font-medium">{member.name || "Unknown User"}</p>
                        <p className="text-sm text-gray-500">{member.email || "unknown@example.com"}</p>
                        <p className="text-sm text-blue-500 capitalize">{member.role || "unknown role"}</p>
                    </div>
                    <button
                        onClick={() => handleDelete(member.$id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    );
};

export default MemberList;