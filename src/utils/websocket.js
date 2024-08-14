// src/utils/websocket.js

let ws = null;

export function initializeWebSocket(userId) {
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
    const parsedMessage = JSON.parse(event.data);
    handleSocketMessage(parsedMessage); //
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };

  ws.onerror = (error) => {
    console.error('WebSocket error', error);
  };
}

export function handleSocketMessage(message) {
  try {
    const parsedMessage = message //JSON.parse(message);

    if (parsedMessage && parsedMessage.data) {
      const { action, data } = parsedMessage;

      if (action === 'notification') {
        switch (data.type) {
          case 'LIKE':
            this.$notify({
              title: 'Profile Liked!',
              message: `${data.userName} liked your profile.`,
              type: 'success',
            });
            break;

          case 'COMMENT':
            this.$notify({
              title: 'New Comment!',
              message: `${data.userName} commented on your profile.`,
              type: 'info',
            });
            break;

          case 'FOLLOW':
            this.$notify({
              title: 'New Follower!',
              message: `${data.userName} started following you.`,
              type: 'success',
            });
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
    console.error('Failed to parse WebSocket message:', error, message);
  }
}

export function setupWebSocket() {
  this.socket = new WebSocket(this.socketServerUrl);

  this.socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('WebSocket message received:', message);

    if (message.action === 'updateUsers') {
      this.users = message.data;
    }

    if (message.action === 'notification') {
      this.notification = message.data;
      this.showNotification = true;

      // Hide the notification after 5 seconds
      setTimeout(() => {
        this.showNotification = false;
      }, 5000);
    }
  };

  this.socket.onopen = () => {
    console.log('WebSocket connection opened');
  };

  this.socket.onclose = () => {
    console.log('WebSocket connection closed');
  };

  this.socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

export function sendWebSocketMessage(action, data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ action, data }));
  }
}


export function handleSocketMessage_old(event) {
  let message;

  try {
    message = JSON.parse(event.data);
  } catch (error) {
    console.error("Failed to parse WebSocket message:", error);
    return;
  }

  if (!message || typeof message !== 'object') {
    console.error("Invalid WebSocket message:", message);
    return;
  }

  console.log('WebSocket message received:', message);

  if (message.action === 'updateUsers') {
    if (Array.isArray(message.data)) {
      this.users = message.data;
    } else {
      console.error('Expected array for updateUsers action data, but received:', message.data);
    }
  } else if (message.action === 'notification') {
    if (message.data) {
      this.notification = message.data;
      this.showNotification = true;

      // Hide the notification after 5 seconds
      setTimeout(() => {
        this.showNotification = false;
      }, 5000);
    } else {
      console.error('Expected object for notification action data, but received:', message.data);
    }
  }
}