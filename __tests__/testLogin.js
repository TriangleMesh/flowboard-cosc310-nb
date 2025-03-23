import axios from 'axios';
import {wrapper} from 'axios-cookiejar-support';
import {describe, expect, it} from '@jest/globals';

const client = wrapper(axios.create({
    httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false  // Disable certificate validation
    }),    timeout:39000,
    withCredentials: true, // Ensures that cookies are sent and received
}));


const correctUserCredentials = ({
    email: "a@pm.com",
    password: "a@pm.com",
});


describe('test if login is 200 when login using correctUserCredentials', () => {
    it('check if respond code is 200', async () => {
        const response = await client.post("https://localhost:3000/api/auth/login", correctUserCredentials);
        expect(response.status).toEqual(200);
    })

    it('check if set-cookie instruction exist', async () => {
        //todo
    })
});

//todo add test to check if login is 400 when login using incorrectUserCredentials