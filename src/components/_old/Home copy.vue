<template>
  <div class="home-container">
    <h2>Nearby Users</h2>
    <div v-if="users.length === 0">
      <p>No nearby users found.</p>
    </div>
    <div v-else class="user-grid">
      <div v-for="user in users" :key="user.id" class="user-card">
        <img 
          v-if="user.avatars.length" 
          :src="`http://localhost:3010/${user.avatars[0].url}`" 
          alt="User Avatar" 
          class="user-avatar">
        <div class="user-info">
          <p>{{ user.name }}</p>
          <p>{{ user.location.placeName }}</p>
        </div>
        <div class="user-actions">
          <button @click="likeUser(user.id)" class="icon-button">
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

export default {
  name: 'HomePage',
  data() {
    return {
      users: [],
      userLocation: {
        latitude: null,
        longitude: null,
      },
      selectedUser: null,
    };
  },
  mounted() {
    this.getUserLocation();
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
      try {
        const response = await axios.get('http://localhost:3010/feed', {
          params: {
            latitude: this.userLocation.latitude,
            longitude: this.userLocation.longitude,
            radiusKm: 15000 // Example radius in kilometers
          },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        this.users = response.data;
      } catch (error) {
        console.error('Error fetching nearby users', error);
      }
    },
    likeUser(userId) {
      // Handle liking the user
      console.log('Liked user with ID:', userId);
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
  color: #888; /* Default icon color */
}

.icon-button:hover {
  color: #007bff;
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
