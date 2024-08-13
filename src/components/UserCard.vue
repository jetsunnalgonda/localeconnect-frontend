<!-- UserCard.vue -->
<template>
  <div class="user-card">
    <img :src="profilePicUrl || defaultAvatarUrl" alt="User Avatar" class="user-avatar">
    <div class="user-info">
      <p class="user-name">{{ user.name }} id: {{user.id}}</p>
      <p class="user-location">{{ user.location.placeName }}</p>
    </div>
    <div class="user-actions">
      <button @click="likeUser(user.id)" :class="{ 'icon-button': true, 'liked': user.liked }">
        <i class="fas fa-heart"></i>
      </button>
      <button @click="viewDetails()" class="icon-button">
        <i class="fas fa-info-circle"></i>
      </button>
    </div>

    <div v-if="showDetails" class="user-details-modal">
      <div class="user-details-content">
        <img :src="profilePicUrl || defaultAvatarUrl" alt="User Avatar" class="user-details-avatar">
        <h3 class="user-name">{{ user.name }}</h3>
        <p class="user-location">Location: {{ user.location.placeName }}</p>
        <p class="user-email">Email: {{ user.email }}</p>
        <p class="user-bio">Bio: {{ user.bio }}</p>
        <button @click="closeDetails" class="close-button">Close</button>
      </div>
    </div>

  </div>
</template>

<script>
import { getPresignedUrl } from '../utils/apiService';

export default {
  props: {
    user: Object,
    apiBaseUrl: String,
    likeUser: Function,
  },
  data() {
    return {
      showDetails: false,
      defaultAvatarUrl: '/default-avatar.jpg', // Default avatar image URL
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
  methods: {
    viewDetails() {
      console.log('viewDetails')
      this.showDetails = true;
      this.$emit('viewDetails', this.user); // Emit event to parent
    },
    closeDetails() {
      this.$emit('viewDetails', null);
      this.showDetails = false;
    }
  }
}
</script>


<style scoped>
.user-card {
  border: 1px solid #e0e0e0;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background-color: #ffffff;
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

/* .user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
} */

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: 10px;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-info p {
  margin: 5px 0;
}

.user-name {
  font-size: 1.1em;
  font-weight: 600;
  color: #333;
}

.user-location {
  font-size: 0.9em;
  color: #777;
}

.user-email {
  font-size: 0.9em;
  color: #333;
}
 
.user-bio {
  font-size: 1em;
  color: #222;
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
  overflow: auto;
}

.user-details-avatar {
  width: 250px;
  height: 250px;
  object-fit: cover;
  margin-bottom: 10px;
  border-radius: 0;
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