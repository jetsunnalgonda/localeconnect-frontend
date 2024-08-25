<template>
  <div class="home-container">
    <h2>Nearby Users</h2>

    <!-- <button @click="triggerTestNotification">Test Notification</button> -->
    <!-- <button @click="pushSuccessNotification">Push Success Notification</button> -->

    <!-- <button @click="refreshAndFetchUser">Refresh Tokens and Fetch User</button> -->

    <Notivue v-slot="item">
      <Notification :item="item" :icons="myIcons" />
    </Notivue>
    <!-- Show mock cards during initial data loading -->
    <div v-if="isLoading && numberOfFetchedUsers === 0" class="user-grid">
      <MockCard v-for="n in 10" :key="n" />
    </div>

    <div v-else-if="users?.length === 0 && !isLoading">
      <p>No nearby users found.</p>
    </div>

    <div v-else class="user-grid" :class="{ 'disabled': isDisabled }">
      <UserCard v-for="user in users" :key="user.id" :user="user" :apiBaseUrl="apiBaseUrl" :likeUser="likeUser"
        @viewDetails="handleViewDetails" />
      <!-- Show mock cards while more data is loading -->
      <MockCard v-for="n in mockCardsCount" :key="n" />
    </div>

  </div>
</template>

<script>
import apiClient from '@/api/apiClient';
import MockCard from './MockCard.vue';
import UserCard from './UserCard.vue';
import { fetchNearbyUsersFromAPI } from '@/api/api';
import { mapGetters } from 'vuex';

// import { initializeWebSocket, sendWebSocketMessage } from '@/utils/websocket';
import websocketService from '@/utils/websocketService';

import { Notivue, Notification, push } from 'notivue'
import { markRaw } from 'vue'
import HeartIcon from './icons/HeartIcon.vue';
import CloseIcon from './icons/CloseIcon.vue';
// import store from '../store'
import { mapActions } from 'vuex';
import refreshTokens from '@/api/RefreshTokens';
import ActionQueue from '@/utils/ActionQueue';

import axios from 'axios';

export default {
  name: 'HomePage',
  components: {
    MockCard,
    UserCard,
    Notivue,
    Notification,
  },
  data() {
    return {
      likeQueue: new ActionQueue(),
      notify: null,
      numberOfFetchedUsers: 0,
      showSnapIndicator: false,
      snapTriggered: false,
      isLoading: true,
      fetchedUsers: 0,
      users: [],
      userLocation: {
        latitude: null,
        longitude: null,
      },
      isDisabled: false,
      selectedUser: null,
      socket: null,
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
      socketServerUrl: process.env.VUE_APP_SOCKET_SERVER_URL,
      page: 1,
      limit: 8,
      hasMore: true,
      radiusKm: 15000,
      showNotification: false,
      notification: {},
      myIcons: {
        success: markRaw(HeartIcon),
        error: '⛔️',
        // promise: null, 
        close: markRaw(CloseIcon),
      }
    };
  },
  computed: {
    ...mapGetters(['user']),
    mockCardsCount() {
      return this.isLoading && this.numberOfFetchedUsers > 0 ? this.numberOfFetchedUsers : 0;
    }
  },
  mounted() {
    // this.notify = useNotivue();
    this.getUserLocation();
    // initializeWebSocket(this.user.id, push.success);
    websocketService.initialize(this.user.id);
    // websocketService.addListener('notification', this.handleNotification);

    const existingListeners = websocketService.listeners.notification || [];
    const hasListener = existingListeners.some(listener => listener === this.handleNotification);

    if (!hasListener) {
      // Only add the listener if it's not already added
      websocketService.addListener('notification', this.handleNotification);
    }

    window.addEventListener('scroll', this.checkScroll);

    console.log("[Home] websocketService", websocketService)
  },
  beforeUnmount() {
    websocketService.removeListener('notification', this.handleNotification);
    window.removeEventListener('scroll', this.checkScroll);
  },
  methods: {
    ...mapActions(['refreshToken', 'fetchUser']),
    handleNotification(data) {
      if (data) {
        switch (data.type) {
          case 'LIKE':
            console.log(`[Home] ${data.userName} liked your profile.`);
            push.success({
              title: 'Profile Liked!',
              message: `${data.userName} liked your profile.`,
              icon: '❤️',
            });
            break;

          case 'COMMENT':
            console.log(`${data.userName} commented on your profile.`);
            push.success({
              title: 'New Comment!',
              message: `${data.userName} commented on your profile.`,
            });
            break;

          case 'FOLLOW':
            console.log(`${data.userName} started following you.`);
            push.success({
              title: 'New Follower!',
              message: `${data.userName} started following you.`,
            });
            break;
          case 'UPDATE_LIKE_ID':
            console.log('UPDATE_LIKE_ID notification received');
            break;
          case 'REMOVE_LIKE':
            console.log('UPDATE_LIKE_ID notification received');
            break;

          // Add more cases as needed for other actions

          default:
            console.warn('Unknown notification type:', data.type);
        }
      }
    },
    async refreshAndFetchUser() {
      try {
        // Refresh tokens and get the new access token
        const accessToken = await refreshTokens();

        // Use the new access token to make an authenticated request
        const response = await axios.get('/profile', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log('Protected data:', response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle the error, such as redirecting to the login page
      }

    },
    triggerTestNotification() {
      push('This is a test notification!');
    },
    pushSuccessNotification() {
      push.success({
        title: 'Profile Liked!',
        message: `Someone liked your profile.`,
        type: 'success',
      });
      // push.success('Something good has been pushed!');
    },
    async getUserLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            this.userLocation.latitude = position.coords.latitude;
            this.userLocation.longitude = position.coords.longitude;

            this.isLoading = false;
            await this.fetchNearbyUsers();
          },
          (error) => {
            console.error('Error getting location', error);
          }
        );
      } else {
        console.warn('Geolocation is not supported by this browser.');
      }
    },
    async fetchNearbyUsers() {
      if (this.isLoading || !this.hasMore) return;

      this.isLoading = true;

      try {
        const nearbyUsers = await fetchNearbyUsersFromAPI(
          this.userLocation, this.radiusKm, this.page, this.limit)

        if (nearbyUsers.length < this.limit) {
          this.hasMore = false;
        }
        this.numberOfFetchedUsers = nearbyUsers.length;

        const newUsers = await Promise.all(nearbyUsers?.map(async (user) => {
          const liked = await this.isLiked(user.id);
          return {
            ...user,
            liked
          };
        }));

        console.log('New users:', newUsers);

        this.users = [...new Set([...this.users, ...newUsers])];
        this.fetchedUsers = this.users?.length || 0;

        this.page += 1;
      } catch (error) {
        console.error('Error fetching nearby users', error);
      } finally {
        this.isLoading = false;
      }
    },
    checkScroll() {
      const offset = 220;
      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.offsetHeight;

      if (scrollPosition >= documentHeight - offset && !this.snapTriggered) {
        this.fetchNearbyUsers();
        this.snapTriggered = true;
        this.showSnapIndicator = true;
      } else if (scrollPosition < documentHeight - offset) {
        this.snapTriggered = false;
        this.showSnapIndicator = false;
      }
    },

    async isLiked(userIdToCheck) {
      try {
        const response = await apiClient.get(`/api/check-like`, {
          params: { userIdToCheck },
        });

        // console.log('Like status:', response.data);
        return response.data.liked;
      } catch (error) {
        console.error('Error checking like status', error);
        return false;
      }
    },
    likeUser(userId) {

      this.likeQueue.enqueue(async () => {
        console.log('Liker user id:', this.user.id);
        console.log('User id to be liked/disliked:', userId);

        if (!this.user || !this.user.name) {
          console.error('User data is not available');
          return;
        }

        const user = this.users.find(user => user.id === userId);

        if (user) {
          user.liked = !user.liked;  // Toggle like status
        }

        try {
          if (user.liked) {
            const now = Date.now();
            const tempId = `${now}-${Math.round(Math.random() * 1E9)}`;
            // Send WebSocket message for like
            websocketService.sendMessage('LIKE', { userId, userName: this.user.name, tempId: tempId, createdAt: now });

            // Perform database operation to create the like record
            const response = await apiClient.post('/api/like', { likedUserId: userId });

            // Optionally send an update with actual likeId after creation
            websocketService.sendMessage('UPDATE_LIKE_ID', { userId, tempId: tempId, referenceId: response.data.likeId });
          } else {
            // Perform dislike action (delete the like record from the database)
            // await apiClient.post('/dislike', { dislikedUserId: userId });
            const response = await apiClient.post('/api/like', { likedUserId: userId });

            // Send WebSocket message to remove the notification
            websocketService.sendMessage('REMOVE_LIKE', { userId, referenceId: response.data.likeId });
          }

          // Optionally refresh the nearby users list
          await this.fetchNearbyUsers();
        } catch (error) {
          console.error('Home.vue: Error liking/unliking user', error);

          // Revert the UI change if there was an error
          if (user) {
            user.liked = !user.liked;
          }
        }

      });
    },

    handleViewDetails(user) {
      this.selectedUser = user;
    }
  }
}
</script>

<style scoped>
.disabled {
  pointer-events: none;
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.snap-indicator {
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 5px;
  background-color: #ccc;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease-in-out;
}

.snap-indicator .snap-line {
  width: 30px;
  height: 3px;
  background-color: #000;
  border-radius: 2px;
}

.snap-indicator.show {
  transform: translateX(-50%) translateY(-5px);
}

.home-container {
  padding: 20px;
}

.success {
  color: rgb(240, 100, 100);
}
</style>
