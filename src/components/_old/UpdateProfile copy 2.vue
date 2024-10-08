<template>
    <div class="profile-container">
        <h2>Update Profile</h2>
        <form @submit.prevent="updateProfile">
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
                <button type="submit" class="save-button">Save</button>
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
        // profilePicUrl() {
        //     return this.user?.avatars?.[0]?.url
        //         ? `${this.apiBaseUrl}/${this.user.avatars[0].url}`
        //         : '/default-avatar.jpg';
        // },
        // async profilePicUrl() {
        //     if (this.user?.avatars?.[0]?.url) {
        //         return await this.getPresignedUrl(this.user.avatars[0].url);
        //     } else {
        //         return '/default-avatar.jpg';
        //     }
        // },
        userName() {
            return this.user?.name || 'Guest';
        },
    },
    methods: {
        ...mapActions(['setUser', 'setAuthenticated']),
        async fetchUserData() {
            try {
                const response = await axios.get(`${this.apiBaseUrl}/profile`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                this.user = response.data;
                this.form = { ...this.user };
                this.form.avatars = this.user.avatars || [];

                // Fetch pre-signed URLs for avatars
                for (const avatar of this.form.avatars) {
                    avatar.presignedUrl = await getPresignedUrl(avatar.url);
                }

                this.temporaryAvatarUrl = this.profilePicUrl;

            } catch (error) {
                console.error('Error fetching user data', error);
                this.handleServerError();
            }
        },
        async created() {
            await this.getPresignedUrl(this.user.avatars[0] || '');
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