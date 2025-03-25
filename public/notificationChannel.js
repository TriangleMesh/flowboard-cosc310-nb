// Helper function to get a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}


document.addEventListener('DOMContentLoaded', function () {
    let socket;

    const sessionKey = getCookie("flowboard-flowboard-cosc310-session");
    if (!sessionKey) {
        alert('Session key not found. Please log in.');
        return;
    }

    const url = `ws://localhost:8080?session=${encodeURIComponent(sessionKey)}&channel=notification`;
    socket = new WebSocket(url);

    // Handle connection open
    socket.onopen = () => {
        console.log('Connected to the notification server');
    };

    // Handle incoming messages
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.message.toString())
        showNotification(data.message.toString(), 'info')
    };

    // Handle errors
    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        alert('An error occurred. Please try again.');
    };

});