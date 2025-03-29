import { DATABASE_ID, MEMBERS_ID } from "@/config";
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
        const { workspaceId, memberId } = c.req.valid("query");

        if (!user){
            return c.json({ error: "Unauthorized" }, 401);
        }

        try {
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
                return c.json({ error: "Unauthorized" }, 401);
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

export default app;