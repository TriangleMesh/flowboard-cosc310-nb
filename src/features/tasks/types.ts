import {Models} from "node-appwrite"

export enum TaskStatus {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE",
}

export enum TaskPriority {
    LOW = "LOW",
    MEDIUM_LOW = "MEDIUM_LOW",
    MEDIUM = "MEDIUM",
    MEDIUM_HIGH = "MEDIUM_HIGH",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL",
    NULL = "NULL",
}


export type Task = Models.Document & {
    name: string;
    status: TaskStatus;
    assigneeId: string;
    projectId: string;
    position: number;
    dueDate: string;
    priority: TaskPriority;
}
    
