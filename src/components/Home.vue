<template>
  <div class="home-container">
    <h2>Nearby Users</h2>

    <!-- <button @click="triggerTestNotification">Test Notification</button> -->
    <button @click="pushSuccessNotification">Push Success Notification</button>

    <Notivue v-slot="item">
      <Notification :item="item" />
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

    <!-- <NotificationSlide :notification="notification" :show="showNotification" /> -->

    <div v-if="showSnapIndicator" class="snap-indicator">
      <div class="snap-line"></div>
    </div>

  </div>
</template>

<script>
import apiClient from '@/api/apiClient';
import MockCard from './MockCard.vue';
import UserCard from './UserCard.vue';
// import NotificationSlide from './NotificationSlide.vue'; // Import the new component
import { Notivue, Notification, push } from 'notivue'

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
      showNotification: false, // Control for notification visibility
      notification: {}, // Notification data
    };
  },
  computed: {
    mockCardsCount() {
      return this.isLoading && this.numberOfFetchedUsers > 0 ? this.numberOfFetchedUsers : 0;
    }
  },
  mounted() {
    this.getUserLocation();
    this.setupWebSocket();
    window.addEventListener('scroll', this.checkScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.checkScroll);
  },
  methods: {
    triggerTestNotification() {
      push('This is a test notification!');
    },
    pushSuccessNotification() {
      push.success('Something good has been pushed!');
    },
    // triggerTestNotification() {
    //   console.log("trigger test notification");
    //   console.log('showNotification = ', this.showNotification);
    //   this.notification = {
    //     message: 'This is a test notification!',
    //   };
    //   this.showNotification = true;

    //   // Hide the notification after 5 seconds
    //   // setTimeout(() => {
    //   //   this.showNotification = false;
    //   // }, 5000);
    // },
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
        const response = await apiClient.get('/feed', {
          params: {
            latitude: this.userLocation.latitude,
            longitude: this.userLocation.longitude,
            radiusKm: this.radiusKm,
            page: this.page,
            limit: this.limit,
          },
        });

        if (response.data.length < this.limit) {
          this.hasMore = false;
        }

        this.numberOfFetchedUsers = response.data.length;

        const newUsers = await Promise.all(response.data?.map(async (user) => {
          const liked = await this.isLiked(user.id);
          return {
            ...user,
            liked
          };
        }));

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
    setupWebSocket() {
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
    },
    async isLiked(userIdToCheck) {
      try {
        const response = await apiClient.get(`/check-like`, {
          params: { userIdToCheck },
        });

        // console.log('Like status:', response.data);
        return response.data.liked;
      } catch (error) {
        console.error('Error checking like status', error);
        return false;
      }
    },
    async likeUser(userId) {
      const user = this.users.find(user => user.id === userId);

      if (user) {
        user.liked = !user.liked;
      }

      try {
        if (user.liked) {
          await apiClient.get(`/like`, { likedUserId: userId }, {});
        } else {
          await apiClient.get(`/like`, { likedUserId: userId }, {});
        }

        await this.fetchNearbyUsers();
      } catch (error) {
        console.error('Error liking/unliking user', error);
      }
    },
    handleViewDetails(user) {
      this.selectedUser = user;
    }
  }
};
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
</style>
