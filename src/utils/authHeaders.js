export function getAuthHeaders() {
    return {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
}
