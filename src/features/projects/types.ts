import {Models} from "node-appwrite";	

export type Project = Models.Document & {	
    name : string;	
    ImageUrl: string;
    workspaceId: string;	
};