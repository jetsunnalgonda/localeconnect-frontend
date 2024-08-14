// In store/index.js
import { createStore } from 'vuex';
import axios from 'axios';

// Retrieve user data from localStorage
const userFromStorage = localStorage.getItem('user');
const parsedUser = userFromStorage ? JSON.parse(userFromStorage) : null;

export default createStore({
  state: {
    user: parsedUser, // Initialize user data from localStorage
    isAuthenticated: !!localStorage.getItem('token'),
    accessToken: localStorage.getItem('token') || '', // Store the access token
    refreshToken: localStorage.getItem('refreshToken') || '', // Store the refresh token
  },
  mutations: {
    setTokens(state, { accessToken, refreshToken }) {
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    clearTokens(state) {
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    setUser(state, user) {
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user)); // Save user data in localStorage
    },
    setAuthenticated(state, status) {
      state.isAuthenticated = status;
      if (!status) {
        localStorage.removeItem('user'); // Clear user data if not authenticated
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    },
    setToken(state, token) {
      state.accessToken = token;
      localStorage.setItem('token', token);
    },
    setRefreshToken(state, refreshToken) {
      state.refreshToken = refreshToken;
      localStorage.setItem('refreshToken', refreshToken);
    },
    logoutUser(state) {
      state.user = null;
      state.token = '';
      state.refreshToken = '';
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
  },
  actions: {
    async login({ commit, dispatch }, form) {
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/login`, form);
        const { token, refreshToken } = response.data;
        console.log('Access token received:', token);
        console.log('Refresh token received:', refreshToken);

        // Store tokens using Vuex mutations
        commit('setTokens', { accessToken: token, refreshToken });

        // Fetch user profile
        await dispatch('fetchUser');

        // Set authentication status
        await dispatch('setAuthenticated', true);

        // Return successful result
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
    async fetchUser({ commit }) {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        commit('setUser', response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Attempt to refresh the token if it's expired
          await this.dispatch('refreshToken');
          this.dispatch('fetchUser'); // Retry fetching the user
        }
      }
    },
    async refreshToken({ commit, state }) {
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/refresh`, {
          token: state.refreshToken,
        });
        commit('setAccessToken', response.data.token);
        commit('setRefreshToken', response.data.refreshToken);
      } catch (error) {
        console.log('Failed to refresh token:', error);
        commit('logout');
        // Redirect to login if refresh fails
        this.$router.push('/login');
        alert('Your session has expired. Please log in again.');
      }
    },
    setUser({ commit }, user) {
      commit('setUser', user);
    },
    setAuthenticated({ commit }, status) {
      commit('setAuthenticated', status);
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
    token: (state) => state.token,
  },
});
