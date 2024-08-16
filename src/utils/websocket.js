// src/utils/websocket.js

let ws = null;

export function initializeWebSocket(userId, notifyCallback) {
  if (ws) {
    console.log('Closing existing WebSocket connection');
    ws.close(); // Close the existing connection
  }
  console.log('Creating a new WebSocket connection with the userId: ' + userId);
  ws = new WebSocket(`${process.env.VUE_APP_SOCKET_SERVER_URL}/?userId=${userId}`);

  ws.onopen = () => {
    console.log('WebSocket connection opened');
  };

  ws.onmessage = (event) => {
    console.log('WebSocket message received: ' + event.data);
    const parsedMessage = JSON.parse(event.data);
    handleSocketMessage(parsedMessage, notifyCallback); // Pass the callback
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };

  ws.onerror = (error) => {
    console.error('WebSocket error', error);
  };
}

export function handleSocketMessage(message, notifyCallback) {
  try {
    const parsedMessage = message; // No need to parse again, it was already parsed

    if (parsedMessage && parsedMessage.data) {
      const { action, data } = parsedMessage;

      if (action === 'notification') {
        switch (data.type) {
          case 'LIKE':
            console.log(`${data.userName} liked your profile.`);
            if (notifyCallback && typeof notifyCallback === 'function') {
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
            if (notifyCallback && typeof notifyCallback === 'function') {
              notifyCallback({
                title: 'New Comment!',
                message: `${data.userName} commented on your profile.`,
                type: 'info',
              });
            }
            break;

          case 'FOLLOW':
            console.log(`${data.userName} started following you.`);
            if (notifyCallback && typeof notifyCallback === 'function') {
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
