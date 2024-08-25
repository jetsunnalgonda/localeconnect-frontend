<template>
    <div class="profile-container">
        <!-- Overlay container -->
        <h2>Update Profile</h2>
        <form @submit.prevent="updateProfile" class="loading-overlay-container" :class="{ 'disabled': isLoading }">
            <!-- Profile Picture Section -->
            <div class="profile-pic-container" @click="triggerFileInput">
                <img :src="temporaryAvatarUrl" alt="Avatar Preview" class="profile-pic" />
                <input type="file" @change="handleAvatarChange" ref="fileInput" style="display: none;" />
            </div>

            <!-- Form Fields -->
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
                <p v-if="form.location.placeName">
                    Place Name: {{ form.location.placeName }}
                </p>
                <MapPopup v-if="showMapPopup" :mapVisible="showMapPopup" @close="closeMapPopup"
                    @location-selected="updateLocation" :currentLocation="form.location" />
            </div>

            <!-- Save Button -->
            <div>
                <button type="submit" class="save-button" :disabled="isLoading">
                    <span v-if="isLoading">Saving...</span>
                    <span v-else>Save</span>
                </button>
            </div>
        </form>

        <!-- Avatar Management Section -->
        <div class="avatar-management" v-if="user && user.avatars && user.avatars.length">
            <h3>Your Avatars</h3>
            <div class="avatar-gallery">
                <img v-for="avatar in user.avatars" :key="avatar.id" :src="avatar.presignedUrl || '/default-avatar.jpg'"
                    alt="Avatar" class="avatar" @click="deleteAvatar(avatar.id)" />
            </div>
        </div>
    </div>
</template>

<script>
import { getPresignedUrl } from '../utils/apiService';
import axios from 'axios';

import apiClient from '@/api/apiClient';

import { mapGetters, mapActions } from 'vuex';
import MapPopup from './MapPopup.vue';
import { useRouter } from 'vue-router';

import LoadingOverlay from '../utils/LoadingOverlay';
import '../utils/LoadingOverlay.css';

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
            loadingOverlay: null,
            isLoading: false,
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
        showOverlay() {
            if (this.loadingOverlay) {
                this.loadingOverlay.close(); // Close any existing instance
            }
            this.loadingOverlay = new LoadingOverlay({
                text: 'Updating profile...',
                color: '#1b62e1',
                spinnerType: 'lds-roller'
            });
            this.loadingOverlay.init('loading-overlay-container'); // Attach to element with class 'loading-overlay-container'
        },
        hideOverlay() {
            if (this.loadingOverlay) {
                this.loadingOverlay.close();
                this.loadingOverlay = null; // Clear reference
            }
        },
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
            const url = `${this.apiBaseUrl}/api/profile`;
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
            this.showOverlay();
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

                    await apiClient.put('/api/profile', avatarFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    const response = await apiClient.get('/api/profile');
                    formData.avatars = response.data.avatars;
                }

                const response = await apiClient.put('/api/profile', formData);

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
                this.hideOverlay();
            }
        },
        async deleteAvatar(avatarId) {
            try {
                await axios.delete(`${this.apiBaseUrl}/api/profile/avatar/${avatarId}`, {
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
        // console.log(typeof $); // Should output 'function' if jQuery is loaded
        // console.log('jQuery:', $);
        // console.log('waitMe:', $.fn.waitMe);
        this.fetchUserData();
    },
};
</script>

<style scoped>
.disabled {
    opacity: 0.6;
    pointer-events: none;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.loading-overlay-container {
    position: relative;
    /* Ensure that LoadingOverlay is positioned correctly */
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