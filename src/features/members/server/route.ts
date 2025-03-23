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

export default app; 