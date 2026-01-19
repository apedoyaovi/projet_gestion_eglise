const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const API_URLS = {
    MEMBER: `${API_BASE_URL}/members`,
    EVENT: `${API_BASE_URL}/events`,
    FINANCE: `${API_BASE_URL}/finance`,
    AUTH: `${API_BASE_URL}/auth`,
    USERS: `${API_BASE_URL}/users`,
    BACKUP: `${API_BASE_URL}/backup`,
    CHURCH_CONFIG: `${API_BASE_URL}/church-config`,
    SCHEDULES: `${API_BASE_URL}/schedules`,
    NOTIFICATIONS: `${API_BASE_URL}/notifications`,
};

export default API_BASE_URL;
