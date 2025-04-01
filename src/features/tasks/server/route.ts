/* eslint-disable @typescript-eslint/no-unused-vars */
import {Context, Hono} from "hono";
import {getMember} from "@/features/members/utils";
import {zValidator} from "@hono/zod-validator";
import {createTaskSchema, deleteTaskSchema, updateTaskSchema} from "../schemas";
import {sessionMiddleware} from "@/lib/session-middleware";
import {DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID} from "@/config";
import {AppwriteException, ID, Query} from "node-appwrite";
import {z} from "zod";
import {Task, TaskPriority, TaskStatus} from "../types";
import {Project} from "@/features/projects/types";
import {createAdminClient} from "@/lib/appwrite";
import {sendNotificationToUser} from "@/lib/websocketServer";
import {MemberRole} from "@/features/members/type";


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
            priority: z.nativeEnum(TaskPriority).nullish(),
            assigneesId: z
                .union([
                    z.string().array(),
                    z.string(),
                    z.null(),
                ])
                .nullish()
            })
    ),
    async (c) => {
        const {users} = await createAdminClient(); // UPDATE: added within createAdminClient get Users()
        const databases = c.get("databases");
        const user = c.get("user");

        const {
            workspaceId,
            projectId,
            status,
            search,
            assigneeId,
            dueDate,
            priority,
            assigneesId
        } = c.req.valid("query");

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({error: "Unauthorized"}, 401);
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

        if (priority) { //todo admin only?
            console.log("priority:", priority);
            query.push(Query.equal("priority", priority));
        }

        if (assigneesId) {
            console.log("assigneesId:", assigneesId);
            // Assuming assigneesId is an array
            if (Array.isArray(assigneesId)) {
                for (const assigneeId of assigneesId) {
                    query.push(Query.contains("assigneesId", assigneeId));
                }
            } else {
                query.push(Query.contains("assigneesId", assigneesId));
            }
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

        //todo update here
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

//todo add authentication here
app.get("/getTaskById", sessionMiddleware, zValidator("query", z.object({taskId: z.string()}))
    , async (c) => {
        const databases = c.get("databases");
        const {taskId} = c.req.valid("query");

        const task = await databases.getDocument<Task>(DATABASE_ID, TASKS_ID, taskId);
        if (!task) {
            return c.json({error: "Task not found"}, 404);
        }

        return c.json({data: task});
    });

app.post(
    "/",
    sessionMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");

        const {
            name,
            status,
            workspaceId,
            projectId,
            dueDate,
            assigneeId,
            priority,
            description,
            locked,
            assigneesId
        } = c.req.valid("json");

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({error: "Unauthorized"}, 401);
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
            priority,
            description,
            locked,
            assigneesId
        });

        return c.json({data: task});
    }
);

app.patch(
    "/",
    sessionMiddleware,
    zValidator("json", updateTaskSchema),
    async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");
        const {
            name,
            status,
            dueDate,
            assigneeId,
            taskId,
            priority,
            description,
            locked,
            assigneesId
        } = c.req.valid("json");
        let workspaceId: string = "";

        //get workspaceId from originalTask
        await databases.getDocument(DATABASE_ID, TASKS_ID, taskId).then((task) => {
            workspaceId = task.workspaceId;
        });

        let member;
        // check if user is member of workspace
        if (workspaceId) {
            member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({error: "Unauthorized"}, 401);
            }
        } else {
            return c.json({error: "Task not found"}, 404);
        }

        // construct update originalTask object
        const updateData: Partial<Task> = {};
        if (name !== undefined) updateData.name = name;
        if (status !== undefined) updateData.status = status;
        if (dueDate !== undefined) updateData.dueDate = dueDate;
        if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
        if (priority !== undefined) {
            updateData.priority = priority;
        }
        if (description !== undefined) updateData.description = description;
        if (locked !== undefined) updateData.locked = locked;
        if (assigneesId !== undefined) {
            updateData.assigneesId = assigneesId;
        }


        //check if originalTask is locked
        const originalTask = await databases.getDocument<Task>(DATABASE_ID, TASKS_ID, taskId);
        if (originalTask.locked && member.role === MemberRole.MEMBER) {
            return c.json({error: "Task is locked"}, 403);
        } else if (originalTask.locked && member.role === MemberRole.ADMIN) {
            if (updateData.locked === undefined || updateData.locked === true) {
                return c.json({error: "Task is locked, please unlock before making changes"}, 403);
            }
        }

        //prevent normal member from changing task lock status
        if (updateData.locked !== originalTask.locked && member.role === MemberRole.MEMBER) {
            return c.json({error: "Only admin can change originalTask lock status"}, 403);
        }

        //get userId by assigneeId
        let notificationUserId: string = "";
        if (assigneeId !== undefined) {
            await databases.getDocument(DATABASE_ID, MEMBERS_ID, assigneeId).then((member) => {
                notificationUserId = member.userId;
            });
        }

        // get taskName by id
        let taskName: string = "";
        await databases.getDocument(DATABASE_ID, TASKS_ID, taskId).then((task) => {
            taskName = task.name;
        });

        //new multiple assignees
        const notificationUserIds: string[] = [];
        if (assigneesId !== undefined) {
            for (const assigneeId of assigneesId) {
                await databases.getDocument(DATABASE_ID, MEMBERS_ID, assigneeId).then((member) => {
                    notificationUserIds.push(member.userId);
                });
            }
        }

        // update originalTask
        const updatedTask = await databases.updateDocument(DATABASE_ID, TASKS_ID, taskId, updateData);

        sendNotificationToUser(notificationUserId, {type: 'system', message: `${name || taskName} has been updated.`});

        for (const assigneeId of notificationUserIds) {
            sendNotificationToUser(assigneeId, {type: 'system', message: `Task ${name || taskName} has been updated.`});
        }


        return c.json({data: updatedTask});
    }
);

app.delete(
    "/",
    sessionMiddleware,
    zValidator("json", deleteTaskSchema),
    async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");
        const {taskId} = c.req.valid("json");

        let workspaceId: string = "";

        //get workspaceId from task
        await databases.getDocument(DATABASE_ID, TASKS_ID, taskId).then((task) => {
            workspaceId = task.workspaceId;
        });

        let member;
        // check if user is member of workspace
        if (workspaceId) {
            member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({error: "Unauthorized"}, 401);
            }
        } else {
            return c.json({error: "Task not found"}, 404);
        }

        //check if task is locked
        const task = await databases.getDocument<Task>(DATABASE_ID, TASKS_ID, taskId);
        if (task.locked) {
            return c.json({error: "Task is locked"}, 403);
        }

        await databases.deleteDocument(DATABASE_ID, TASKS_ID, taskId);

        return c.json({success: true});

    }
);
export default app;


// async function getTaskById(
//     id: string,
//     c: Context,
//     databases: Databases
// ){
//     try {
//         // Return the task if found
//         return await databases.getDocument<Task>(DATABASE_ID, TASKS_ID, id);
//     } catch (error) {
//         // Log the error for debugging purposes
//
//         // Handle specific error cases
//         if (error instanceof AppwriteException) {
//             // @ts-ignore code exists
//             if (error.response.code === 404) {
//                 // Task not found
//                 return c.json({ error: "Task not found" }, 404);
//             }
//         }
//
//         // Generic internal server error
//         return c.json({ error: "Internal server error" }, 500);
//     }
// }