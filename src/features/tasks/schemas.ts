import {z} from "zod";
import {TaskStatus} from "./types";

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
        assigneeId: z.string
        ().trim().min(1, "Required"),
        description:
            z.string().optional(),
    })
;
