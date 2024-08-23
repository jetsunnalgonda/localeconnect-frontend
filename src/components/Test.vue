<template>
    <div class="notifications-detail">
        <h2>Notifications</h2>
        <ul>
            <li v-for="notification in notifications" :key="notification.id"
                :class="{ 'highlight': notification.id === highlightedNotificationId }"
                @click="highlightNotification(notification.id)">
                <p>{{ notification.message }}</p>
                <small>{{ notification.createdAt }}</small>
            </li>
        </ul>
        <button @click="clearAllNotifications">Clear All</button>
    </div>
</template>

<script>
export default {
    name: 'TestIt',
    data() {
        return {
            notifications: [], // Your notifications data
            highlightedNotificationId: null,
        };
    },
    methods: {
        highlightNotification(id) {
            this.highlightedNotificationId = id;
        },
        clearAllNotifications() {
            this.notifications = []; // Clear your notifications
        }
    }
};
</script>

<style scoped>
.highlight {
    background-color: #f0f0f0;
}
</style>