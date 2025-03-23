/* eslint-disable @typescript-eslint/no-unused-vars */
import { Hono } from "hono";
import { getMember } from "@/features/members/utils";
import { zValidator } from "@hono/zod-validator";
import { createTaskSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, TASKS_ID, MEMBERS_ID, PROJECTS_ID } from "@/config"; // TODO: pending code from Jessica
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { TaskStatus, Task} from "../types";
import { Project } from "@/features/projects/types"; // TODO: pending code from Jessica 
import { createAdminClient } from "@/lib/appwrite";


    
const app = new Hono();

app.get(
    "/",
    sessionMiddleware,
    zValidator(
        "query",
        z.object({
            workspaceId: z.string(),
            projectId: z.string().nullish(),
            assigneeId: z.string().nullish(),
            status: z.nativeEnum(TaskStatus).nullish(),
            search: z.string().nullish(),
            dueDate: z.string().nullish(),
        })
    ),
    async (c) => {
        const { users } = await createAdminClient(); // UPDATE: added within createAdminClient get Users()
        const databases = c.get("databases");
        const user = c.get("user");

        const { workspaceId, projectId, status, search, assigneeId, dueDate } = c.req.valid("query");

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const query = [
            Query.equal("workspaceId", workspaceId),
            Query.orderDesc("$createdAt"),
        ];

        if (projectId) {
            console.log("projectId:", projectId);
            query.push(Query.equal("projectId", projectId));
        }

        if (status) {
            console.log("status:", status);
            query.push(Query.equal("status", status));
        }

        if (assigneeId) {
            console.log("assigneeId:", assigneeId);
            query.push(Query.equal("assigneeId", assigneeId));
        }

        if (dueDate) {
            console.log("dueDate:", dueDate);
            query.push(Query.equal("dueDate", dueDate));
        }

        if (search) {
            console.log("search:", search);
            query.push(Query.search("name", search));
        }

        const tasks = await databases.listDocuments<Task>(DATABASE_ID, TASKS_ID, query);

        const projectIds = tasks.documents.map((task) => task.projectId);
        const assigneeIds = tasks.documents.map((task) => task.assigneeId);

        const projects = await databases.listDocuments<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectIds.length > 0 ? [Query.contains("$id", projectIds)] : []
        );

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            assigneeIds.length > 0 ? [Query.contains("$id", assigneeIds)] : []
        );

        const assignees = await Promise.all(
            members.documents.map(async (member) => {
                try {
                    const user = await users.get(member.userId);
                    return {
                        ...member,
                        name: user.name,
                        email: user.email,
                    };
                } catch (error) {
                    // If we can't get user data, use the member's name or a fallback
                    return {
                        ...member,
                        name: member.name || `User ${member.userId.substring(0, 8)}`,
                        email: "unknown@example.com",
                    };
                }
            })
        );

        const populatedTasks = tasks.documents.map((task) => {
            const project = projects.documents.find((proj) => proj.$id === task.projectId);
            const assignee = assignees.find((asg) => asg.$id === task.assigneeId);

            return {
                ...task,
                project,
                assignee,
            };
        });

        return c.json({
            data: {
                ...tasks,
                documents: populatedTasks,
            },
        });
    }
);

app.post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");

        const { name, status, workspaceId, projectId, dueDate, assigneeId } = c.req.valid("json");

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const highestPositionTask = await databases.listDocuments(DATABASE_ID, TASKS_ID, [
            Query.equal("status", status),
            Query.equal("workspaceId", workspaceId),
            Query.orderAsc("position"),
            Query.limit(1),
        ]);

        const newPosition =
            highestPositionTask.documents.length > 0
                ? highestPositionTask.documents[0].position + 1000
                : 1000;

        const task = await databases.createDocument(DATABASE_ID, TASKS_ID, ID.unique(), {
            name,
            status,
            workspaceId,
            projectId,
            dueDate,
            assigneeId,
            position: newPosition,
        });

        return c.json({ data: task });
    }
);

export default app;
