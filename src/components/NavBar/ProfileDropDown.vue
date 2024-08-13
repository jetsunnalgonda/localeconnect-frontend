<template>
    <div class="profile-menu" @click="toggleDropdown" v-click-outside="handleClickOutside" ref="profileMenu">
        <img :src="profilePicUrl || '/default-avatar.jpg'" alt="Profile Picture" class="profile-pic" />
        <div class="user-name">{{ userName }}</div> <!-- Display user's name -->
        <div v-if="showDropdown" class="dropdown-menu" ref="dropdownProfile">
            <a @click="performLogout">Logout</a>
            <router-link to="/profile">Update Profile</router-link>
            <a>hello</a>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { mapActions } from 'vuex';
import { getPresignedUrl } from '../../utils/apiService';

export default {
    data() {
        return {
            isLoading: false,
            // user: null,
            showDropdown: false,
            defaultAvatarUrl: '/default-avatar.jpg', // Default avatar image URL
            apiBaseUrl: process.env.VUE_APP_API_BASE_URL,
            // profilePicUrl: this.defaultAvatarUrl,
        };
    },
    computed: {
        ...mapGetters(['user', 'isAuthenticated']),

        userName() {
            console.log('userName change triggered');
            console.log('userName is', this.user?.name);
            console.log('user avatar is', this.user?.avatars)
            console.log('imageKey: ' + this.user?.avatars?.[0]?.url)
            return this.user?.name || 'Guest';
        },

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
    methods: {
        ...mapActions(['logout']),
        toggleDropdown() {
            this.showDropdown = !this.showDropdown;
        },
        handleClickOutside() {
            this.showDropdown = false;
        },
        async updateProfilePicUrl(user) {
            if (user && user.avatars && user.avatars.length > 0) {
                const avatarUrl = user.avatars[0].url;
                try {
                    this.profilePicUrl = await getPresignedUrl(avatarUrl);
                } catch (error) {
                    this.profilePicUrl = this.defaultAvatarUrl;
                }
            } else {
                this.profilePicUrl = this.defaultAvatarUrl;
            }
        },
        async performLogout() {
            this.logout();
            this.$router.push('/login');
        }
    },

};
</script>

<style scoped>
.profile-menu {
    position: relative;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    /* Stack items vertically */
    align-items: center;
    margin-bottom: 0px;
    padding-bottom: 0px;
    margin-left: 30px;
    /* Add spacing between the NotificationPanel and ProfileMenu */
}

.profile-menu a, .profile-menu a:hover {
    text-decoration: none;
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
</style>
