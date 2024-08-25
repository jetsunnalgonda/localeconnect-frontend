<template>
  <div class="notification-panel" v-click-outside="handleClickOutside" ref="notificationPanel">

    <button @click="toggleNotifications" class="notification-button">
      <div class="notification-icon">
        <i class="fas fa-bell"></i>
        <span v-if="unreadCount > 0" class="notification-count">{{ unreadCount }}</span>
      </div>
    </button>

    <div v-if="showNotifications" class="dropdown-menu" ref="dropdown">
      <p v-if="notifications.length === 0" class="no-notifications">No notifications.</p>
      <ul v-else>
        <li v-for="notification in notifications.slice(0, 5)" :key="notification.id" class="notification-item">
          <a>
            <div>{{ formatNotification(notification) }}</div>
            <div class="smallText">{{ formatTime(notification.createdAt) }}</div>
          </a>
        </li>
      </ul>
      <button @click="goToAllNotifications" class="show-all-btn">Show All Notifications</button>
    </div>

  </div>
</template>




<script>
import websocketService from '@/utils/websocketService';
import { mapGetters } from 'vuex';
import apiClient from '@/api/apiClient';
import { formatTime, formatNotification } from '@/utils/notificationUtils';

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
    formatNotification(notification) {
      return formatNotification(notification);
    },
    formatTime(createdAt) {
      return formatTime(createdAt);
    },
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
        console.log('[fetchNotifications] data', data);
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
          case 'LIKE': {
            console.log(`[NotificationPanel] ${data.userName} liked your profile.`);
            this.notifications.unshift({
              id: data.id,
              type: data.type,
              referenceId: data.referenceId,
              userName: data.userName,
              createdAt: new Date(data.createdAt), // Convert to Date object if needed
              isRead: false,
            });
            break;
          }

          case 'UPDATE_LIKE_ID': {
            console.log('[NotificationPanel] UPDATE_LIKE_ID notification received');
            // Find the existing notification to update
            const updateIndex = this.notifications.findIndex(n => n.tempId === data.tempId);
            if (updateIndex !== -1) {
              // Update the notification with new data
              this.notifications.splice(updateIndex, 1, {
                ...this.notifications[updateIndex],
                referenceId: data.referenceId,
                isRead: false,
              });
            }
            break;
          }
          case 'REMOVE_LIKE': {
            console.log('[NotificationPanel] REMOVE_LIKE notification received');
            console.log('data.referenceId', data.referenceId);
            console.log('this.notifications', this.notifications);

            if (!data.referenceId) {
              this.fetchNotifications()
            } else {
              const existingNotificationIndex = this.notifications.findIndex(n => n.referenceId === data.referenceId);
              if (existingNotificationIndex !== -1) {
                this.notifications.splice(existingNotificationIndex, 1);
              }
            }
            break;
          }

          // Add more cases as needed for other actions

          default:
            break;
          // console.warn('Unknown notification type:', data.type);
        }

        console.log('this.notifications:', this.notifications)


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

    goToAllNotifications() {
      this.$router.push('/notifications');
      this.showNotifications = false;
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
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.3s;
}

.notification-button:hover {
  transform: scale(1.05);
}

.notification-icon {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(135deg, #4e54c8, #8f94fb);
  color: white;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
}

.notification-icon i {
  font-size: 20px;
}

.notification-count {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: bold;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  background-color: white;
  /* border: 1px solid #ccc; */
  padding: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 280px;
  max-height: 400px;
  overflow-y: auto;
}

.no-notifications {
  padding: 16px;
  text-align: center;
  color: #888;
}

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notification-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.notification-item:last-child {
  border-bottom: none;
}


.notification-item a {
  color: #333;
  font-weight: 500;
  text-decoration: none;
  display: block;
}

.notification-item .smallText {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
}

.notification-item a:hover {
  text-decoration: none;
}

.show-all-btn {
  display: block;
  margin: 12px auto;
  padding: 6px 12px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: #e0e0e0;
  color: #212121;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.show-all-btn:hover {
  background-color: #d6d6d6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
