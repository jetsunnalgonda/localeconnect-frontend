import axios from 'axios';

export async function getUser() {
    try {
        const url = `${process.env.VUE_APP_API_BASE_URL}/profile`;
        const headers = getAuthHeaders();
        console.log(`Requesting user profile from: ${url}`);    

        const response = await axios.get(url, { headers });
        return response.data; // Return the user data directly
    } catch (error) {
        console.error('Error fetching user data', error);
        return null; // Return null or handle the error as needed
    }
}
