import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { beforeAll, describe, expect, it } from '@jest/globals';
import * as dotenv from 'dotenv';
import { registerAndGetSessionValue } from './utils';

dotenv.config({ path: '../.env.local' });

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const getApiUrl = (path) => `${API_BASE}${path}`;
const BASE_URL = getApiUrl('/api/tasks');

const client = wrapper(
    axios.create({
        // httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
        timeout: 38000,
    })
);

// ========== Utility ==========

function getAuthHeader(sessionKey) {
    return {
        'Cookie': `flowboard-flowboard-cosc310-session=${sessionKey}`,
    };
}

function createFormData(fields): FormData {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
        formData.append(key, value);
    }
    return formData;
}

function generateRandomString(length = 6) {
    return Math.random().toString(36).substring(2, length + 2);
}

async function createTask(
    name = "Task-Test",
    status = "TODO",
    dueDate = "2023-12-31"
) {
    const requestBody = {
        name,
        status,
        dueDate,
        assigneeId: memberId,
        workspaceId,
        projectId,
    };

    return await client.post(BASE_URL, requestBody, {
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(sessionKey),
        },
    });
}

// ========== Global Test State ==========

let sessionKey;
let userId;
let workspaceId;
let projectId;
let memberId;

// ========== Setup ==========

async function setupTestEnvironment() {
    sessionKey = await registerAndGetSessionValue();

    const currentRes = await client.get(getApiUrl('/api/auth/current'), {
        headers: getAuthHeader(sessionKey),
    });
    userId = currentRes.data.data.$id;

    const workspaceRes = await client.post(
        getApiUrl('/api/workspaces'),
        createFormData({ name: `Workspace-${generateRandomString()}` }),
        { headers: getAuthHeader(sessionKey) }
    );
    workspaceId = workspaceRes.data.data.$id;

    const memberRes = await client.get(
        getApiUrl(`/api/members?workspaceId=${workspaceId}`),
        { headers: getAuthHeader(sessionKey) }
    );
    memberId = memberRes.data.data.documents[0].$id;

    const projectRes = await client.post(
        getApiUrl('/api/projects'),
        createFormData({
            name: `Project-${generateRandomString()}`,
            workspaceId,
        }),
        { headers: getAuthHeader(sessionKey) }
    );
    projectId = projectRes.data.data.$id;
}

// ========== Tests ==========

describe('Tasks API Tests', () => {
    beforeAll(async () => {
        await setupTestEnvironment();
    });

    describe.each([
        ['TODO', '2025-12-31'],
        ['IN_PROGRESS', '2002-12-31'],
    ])('POST /tasks with status %s', (status, dueDate) => {
        it(`should create a task with status ${status}`, async () => {
            const name = `Task-${generateRandomString()}`;
            const res = await createTask(name, status, dueDate);

            expect(res.status).toBe(200);
            const task = res.data.data;
            expect(task.name).toBe(name);
            expect(task.status).toBe(status);
            expect(task.workspaceId).toBe(workspaceId);
            expect(task.projectId).toBe(projectId);
        });
    });

    it('should return 400 when required fields are missing', async () => {
        const incompleteTask = {
            status: "TODO",
            workspaceId,
            projectId,
        };

        try {
            await client.post(BASE_URL, incompleteTask, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader(sessionKey),
                },
            });
        } catch (error) {
            expect(error.response.status).toBe(400);
        }
    });

    it('should return 401 when no session cookie is provided', async () => {
        const requestBody = {
            name: "Unauthorized Task",
            status: "TODO",
            workspaceId,
            projectId,
        };

        try {
            await client.post(BASE_URL, requestBody, {
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            expect(error.response.status).toBe(401);
            expect(error.response.data.error).toBe("Unauthorized");
        }
    });

    describe('GET /tasks', () => {
        it('should fetch tasks with valid workspaceId', async () => {
            const res = await client.get(BASE_URL, {
                headers: getAuthHeader(sessionKey),
                params: { workspaceId },
            });

            expect(res.status).toBe(200);
            const tasks = res.data.data.documents;
            expect(Array.isArray(tasks)).toBe(true);

            if (tasks.length > 0) {
                const task = tasks[0];
                expect(task.name).toBeDefined();
                expect(task.workspaceId).toBe(workspaceId);
            }
        });

        it('should filter tasks by status', async () => {
            const res = await client.get(BASE_URL, {
                headers: getAuthHeader(sessionKey),
                params: { workspaceId, status: 'TODO' },
            });

            expect(res.status).toBe(200);
            const tasks = res.data.data.documents;
            expect(tasks.every(t => t.status === 'TODO')).toBe(true);
        });

        it('should return error if workspaceId is missing', async () => {
            try {
                await client.get(BASE_URL, {
                    headers: getAuthHeader(sessionKey),
                    params: {},
                });
            } catch (error) {
                expect(error.response.status).toBe(400);
            }
        });

        it('should return tasks sorted by createdAt descending', async () => {
            const res = await client.get(BASE_URL, {
                headers: getAuthHeader(sessionKey),
                params: { workspaceId },
            });

            const tasks = res.data.data.documents;
            for (let i = 0; i < tasks.length - 1; i++) {
                expect(new Date(tasks[i].$createdAt) >= new Date(tasks[i + 1].$createdAt)).toBe(true);
            }
        });
    });

    describe('PATCH /task', () => {
        it('should update a task successfully', async () => {
            const res = await createTask("Task-Original", "TODO", "2023-01-01");
            const taskId = res.data.data.$id;

            const update = {
                taskId,
                name: "Task-Updated",
                status: "DONE",
                dueDate: "2011-12-31",
                assigneeId: memberId,
                workspaceId,
                projectId,
            };

            const patchRes = await client.patch(BASE_URL, update, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader(sessionKey),
                },
            });

            expect(patchRes.status).toBe(200);
            const updated = patchRes.data.data;
            expect(updated.name).toBe("Task-Updated");
            expect(updated.status).toBe("DONE");
            expect(updated.dueDate).toBe("2011-12-31T00:00:00.000+00:00");
        });
    });
});