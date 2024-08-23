<template>
  <div class="notifications-detail">
    <div class="header">
      <h2>Your Notifications</h2>
      <div class="actions">
        <button @click="markAllAsRead" class="mark-read-btn">Mark All as Read</button>
        <button @click="clearAllNotifications" class="clear-btn">Clear All</button>
      </div>
    </div>

    <div class="notification-list">
      <div v-for="notification in notifications" :key="notification.id" class="notification-item">
        <div class="notification-left">
          <img :src="notification.profilePicUrl || defaultAvatarUrl" alt="Profile Picture" class="profile-picture"
            @click="goToProfile(notification.userId)" />
        </div>
        <div class="notification-right">
          <p class="notification-text">{{ formatNotification(notification) }}</p>
          <p class="notification-date">{{ formatTime(notification.createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import apiClient from '@/api/apiClient';
import { formatTime, formatNotification } from '@/utils/notificationUtils';
import { getPresignedUrl } from '@/utils/apiService';
import ActionQueue from '@/utils/ActionQueue';

export default {
  data() {
    return {
      notificationQueue: new ActionQueue(),
      notifications: [],
      defaultAvatarUrl: '/default-avatar.jpg', // Replace with your default avatar path
    };
  },
  asyncComputed: {
    profilePicUrl: {
      async get() {
        let presignedUrl = this.defaultAvatarUrl;
        if (this.user && this.user.avatars.length) {
          presignedUrl = await getPresignedUrl(this.user.avatars[0].url);
        }
        return presignedUrl;
      },
      default() {
        return this.defaultAvatarUrl;
      }
    }
  },
  computed: {
    ...mapGetters(['user']),
  },
  methods: {
    async fetchProfilePicUrl(notification) {
      let presignedUrl = this.defaultAvatarUrl;

      if (notification && notification.extraInfo) {
        try {
          switch (notification.type) {
            case 'LIKE':
              if (notification.extraInfo.liker.avatars?.length) {
                presignedUrl = await getPresignedUrl(notification.extraInfo.liker.avatars[0].url);
              }
              break;
            case 'MESSAGE':
              if (notification.extraInfo.sender.avatars?.length) {
                presignedUrl = await getPresignedUrl(notification.extraInfo.sender.avatars[0].url);
              }
              break;
            case 'FOLLOW':
              if (notification.extraInfo.follower.avatars?.length) {
                presignedUrl = await getPresignedUrl(notification.extraInfo.follower.avatars[0].url);
              }
              break;
            default:
              break;
          }
        } catch (error) {
          console.error('Error fetching profile picture URL:', error);
        }
      }

      return presignedUrl;
    },
    fetchNotifications() {
      this.notificationQueue.enqueue(async () => {
        try {
          const { data } = await apiClient.get('/notifications');
          this.notifications = await Promise.all(
            data.map(async (notification) => {
              const profilePicUrl = await this.fetchProfilePicUrl(notification);
              return {
                ...notification,
                profilePicUrl,
              };
            })
          );
          console.log('this.notifications', this.notifications);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      });
    },

    formatNotification(notification) {
      return formatNotification(notification);
    },
    formatTime(createdAt) {
      return formatTime(createdAt);
    },
    goToProfile(userId) {
      this.$router.push(`/profile/${userId}`);
    },
    async markAllAsRead() {
      // API call to mark all notifications as read
      try {
        await apiClient.post('/notifications/mark-all-read');
        this.notifications.forEach(notification => (notification.isRead = true));
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    },
    async clearAllNotifications() {
      // API call to clear all notifications
      try {
        await apiClient.delete('/notifications');
        this.notifications = [];
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    },
  },
  mounted() {
    this.fetchNotifications();
  },
};
</script>

<style scoped>
.notifications-detail {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  font-size: 1.75rem;
  font-weight: 500;
  color: #212121;
}

.actions {
  display: flex;
  gap: 10px;
}

.mark-read-btn,
.clear-btn {
  background-color: #e0e0e0;
  color: #212121;
  padding: 8px 16px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.mark-read-btn:hover,
.clear-btn:hover {
  background-color: #d6d6d6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: #f0f0f0;
}

.notification-left {
  margin-right: 15px;
}

.profile-picture {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.profile-picture:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.notification-right {
  flex: 1;
}

.notification-text {
  font-size: 1rem;
  margin: 0;
  color: #424242;
}

.notification-date {
  font-size: 0.875rem;
  color: #757575;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .notification-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .notification-left {
    margin-bottom: 10px;
  }

  .profile-picture {
    width: 40px;
    height: 40px;
  }
}
</style>