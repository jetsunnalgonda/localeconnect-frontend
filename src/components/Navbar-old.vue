<!-- src/components/NavBar.vue -->
<template>
    <nav class="navbar">
      <router-link to="/" class="nav-link">Home</router-link>
      <!-- <router-link v-if="!isAuthenticated" to="/login" class="nav-link">Login</router-link>
      <router-link v-if="!isAuthenticated" to="/register" class="nav-link">Register</router-link> -->
      <button v-if="isAuthenticated" @click="logout" class="nav-button">Logout</button>
    </nav>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex';
  
  export default {
    name: 'NavBar',
    computed: {
      ...mapState(['isAuthenticated']),
    },
    methods: {
      ...mapActions(['setAuthenticated']),
      logout() {
        console.log('Logout button clicked');
        // Remove the JWT token from local storage
        localStorage.removeItem('token');
        // Update Vuex state
        this.setAuthenticated(false);
        // Redirect to home page
        this.$router.push('/login');
      },
    },
  };
  </script>
  
  <style scoped>
  /* Navbar container styling */
  .navbar {
    background-color: #333; /* Dark background color */
    padding: 1rem; /* Spacing around the navbar */
    display: flex;
    justify-content: space-between; /* Space out links and logout button */
    align-items: center;
  }
  
  /* Navbar content styling */
  .navbar-content {
    display: flex;
    align-items: center;
    gap: 1rem; /* Space between links and button */
    flex-grow: 1; /* Allow content to grow and take up available space */
  }
  
  /* Navbar links styling */
  .nav-link {
    color: #fff; /* White text color */
    text-decoration: none;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 4px;
  }
  
  .nav-link:hover {
    background-color: #555; /* Darker background on hover */
  }
  
  /* Navbar button styling */
  .nav-button {
    background-color: #f44336; /* Red background color */
    color: #fff; /* White text color */
    border: none;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-left: auto; /* Push the button to the right corner */
  }
  
  .nav-button:hover {
    background-color: #c62828; /* Darker red on hover */
  }
  </style>