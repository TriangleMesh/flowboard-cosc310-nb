let socket;

// Helper function to get a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Function to connect to the WebSocket server
function connectToServer() {
    //fetch chatroom from the URL
    const chatroom = new URLSearchParams(window.location.search).get("id");

    if (!chatroom) {
        alert('Please fill in all fields.');
        return;
    }

    // Retrieve session cookie (if using Appwrite or similar)
    const sessionKey = getCookie("flowboard-flowboard-cosc310-session");
    if (!sessionKey) {
        alert('Session key not found. Please log in.');
        return;
    }

    // Connect to the WebSocket server with query parameters
    const url = `ws://localhost:8080?chatroom=${encodeURIComponent(chatroom)}&session=${encodeURIComponent(sessionKey)}&channel=chatroom`;
    socket = new WebSocket(url);

    // Handle connection open
    socket.onopen = () => {
        console.log('Connected to the WebSocket server');
        document.getElementById('chat-interface').classList.remove('hidden');
    };

    // Handle incoming messages
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.message.toString())
        const chatBox = document.getElementById('chat-box');

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');

        if (data.type === 'welcome' || data.type === 'system') {
            messageDiv.classList.add('system-message');
            messageDiv.textContent = `[System] ${data.message}`;
        } else if (data.type === 'message') {
            messageDiv.textContent = `${data.username}: ${data.message.toString()}`;
            console.log(`Received message: ${data.message.toString()}`);
        }

        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
    };

    // Handle connection close
    socket.onclose = (event) => {
        console.log(`Disconnected from the WebSocket server. Code: ${event.code}, Reason: ${event.reason}`);
        alert('Connection closed. Please refresh the page to reconnect.');
    };

    // Handle errors
    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        alert('An error occurred. Please try again.');
    };
}

// Function to send a message
function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();

    if (!message) {
        alert('Message cannot be empty.');
        return;
    }

    // Send the message to the server
    socket.send(message);
    input.value = ''; // Clear the input field
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    connectToServer();
    document.getElementById('send-button').addEventListener('click', sendMessage);

    // Allow sending messages by pressing Enter
    document.getElementById('message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});