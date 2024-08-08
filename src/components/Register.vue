<template>
    <div class="register-container">
        <h2>Register</h2>
        <form @submit.prevent="register">
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" v-model="form.name" id="name" required />
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" v-model="form.email" id="email" required />
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" v-model="form.password" id="password" required />
            </div>
            <div class="form-group">
                <label for="bio">Bio:</label>
                <textarea v-model="form.bio" id="bio" required></textarea>
            </div>
            <div class="form-group">
                <label for="avatars">Avatars:</label>
                <input type="file" id="avatars" multiple @change="handleFileUpload" />
            </div>
            <div class="form-group">
                <label>Location:</label>
                <button @click="openMapPopup" type="button">Select Location</button>
                <p v-if="form.location.placeName">Place: {{ form.location.placeName }}</p>
            </div>
            <button type="submit" class="register-button">Register</button>
        </form>
        <button @click="goToLogin" class="login-button">Login</button>
        <MapPopup v-if="showMapPopup" :mapVisible="showMapPopup" @close="closeMapPopup"
            @location-selected="updateLocation" :currentLocation="form.location" />
    </div>
</template>

<script>
import axios from 'axios';
import MapPopup from './MapPopup.vue'; // Import the MapPopup component
import { fetchPlaceNameFromCoordinates } from '../utils/geocodeUtils'; // Import the utility functions

export default {
    name: 'UserRegister',
    components: {
        MapPopup, // Register the MapPopup component
    },
    data() {
        return {
            form: {
                name: '',
                email: '',
                password: '',
                bio: '',
                location: {
                    latitude: '',
                    longitude: '',
                    placeName: ''
                }
            },
            avatarFiles: [], // Store the uploaded files
            showMapPopup: false, // Controls the visibility of the map popup
            apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
        };
    },
    mounted() {
        this.getLocation();
    },
    methods: {
        handleFileUpload(event) {
            this.avatarFiles = Array.from(event.target.files);
        },
        async getPresignedUrl() {
            try {
                const response = await axios.get(`${apiBaseUrl}/presigned-url`, {
                    params: { filename: this.file.name },
                });
                this.presignedUrl = response.data.url;
            } catch (error) {
                console.error('Error getting presigned URL', error);
            }
        },
        async register() {
            try {
                const formData = new FormData();
                formData.append('name', this.form.name);
                formData.append('email', this.form.email);
                formData.append('password', this.form.password);
                formData.append('bio', this.form.bio);

                // Append location as a JSON string
                formData.append('location', JSON.stringify({
                    latitude: this.form.location.latitude,
                    longitude: this.form.location.longitude,
                    placeName: this.form.location.placeName
                }));

                this.avatarFiles.forEach(file => {
                    formData.append('avatars', file);
                });

                // Send registration data including location and avatar files to the server
                await axios.post(`${this.apiBaseUrl}/register`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });

                this.$router.push('/login');
            } catch (error) {
                console.error('Registration failed', error);
            }
        },
        getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        this.form.location.latitude = latitude;
                        this.form.location.longitude = longitude;
                        this.fetchPlaceName(latitude, longitude); // Fetch place name based on location
                    },
                    (error) => {
                        console.error('Error getting location', error);
                        // Handle errors or set default location if needed
                    }
                );
            } else {
                console.warn('Geolocation is not supported by this browser.');
            }
        },
        fetchPlaceName(lat, lng) {
            fetchPlaceNameFromCoordinates(lat, lng, (placeName) => {
                this.form.location.placeName = placeName || 'Unknown place';
            });
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
        goToLogin() {
            this.$router.push('/login');
        }
    }
};
</script>

<style scoped></style>
