import axios from 'axios';
import {wrapper} from 'axios-cookiejar-support';
import {describe, it, expect, beforeAll, afterAll} from '@jest/globals';
import * as dotenv from "dotenv";
import {findLoginCookieValue, registerAndGetSessionValue} from "./utils";

const client = wrapper(axios.create({
    httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false  // Disable certificate validation
    }),
    timeout: 38000,
}));

dotenv.config({path: '../.env.local'});

const HOST = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/";
// Base URL of your API
const BASE_URL = HOST + 'api/members';

// Helper function to generate random strings
function generateRandomString(length = 6) {
    return Math.random().toString(36).substring(2, length + 2);
}

// Global variables for session and workspace IDs
let key, userId, workspaceId, memberId;

describe('Members API Tests', () => {
    // Login the test user and create a workspace before running tests
    beforeAll(async () => {
        // Register a new user and get the current userId
        key = await registerAndGetSessionValue();
        const currentResponse = await client.get(`http://localhost:3000/api/auth/current`, {
            headers: {
                Cookie: `flowboard-flowboard-cosc310-session=${key}`,
            },
        });
        expect(currentResponse.status).toEqual(200);
        expect(currentResponse.data.data).toBeDefined();
        userId = currentResponse.data.data.$id;

        // Create a workspace
        const workspaceName = `Workspace-${generateRandomString()}`;
        const workspaceFormData = new FormData();
        workspaceFormData.append('name', workspaceName);

        const createWorkspaceUrl = process.env.NEXT_PUBLIC_APP_URL ||
            "http://localhost:3000/" + "api/workspaces";

        const workspaceResponse = await client.post(createWorkspaceUrl, workspaceFormData, {
            headers: {
                'Cookie': `flowboard-flowboard-cosc310-session=${key}`
            }
        });

        expect(workspaceResponse.status).toBe(200);
        expect(workspaceResponse.data.data.name).toBe(workspaceName);
        workspaceId = workspaceResponse.data.data.$id;

        //get the member id
        const memberResponse = await client.get(`${BASE_URL}`, {
            headers: {
                'Cookie': `flowboard-flowboard-cosc310-session=${key}`
            },
            params: {
                workspaceId: workspaceId, // Required parameter
            }
        });

        memberId = memberResponse.data.data.documents.at(0).$id
    });

    describe('GET /members', () => {
        it('should fetch members successfully with valid workspaceId', async () => {
            // Send GET request to fetch members
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
            expect(Array.isArray(response.data.data.documents)).toBe(true); // Ensure members are returned as an array

            const members = response.data.data.documents;
            if (members.length > 0) {
                const member = members[0];
                expect(member.workspaceId).toBe(workspaceId);
                expect(member.name).toBeDefined(); // Ensure name is present
                expect(member.email).toBeDefined(); // Ensure email is present
            }
        });

        it('should return 401 Unauthorized if user is not a member of the workspace', async () => {
            try {
                // Create a new workspace that the user is not a member of
                const newWorkspaceName = `Workspace-${generateRandomString()}`;
                const newWorkspaceFormData = new FormData();
                newWorkspaceFormData.append('name', newWorkspaceName);

                const newWorkspaceResponse = await client.post(
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/api/workspaces",
                    newWorkspaceFormData,
                    {
                        headers: {
                            'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                        }
                    }
                );

                const newWorkspaceId = newWorkspaceResponse.data.data.$id;

                // Send GET request with a workspaceId the user is not a member of
                const response = await client.get(`${BASE_URL}`, {
                    headers: {
                        'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                    },
                    params: {
                        workspaceId: newWorkspaceId,
                    }
                });
            } catch (error) {
                // Validate the error response
                expect(error.response.status).toEqual(401); // Expect a 401 Unauthorized error
                expect(error.response.data.error).toBe("Unauthorized");
            }
        });

        it('should return 400 Bad Request if workspaceId is missing', async () => {
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
    });
    describe('DELETE /members', () => {
        it('should delete a member successfully with valid key', async () => {
            const deleteMemberResponse = await client.delete(`${BASE_URL}`, {
                headers: {
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                },
                params: {
                    workspaceId: workspaceId, // Required parameter
                    memberId: memberId

                }
            });

            expect(deleteMemberResponse.status).toEqual(200);
        });

        it('should delete a member unsuccessfully with invalid key', async () => {
            const deleteMemberResponse = await client.delete(`${BASE_URL}`, {
                headers: {
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}+invalidate`
                },
                params: {
                    workspaceId: workspaceId, // Required parameter
                    memberId: memberId
                }, validateStatus: () => true,
            });
            expect(deleteMemberResponse.status).toEqual(500);
        });

    });

});