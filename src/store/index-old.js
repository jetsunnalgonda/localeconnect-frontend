import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: !!localStorage.getItem('token'), // Initialize state based on token presence
  },
  mutations: {
    setAuthenticated(state, status) {
      state.isAuthenticated = status;
    },
  },
  actions: {
    setAuthenticated({ commit }, status) {
      commit('setAuthenticated', status);
    },
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
  },
});

