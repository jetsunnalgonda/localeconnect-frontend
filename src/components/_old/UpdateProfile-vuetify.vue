<template>
    <v-app>
      <v-container>
        <!-- Overlay with Loading Spinner -->
        <v-overlay :value="isLoading" absolute>
          <v-progress-circular indeterminate color="primary" size="64" width="8"></v-progress-circular>
        </v-overlay>
  
        <!-- Profile Update Form -->
        <v-card class="pa-4">
          <v-card-title>
            <h2>Update Profile</h2>
          </v-card-title>
  
          <v-form @submit.prevent="updateProfile">
            <!-- Profile Picture Section -->
            <v-avatar size="150" class="mx-auto">
              <v-img :src="temporaryAvatarUrl" @click="triggerFileInput"></v-img>
              <input type="file" @change="handleAvatarChange" ref="fileInput" style="display: none;" />
            </v-avatar>
  
            <!-- Form Fields -->
            <v-text-field v-model="form.name" label="Name"></v-text-field>
            <v-text-field v-model="form.email" label="Email" type="email"></v-text-field>
            <v-textarea v-model="form.bio" label="Bio"></v-textarea>
  
            <v-menu v-model="showMapPopup" :close-on-content-click="false">
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" @click="openMapPopup">Select Location</v-btn>
              </template>
              <v-card>
                <v-card-title>
                  Location
                </v-card-title>
                <v-card-text>
                  <p v-if="form.location.placeName">Place Name: {{ form.location.placeName }}</p>
                  <MapPopup v-if="showMapPopup" :mapVisible="showMapPopup" @close="closeMapPopup"
                    @location-selected="updateLocation" :currentLocation="form.location" />
                </v-card-text>
              </v-card>
            </v-menu>
  
            <!-- Save Button -->
            <v-btn type="submit" :loading="isLoading" color="primary">Save</v-btn>
          </v-form>
  
          <!-- Avatar Management Section -->
          <v-card v-if="user && user.avatars && user.avatars.length" class="mt-4">
            <v-card-title>
              <h3>Your Avatars</h3>
            </v-card-title>
            <v-card-text>
              <v-avatar v-for="avatar in user.avatars" :key="avatar.id" class="ma-2" size="60" @click="deleteAvatar(avatar.id)">
                <v-img :src="avatar.presignedUrl || '/default-avatar.jpg'" />
              </v-avatar>
            </v-card-text>
          </v-card>
        </v-card>
      </v-container>
    </v-app>
  </template>

<script>
import { getPresignedUrl } from '../../utils/apiService';
import axios from 'axios';
import { mapGetters, mapActions } from 'vuex';
import MapPopup from './MapPopup.vue';
import { useRouter } from 'vue-router';

// const apiBaseUrl = process.env.VUE_APP_API_BASE_URL;

export default {
    name: 'UpdateProfile',
    components: {
        MapPopup,
    },
    setup() {
        const router = useRouter();
        return { router };
    },
    data() {
        return {
            isLoading: true,
            fullPage: true,
            canCancel: true,
            useSlot: false,
            loader: 'spinner',
            color: '#007bff',
            bgColor: '#ffffff',
            height: 128,
            width: 128,
            user: null,
            form: {
                name: '',
                email: '',
                bio: '',
                location: {
                    placeName: '',
                },
                password: '',
                avatars: [],
            },
            showUpload: false,
            temporaryAvatar: null,
            temporaryAvatarUrl: '',
            showMapPopup: false,
            apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
            profilePicUrl: '/default-avatar.jpg',
        };
    },
    computed: {
        ...mapGetters(['user', 'isAuthenticated']),

        userName() {
            return this.user?.name || 'Guest';
        },
    },
    methods: {
        ...mapActions(['setUser', 'setAuthenticated']),
        async fetchUserData() {
            // this.loading = true;
            console.log('Fetching user data...');
            try {
                const response = await this.getUserProfile();
                this.user = response.data;
                this.form = { ...this.user };
                this.form.avatars = this.user.avatars || [];

                await this.loadAvatarUrls();

                // this.temporaryAvatarUrl = this.profilePicUrl;
                if (this.form.avatars.length > 0 && this.form.avatars[0].presignedUrl) {
                    this.temporaryAvatarUrl = this.form.avatars[0].presignedUrl;
                } else {
                    // Fallback to a default avatar if no avatar is found
                    this.temporaryAvatarUrl = '/default-avatar.jpg';
                }
                console.log('User data fetched successfully');
            } catch (error) {
                console.error('Error fetching user data', error);
                this.handleServerError();
            }
            // finally {
            //     this.loading = false; // Stop loading
            // }
        },
        async getUserProfile() {
            const url = `${this.apiBaseUrl}/profile`;
            const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
            console.log(`Requesting user profile from: ${url}`);
            return axios.get(url, { headers });
        },
        async loadAvatarUrls() {
            console.log('Loading avatar URLs...');
            for (const avatar of this.form.avatars) {
                try {
                    avatar.presignedUrl = await getPresignedUrl(avatar.url);
                    console.log(`Fetched presigned URL for avatar: ${avatar.url}`);
                    console.log(`Presigned URL: ${avatar.presignedUrl}`);
                } catch (error) {
                    console.error(`Failed to fetch presigned URL for avatar: ${avatar.url}`, error);
                    avatar.presignedUrl = '/default-avatar.jpg'; // Fallback URL
                }
            }
        },
        async created() {
            await getPresignedUrl(this.user.avatars[0] || '');
        },
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        handleAvatarChange(event) {
            const file = event.target.files[0];
            if (file) {
                this.temporaryAvatar = file;
                this.temporaryAvatarUrl = URL.createObjectURL(file);
            }
        },
        async updateProfile() {
            this.isLoading = true;

            try {
                const formData = { ...this.form };
                console.log(formData.avatars);
                formData.avatars = formData.avatars.map((avatar) => ({
                    id: avatar.id,
                    url: avatar.url || undefined
                }));

                if (this.temporaryAvatar) {
                    const avatarFormData = new FormData();
                    avatarFormData.append('avatars', this.temporaryAvatar);

                    await axios.put(`${this.apiBaseUrl}/profile`, avatarFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });

                    const response = await axios.get(`${this.apiBaseUrl}/profile`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    formData.avatars = response.data.avatars;
                }

                const response = await axios.put(`${this.apiBaseUrl}/profile`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });

                this.setUser(response.data);
                this.fetchUserData();
            } catch (error) {
                console.error('Error updating profile', error);
                // Check if error indicates a need to log out
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    this.handleServerError();
                } else {
                    // Handle other types of errors
                    console.error('An unexpected error occurred');
                }
            } finally {
                this.isLoading = false;
            }
        },
        async deleteAvatar(avatarId) {
            try {
                await axios.delete(`${this.apiBaseUrl}/profile/avatar/${avatarId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                this.fetchUserData();
            } catch (error) {
                console.error('Error deleting avatar', error);
                this.handleServerError();
            }
        },
        openMapPopup() {
            this.showMapPopup = true;
        },
        closeMapPopup() {
            this.showMapPopup = false;
        },
        updateLocation(location) {
            this.form.location = { placeName: location.placeName };
        },
        handleServerError() {
            // Redirect to login or another page
            // if (error.response && error.response.status === 401) {
            // Only redirect if it's an authentication issue
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            this.setUser(null); // Clear Vuex user state
            this.setAuthenticated(false); // Update the authentication state

            this.router.push('/login');
            // } else {
            //     console.error('Server error:', error);
            //     // Handle other types of errors accordingly
            // }
        },
    },
    created() {
        this.fetchUserData();
    },
};
</script>

<style scoped>
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.profile-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    animation: fadeIn 0.5s ease-in-out;
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