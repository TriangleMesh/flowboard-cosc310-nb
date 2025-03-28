import axios from 'axios';
import {wrapper} from 'axios-cookiejar-support';
import {describe, it, expect, beforeAll} from '@jest/globals';
import {registerAndGetSessionValue} from "./utils";
import * as dotenv from "dotenv";

const client = wrapper(axios.create({
    httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false  // Disable certificate validation
    }),    timeout:39000,

}));

dotenv.config({path: '../.env.local'});


// Base URL of your API
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/" + 'api';

function generateRandomString(length = 6) {
    return Math.random().toString(36).substring(2, length + 2);
}

describe('Workspaces API Tests', () => {
    let key, workspaceId, inviteCode;

    // Register a new user before running other tests
    beforeAll(async () => {
        //get session cookie value first
        key = await registerAndGetSessionValue();
    });

    describe('GET /workspaces', () => {
        it('should return an empty list if no workspaces exist', async () => {
            const response = await client.get(`${BASE_URL}/workspaces`, {
                headers: {
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                }
            });


            //check the response we got
            expect(response.status).toEqual(200);
            expect(response.data).toBeDefined();

            expect(response.data.data).toEqual({"documents": [], "total": 0});
        });
    });


    describe('POST /workspaces', () => {
        it('should create a new workspace successfully', async () => {
            const workspaceName = `Workspace-${generateRandomString()}`;
            const formData = new FormData();
            formData.append('name', workspaceName);

            const response = await client.post(`${BASE_URL}/workspaces`, formData, {
                headers: {
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                }
            });

            expect(response.status).toEqual(200);
            expect(response.data.data.name).toBe(workspaceName);

            // Save workspace ID for later use
            workspaceId = response.data.data.$id;
        });

        it('should fail to create a workspace with missing name', async () => {
            const formData = new FormData();

            const response = await client.post(`${BASE_URL}/workspaces`, formData, {
                headers: {
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                }, validateStatus: () => true,
            });

            expect(response.status).toEqual(400); // Bad Request
            expect(response.data.error).toBeDefined();
        });
    });

    describe('PATCH /workspaces/:workspaceId', () => {
        it('should update workspace details successfully', async () => {
            const updatedName = `Updated-${generateRandomString()}`;
            const formData = new FormData();
            formData.append('name', updatedName);

            const response = await client.patch(`${BASE_URL}/workspaces/${workspaceId}`, formData, {
                headers: {
                    'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                }
            });

            expect(response.status).toEqual(200);
            expect(response.data.data.name).toBe(updatedName);
        });

        it('should fail to update workspace details without admin role', async () => {
            const formData = new FormData();
            formData.append('name', 'Unauthorized Update');

            // Simulate unauthorized access by clearing cookies
            const response = await client.patch(`${BASE_URL}/workspaces/${workspaceId}`, formData, {
                validateStatus: () => true,
            });

            expect(response.status).toEqual(401); // Unauthorized
            expect(response.data.error).toBe('Unauthorized');
        });
    });

    describe('POST /workspaces/:workspaceId/reset-invite-code', () => {
        it('should reset the invite code successfully', async () => {
            const response = await client.post(
                `${BASE_URL}/workspaces/${workspaceId}/reset-invite-code`,
                null,
                {
                    headers: {
                        'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                    }
                });

            expect(response.status).toEqual(200);
            expect(response.data.data.inviteCode).toBeDefined();

            // Save invite code for later use
            inviteCode = response.data.data.inviteCode;
        });

        it('should fail to reset invite code without admin role', async () => {
            // Simulate unauthorized access by clearing cookies
            const response = await client.post(
                `${BASE_URL}/workspaces/${workspaceId}/reset-invite-code`,
                null,
                {validateStatus: () => true}
            );

            expect(response.status).toEqual(401); // Unauthorized
            expect(response.data.error).toBe('Unauthorized');
        });
    });


    describe('POST /workspaces/:workspaceId/join', () => {

        // it('should join a workspace successfully with valid invite code', async () => {
        //     const response = await client.post(
        //         `${BASE_URL}/workspaces/${workspaceId}/join`,
        //         {code: inviteCode},
        //         {
        //             headers: {
        //                 'Cookie': `flowboard-flowboard-cosc310-session=${key}`
        //             }
        //         });
        //
        //     expect(response.status).toEqual(200);
        //     expect(response.data.data.$id).toBe(workspaceId);
        // });

        // it('should fail to join a workspace with invalid invite code', async () => {
        //     const response = await client.post(
        //         `${BASE_URL}/workspaces/${workspaceId}/join`,
        //         {code: 'INVALID_CODE'},
        //         {
        //             headers: {
        //                 'Cookie': `flowboard-flowboard-cosc310-session=${key}`
        //             }, validateStatus: () => true
        //         }
        //     );
        //
        //     expect(response.status).toEqual(400); // Bad Request
        //     expect(response.data.error).toBe('Invalid invite code');
        // });

        it('should fail to join a workspace if already a member', async () => {
            const response = await client.post(
                `${BASE_URL}/workspaces/${workspaceId}/join`,
                {code: inviteCode},
                {
                    headers: {
                        'Cookie': `flowboard-flowboard-cosc310-session=${key}`
                    }, validateStatus: () => true
                });

            expect(response.status).toEqual(400); // Bad Request
            expect(response.data.error).toBe('Already a member');
        });
    });
});