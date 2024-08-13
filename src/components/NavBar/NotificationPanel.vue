<template>
    <div class="notification-panel" v-click-outside="handleClickOutside" ref="notificationPanel">
        <button @click="toggleNotifications" class="notification-button">
            <div class="notification-icon">
                <i class="fas fa-bell"></i>
                <span v-if="unreadCount > 0" class="notification-count">{{ unreadCount }}</span>
            </div>
        </button>
        <div v-if="showNotifications" class="dropdown-menu" ref="dropdown">
            <p v-if="notifications.length === 0">No notifications.</p>
            <ul v-else>
                <li v-for="notification in notifications" :key="notification.id">
                    <a @click="viewNotification(notification)">{{ notification.summary }}</a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            showNotifications: false,
            notifications: [],
        };
    },
    computed: {
        unreadCount() {
            return this.notifications.filter(notification => !notification.read).length;
        },
    },
    methods: {
        toggleNotifications() {
            // event.stopPropagation(); // Prevent event bubbling
            this.showNotifications = !this.showNotifications;
        },
        viewNotification(notification) {
            notification.read = true;
            this.$router.push(`/notifications/${notification.id}`);
        },
        fetchNotifications() {
            // Fetch notifications from the backend or a store
            this.notifications = [
                { id: 1, summary: 'New message from John', read: false },
                { id: 2, summary: 'Your profile was viewed', read: true },
            ];
        },
        handleClickOutside() {
            // if (this.$refs.notificationPanel && !this.$refs.notificationPanel.contains(event.target)) {
                this.showNotifications = false;
            // }
        },
    },
    mounted() {
        this.fetchNotifications();
        // document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        // document.removeEventListener('click', this.handleClickOutside);
    },
};
</script>

<style scoped>
.notification-panel {
    position: relative;
    display: inline-block;
    cursor: pointer;
}

.notification-button {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
}

.notification-icon {
    position: relative;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 2px solid #fff;
    background-color: #333;
    color: #fff;
}

.notification-icon i {
    font-size: 20px; /* Adjust size of bell icon */
}

.notification-count {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: red;
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 12px;
}

.notifications-dropdown {
    position: absolute;
    right: 0;
    background-color: white;
    border: 1px solid #ccc;
    padding: 10px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    width: 200px;
}

.notifications-dropdown ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.notifications-dropdown li {
    padding: 5px 0;
}

.notifications-dropdown li a {
    color: black;
    text-decoration: none;
}

.notifications-dropdown li a:hover {
    color: black;
    text-decoration: none;
}
</style>
