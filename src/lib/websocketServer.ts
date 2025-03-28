import { WebSocketServer, WebSocket } from 'ws';
import { Client, Account, type Models, Databases, Query } from 'node-appwrite';
import * as dotenv from 'dotenv';
import path from 'node:path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const BACKENDKEY = process.env.BACKENDKEY!;
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const APPWRITE_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const APPWRITE_MEMBERS_ID = process.env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID!;

type ChatRoom = {
    name: string;
    clients: Set<WebSocket>;
};

type UserSession = Models.User<Models.Preferences>;

let client: Client;

// Helper function to authenticate using a session key
async function authenticate(sessionKey: string): Promise<UserSession> {
    if (!sessionKey) throw new Error('Invalid session key');

    client = new Client()
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT)
        .setSession(sessionKey);

    const account = new Account(client);
    return await account.get();
}

// Check if the user has access to the workspace
async function hasAccessToWorkspace(workspaceId: string, userId: string): Promise<boolean> {
    const databases = new Databases(client);
    const result = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_MEMBERS_ID,
        [Query.equal('userId', userId), Query.equal('workspaceId', workspaceId)]
    );
    return result.total > 0;
}

// Global state
const chatRooms: Map<string, ChatRoom> = new Map();
const notificationClients: Map<string, WebSocket> = new Map();

// Initialize WebSocket server
export function initServer() {
    const wss = new WebSocketServer({ port: 8080 });
    console.log('WebSocket server is running on ws://localhost:8080');

    wss.on('connection', async (ws: WebSocket, req) => {
        try {
            const url = new URL(req.url || '', `http://${req.headers.host}`);
            const chatRoomName = url.searchParams.get('chatroom');
            const session = url.searchParams.get('session');
            const channel = url.searchParams.get('channel');

            // Validate required parameters
            if (!session || !channel || !(channel === 'notification' || channel === 'chatroom' || channel === 'backend')) {
                ws.close(4001, 'Missing or invalid parameters.');
                return;
            }

            // Handle backend channel
            if (channel === 'backend') {
                handleBackendChannel(ws, session);
                return;
            }

            // Authenticate user for other channels
            const user = await authenticate(session);

            if (channel === 'notification') {
                handleNotificationChannel(ws, user);
                return;
            }

            if (channel === 'chatroom' && chatRoomName) {
                await handleChatroomChannel(ws, user, chatRoomName);
                return;
            }

            ws.close(4001, 'Invalid channel.');
        } catch (error) {
            console.error(`Error during connection: ${error}`);
            // @ts-ignore This is error type
            ws.close(4003, error.message);
        }
    });
}

// Handle backend channel
function handleBackendChannel(ws: WebSocket, session: string | null) {
    if (session !== BACKENDKEY) {
        console.warn(`Backend API received an invalid key: ${session}`);
        ws.close(4003, 'Invalid backend key.');
        return;
    }

    console.log('Backend API message forwarding service connected.');
    ws.on('message', (data: string) => {
        try {
            const { userId, message } = JSON.parse(data.toString());
            console.log(`Forwarding message to user: ${userId}`, message);
            sendWSNotificationToUser(userId, message);
        } catch (error) {
            console.error(`Failed to parse message: ${error}`);
        }
    });
}

// Handle notification channel
function handleNotificationChannel(ws: WebSocket, user: UserSession) {
    console.log(`User ${user.$id} authenticated and connected to notification channel.`);
    notificationClients.set(user.$id, ws);

    ws.on('close', () => {
        notificationClients.delete(user.$id);
        console.log(`User ${user.$id} disconnected from notification channel.`);
    });
}

// Handle chatroom channel
async function handleChatroomChannel(ws: WebSocket, user: UserSession, chatRoomName: string) {
    if (!(await hasAccessToWorkspace(chatRoomName, user.$id))) {
        ws.close(4003, 'Forbidden.');
        return;
    }

    console.log(`User ${user.name} authenticated and connected to chatroom ${chatRoomName}.`);

    let chatRoom = chatRooms.get(chatRoomName);
    if (!chatRoom) {
        chatRoom = { name: chatRoomName, clients: new Set() };
        chatRooms.set(chatRoomName, chatRoom);
    }
    chatRoom.clients.add(ws);

    // Send welcome message
    ws.send(JSON.stringify({ type: 'welcome', message: `Welcome to chatroom ${chatRoomName}, ${user.name}!` }));

    // Notify other users
    broadcastToChatRoom(chatRoom, { type: 'system', message: `${user.name} has joined the chatroom.` });

    // Handle messages from the client
    ws.on('message', (data: string) => {
        console.log(`Received message from ${user.name}: ${data}`);
        broadcastToChatRoom(chatRoom!, {
            type: 'message',
            username: user.name,
            message: data.toString(),
        });
    });

    // Handle disconnection
    ws.on('close', () => {
        console.log(`User ${user.name} disconnected from chatroom ${chatRoomName}.`);
        chatRoom?.clients.delete(ws);

        broadcastToChatRoom(chatRoom, { type: 'system', message: `${user.name} has left the chatroom.` });

        if (chatRoom && chatRoom.clients.size === 0) {
            chatRooms.delete(chatRoomName);
            console.log(`Chatroom ${chatRoomName} is now empty and has been removed.`);
        }
    });
}

// Broadcast a message to all users in a chatroom
function broadcastToChatRoom(chatRoom: ChatRoom | undefined, message: any) {
    if (!chatRoom) return;

    chatRoom.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// Send a notification to a specific user
function sendWSNotificationToUser(userId: string, message: any) {
    const tunnel = notificationClients.get(userId);

    if (tunnel && tunnel.readyState === WebSocket.OPEN) {
        tunnel.send(JSON.stringify(message));
        console.log("Sent notification to user:", userId);
    } else {
        console.warn(`Client for user ${userId} is not connected or ready.`);
    }
}

// Expose a method to send notifications externally
export function sendNotificationToUser(userId: string, message: any) {
    const socket = new WebSocket(`ws://localhost:8080?channel=backend&session=${BACKENDKEY}`);
    console.log("Connecting to WebSocket server backend channel");

    socket.onopen = () => {
        console.log("Connected to WebSocket server backend channel");
        socket.send(JSON.stringify({ userId, message }));
    };

    // @ts-ignore
    socket.onerror = (error: Event) => {
        console.error(`WebSocket error while sending notification: ${error}`);
    };
}