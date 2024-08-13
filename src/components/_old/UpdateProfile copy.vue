<template>
  <div class="profile-container">
    <h2>Update Profile</h2>
    <form @submit.prevent="updateProfile">
      <div class="profile-pic-container" @click="triggerFileInput">
        <img :src="temporaryAvatarUrl" alt="Avatar Preview" class="profile-pic" />
        <input type="file" @change="handleAvatarChange" ref="fileInput" style="display: none;" />
      </div>
      <div class="form-group">
        <label>Name:</label>
        <input v-model="form.name" type="text" />
      </div>
      <div class="form-group">
        <label>Email:</label>
        <input v-model="form.email" type="email" />
      </div>
      <div class="form-group">
        <label>Bio:</label>
        <textarea v-model="form.bio"></textarea>
      </div>
      <div class="form-group">
        <label>Location:</label>
        <button @click="openMapPopup" type="button">Select Location</button>
        <p v-if="form.location.latitude && form.location.longitude">
          {{ form.location.placeName }}
          <!-- Coordinates: {{ form.location.latitude }}, {{ form.location.longitude }} -->
        </p>
        <MapPopup v-if="showMapPopup" :mapVisible="showMapPopup" @close="closeMapPopup"
          @location-selected="updateLocation" :currentLocation="form.location" />
      </div>
      <div>
        <button type="submit" class="save-button">Save</button>
      </div>
    </form>
    <div class="avatar-management" v-if="user && user.avatars && user.avatars.length">
      <h3>Your Avatars</h3>
      <div class="avatar-gallery">
        <img v-for="avatar in user.avatars" :key="avatar.id" :src="`${apiBaseUrl}/${avatar.url}`"
          alt="Avatar" class="avatar" @click="deleteAvatar(avatar.id)" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapActions } from 'vuex';
import MapPopup from './MapPopup.vue'; // Import the MapPopup component

export default {
  name: 'UpdateProfile',
  components: {
    MapPopup, // Register the MapPopup component
  },
  data() {
    return {
      user: null,
      form: {
        name: '',
        email: '',
        bio: '',
        location: {
          latitude: '',
          longitude: ''
        },
        password: '',
        avatars: [],
      },
      showUpload: false,
      temporaryAvatar: null,
      temporaryAvatarUrl: '',
      showMapPopup: false, // Controls the visibility of the map popup
    };
  },
  mounted() {
    const apiBaseUrl = process.env.VUE_APP_API_BASE_URL;
  },
  computed: {
    ...mapGetters(['user', 'isAuthenticated']),
    profilePicUrl() {
      return this.user?.avatars?.[0]?.url
        ? `${apiBaseUrl}/${this.user.avatars[0].url}`
        : '/default-avatar.jpg';
    },
    userName() {
      return this.user?.name || 'Guest';
    },
  },
  methods: {
    ...mapActions(['setUser']),
    async fetchUserData() {
      try {
        const response = await axios.get(`${apiBaseUrl}/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        this.user = response.data;
        this.form = { ...this.user };
        this.form.avatars = this.user.avatars || [];
        this.temporaryAvatarUrl = this.profilePicUrl; // Set initial avatar
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    },
    handleAvatarChange(event) {
      const file = event.target.files[0];
      this.temporaryAvatar = file;
      this.temporaryAvatarUrl = URL.createObjectURL(file);
    },
    async updateProfile() {
      try {
        const formData = { ...this.form };
        formData.avatars = formData.avatars.map((avatar) => ({ id: avatar.id }));

        if (this.temporaryAvatar) {
          const avatarFormData = new FormData();
          avatarFormData.append('avatars', this.temporaryAvatar);

          await axios.put(`${apiBaseUrl}/profile/`, avatarFormData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });

          // Update user data after avatar upload
          const response = await axios.get(`${apiBaseUrl}/profile`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          formData.avatars = response.data.avatars;
        }

        const response = await axios.put(`${apiBaseUrl}/profile`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        this.setUser(response.data); // Update Vuex store
        this.fetchUserData(); // Refresh user data
      } catch (error) {
        console.error('Error updating profile', error);
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    async deleteAvatar(avatarId) {
      try {
        await axios.delete(`${apiBaseUrl}/profile/avatar/${avatarId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        this.fetchUserData();
      } catch (error) {
        console.error('Error deleting avatar', error);
      }
    },
    openMapPopup() {
      this.showMapPopup = true;
    },
    closeMapPopup() {
      this.showMapPopup = false;
    },
    updateLocation(location) {
      this.form.location = location;
    },
  },
  created() {
    this.fetchUserData();
  },
};
</script>

<style scoped>
.profile-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.profile-pic-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.profile-pic {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.save-button {
  margin-top: 20px;
}

.avatar-management {
  margin-top: 30px;
}

.avatar-gallery {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover;
}
</style>