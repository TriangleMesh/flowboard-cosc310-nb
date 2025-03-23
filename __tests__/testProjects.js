import axios from 'axios';
import {wrapper} from 'axios-cookiejar-support';
import {describe, it, expect, beforeAll, afterAll} from '@jest/globals';
import {registerAndGetSessionValue} from "./getCookies";
import * as dotenv from "dotenv";

const client = wrapper(axios.create({
    httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false  // Disable certificate validation
    }),
    timeout:39000,
}));

dotenv.config({path: '../.env.local'});

// Base URL of your API
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000/" + 'api/projects';


// Helper function to generate random strings
function generateRandomString(length = 6) {
    return Math.random().toString(36).substring(2, length + 2);
}


// Global variables for session and workspace/project IDs
let key, workspaceId, projectId;

describe('Projects API Tests', () => {
    // Log in the test user before running tests
    beforeAll(async () => {
        key = await registerAndGetSessionValue();

        const workspaceName = `Workspace-${generateRandomString()}`;
        const formData = new FormData();
        formData.append('name', workspaceName);

        const createWorkSpaceUrl = process.env.NEXT_PUBLIC_APP_URL ||
            "https://localhost:3000/" + "api/workspaces";


        const response = await client.post(createWorkSpaceUrl, formData, {
            headers: {
                'Cookie': `flowboard-flowboard-cosc310-session=${key}`
            }
        });

        expect(response.status).toEqual(200);
        expect(response.data.data.name).toBe(workspaceName);

        // Save workspace ID for later use
        workspaceId = response.data.data.$id;
    });


    describe('POST /projects', () => {
        it('should create a new project successfully', async () => {
            const projectName = `Project-${generateRandomString()}`;
            const formData = new FormData();
            formData.append('name', projectName);
            formData.append('workspaceId', workspaceId);

            const response = await client.post(`${BASE_URL}/`, formData, {
                headers: {
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                }
            });

            expect(response.status).toEqual(200);
            expect(response.data.data.name).toBe(projectName);

            // Save project ID for later use
            projectId = response.data.data.$id;
        });

        it('should fail to create a project without workspaceId', async () => {
            const formData = new FormData();
            formData.append('name', 'Invalid Project');

            const response = await client.post(`${BASE_URL}/`, formData, {
                headers: {
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                }, validateStatus: () => true,
            });

            expect(response.status).toEqual(400); // Bad Request
            expect(response.data.error).toEqual({
                "issues": [
                    {
                        "code": "invalid_type",
                        "expected": "string",
                        "message": "Required",
                        "path": [
                            "workspaceId"
                        ],
                        "received": "undefined"
                    }
                ],
                "name": "ZodError"
            });
        });

        it('should fail to create a project with invalid permissions', async () => {
            const formData = new FormData();
            formData.append('name', 'Unauthorized Project');
            formData.append('workspaceId', workspaceId);

            // Simulate unauthorized access by clearing cookies
            const response = await client.post(`${BASE_URL}/`, formData, {
                validateStatus: () => true,
            });

            expect(response.status).toEqual(401); // Unauthorized
            expect(response.data.error).toBe('Unauthorized');
        });
    });

    describe('GET /projects', () => {
        it('should fetch all projects for a workspace successfully', async () => {
            const response = await client.get(`${BASE_URL}/`, {
                params: {workspaceId},
                headers: {
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                },
            });

            expect(response.status).toEqual(200);
            expect(response.data.data.documents).toBeDefined();
            expect(Array.isArray(response.data.data.documents)).toBe(true);
        });

        it('should fail to fetch projects without workspaceId', async () => {
            const response = await client.get(`${BASE_URL}/`, {
                headers: {
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                }, validateStatus: () => true,
            });

            expect(response.status).toEqual(400); // Bad Request
            expect(response.data.error).toEqual({
                "issues": [
                    {
                        "code": "invalid_type",
                        "expected": "string",
                        "message": "Required",
                        "path": [
                            "workspaceId"
                        ],
                        "received": "undefined"
                    }
                ],
                "name": "ZodError"
            });
        });

        it('should fail to fetch projects with invalid permissions', async () => {
            // Simulate unauthorized access by clearing cookies
            const response = await client.get(`${BASE_URL}/`, {
                params: {workspaceId},
                validateStatus: () => true,
            });

            expect(response.status).toEqual(401); // Unauthorized
            expect(response.data.error).toBe('Unauthorized');
        });
    });

    describe('PATCH /projects/:projectId', () => {
        it('should update a project successfully', async () => {
            const updatedName = `Updated-${generateRandomString()}`;
            const formData = new FormData();
            formData.append('name', updatedName);

            const response = await client.patch(`${BASE_URL}/${projectId}`, formData, {
                headers: {
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                }
            });

            expect(response.status).toEqual(200);
            expect(response.data.data.name).toBe(updatedName);
        });

        it('should fail to update a project with invalid permissions', async () => {
            const formData = new FormData();
            formData.append('name', 'Unauthorized Update');

            // Simulate unauthorized access by clearing cookies
            const response = await client.patch(`${BASE_URL}/${projectId}`, formData, {
                validateStatus: () => true,
            });

            expect(response.status).toEqual(401); // Unauthorized
            expect(response.data.error).toBe('Unauthorized');
        });
    });



    // describe('DELETE /projects/:projectId', () => {
    //     it('should delete a project successfully', async () => {
    //         const response = await client.delete(`${BASE_URL}/${projectId}`, {
    //             headers: {
    //                 'Cookie': `flowboard-flowboard-cosc310-session=${key}`
    //             }
    //         });
    //
    //         expect(response.status).toEqual(200);
    //         expect(response.data.data.$id).toBe(projectId);
    //     });
    //
    //     it('should fail to delete a project with invalid permissions', async () => {
    //         // Simulate unauthorized access by clearing cookies
    //         const response = await client.delete(`${BASE_URL}/${projectId}`, {
    //             validateStatus: () => true,
    //         });
    //
    //         expect(response.status).toEqual(401); // Unauthorized
    //         expect(response.data.error).toBe('Unauthorized');
    //     });
    // });

    // Clean up after tests
    afterAll(async () => {
        // Logout the user
        await client.post('https://localhost:3000/api/auth/logout', {}, {
            headers: {
                'Cookie': `flowboard-flowboard-cosc310-session=${key}`
            }
        });
    });
});