// In store/index.js
import { createStore } from 'vuex';

// Retrieve user data from localStorage
const userFromStorage = localStorage.getItem('user');
const parsedUser = userFromStorage ? JSON.parse(userFromStorage) : null;

export default createStore({
    state: {
        user: parsedUser, // Initialize user data from localStorage
        isAuthenticated: !!localStorage.getItem('token'),
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
            localStorage.setItem('user', JSON.stringify(user)); // Save user data in localStorage
        },
        setAuthenticated(state, status) {
            state.isAuthenticated = status;
            if (!status) {
                localStorage.removeItem('user'); // Clear user data if not authenticated
                localStorage.removeItem('token');
            }
        },
    },
    actions: {
        setUser({ commit }, user) {
            commit('setUser', user);
        },
        setAuthenticated({ commit }, status) {
            commit('setAuthenticated', status);
        },
    },
    getters: {
        user: (state) => state.user,
        isAuthenticated: (state) => state.isAuthenticated,
    },
});
