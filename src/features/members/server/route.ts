import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Query } from "node-appwrite";
import { z } from "zod";
import { createAdminClient } from "@/lib/appwrite";

const app = new Hono();

// Get all members for a workspace
app.get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");
        const { workspaceId } = c.req.valid("query");

        // Check if the user is a member of the workspace
        const userMembership = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.equal("userId", user.$id),
            ]
        );

        if (userMembership.documents.length === 0) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        // Get all members of the workspace
        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("workspaceId", workspaceId)]
        );

        // Get user details for each member
        const { users } = await createAdminClient();

        const populatedMembers = await Promise.all(
            members.documents.map(async (member) => {
                try {
                    const user = await users.get(member.userId);
                    return {
                        ...member,
                        name: member.name || user.name, // Use member.name if it exists, otherwise use user.name
                        email: user.email,
                    };
                } catch (error) {
                    // If user not found, use default values
                    return {
                        ...member,
                        name: member.name || "Unknown User", // Use member.name if it exists, otherwise use "Unknown User"
                        email: "unknown@example.com",
                    };
                }
            })
        );

        return c.json({ data: { documents: populatedMembers } });
    }
);

// Delete a member from a specific workspace
app.delete(
    "/",
    sessionMiddleware,
    zValidator(
        "query",
        z.object({
            workspaceId: z.string(), // Ensure workspaceId is provided in the query
            memberId: z.string(),   // Ensure memberId is provided in the query
        })
    ),
    async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        // Check if the session is valid
        if (!user) {
            return c.json({ error: "Unauthorized: Invalid session key" }, 401);
        }

        try {
            const { workspaceId, memberId } = c.req.valid("query");

            // Step 1: Fetch the member document to check if it exists and belongs to the workspace
            console.log("Received request:", { workspaceId, memberId });

            const member = await databases.getDocument(DATABASE_ID, MEMBERS_ID, memberId);

            if (!member || member.workspaceId !== workspaceId) {
                return c.json({ error: "Member not found or does not belong to this workspace" }, 404);
            }

            // Step 2: Check if the current user is authorized to delete this member
            const userMembership = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("userId", user.$id),
                ]
            );

            if (userMembership.documents.length === 0) {
                return c.json({ error: "Unauthorized: User is not a member of this workspace" }, 401);
            }

            // Step 3: Delete the member
            await databases.deleteDocument(DATABASE_ID, MEMBERS_ID, memberId);

            return c.json({ message: "Member deleted successfully" });
        } catch (error) {
            console.error("Error deleting member:", error);
            return c.json({ error: "Failed to delete member" }, 500);
        }
    }
);

// Update a member's role in a specific workspace
app.patch(
    "/",
    sessionMiddleware,
    zValidator(
        "query",
        z.object({
            workspaceId: z.string(), // Ensure workspaceId is provided in the query
            memberId: z.string(),   // Ensure memberId is provided in the query
        })
    ),
    zValidator(
        "json",
        z.object({
            role: z.enum(["MEMBER", "ADMIN"]), // Ensure role is valid
        })
    ),
    async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");
        const { workspaceId, memberId } = c.req.valid("query");
        const { role } = c.req.valid("json");

        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        try {
            // Step 1: Check if the current user is an admin of the workspace
            const userMembership = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("userId", user.$id),
                    Query.equal("role", "ADMIN"), // Only admins can update roles
                ]
            );

            if (userMembership.documents.length === 0) {
                return c.json({ error: "Unauthorized: Only admins can update roles" }, 403);
            }

            // Step 2: Fetch the member document to check if it exists and belongs to the workspace
            const member = await databases.getDocument(DATABASE_ID, MEMBERS_ID, memberId);

            if (!member || member.workspaceId !== workspaceId) {
                return c.json({ error: "Member not found or does not belong to this workspace" }, 404);
            }

            // Step 3: If the new role is not ADMIN, ensure there is at least one other admin
            if (role !== "ADMIN") {
                const existingAdmins = await databases.listDocuments(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [
                        Query.equal("workspaceId", workspaceId),
                        Query.equal("role", "ADMIN"),
                    ]
                );

                // Check if the current member is the only admin
                const isLastAdmin =
                    existingAdmins.documents.length === 1 &&
                    existingAdmins.documents[0].$id === memberId;

                if (isLastAdmin) {
                    return c.json(
                        { error: "Cannot demote the last admin. There must be at least one admin in the workspace." },
                        400
                    );
                }
            }

            // Step 4: If the new role is ADMIN, demote any existing admin to MEMBER
            if (role === "ADMIN") {
                const existingAdmins = await databases.listDocuments(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [
                        Query.equal("workspaceId", workspaceId),
                        Query.equal("role", "ADMIN"),
                    ]
                );

                for (const admin of existingAdmins.documents) {
                    if (admin.$id !== memberId) {
                        // Demote the existing admin to MEMBER
                        await databases.updateDocument(DATABASE_ID, MEMBERS_ID, admin.$id, {
                            role: "MEMBER",
                        });
                    }
                }

                // Step 5: Update the workspaces table with the new admin's userId
                await updateWorkspace(databases, workspaceId, { userId: member.userId });
            }

            // Step 6: Update the member's role
            await databases.updateDocument(DATABASE_ID, MEMBERS_ID, memberId, {
                role, // Update the role field
            });

            return c.json({ message: "Member role updated successfully" });
        } catch (error) {
            console.error("Error updating member role:", error);
            return c.json({ error: "Failed to update member role" }, 500);
        }
    }
);
// Helper function to update workspace details
const updateWorkspace = async (
    databases: any,
    workspaceId: string,
    updates: { name?: string; imageUrl?: string; userId?: string }
) => {
    try {
        // Fetch the workspace to ensure it exists
        const workspace = await databases.getDocument(DATABASE_ID, WORKSPACES_ID, workspaceId);
        if (!workspace) {
            throw new Error("Workspace not found");
        }

        // Update the workspace document with the provided updates
        return await databases.updateDocument(DATABASE_ID, WORKSPACES_ID, workspaceId, updates);
    } catch (error) {
        console.error("Error updating workspace:", error);
        throw error;
    }
};

export default app;