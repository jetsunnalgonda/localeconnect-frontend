// src/utils/websocket.js

let ws = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelay = 2000; // Delay in milliseconds before reconnecting

function createWebSocket(userId) {
  console.log('Creating a new WebSocket connection with the userId: ' + userId);
  ws = new WebSocket(`${process.env.VUE_APP_SOCKET_SERVER_URL}/?userId=${userId}`);

  ws.onopen = () => {
    console.log('WebSocket connection opened');
    reconnectAttempts = 0; // Reset reconnect attempts on successful connection
  };

  ws.onmessage = (event) => {
    console.log('WebSocket message received: ' + event.data);
    const parsedMessage = JSON.parse(event.data);
    handleSocketMessage(parsedMessage); // Handle message without callback here
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
    handleReconnect(userId); // Attempt to reconnect
  };

  ws.onerror = (error) => {
    console.error('WebSocket error', error);
    // Optionally, handle WebSocket errors here
  };
}

function handleReconnect(userId) {
  if (reconnectAttempts < maxReconnectAttempts) {
    reconnectAttempts++;
    console.log(`Reconnecting in ${reconnectDelay}ms... (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
    setTimeout(() => createWebSocket(userId), reconnectDelay);
  } else {
    console.error('Max reconnect attempts reached');
  }
}

export function initializeWebSocket(userId, notifyCallback) {
  if (ws) {
    console.log('Closing existing WebSocket connection');
    ws.close(); // Close the existing connection
  }
  createWebSocket(userId);
}

export function handleSocketMessage(message) {
  try {
    const parsedMessage = message; // No need to parse again, it was already parsed

    if (parsedMessage && parsedMessage.data) {
      const { action, data } = parsedMessage;

      if (action === 'notification') {
        switch (data.type) {
          case 'LIKE':
            console.log(`${data.userName} liked your profile.`);
            if (typeof notifyCallback === 'function') {
              notifyCallback({
                title: 'Profile Liked!',
                message: `${data.userName} liked your profile.`,
                type: 'success',
                icon: '❤️',
              });
            }
            break;

          case 'COMMENT':
            console.log(`${data.userName} commented on your profile.`);
            if (typeof notifyCallback === 'function') {
              notifyCallback({
                title: 'New Comment!',
                message: `${data.userName} commented on your profile.`,
                type: 'info',
              });
            }
            break;

          case 'FOLLOW':
            console.log(`${data.userName} started following you.`);
            if (typeof notifyCallback === 'function') {
              notifyCallback({
                title: 'New Follower!',
                message: `${data.userName} started following you.`,
                type: 'success',
              });
            }
            break;

          // Add more cases as needed for other actions

          default:
            console.warn('Unknown notification type:', data.type);
        }
      }
    } else {
      console.warn('WebSocket message does not contain expected data:', parsedMessage);
    }
  } catch (error) {
    console.error('Failed to handle WebSocket message:', error, message);
  }
}

export function sendWebSocketMessage(action, data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    const message = JSON.stringify({ action, data });
    ws.send(message);
    console.log('Sent WebSocket message:', message);
  } else {
    console.error('WebSocket connection is not open');
  }
}
