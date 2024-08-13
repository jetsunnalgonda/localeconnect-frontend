<template>
  <div class="home-container">
    <h2>Nearby Users</h2>
    <div v-if="isLoading">
      <MockFeed />
    </div>
    <div v-else-if="users.length === 0">
      <p>No nearby users found.</p>
    </div>
    <div v-else class="user-grid">
      <div v-for="user in users" :key="user.id" class="user-card">
        <img v-if="user.avatars.length" :src="`${this.apiBaseUrl}/${user.avatars[0].url}`" alt="User Avatar"
          class="user-avatar">
        <div class="user-info">
          <p>{{ user.name }}</p>
          <p>{{ user.location.placeName }}</p>
        </div>
        <div class="user-actions">
          <button @click="likeUser(user.id)" :class="{ 'icon-button': true, 'liked': user.liked }">
            <i class="fas fa-heart"></i>
          </button>
          <button @click="viewDetails(user)" class="icon-button">
            <i class="fas fa-info-circle"></i>
          </button>
        </div>
      </div>
    </div>
    <div v-if="selectedUser" class="user-details-modal">
      <div class="user-details-content">
        <h3>{{ selectedUser.name }}</h3>
        <p>Location: {{ selectedUser.location.placeName }}</p>
        <p>Email: {{ selectedUser.email }}</p>
        <p>Bio: {{ selectedUser.bio }}</p>
        <button @click="closeDetails" class="close-button">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import MockFeed from './MockFeed.vue';

export default {
  name: 'HomePage',
  components: {
    MockFeed
  },
  data() {
    return {
      isLoading: true,
      users: [],
      userLocation: {
        latitude: null,
        longitude: null,
      },
      selectedUser: null,
      socket: null, // Add socket property
      apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
      socketServerUrl: process.env.VUE_APP_SOCKET_SERVER_URL,
      page: 1,
      hasMore: true,
    };
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.checkScroll);
  },
  mounted() {
    this.getUserLocation();
    this.setupWebSocket();
    window.addEventListener('scroll', this.checkScroll);
  },
  methods: {
    async getUserLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            this.userLocation.latitude = position.coords.latitude;
            this.userLocation.longitude = position.coords.longitude;
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
        const response = await axios.get(`${this.apiBaseUrl}/feed`, {
          params: {
            latitude: this.userLocation.latitude,
            longitude: this.userLocation.longitude,
            radiusKm: 15000,
            page: this.page,
            limit: 20
          },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (response.data.length < 20) {
          this.hasMore = false; // No more data available
        }

        this.users = await Promise.all(response.data.map(async (user) => {
          // Check like status for each user
          const liked = await this.isLiked(user.id);
          return {
            ...user,
            liked
          };
        }));

        // this.users = [...this.users, ...await Promise.all(response.data.map(async (user) => {
        //   const liked = await this.isLiked(user.id);
        //   return {
        //     ...user,
        //     liked
        //   };
        // }))];
        
      } catch (error) {
        console.error('Error fetching nearby users', error);
      } finally {
        this.isLoading = true; //false; // Stop loading indicator
      }
    },
    setupWebSocket() {
      // Initialize WebSocket connection
      this.socket = new WebSocket(this.socketServerUrl); // Replace with your WebSocket server URL

      // Handle incoming messages

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('WebSocket message received:', message);

        // Example: Update the users list if the message contains user data
        if (message.action === 'updateUsers') {
          this.users = message.data;
        }
      };

      // Handle connection open
      this.socket.onopen = () => {
        console.log('WebSocket connection opened');
      };

      // Handle connection close
      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
      };

      // Handle connection errors
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    },
    async checkUserLikes_old() {
      try {
        const userIds = this.users.map(user => user.id);

        axios.get(`${this.apiBaseUrl}/check-like`, {
          params: {
            userIdToCheck: 2 // Replace with dynamic value if needed
          }
        })
          .then(response => {
            console.log('Like status:', response.data);
          })
          .catch(error => {
            console.error('Error checking like status:', error);
          });

        const response = await axios.post(`${this.apiBaseUrl}/check-like`, { userIdToCheck: userIds }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        // Update the local state with like statuses
        this.users = this.users.map(user => ({
          ...user,
          liked: response.data.includes(user.id)
        }));
      } catch (error) {
        console.error('Error checking like status', error);
      }
    },
    async isLiked(userIdToCheck) {
      try {

        // axios.get(`http://localhost:3010/check-like`, {
        //   params: {
        //     userIdToCheck: 2 // Replace with dynamic value if needed
        //   }
        // })
        //   .then(response => {
        //     console.log('Like status:', response.data);
        //   })
        //   .catch(error => {
        //     console.error('Error checking like status:', error);
        //   });

        const response = await axios.get(`${this.apiBaseUrl}/check-like`, {
          params: { userIdToCheck },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        console.log('Like status:', response.data);
        return response.data.liked;
      } catch (error) {
        console.error('Error checking like status', error);
        return false;
      }
    },
    async likeUser(userId) {
      console.log('Liked/unliked user with ID:', userId);

      // Toggle like status in local state
      const user = this.users.find(user => user.id === userId);

      if (user) {
        user.liked = !user.liked;
      }

      try {

        if (user.liked) {
          await axios.post(`${this.apiBaseUrl}/like`, { likedUserId: userId }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
        } else {
          await axios.post(`${this.apiBaseUrl}/like`, { likedUserId: userId }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
        }

        // Optionally update the server-side state or re-fetch users
        await this.fetchNearbyUsers();
      } catch (error) {
        console.error('Error liking/unliking user', error);
      }
      // Send WebSocket message to update the like status
      // if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      //   this.socket.send(JSON.stringify({
      //     action: user.liked ? 'like' : 'unlike',
      //     userId
      //   }));
      // }
    },
    viewDetails(user) {
      this.selectedUser = user;
    },
    closeDetails() {
      this.selectedUser = null;
    }
  }
};
</script>


<style scoped>
.home-container {
  padding: 20px;
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.user-card {
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #fff;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-info p {
  margin: 5px 0;
}

.user-actions {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 10px;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5em;
  color: #888;
  /* Default icon color */
  transition: color 0.3s ease;
}

.icon-button:hover {
  color: #007bff;
}

.icon-button.liked {
  color: #e74c3c;
  /* Color for liked state */
}

.user-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-details-content {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.close-button {
  background: none;
  border: 1px solid #111;
  background-color: #7f7d7d;
  padding: 5px 10px;
  cursor: pointer;
  margin-top: 10px;
  border-radius: 5px;
}

.close-button:hover {
  background-color: #999797;
}
</style>
