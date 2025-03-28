import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { describe, it, expect } from '@jest/globals';
const { loginAndGetSessionValue } = require("./utils");


const client = wrapper(axios.create({
    httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false  // Disable certificate validation
    }),
    timeout:39000,

}));

describe('api after login test', () => {
    it('check if respond code is 200', async () => {

        //get session cookie value first
        let key;
        try {
            key = await loginAndGetSessionValue();
            console.log("Session Cookie Value:", key);
        } catch (error) {
            console.error("Error:", error);
        }

        //add the key we just got to our request
        const response = await client.get("https://localhost:3000/api/workspaces", {
            headers: {
                'Cookie': `flowboard-flowboard-cosc310-session=${key}`
            }
        });

        //make request without cookies
        //const response = await client.get("https://localhost:3000");

        //check the response we got
        expect(response.status).toEqual(200);
        expect(response.data).toBeDefined();
    });
});
