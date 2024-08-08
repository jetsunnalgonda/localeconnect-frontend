import { createStore } from 'vuex';
import axios from 'axios';

const store = createStore({
  state() {
    return {
      user: null,
      isAuthenticated: !!localStorage.getItem('token'),
    };
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
      if (user) {
        localStorage.setItem('token', user.token);
      } else {
        localStorage.removeItem('token');
      }
    },
    LOGOUT(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
  actions: {
    async fetchUserData({ commit }) {
      try {
        const response = await axios.get('http://localhost:3010/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        commit('SET_USER', response.data);
      } catch (error) {
        console.error('Error fetching user data', error);
        commit('LOGOUT');
        throw error;  // Re-throw to handle in component
      }
    },
    logout({ commit }) {
      commit('LOGOUT');
      // Redirect to login or home
      this.$router.push('/login');
    },
  },
});

export default store;
