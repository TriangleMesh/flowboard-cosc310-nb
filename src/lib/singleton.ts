// import {WebSocketServer, WebSocket} from 'ws';
// import {Client, Account, type Models, Databases, Query} from 'node-appwrite';
// import * as dotenv from 'dotenv';
// import path from 'node:path';
//
// // Load environment variables
// dotenv.config({path: path.resolve(process.cwd(), '.env.local')});
//
//
// type ChatRoom = {
//     name: string;
//     clients: Set<WebSocket>;
// };
//
// const BACKENDKEY = process.env.BACKENDKEY!;
//
//
// type UserSession = Models.User<Models.Preferences>;
//
// // Singleton class for the WebSocket server
// class WebSocketServerSingleton {
//     private static instance: WebSocketServerSingleton | null = null;
//     private wss: WebSocketServer | undefined = undefined;
//     private chatRooms: Map<string, ChatRoom> = new Map();
//     private notificationClients: Map<string, WebSocket> = new Map();
//     private appwriteClient: Client;
//
//     // Private constructor to prevent direct instantiation
//     private constructor() {
//         this.appwriteClient = new Client()
//             .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
//             .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);
//         try {
//             this.wss = new WebSocketServer({port: 8080});
//             WebSocketServerSingleton.instance = this;
//             console.log('WebSocket server is running on ws://localhost:8080');
//             this.setupEventListeners();
//         } catch (Error) {
//             console.log('Error in websocket server')
//         }
//     }
//
//     // Static method to get the singleton instance
//     public static getInstance(): WebSocketServerSingleton {
//         if (!WebSocketServerSingleton.instance) {
//             WebSocketServerSingleton.instance = new WebSocketServerSingleton();
//         }
//         return WebSocketServerSingleton.instance;
//     }
//
//     // Authenticate a user using a session key
//     private async authenticate(sessionKey: string): Promise<UserSession> {
//         if (!sessionKey) {
//             throw new Error('Invalid session key');
//         }
//
//         const account = new Account(this.appwriteClient);
//         this.appwriteClient.setSession(sessionKey);
//         return await account.get();
//     }
//
//     // Check if a user has access to a workspace
//     private async hasAccessToWorkspace(workspaceId: string, userId: string): Promise<boolean> {
//         const databases = new Databases(this.appwriteClient);
//         const result = await databases.listDocuments(
//             process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
//             process.env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID!,
//             [Query.equal('userId', userId), Query.equal('workspaceId', workspaceId)]
//         );
//         return result.total > 0;
//     }
//
//     // Broadcast a message to all users in a chatroom
//     private broadcastToChatRoom(chatRoom: ChatRoom | undefined, message: any): void {
//         if (!chatRoom) return;
//
//         chatRoom.clients.forEach((client) => {
//             if (client.readyState === WebSocket.OPEN) {
//                 client.send(JSON.stringify(message));
//             }
//         });
//     }
//
//     // Send a notification to a specific user
//     public sendNotificationToUser(userId: string, message: any): void {
//         const client = this.notificationClients.get(userId);
//         if (client && client.readyState === WebSocket.OPEN) {
//             client.send(JSON.stringify(message));
//         } else {
//             console.warn(`Client for user ${userId} is not connected or ready.`);
//         }
//     }
//
//     // Setup WebSocket event listeners
//     private setupEventListeners(): void {
//         // @ts-ignore - wss is not null
//         this.wss.on('connection', async (ws: WebSocket, req) => {
//
//             // Extract query parameters
//             const url = new URL(req.url || '', `http://${req.headers.host}`);
//             const chatRoomName = url.searchParams.get('chatroom');
//             let session: string | null = null;
//             session = url.searchParams.get('session');
//             const channel = url.searchParams.get('channel');
//
//             const isValidSession = !!session;
//             const isNotificationChannel = channel === 'notification';
//             const isBackendChannel = channel === 'backend';
//             const isChatroomChannel = channel === 'chatroom' && !!chatRoomName;
//
//             if (!(isValidSession && (isNotificationChannel || isChatroomChannel || isBackendChannel))) {
//                 console.error('Missing required parameters.');
//                 console.log('chatRoomName:', chatRoomName);
//                 console.log('session:', session);
//                 console.log('channel:', channel);
//                 ws.close(4001, 'session key, chatroom, and channel are required.');
//                 return;
//             }
//
//             if (!isBackendChannel) {
//                 console.log(`Authenticating user with session key: ${session}`);
//
//                 let user: UserSession;
//                 try {
//                     user = await this.authenticate(session!);
//                 } catch (error) {
//                     console.error(`Authentication failed for key: ${session}`);
//                     ws.close(4003, 'Invalid session key.');
//                     return;
//                 }
//
//                 if (channel === 'notification') {
//                     console.log(`User ${user.$id} authenticated and connected to notification channel.`);
//                     this.notificationClients.set(user.$id, ws);
//                     return;
//                 } else if (channel === 'chatroom') {
//                     if (!chatRoomName || !(await this.hasAccessToWorkspace(chatRoomName, user.$id))) {
//                         ws.close(4003, 'Forbidden.');
//                         return;
//                     }
//
//                     console.log(`User ${user.name} authenticated and connected to chatroom ${chatRoomName}.`);
//
//                     let chatRoom = this.chatRooms.get(chatRoomName);
//                     if (!chatRoom) {
//                         chatRoom = {name: chatRoomName, clients: new Set()};
//                         this.chatRooms.set(chatRoomName, chatRoom);
//                     }
//                     chatRoom.clients.add(ws);
//
//                     // Send a welcome message
//                     ws.send(JSON.stringify({
//                         type: 'welcome',
//                         message: `Welcome to chatroom ${chatRoomName}, ${user.name}!`
//                     }));
//
//                     // Notify other users in the chatroom
//                     this.broadcastToChatRoom(chatRoom, {
//                         type: 'system',
//                         message: `${user.name} has joined the chatroom.`
//                     });
//
//                     // Handle messages from the client
//                     ws.on('message', (data: string) => {
//                         console.log(`Received message from ${user.name}: ${data}`);
//                         this.broadcastToChatRoom(chatRoom!, {
//                             type: 'message',
//                             username: user.name,
//                             message: data.toString(),
//                         });
//                     });
//
//                     // Handle client disconnection
//                     ws.on('close', () => {
//                         console.log(`User ${user.name} disconnected from chatroom ${chatRoomName}.`);
//                         chatRoom?.clients.delete(ws);
//
//                         this.broadcastToChatRoom(chatRoom, {
//                             type: 'system',
//                             message: `${user.name} has left the chatroom.`
//                         });
//
//                         if (chatRoom && chatRoom.clients.size === 0) {
//                             this.chatRooms.delete(chatRoomName);
//                             console.log(`Chatroom ${chatRoomName} is now empty and has been removed.`);
//                         }
//                     });
//                 }
//             } else if (channel ==='backend') { //backend api message forwarding service
//                 if (session == null || session !== BACKENDKEY){
//                     console.warn(`Backend API received an invalid key:${session}`);
//                     return;
//                 }
//                 console.log('Backend API message forwarding service connected.');
//                 ws.on('message', (data: string) => {
//                     console.log(`Received message from backend: ${data}`);
//                     try {
//                         const {userId, message} = JSON.parse(data.toString());
//                         WebSocketServerSingleton.getInstance().sendNotificationToUser(userId, message);
//                     } catch (error) {
//                         console.error(`Failed to parse message: ${error}`);
//                     }
//                 });
//             }
//
//             // Handle errors
//             ws.on('error', (error: Error) => {
//                 console.error(`WebSocket error: ${error.message}`);
//             });
//         });
//     }
// }
//
// // Export the sendNotificationToUser function
// // export function sendNotificationToUser(userId: string, message: any): void {
// //     WebSocketServerSingleton.getInstance().sendNotificationToUser(userId, message);
// // }
//
// // export function sendNotificationToUser(userId: string, message: any) {
// //     const socket = new WebSocket('ws://localhost:8080?channel=backend');
// //     console.log("Connecting to WebSocket server backend channel");
// //     socket.onopen = () => {
// //         console.log("Connected to WebSocket server backend channel");
// //         socket.send(JSON.stringify({userId, message}));
// //     };
// // }
//
//
//
// export function initServer(): void {
//     WebSocketServerSingleton.getInstance();
// }