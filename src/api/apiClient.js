// src/api/apiClient.js
import axios from 'axios';
import router from '../router'; 
import store from '../store'; 

// import { mapActions } from 'vuex';

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL, 
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Handle token refresh on a 403 error
    if (error.response && error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call Vuex action to refresh the token
        await store.dispatch('refreshToken');

        // Retry the original request with the new token
        const token = localStorage.getItem('token'); // Get updated token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login if refresh fails
        // localStorage.removeItem('token');
        // localStorage.removeItem('refreshToken');
        await store.dispatch('logout'); // Dispatch Vuex logout action
        router.push('/login');
        alert('Your session has expired. Please log in again.');
      }
    }

    return Promise.reject(error);
  }
);

// apiClient.interceptors.response.use(
//   response => response,
//   async error => {
//     const originalRequest = error.config;

//     if (error.response && error.response.status === 403 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem('refreshToken');
//         const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/refresh`, { token: refreshToken });

//         localStorage.setItem('token', response.data.token);
//         localStorage.setItem('refreshToken', response.data.refreshToken);

//         originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         store.dispatch('logout');
//         router.push('/login');
//         alert('Your session has expired. Please log in again.');
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default apiClient;
