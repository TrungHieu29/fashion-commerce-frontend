import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { getUserStatusMessage } from './status-messages';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const statusCode = error.response?.status;
        const serverMessage = error.response?.data?.message || error.response?.data?.error || '';
        const normalizedMessage = String(serverMessage).toLowerCase();
        const isAccountStatusError =
            statusCode === 403 ||
            normalizedMessage.includes('disabled') ||
            normalizedMessage.includes('inactive') ||
            normalizedMessage.includes('banned') ||
            normalizedMessage.includes('pending');

        if ((statusCode === 401 || statusCode === 403) && useAuthStore.getState().isAuthenticated) {
            const currentUserStatus = useAuthStore.getState().user?.status;
            const message = isAccountStatusError
                ? getUserStatusMessage(extractUserStatus(serverMessage) || currentUserStatus)
                : 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';

            useAuthStore.getState().logout();
            toast.error(message);

            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

const extractUserStatus = (message?: string) => {
    const upperMessage = String(message || '').toUpperCase();
    if (upperMessage.includes('PENDING')) return 'PENDING';
    if (upperMessage.includes('INACTIVE')) return 'INACTIVE';
    if (upperMessage.includes('BANNED')) return 'BANNED';
    return undefined;
};

export { api };
