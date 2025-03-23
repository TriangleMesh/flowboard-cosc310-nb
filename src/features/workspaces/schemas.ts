import {z} from "zod";

export const createWorkspaceSchema = z.object({
    name: z.string().trim().min(1, "required"),
    image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
    ])
        .optional(),
})

export const updateWorkspaceSchema = z.object({
    name: z.string().trim().min(1, "Must be 1 or more characters").optional(),
    image: z.union([
        typeof File !== "undefined" ? z.instanceof(File) : z.never(), 
        z.string().transform((value: any) => value === "" ? undefined : value),
    ]).optional(),
});