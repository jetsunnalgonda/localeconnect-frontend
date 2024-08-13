<template>
  <div class="login-container loading-overlay-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin" :class="{ 'disabled': isLoading }">
      <div class="form-group">
        <label for="email">Email:</label>
        <input v-model="form.email" id="email" type="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input v-model="form.password" id="password" type="password" required />
      </div>
      <button type="submit" class="login-button">Login</button>
      <button @click="goToRegister" class="register-button">Register</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import LoadingOverlay from '../utils/LoadingOverlay';
import '../utils/LoadingOverlay.css';

export default {
  name: 'LoginUser',
  data() {
    return {
      loadingOverlay: null,
      isLoading: false,
      fullPage: true,
      canCancel: true,
      useSlot: false,
      loader: 'spinner',
      color: '#007bff',
      bgColor: '#ffffff',
      height: 128,
      width: 128,

      form: {
        email: '',
        password: '',
      },
      errorMessage: '',
    };
  },
  methods: {
    showOverlay() {
      if (this.loadingOverlay) {
        this.loadingOverlay.close(); // Close any existing instance
      }
      this.loadingOverlay = new LoadingOverlay({
        text: 'Logging in...',
        color: '#1b62e1',
        spinnerType: 'lds-roller'
      });
      this.loadingOverlay.init('loading-overlay-container'); // Attach to element with class 'loading-overlay-container'
    },
    hideOverlay() {
      if (this.loadingOverlay) {
        this.loadingOverlay.close();
        this.loadingOverlay = null; // Clear reference
      }
    },
    async handleLogin() {
      this.isLoading = true;
      this.showOverlay();

      try {
        const result = await this.login(this.form);
        if (result.success) {
          this.$router.push('/'); // Redirect to home or another protected route
        } else {
          this.errorMessage = result.message;
        }
      } catch (error) {
        this.errorMessage = 'An error occurred during login.';
      } finally {
        this.isLoading = false;
        this.hideOverlay();
      }

    },
    goToRegister() {
      this.$router.push('/register');
    },
    ...mapActions(['login']),
  },
  // mounted() {
  //   this.showOverlay();
  // },
};
</script>

<style scoped>
.disabled {
  pointer-events: none;
}
.error-message {
  color: red;
}
</style>