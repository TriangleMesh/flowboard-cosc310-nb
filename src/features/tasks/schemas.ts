import {z} from "zod";
import {TaskPriority, TaskStatus} from "./types";

export const createTaskSchema = z.object({
        name: z.string().min(1, "Required"),
        status: z.nativeEnum(TaskStatus, {required_error: "Required"}),
        workspaceId: z.string().trim().min(1, "Required"),
        projectId: z.string().trim().min(1, "Required"),
        dueDate: z.coerce.date(),
        description: z.string().optional(),
        //make the following optional so that no need to change existing test cases
        priority: z.nativeEnum(TaskPriority, {required_error: "Required"}).optional().default(TaskPriority.NULL),
        locked: z.boolean().optional().default(false),
        assigneesId: z.array(z.string().trim().min(1, "Required")).optional()
    })
;

export const updateTaskSchema = z.object({
    taskId: z.string().min(1, "Required"),
    name: z.string().min(1, "Required"),
    status: z.nativeEnum(TaskStatus, {required_error: "Required"}),
    dueDate: z.coerce.date(),
    projectId: z.string().optional(),
    description: z.string().optional().nullish(),
    priority: z.nativeEnum(TaskPriority).nullable().optional().default(TaskPriority.NULL),
    locked: z.boolean().optional().nullish(),
    assigneesId: z.array(z.string().trim().min(1, "Required")).optional().nullish()
}).refine((data) => {
    return Object.keys(data).length > 0;
}, {
    message: "At least one field is required",
});

export const getTaskByIdSchema = z.object({
    taskId: z.string().trim().min(1, "Required"),
});

export const deleteTaskSchema = z.object({
    taskId: z.string().trim().min(1, "Required"),
});