import {WebSocketServer, WebSocket} from 'ws';
import {Client, Account, type Models, Databases, Storage, Query} from 'node-appwrite';
// @ts-ignore
import Preferences = Models.Preferences;
import * as dotenv from "dotenv";
import path from "node:path";

dotenv.config({path: path.resolve(process.cwd(), '.env.local')});
const BACKENDKEY = process.env.BACKENDKEY!;


type ChatRoom = {
    name: string;
    clients: Set<WebSocket>;
};
type UserSession = Models.User<Models.Preferences>;


let client: Client, user: Models.User<Preferences>;

// Helper function to authenticate using a session key
async function authenticate(sessionKey: string | null): Promise<Models.User<Preferences>> {
    if (!sessionKey) {
        throw new Error('Invalid session key');
    }
    client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    client.setSession(sessionKey);

    const account = new Account(client);
    user = await account.get();

    return user;
}

async function hasAccessToWorkspace({workspaceId}: { workspaceId: any }) {
    const databases = new Databases(client);

    const result = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID!,
        [Query.equal('userId', user.$id),
            Query.equal('workspaceId', workspaceId)]
    );
    return result.total > 0;
}


const chatRooms: Map<string, ChatRoom> = new Map();
let notificationClients: Map<string, WebSocket> = new Map();

export function initServer() {
    let wss: WebSocketServer = new WebSocketServer({port: 8080});
    console.log('WebSocket server is running on ws://localhost:8080');

    // Handle client connections
    wss.on('connection', async (ws: WebSocket, req) => {

        // Extract query parameters
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const chatRoomName = url.searchParams.get('chatroom');
        let session: string | null = null;
        session = url.searchParams.get('session');
        const channel = url.searchParams.get('channel');

        const isValidSession = !!session;
        const isNotificationChannel = channel === 'notification';
        const isBackendChannel = channel === 'backend';
        const isChatroomChannel = channel === 'chatroom' && !!chatRoomName;

        if (!(isValidSession && (isNotificationChannel || isChatroomChannel || isBackendChannel))) {
            console.error('Missing required parameters.');
            console.log('chatRoomName:', chatRoomName);
            console.log('session:', session);
            console.log('channel:', channel);
            ws.close(4001, 'session key, chatroom, and channel are required.');
            return;
        }

        if (!isBackendChannel) {
            console.log(`Authenticating user with session key: ${session}`);

            let user: UserSession;
            try {
                user = await authenticate(session!);
            } catch (error) {
                console.error(`Authentication failed for key: ${session}`);
                ws.close(4003, 'Invalid session key.');
                return;
            }

            if (channel === 'notification') {
                console.log(`User ${user.$id} authenticated and connected to notification channel.`);
                notificationClients.set(user.$id, ws);
                return;
            } else if (channel === 'chatroom') {
                if (!chatRoomName || !(await hasAccessToWorkspace({workspaceId: chatRoomName}))) {
                    ws.close(4003, 'Forbidden.');
                    return;
                }

                console.log(`User ${user.name} authenticated and connected to chatroom ${chatRoomName}.`);

                let chatRoom = chatRooms.get(chatRoomName);
                if (!chatRoom) {
                    chatRoom = {name: chatRoomName, clients: new Set()};
                    chatRooms.set(chatRoomName, chatRoom);
                }
                chatRoom.clients.add(ws);

                // Send a welcome message
                ws.send(JSON.stringify({
                    type: 'welcome',
                    message: `Welcome to chatroom ${chatRoomName}, ${user.name}!`
                }));

                // Notify other users in the chatroom
                broadcastToChatRoom(chatRoom, {
                    type: 'system',
                    message: `${user.name} has joined the chatroom.`
                });

                // Handle messages from the client
                ws.on('message', (data: string) => {
                    console.log(`Received message from ${user.name}: ${data}`);
                    broadcastToChatRoom(chatRoom!, {
                        type: 'message',
                        username: user.name,
                        message: data.toString(),
                    });
                });

                // Handle client disconnection
                ws.on('close', () => {
                    console.log(`User ${user.name} disconnected from chatroom ${chatRoomName}.`);
                    chatRoom?.clients.delete(ws);

                    broadcastToChatRoom(chatRoom, {
                        type: 'system',
                        message: `${user.name} has left the chatroom.`
                    });

                    if (chatRoom && chatRoom.clients.size === 0) {
                        chatRooms.delete(chatRoomName);
                        console.log(`Chatroom ${chatRoomName} is now empty and has been removed.`);
                    }
                });
            }
        } else if (channel === 'backend') { //backend api message forwarding service
            if (session == null || session !== BACKENDKEY) {
                console.warn(`Backend API received an invalid key:${session}`);
                return;
            }
            console.log('Backend API message forwarding service connected.');
            ws.on('message', (data: string) => {
                console.log(`Received message from backend: ${data}`);
                try {
                    const {userId, message} = JSON.parse(data.toString());
                    console.log(`Forwarding message to user: ${userId}`, message);
                    sendWSNotificationToUser(userId, message);
                } catch (error) {
                    console.error(`Failed to parse message: ${error}`);
                }
            });
        }

        // Handle errors
        ws.on('error', (error: Error) => {
            console.error(`WebSocket error: ${error.message}`);
        });
    });
}

// Helper function to broadcast a message to all users in a chatroom
function broadcastToChatRoom(chatRoom: ChatRoom | undefined, message: any) {
    if (!chatRoom) return;

    chatRoom.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

function sendWSNotificationToUser(userId: string, message: any) {
    const tunnel = notificationClients.get(userId);

    if (tunnel && tunnel.readyState === WebSocket.OPEN) {
        notificationClients.get(userId)?.send(JSON.stringify(message))
        console.log("Sent notification to user:", userId);
    } else {
        console.warn(`Client for user ${userId} is not connected or ready.`);
    }

    // notificationClients.forEach((client, key) => {
    //     if (key === userId && client.readyState === WebSocket.OPEN) {
    //         client.send(JSON.stringify(message));
    //         console.log("Sent notification to user:", userId);
    //     } else {
    //         console.warn(`Client for user ${key} is not connected ${userId}.`);
    //     }
    // })
}