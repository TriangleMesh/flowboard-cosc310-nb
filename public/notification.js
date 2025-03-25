/**
 * Function to display a notification in the top-right corner.
 * @param {string} message - The message to display in the notification.
 * @param {string} type - The type of notification ('success', 'error', 'info').
 * @param {number} duration - How long the notification should be visible (in milliseconds).
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Create the notification container if it doesn't exist
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    // Create the notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add the notification to the container
    container.appendChild(notification);

    // Trigger the "show" animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10); // Small delay to allow the browser to render the element

    // Remove the notification after the specified duration
    setTimeout(() => {
        notification.classList.remove('show');

        // Wait for the animation to finish before removing the element
        setTimeout(() => {
            notification.remove();
        }, 300); // Match this duration with the CSS transition duration
    }, duration);
}