<template>
  <div class="notification-panel" v-click-outside="handleClickOutside" ref="notificationPanel">
    <button @click="toggleNotifications" class="notification-button">
      <div class="notification-icon">
        <i class="fas fa-bell"></i>
        <span v-if="unreadCount > 0" class="notification-count">{{ unreadCount }}</span>
      </div>
    </button>
    <div v-if="showNotifications" class="dropdown-menu" ref="dropdown">
      <p v-if="notifications.length === 0">No notifications.</p>
      <ul v-else>
        <li v-for="notification in notifications" :key="notification.id">
          <a @click="viewNotification(notification)">{{ formatNotification(notification) }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import websocketService from '@/utils/websocketService';
import { mapGetters } from 'vuex';
import apiClient from '@/api/apiClient';

export default {
  data() {
    return {
      showNotifications: false,
      notifications: [],
    };
  },
  computed: {
    ...mapGetters(['user']),
    unreadCount() {
      return this.notifications.filter(notification => !notification.isRead).length;
    },
  },
  methods: {
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
    },
    viewNotification(notification) {
      notification.isRead = true;
      this.$router.push(`/notifications/${notification.id}`);
    },
    async fetchNotifications() {
      try {
        const { data } = await apiClient.get('/notifications');
        console.log('data', data);
        this.notifications = data;
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    },
    handleClickOutside(event) {
      if (this.$refs.notificationPanel && !this.$refs.notificationPanel.contains(event.target)) {
        this.showNotifications = false;
      }
    },
    // handleWebSocketMessage(message) {
    //   if (message.action === 'notification') {
    //     const { data } = message;
    //     this.notifications.unshift({
    //       id: data.id,
    //       type: data.type,
    //       referenceId: data.referenceId,
    //       isRead: false,
    //       createdAt: new Date(data.createdAt), // Convert to Date object if needed
    //     });
    //   }
    // },
    handleNotificationMenu(data) {
      console.log('[NotificationPanel.vue] Notification occurred:', data);
      if (data) {
        switch (data.type) {
          case 'LIKE':
            console.log(`[NotificationPanel] ${data.userName} liked your profile.`);
            // fetchNotifications()
            this.notifications.unshift({
              type: 'LIKE',
              userName: data.userName,
            });
            break;

          case 'COMMENT':
            console.log(`${data.userName} commented on your profile.`);
            this.notifications.unshift({
              title: 'New Comment!',
              message: `${data.userName} commented on your profile.`,
            });
            break;

          case 'FOLLOW':
            console.log(`${data.userName} started following you.`);
            this.notifications.unshift({
              title: 'New Follower!',
              message: `${data.userName} started following you.`,
            });
            break;

          // Add more cases as needed for other actions

          default:
            console.warn('Unknown notification type:', data.type);
        }
      }
    },
    // formatNotification(notification) {
    //   switch (notification.type) {
    //     case 'LIKE':
    //       return `Someone liked your profile.`;
    //     case 'message':
    //       return `You have a new message.`;
    //     case 'follow':
    //       return `You have a new follower.`;
    //     default:
    //       return `Notification: ${notification.referenceId}`;
    //   }
    // },
    formatNotification(notification) {
      console.log('[formatNotification] Notification:', notification)
      switch (notification.type) {
        case 'LIKE':
          console.log('notification.extraInfo', notification.extraInfo)
          if (notification.extraInfo && notification.extraInfo.liker) {
            return `${notification.extraInfo.liker.name} liked your profile.`;
          } else {
            return `${notification.userName} liked your profile.`;
          }
        case 'message':
          if (notification.extraInfo && notification.extraInfo.sender) {
            return `You have a new message from ${notification.extraInfo.sender.name}.`;
          } else {
            return `You have a new message.`;
          }
        case 'follow':
          if (notification.extraInfo && notification.extraInfo.follower) {
            return `${notification.extraInfo.follower.name} started following you.`;
          } else {
            return `You have a new follower.`;
          }
        default:
          return `Notification: ${notification.referenceId}`;
      }
    },

  },
  mounted() {
    this.fetchNotifications();
    console.log("[NotificationPanel] websocketService", websocketService)

    // Add listener for notifications if not already present
    // websocketService.addListener('notification', this.handleNotificationMenu);
    // Check if the listener is already added
    const existingListeners = websocketService.listeners.notification || [];
    const hasListener = existingListeners.some(listener => listener === this.handleNotificationMenu);

    if (!hasListener) {
      // Only add the listener if it's not already added
      websocketService.addListener('notification', this.handleNotificationMenu);
    } else {
      console.log("[NotificationPanel] already has a handleNotificationMenu listener")
      console.log("Existing listeners:", existingListeners)
    }
  },
  beforeUnmount() {
    // Remove listener for notifications
    websocketService.removeListener('notification', this.handleNotificationMenu);
  },
};
</script>

<style scoped>
.notification-panel {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.notification-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
}

.notification-icon {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid #fff;
  background-color: #333;
  color: #fff;
}

.notification-icon i {
  font-size: 20px;
  /* Adjust size of bell icon */
}

.notification-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 200px;
}

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-menu li {
  padding: 5px 0;
}

.dropdown-menu li a {
  color: black;
  text-decoration: none;
}

.dropdown-menu li a:hover {
  color: black;
  text-decoration: none;
}
</style>
