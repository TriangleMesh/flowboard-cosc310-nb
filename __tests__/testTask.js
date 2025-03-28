import axios from 'axios';
import {wrapper} from 'axios-cookiejar-support';
import {describe, it, expect, beforeAll, afterAll} from '@jest/globals';
import * as dotenv from "dotenv";
import {beforeEach} from "node:test";
import {findLoginCookieValue, registerAndGetSessionValue} from "./utils";
import * as taskData from "ts-jest/dist/transformers/hoist-jest";

const client = wrapper(axios.create({
    httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false  // Disable certificate validation
    }),
    timeout:38000,
}));

dotenv.config({path: '../.env.local'});

// Base URL of your API
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000/" + 'api/tasks';

// Helper function to generate random strings
function generateRandomString(length = 6) {
    return Math.random().toString(36).substring(2, length + 2);
}

// Global variables for session and workspace/project IDs
let key, userId, workspaceId, projectId, taskId, taskId2;

describe ('Tasks API Tests', () => {
    // login the test user before running tests
    beforeAll(async () => {
        // register a new user and get the current userId
        key = await registerAndGetSessionValue();
        const currentResponse = await client.get(`https://localhost:3000/api/auth/current`, {
            headers: {
                Cookie: `flowboard-flowboard-cosc310-session=${key}`,
            },
        });
        expect(currentResponse.status).toEqual(200);
        expect(currentResponse.data.data).toBeDefined();
        userId = currentResponse.data.data.$id;
        // get the workspaceId
        const workspaceName = `Workspaces-${generateRandomString()}`;
        const workspaceFormData = new FormData();
        workspaceFormData.append('name', workspaceName);
        const createWorkspaceUrl = process.env.NEXT_PUBLIC_APP_URL  ||
            "https://localhost:3000/" + "api/workspaces";
        const workspaceResponse = await client.post(createWorkspaceUrl, workspaceFormData, {
            headers: {
                'Cookie': `flowboard-flowboard-cosc310-session=${key}`
            }
        });
        expect(workspaceResponse.status).toBe(200);
        expect(workspaceResponse.data.data.name).toBe(workspaceName);
        workspaceId = workspaceResponse.data.data.$id;
        // get the projectId
        const projectName = `Project-${generateRandomString()}`;
        const createProjectFormData = new FormData();
        createProjectFormData.append('name', projectName);
        createProjectFormData.append('workspaceId', workspaceId);

        const createProjectUrl = process.env.NEXT_PUBLIC_APP_URL ||
            "https://localhost:3000/" + "api/projects";

        const projectResponse = await client.post(createProjectUrl, createProjectFormData, {
            headers: {
                'Cookie': `flowboard-flowboard-cosc310-session=${key}`
            }
        });

        expect(projectResponse.status).toEqual(200);
        expect(projectResponse.data.data.name).toBe(projectName);
        // Save project ID for later use
        projectId = projectResponse.data.data.$id;

    });
    describe('POST /tasks', () => {
        it('should create a new task with status TODO successfully', async () => {
            const taskName = `Task-${generateRandomString()}`;
            const status = "TODO";
            const dueDate = "2025-12-31";
            const assigneeId = userId;
            const requestBody = {
                name: taskName,
                status: status,
                dueDate: dueDate,
                assigneeId: assigneeId,
                workspaceId: workspaceId,
                projectId: projectId

            };
            /*
            * {
                  "name": "Design Homepage UI",
                  "status": "TODO",
                  "dueDate": "2025-12-31",
                  "assigneeId": "user_789",
                  "workspaceId": "67d3aff10033771f5a8e",
                  "projectId": "67d3b27e002e09ee86d2"

                }
            * */

            const response = await client.post(`${BASE_URL}?workspaceId=${workspaceId}&projectId=${projectId}`, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                }
            });
            taskId = response.data.data.$id;
            expect(response.status).toEqual(200);
            expect(response.data.data.name).toBe(taskName);
            expect(response.data.data.status).toBe(status);
            expect(response.data.data.assigneeId).toBe(assigneeId);
            expect(response.data.data.workspaceId).toBe(workspaceId);
            expect(response.data.data.projectId).toBe(projectId);
        });

        it('should create a new task successfully with status IN_PROGRESS', async () => {
            const taskName = `Task-${generateRandomString()}`;
            const status = "IN_PROGRESS"; // Different status
            const dueDate = "2025-12-31";
            const assigneeId = userId;
            const requestBody = {
                name: taskName,
                status: status,
                dueDate: dueDate,
                assigneeId: assigneeId,
                workspaceId: workspaceId,
                projectId: projectId
            };

            const response = await client.post(`${BASE_URL}?workspaceId=${workspaceId}&projectId=${projectId}`, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                }
            });

            const taskId2 = response.data.data.$id;
            expect(response.status).toEqual(200);
            expect(response.data.data.name).toBe(taskName);
            expect(response.data.data.status).toBe(status); // Verify the new status
            expect(response.data.data.assigneeId).toBe(assigneeId);
            expect(response.data.data.workspaceId).toBe(workspaceId);
            expect(response.data.data.projectId).toBe(projectId);
        });

        it('should return 400 when required fields are missing', async () => {
            const requestBody = {
                status: "TODO",
                workspaceId: workspaceId,
                projectId: projectId
            };

            try {
                await client.post(`${BASE_URL}`, requestBody, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                    }
                });
            } catch (error) {
                expect(error.response.status).toEqual(400);
                expect(error.response.data.error).toBeDefined();
            }
        });
        it('should return 401 when no session cookie is provided', async () => {
            const requestBody = {
                name: "Task-Test",
                status: "TODO",
                workspaceId: workspaceId,
                projectId: projectId
            };

            try {
                await client.post(`${BASE_URL}`, requestBody, {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                expect(error.response.status).toEqual(401);
                expect(error.response.data.error).toBe("Unauthorized");
            }
        });

    });

    describe('GET /tasks', () => {
        it('should fetch tasks successfully with valid workspaceId', async () => {
            // Send GET request to fetch tasks
            const response = await client.get(`${BASE_URL}`, {
                headers: {
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                },
                params: {
                    workspaceId: workspaceId, // Required parameter
                }
            });

            // Validate the response
            expect(response.status).toEqual(200);
            expect(Array.isArray(response.data.data.documents)).toBe(true); // Ensure tasks are returned as an array
            const tasks = response.data.data.documents;

            if (tasks.length > 0) {
                const task = tasks[0];
                expect(task.name).toBeDefined();
                expect(task.status).toBeDefined();
                expect(task.workspaceId).toBe(workspaceId);
            }
        });

        it('should filter tasks by status', async () => {
            // Send GET request with a specific status filter
            const response = await client.get(`${BASE_URL}`, {
                headers: {
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                },
                params: {
                    workspaceId: workspaceId,
                    status: "TODO" // Filter by status
                }
            });

            // Validate the response
            expect(response.status).toEqual(200);
            const tasks = response.data.data.documents;
            expect(tasks.every(task => task.status === "TODO")).toBe(true); // Ensure all tasks have the specified status
        });

        it('should return an error if workspaceId is missing', async () => {
            try {
                // Send GET request without workspaceId
                const response = await client.get(`${BASE_URL}`, {
                    headers: {
                        'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                    },
                    params: {} // Missing workspaceId
                });
            } catch (error) {
                // Validate the error response
                expect(error.response.status).toEqual(400); // Expect a 400 Bad Request error
            }
        });

        it('should return tasks sorted by creation date descending', async () => {
            const response = await client.get(`${BASE_URL}`, {
                headers: {
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                },
                params: {
                    workspaceId: workspaceId
                }
            });

            expect(response.status).toEqual(200);
            const tasks = response.data.data.documents;
            if (tasks.length > 1) {
                for (let i = 0; i < tasks.length - 1; i++) {
                    expect(new Date(tasks[i].$createdAt) >= new Date(tasks[i + 1].$createdAt)).toBe(true);
                }
            }
        });
    });
})
