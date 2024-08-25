// apiService.js
import axios from 'axios';

const apiBaseUrl = process.env.VUE_APP_API_BASE_URL; // Import your API base URL

export async function getPresignedUrl(imageKey) {
    console.log('Getting presigned URL for imageKey: ' + imageKey);
    try {
        const response = await axios.get(`${apiBaseUrl}/api/generate-presigned-url`, {
            params: { imageKey },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        return response.data.url || '/default-avatar.jpg';
    } catch (error) {
        console.error('Error fetching presigned URL:', error);
        return '/default-avatar.jpg'; // Fallback to a default image in case of error
    }
}
