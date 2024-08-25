<template>
  <div class="chat-panel" v-click-outside="handleClickOutside" ref="chatPanel">
    <button @click="toggleChats" class="chat-button">
      <div class="chat-icon">
        <i class="fas fa-comments"></i>
        <span v-if="unreadCount > 0" class="chat-count">{{ unreadCount }}</span>
      </div>
    </button>
    
    <div v-if="showChats" class="dropdown-menu" ref="dropdown">
      <p v-if="chats.length === 0">No chats.</p>
      <ul v-else>
        <li v-for="chat in chats" :key="chat.id" class="chat-item">
          <a @click="viewChat(chat)">
            <div class="chat-summary">
              <span class="chat-user">{{ chat.userName }}</span>
              <span class="chat-message">{{ chat.lastMessage }}</span>
              <span v-if="chat.unreadCount > 0" class="unread-badge">{{ chat.unreadCount }}</span>
            </div>
          </a>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      showChats: false,
      chats: [],
    };
  },
  computed: {
    unreadCount() {
      return this.chats.reduce((count, chat) => count + (chat.unreadCount || 0), 0);
    },
  },
  methods: {
    toggleChats() {
      this.showChats = !this.showChats;
    },
    viewChat(chat) {
      chat.unreadCount = 0;  // Mark all messages as read
      this.$router.push(`/chat/${chat.userId}`);
    },
    fetchChats() {
      // Fetch chats from the backend or a store
      this.chats = [
        { id: 1, userName: 'John', lastMessage: 'See you tomorrow!', unreadCount: 2, userId: 101 },
        { id: 2, userName: 'Jane', lastMessage: 'Hey, what\'s up?', unreadCount: 0, userId: 102 },
      ];
    },
    handleClickOutside() {
      this.showChats = false;
    },
  },
  mounted() {
    this.fetchChats();
  },
};
</script>

<style scoped>
.chat-panel {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.chat-button {
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
}

.chat-icon {
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

.chat-icon i {
  font-size: 20px;
}

.chat-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 250px;
}

.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chat-item {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.chat-item:last-child {
  border-bottom: none;
}

.chat-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-user {
  font-weight: bold;
}

.chat-message {
  flex: 1;
  margin-left: 10px;
  color: #666;
  font-size: 0.9em;
}

.unread-badge {
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 4px 8px;
  font-size: 0.8em;
}
</style>
