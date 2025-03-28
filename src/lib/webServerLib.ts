import {WebSocket} from "ws";
import * as dotenv from "dotenv";
import path from "node:path";

dotenv.config({path: path.resolve(process.cwd(), '.env.local')});
const BACKENDKEY = process.env.BACKENDKEY!;
export function sendNotificationToUser(userId: string, message: any) {
    const socket = new WebSocket('ws://localhost:8080?channel=backend&session=' + BACKENDKEY);
    console.log("Connecting to WebSocket server backend channel");
    socket.onopen = () => {
        console.log("Connected to WebSocket server backend channel");
        socket.send(JSON.stringify({userId, message}));
    };
}
