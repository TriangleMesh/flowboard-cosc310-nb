import {z} from "zod";
import {TaskPriority, TaskStatus} from "./types";

export const createTaskSchema = z.object({
        name: z.string().min(1, "Required"),
        status: z.nativeEnum(TaskStatus, {required_error: "Required"}),
        workspaceId: z.string().trim().min(1, "Required"),
        projectId: z.string().trim().min(1, "Required"),
        dueDate: z.string().refine((value) => { //validate by trying to create a date object
            try {
                const date = new Date(value);
                return !isNaN(date.getDate());
            } catch (error) {
                return false;
            }
        }, {
            message: "Invalid date format",
        }),
        assigneeId: z.string().trim().min(1, "Required"),
        description: z.string().optional(),
        priority: z.nativeEnum(TaskPriority, {required_error: "Required"}).optional(), //make it optional so that no needs to change existing test cases
    })
;

export const updateTaskSchema = z.object({
    taskId: z.string().min(1, "Required"),
    name: z.string().min(1, "Required").optional(),
    status: z.nativeEnum(TaskStatus, {required_error: "Required"}).optional(),
    dueDate: z.string().refine((value) => {
        try {
            const date = new Date(value);
            return !isNaN(date.getDate());
        } catch (error) {
            return false;
        }
    }, {
        message: "Invalid date format",
    }).optional(),
    assigneeId: z.string().trim().min(1, "Required").optional(),
    projectId: z.string().optional(),
    priority: z.nativeEnum(TaskPriority, {required_error: "Required"}).optional(), //make it optional so that no needs to change existing test cases
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