import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { getUserStatusMessage } from './status-messages';

const LOGIN_PATH = '/login';
const AUTH_MESSAGE_KEY = 'auth-message';
const SESSION_EXPIRED_MESSAGE = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
let isRedirectingToLogin = false;

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
            if (isJwtExpired(token)) {
                endAuthSession(SESSION_EXPIRED_MESSAGE);
                return Promise.reject(new axios.CanceledError(SESSION_EXPIRED_MESSAGE));
            }

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
                : SESSION_EXPIRED_MESSAGE;

            endAuthSession(message);
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

const isJwtExpired = (token: string) => {
    try {
        const [, payload] = token.split('.');
        if (!payload) return false;

        const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(window.atob(normalizedPayload));
        const exp = decodedPayload?.exp;

        if (typeof exp !== 'number') return false;

        return exp * 1000 <= Date.now() + 5000;
    } catch {
        return false;
    }
};

const endAuthSession = (message: string) => {
    if (isRedirectingToLogin) return;

    isRedirectingToLogin = true;
    useAuthStore.getState().logout();

    try {
        sessionStorage.setItem(AUTH_MESSAGE_KEY, message);
    } catch {
        // Storage can fail in private modes; redirect remains the important part.
    }

    if (window.location.pathname.startsWith(LOGIN_PATH)) {
        toast.error(message);
        isRedirectingToLogin = false;
        return;
    }

    window.location.replace(LOGIN_PATH);
};

export { api };
