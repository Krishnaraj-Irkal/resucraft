import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL
});

// Attach Bearer token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const USER_FACING_MESSAGES = {
    401: 'Your session has expired. Please log in again.',
    403: (msg) => msg || 'You do not have permission to do that.',
    404: (msg) => msg || 'The requested resource was not found.',
    409: (msg) => msg || 'A conflict occurred. Please check your input.',
    429: 'Too many requests. Please wait a moment before trying again.',
    500: 'Something went wrong on our end. Please try again.',
};

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const serverMsg = error.response?.data?.message;

        if (status === 401) {
            localStorage.removeItem('token');
            toast.error(USER_FACING_MESSAGES[401]);
            setTimeout(() => { window.location.href = '/login'; }, 1500);
            return Promise.reject(error);
        }

        if (!error.response) {
            // Network error — no response at all
            toast.error('Unable to reach the server. Please check your connection.');
            return Promise.reject(error);
        }

        const template = USER_FACING_MESSAGES[status];
        if (template) {
            const message = typeof template === 'function' ? template(serverMsg) : template;
            error.userMessage = message;
        } else {
            error.userMessage = serverMsg || 'An unexpected error occurred.';
        }

        return Promise.reject(error);
    }
);

export default api;