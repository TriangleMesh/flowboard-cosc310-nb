const {wrapper} = require("axios-cookiejar-support");
const axios = require("axios");
const {request} = require("node:http");
const {URL} = require("node:url");
const dotenv = require("dotenv");
const {AUTH_COOKIE} = require("../src/features/auth/constants");

dotenv.config({path: '../.env.local'});
const HOST = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000/";

function loginAndGetSessionValue() {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            email: "a@pm.com",
            password: "a@pm.com",
        });

        const options = {
            hostname: (new URL(HOST)).hostname,
            port: 3000,
            path: "/api/auth/login", // Updated path
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(postData),
            },
            rejectUnauthorized: false, // Ignore SSL certificate errors
        };

        const req = request(options, (res) => {
            let data = "";
            const cookies = res.headers["set-cookie"] || [];

            // Find the session cookie
            const sessionCookie = cookies.find((cookie) =>
                cookie.startsWith(AUTH_COOKIE + "=")
            );

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                if (sessionCookie) {
                    // Extract only the value part before the first semicolon
                    const sessionValue = sessionCookie.split("=")[1].split(";")[0];
                    resolve(sessionValue);
                } else {
                    reject("Session cookie not found");
                }
            });
        });

        req.on("error", (err) => reject(err));

        req.write(postData);
        req.end();
    });
}

const client = wrapper(axios.create({
    httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false, // Disable certificate validation
    }),
}));

// Base URL of your API
const BASE_URL = HOST + 'api/auth';

// Helper function to generate a random string for the alias
function generateRandomAlias() {
    return `testuser_${Math.random().toString(36).substring(7)}`;
}

async function registerAndGetSessionValue() {
    let randomAlias = generateRandomAlias();
    let email = `${randomAlias}@example.com`;

    const registerResponse = await client.post(`${BASE_URL}/register`, {
        name: randomAlias,
        email,
        password: 'password123',
    });

    //console.log(registerResponse.headers['set-cookie']);
    return findLoginCookieValue(registerResponse.headers['set-cookie']);
}

function findLoginCookieValue(cookies) {
    if (!Array.isArray(cookies)) {
        throw new Error("Cookies must be provided as an array of strings.");
    }

    // Find the cookie that starts with the session name
    const sessionCookie = cookies.find(cookie => cookie.startsWith(AUTH_COOKIE + "="));

    if (!sessionCookie) {
        return null; // Session cookie not found
    }

    return sessionCookie.split(';')[0].split("=")[1];
}

// Export the function to be used in other files
module.exports = {loginAndGetSessionValue, findLoginCookieValue, registerAndGetSessionValue};