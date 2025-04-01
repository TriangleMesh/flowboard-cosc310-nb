"use client";

import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace-by-id";
import { useCurrent } from "@/features/auth/api/use-current";
import React from "react";

interface AdminPageProps {
    params: {
        workspaceId: string; // Assuming the workspace ID is passed as a route parameter
    };
}



export default function AdminPage({ params }: AdminPageProps) {
    const { workspaceId } = params;

    // Fetch the current user data
    const { data: currentUser, isLoading: isUserLoading, isError: isUserError } = useCurrent();

    // Fetch the workspace data
    const { data: workspace, isLoading: isWorkspaceLoading, isError: isWorkspaceError } = useGetWorkspace(workspaceId);

    // Determine if the current user is the admin
    const isAdmin = workspace?.userId === currentUser?.$id;

    const AdminContent = () => (
        <div>
            <h1>Admin Page</h1>
            <p>Welcome, Admin! You have access to this page.</p>
            {/* Add your admin-specific content here */}
        </div>
    );

    const NonAdminContent = () => (
        <div>
            <h1>Non-Admin Page</h1>
            <p>Only admin can access this Page.</p>
        </div>
    );

// Render based on isAdmin



    // Handle loading and error states
    if (isWorkspaceLoading || isUserLoading) {
        return <div>Loading...</div>;
    }

    if (isWorkspaceError || isUserError) {
        return (
            <div>
                <h1>Error</h1>
                <p>Failed to load data. Please try again later.</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }


    if (isAdmin) {
        return <AdminContent />;
    } else {
        return <NonAdminContent />;
    }

}