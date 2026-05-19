import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

const api = axios.create({
    baseURL: 'http://localhost:8080', // Đảm bảo đây là URL backend của bạn
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor để đính kèm JWT token vào mỗi request
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token; // Lấy token trực tiếp từ store
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor (tùy chọn): Xử lý lỗi 401/403 hoặc refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Ví dụ: Nếu token hết hạn (401), có thể tự động đăng xuất
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            // window.location.href = '/login'; // Có thể chuyển hướng về trang đăng nhập
        }
        return Promise.reject(error);
    }
);

export { api };
