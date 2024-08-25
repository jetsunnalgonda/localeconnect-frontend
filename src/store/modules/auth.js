import apiClient from '@/api/apiClient'; // Use apiClient instead of axios

const userFromStorage = localStorage.getItem('user');
const parsedUser = userFromStorage ? JSON.parse(userFromStorage) : null;

export default {
  namespaced: true,
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
        const response = await apiClient.post(`/api/login`, form);
        const { token, refreshToken } = response.data;

        // Store tokens
        commit('setTokens', { accessToken: token, refreshToken });

        // Fetch user profile
        await dispatch('fetchUser');

        // Set authentication status
        commit('setAuthenticated', true);

        // Start token refresh loop
        dispatch('startTokenRefresh');

        return { success: true };
      } catch (error) {
        return { success: false, message: 'Login failed. Please check your email and password.' };
      }
    },
    async logout({ commit }) {
      commit('logoutUser');
    },
    async refreshToken({ commit, state }) {
      try {
        const response = await apiClient.post(`/api/refresh`, {
          token: state.refreshToken,
        });
        const { token, refreshToken } = response.data;

        // Update tokens in state and localStorage
        commit('setTokens', { accessToken: token, refreshToken });

        // Set authentication status
        commit('setAuthenticated', true);
        return true;
      } catch (error) {
        commit('logoutUser');
        alert('Your session has expired. Please log in again.');
        return false;
      }
    },
    async fetchUser({ commit }) {
      try {
        const response = await apiClient.get(`/api/profile`);
        commit('setUser', response.data);
        commit('setAuthenticated', true);
      } catch (error) {
        commit('logoutUser');
        alert('An error occurred. Please log in again.');
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
};
