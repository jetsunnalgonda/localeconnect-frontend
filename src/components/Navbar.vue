<template>
    <nav class="navbar">
        <div class="navbar-content">
            <div class="logo">
                <router-link to="/">Cool App</router-link>
            </div>
            <div v-if="isAuthenticated" class="profile-menu" @click="toggleDropdown">
                <img :src="profilePicUrl" alt="Profile Picture" class="profile-pic" />
                <div class="user-name">{{ userName }}</div> <!-- Display user's name -->
                <div v-if="showDropdown" class="dropdown-menu">
                    <a @click="logout">Logout</a>
                    <router-link to="/profile">Update Profile</router-link>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
import { mapGetters } from 'vuex';

// const apiBaseUrl = process.env.VUE_APP_API_BASE_URL;

export default {
    name: 'NavBar',
    data() {
        return {
            showDropdown: false,
            defaultAvatarUrl: '/default-avatar.jpg', // Default avatar image URL
            apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
        };
    },
    computed: {
        ...mapGetters(['user', 'isAuthenticated']),
        profilePicUrl() {
            const avatarUrl = this.user?.avatars?.[0]?.url;
            return avatarUrl ? `${this.apiBaseUrl}/${avatarUrl}` : this.defaultAvatarUrl;
        },
        userName() {
            return this.user?.name || 'Guest';
        },
        // profilePicUrl() {
        //     console.log('vuex user:', this.user);
        //     console.log('Token:', localStorage.getItem('token'));
        //     console.log('User:', localStorage.getItem('user'));

        //     const userString = localStorage.getItem('user');
        //     let firstAvatarUrl

        //     if (userString) {
        //         // Parse the user object from the JSON string
        //         const user = JSON.parse(userString);

        //         // Access the first avatar's URL
        //         firstAvatarUrl = user.avatars?.[0]?.url;

        //         console.log('User\'s first avatar:', firstAvatarUrl);
        //     } else {
        //         console.log('No user data found in localStorage.');
        //     }
        //     console.log(this.user); // Debugging
        //     const avatarUrl = firstAvatarUrl //this.user?.avatars?.[0]?.url;
        //     return avatarUrl ? `http://localhost:3010/${avatarUrl}` : '/default-avatar.jpg';
        // },
        // userName() {
        //     const userString = localStorage.getItem('user');
        //     if (this.user) {
        //         const user = JSON.parse(userString);
        //         return user.name || 'Anonymous'; // Provide a default name if none exists
        //     }
        //     return 'Anonymous';
        // },
    },
    methods: {
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
        },
        async logout() {
            localStorage.removeItem('token');
            this.$store.dispatch('setAuthenticated', false);
            this.$router.push('/login');
        },
    },
};
</script>

<style scoped>
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: #333;
    height: 60px;
    /* Fixed height for consistency */
}

.navbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 0px;
}

.logo {
    font-size: 1.5em;
    color: white;
    display: flex;
    align-items: center;
    height: 100%;
}

.logo a {
    color: white;
    text-decoration: none;
}

.profile-menu {
    position: relative;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    /* Stack items vertically */
    align-items: center;
    margin-bottom: 0px;
    padding-bottom: 0px;
}

.profile-pic {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #fff;
    object-fit: cover;
}

.user-name {
    margin-top: 5px;
    /* Space between avatar and name */
    color: white;
    font-size: 14px;
    text-align: center;
    /* Center text below the avatar */
    margin-bottom: 0px;
}

.dropdown-menu {
    position: absolute;
    top: 50px;
    right: 0;
    background: #fff;
    border: 1px solid #ddd;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    width: 200px;
    z-index: 1000;
    margin: 0;
    padding: 0;
}

.dropdown-menu a,
.dropdown-menu router-link {
    display: block;
    padding: 12px 16px;
    text-decoration: none;
    color: #333;
    border-bottom: 1px solid #eee;
    transition: background-color 0.3s;
    margin-right: 0px;
    border-radius: 8px;
}

.dropdown-menu a:hover,
.dropdown-menu router-link:hover {
    background-color: #f0f0f0;
}

.dropdown-menu a:last-child,
.dropdown-menu router-link:last-child {
    border-bottom: none;
}
</style>
