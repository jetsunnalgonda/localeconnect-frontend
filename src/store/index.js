import { createStore } from 'vuex';
import axios from 'axios';

const userFromStorage = localStorage.getItem('user');
const parsedUser = userFromStorage ? JSON.parse(userFromStorage) : null;

export default createStore({
  state: {
    user: parsedUser,
    isAuthenticated: !!localStorage.getItem('token'),
    accessToken: localStorage.getItem('token') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
  },
  mutations: {
    setTokens(state, { accessToken, refreshToken }) {
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    setUser(state, user) {
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    logoutUser(state) {
      state.user = null;
      state.accessToken = '';
      state.refreshToken = '';
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    setAuthenticated(state, status) {
      state.isAuthenticated = status;
      if (!status) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    },
  },
  actions: {
    async login({ commit, dispatch }, form) {
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/login`, form);
        const { token, refreshToken } = response.data;
        console.log('Access token received:', token);
        console.log('Refresh token received:', refreshToken);

        // Store tokens using Vuex mutations
        commit('setTokens', { accessToken: token, refreshToken });

        // Fetch user profile
        await dispatch('fetchUser');

        // Set authentication status
        commit('setAuthenticated', true);

        return { success: true };
      } catch (error) {
        console.error('Error logging in:', error);
        return { success: false, message: 'Login failed. Please check your email and password.' };
      }
    },
    async logout({ commit }) {
      try {
        commit('logoutUser');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    },
    async refreshToken({ commit, state }) {
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/refresh`, {
          token: state.refreshToken,
        });
        const { token, refreshToken } = response.data;

        // Update tokens in state and localStorage
        commit('setTokens', { accessToken: token, refreshToken });

        // Set authentication status to true after refreshing tokens
        commit('setAuthenticated', true);

        // Return true to indicate that tokens were successfully refreshed
        return true;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        commit('logoutUser');
        // Redirect to login if refresh fails
        // this.$router.push('/login');
        alert('Your session has expired. Please log in again.');
        // Return false to indicate failure
        return false;
      }
    },
    async fetchUser({ commit, dispatch }) {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        commit('setUser', response.data);
        // Ensure authentication status is true after fetching user
        commit('setAuthenticated', true);
      } catch (error) {
        console.error('Error fetching user:', error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Attempt to refresh the token if it's expired
          const refreshed = await dispatch('refreshToken');
          if (refreshed) {
            // Retry fetching the user after refreshing tokens
            await dispatch('fetchUser');
          } else {
            // If token refresh fails, handle logout
            commit('logoutUser');
            // this.$router.push('/login');
            alert('Your session has expired. Please log in again.');
          }
        } else {
          // For other errors, handle logout
          commit('logoutUser');
          // this.$router.push('/login');
          alert('An error occurred. Please log in again.');
        }
      }
    },
    startTokenRefresh({ dispatch }) {
      const refreshInterval = 15 * 60 * 1000; // Refresh every 15 minutes
      setInterval(() => {
        dispatch('refreshToken');
      }, refreshInterval);
    },
  },
  getters: {
    user: (state) => state.user,
    isAuthenticated: (state) => state.isAuthenticated,
    accessToken: (state) => state.accessToken,
  },
});
