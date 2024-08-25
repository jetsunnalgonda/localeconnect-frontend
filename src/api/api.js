import apiClient from './apiClient.js';

export const likeUser = async (userId, likeMessage) => {
  try {
    return await apiClient.post(`/api/like`, { likedUserId: userId, likeMessage });
  } catch (error) {
    console.error('api.js: Error liking/unliking user', error);
    throw error;  // Re-throw the error to handle it in the component
  }
};

export const fetchNearbyUsersFromAPI = async (location, radiusKm, page, limit) => {
    const response = await apiClient.get('/api/feed', {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        radiusKm,
        page,
        limit,
      },
    });
    return response.data;
  };

//   export const sendNotification = (userId, type, userName) => {
//     const ws = clients.get(userId);
  
//     if (ws && ws.readyState === WebSocket.OPEN) {
//       ws.send(JSON.stringify({
//         action: 'notification',
//         data: {
//           type: type,
//           userName: userName,
//         },
//       }));
//     }
//   };