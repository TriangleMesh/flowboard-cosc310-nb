document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const chatButton = document.getElementById('chatButton');
    const chatIframeContainer = document.getElementById('chatIframeContainer');
    const closeButton = document.getElementById('closeButton');

    // Show the chat iframe when the chat button is clicked
    chatButton.addEventListener('click', () => {
        toggleChatVisibility();
    });

    // Hide the chat iframe when the close button is clicked
    closeButton.addEventListener('click', () => {
        toggleChatVisibility();
    });

    function toggleChatVisibility() {
        if (chatIframeContainer.style.display === 'block') {
            chatIframeContainer.style.display = 'none';
        } else {
            chatIframeContainer.style.display = 'block';
        }

        let iframeElement = chatIframeContainer.getElementsByTagName("iframe")[0];

        // Extract the workspace ID from the current document's URL
        const workspaceIdMatch = document.URL.match(/\/workspaces\/([^/?]+)/); // Match "workspaces/<id>"
        const workspaceId = workspaceIdMatch ? workspaceIdMatch[1] : null;

        // Construct the desired iframe URL using the current host and workspace ID
        const iframeUrl = `${window.location.origin}/chatroom/room.html?id=${workspaceId}`;

        // Check if the iframe's src matches the desired URL
        if (iframeElement.src !== iframeUrl) {
            iframeElement.src = iframeUrl; // Update the iframe's src if it doesn't match
            console.log(`Iframe src updated to: ${iframeUrl}`);
        } else {
            console.log('Iframe src is already up-to-date.');
        }
    }
})


