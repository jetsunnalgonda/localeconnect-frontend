<!-- UserCard.vue -->
<template>
  <div v-for="user in users" :key="user.id" class="user-card">
    <img v-if="user.avatars.length" :src="profilePicUrl || '/default-avatar.jpg'" alt="User Avatar" class="user-avatar">
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
</template>

<script>
import { getPresignedUrl } from '../../utils/apiService';

export default {
  props: {
    users: Object,
    apiBaseUrl: String,
    likeUser: Function,
    viewDetails: Function
  },
  data() {
    return {
      defaultAvatarUrl: '/default-avatar.jpg', // Default avatar image URL
    };
  },
  asyncComputed: {
    profilePicUrl: {
      async get() {
        this.isLoading = true;
        let presignedUrl = this.defaultAvatarUrl
        if (this.isAuthenticated) {
          presignedUrl = await getPresignedUrl(this.user?.avatars?.[0]?.url)
        }
        return presignedUrl
      },
      default() {
        return this.defaultAvatarUrl
      }
    }
  },

}
</script>

<style scoped>
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
  overflow: hidden;
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