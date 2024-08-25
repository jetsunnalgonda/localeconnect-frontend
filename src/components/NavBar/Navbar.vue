<template>
    <nav class="navbar">
        <div class="navbar-content">
            <div class="logo">
                <router-link to="/"><img src="../../assets/goodmessage-logo.png" /></router-link>
            </div>
            <div class="right-side">
                <ChatDropdown v-if="isAuthenticated" />
                <NotificationPanel v-if="isAuthenticated" />
                <ProfileDropDown v-if="isAuthenticated" />
            </div>
        </div>
    </nav>
</template>

<script>
import { mapGetters } from 'vuex';
import NotificationPanel from './NotificationPanel.vue';
import ProfileDropDown from './ProfileDropDown.vue';
import ChatDropdown from '../ChatDropdown.vue';

export default {
    name: 'NavBar',
    components: {
        NotificationPanel,
        ProfileDropDown,
        ChatDropdown,
    },
    computed: {
        ...mapGetters(['isAuthenticated']),
    },
};
</script>


<style scoped>
.right-side {
    display: flex;
    align-items: center;
}

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
</style>
