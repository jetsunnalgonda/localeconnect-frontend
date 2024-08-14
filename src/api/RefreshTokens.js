// import apiClient from './apiClient';
import axios from 'axios';

// Function to refresh tokens
async function refreshTokens() {
  try {
    // Get the refresh token from local storage (or cookies)
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Send a request to refresh the tokens
    // const response = await apiClient('/refresh', { token: refreshToken });
    const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/refresh`, { token: refreshToken });


    // Extract the new tokens from the response
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    // Store the new tokens in local storage (or cookies)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    // Return the new access token for immediate use if needed
    return accessToken;
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    // Handle the error appropriately, e.g., by redirecting to the login page
    throw error;
  }
}

export default refreshTokens;
