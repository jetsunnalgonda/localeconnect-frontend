<template>
    <div class="logout">
      <p>Logging out...</p>
    </div>
  </template>
  
  <script>
  import { mapActions } from 'vuex';
  
  export default {
    name: 'LogOut',
    methods: {
      ...mapActions(['setAuthenticated']),
      logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.setUser(null); // Clear Vuex user state
        this.setAuthenticated(false); // Update the authentication state

        // this.$store.dispatch('setUser', null);
        this.$router.push('/login'); // Redirect to the login page after logging out
      },
    },
    mounted() {
      this.logout();
    },
  };
  </script>
  
  <style scoped>
  .logout {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-size: 1.5em;
  }
  </style>
  