import axios from 'axios';
import {wrapper} from 'axios-cookiejar-support';
import {describe, it, expect, beforeAll} from '@jest/globals';
import {findLoginCookieValue} from "./utils";
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '../.env.local' });

const client = wrapper(axios.create({
    httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false, // Disable certificate validation
    }),
    timeout:39000,
}));

// Base URL of your API
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000/" + 'api/auth';

// Helper function to generate a random string for the alias
function generateRandomAlias() {
    return `testuser_${Math.random().toString(36).substring(7)}`;
}

describe('Authentication API Tests', () => {
    let randomAlias, email, key;

    // Register a new user before running other tests
    beforeAll(async () => {
        randomAlias = generateRandomAlias();
        email = `${randomAlias}@example.com`;

        const response = await client.post(`${BASE_URL}/register`, {
            name: randomAlias,
            email: email,
            password: 'password123',
        });

        expect(response.status).toEqual(200);
        expect(response.data.success).toBe(true);
        expect(response.headers['set-cookie']).toBeDefined();
        key = findLoginCookieValue(response.headers['set-cookie']);
    });

    // ** REGISTER ENDPOINT TESTS **
    describe('POST /register', () => {
        it('should fail to register with an existing email', async () => {
            const response = await client.post(`${BASE_URL}/register`, {
                name: randomAlias,
                email, // Use the same email as the pre-registered user
                password: 'password123',
            }, {
                validateStatus: () => true, // Allow non-2xx responses
            });

            expect(response.status).toEqual(500);
        });

        it('should fail to register with missing fields', async () => {
            const response = await client.post(`${BASE_URL}/register`, {
                name: '', // Missing name
                email: '', // Missing email
                password: '', // Missing password
            }, {
                validateStatus: () => true, // Allow non-2xx responses
            });

            expect(response.status).toEqual(400); // Bad Request
            expect(response.data.success).toBe(false);
        });
    });

    // ** LOGIN ENDPOINT TESTS **
    describe('POST /login', () => {
        it('should login successfully and set a session cookie', async () => {
            const loginResponse = await client.post(`${BASE_URL}/login`, {
                email,
                password: 'password123',
            });

            // Check response status and success flag
            expect(loginResponse.status).toEqual(200);
            expect(loginResponse.data.success).toBe(true);

            // Validate the session cookie is set
            expect(loginResponse.headers['set-cookie']).toBeDefined();
        });

        it('should fail to login with invalid credentials', async () => {
            const response = await client.post(`${BASE_URL}/login`, {
                email,
                password: 'wrongpassword', // Incorrect password
            }, {
                validateStatus: () => true, // Allow non-2xx responses
            });

            expect(response.status).toEqual(500); // Unauthorized or server error
        });

        it('should fail to login with missing fields', async () => {
            const response = await client.post(`${BASE_URL}/login`, {
                email: '', // Missing email
                password: '', // Missing password
            }, {
                validateStatus: () => true, // Allow non-2xx responses
            });

            expect(response.status).toEqual(400); // Bad Request
            expect(response.data.success).toBe(false);
        });
    });

    // ** CURRENT USER ENDPOINT TESTS **
    describe('GET /current', () => {
        it('should retrieve the current user when authenticated', async () => {
            const currentResponse = await client.get(`${BASE_URL}/current`, {
                headers: {
                    Cookie: `flowboard-flowboard-cosc310-session=${key}`,
                },
            });

            // Check response status and user data
            expect(currentResponse.status).toEqual(200);
            expect(currentResponse.data.data).toBeDefined();
            expect(currentResponse.data.data.name).toBe(randomAlias); // Ensure the correct user is returned
        });

        it('should return 401 Unauthorized if not logged in', async () => {
            const response = await client.get(`${BASE_URL}/current`, {
                validateStatus: () => true, // Allow non-2xx responses
            });

            expect(response.status).toEqual(401); // Unauthorized
            expect(response.data.error).toBe('Unauthorized');
        });
    });

    // ** LOGOUT ENDPOINT TESTS **
    describe('POST /logout', () => {
        it('should logout the user and clear the session cookie', async () => {
            const logoutResponse = await client.post(`${BASE_URL}/logout`, {}, {
                headers: {
                    Cookie: `flowboard-flowboard-cosc310-session=${key}`,
                },
            });

            // Check response status and success flag
            expect(logoutResponse.status).toEqual(200);
            expect(logoutResponse.data.success).toBe(true);

            // Verify that the session cookie is cleared
            expect(findLoginCookieValue(logoutResponse.headers['set-cookie']).length).toBe(0);
        });

        it('should fail to logout if not logged in', async () => {
            const response = await client.post(`${BASE_URL}/logout`, {}, {
                validateStatus: () => true, // Allow non-2xx responses
            });

            expect(response.status).toEqual(401); // Unauthorized
            expect(response.data.error).toBe('Unauthorized');
        });
    });
});