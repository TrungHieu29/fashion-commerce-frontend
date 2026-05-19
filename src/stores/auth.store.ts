import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    username: string;
    roles: string[];
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

/**
 * Store quản lý trạng thái đăng nhập toàn cục sử dụng Zustand.
 * persist giúp lưu trữ thông tin vào localStorage để khi F5 trang không bị mất login.
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user, token) => set({
                user,
                token,
                isAuthenticated: true
            }),

            logout: () => set({
                user: null,
                token: null,
                isAuthenticated: false
            }),
        }),
        {
            name: 'auth-storage', // Tên key lưu trong LocalStorage
        }
    )
);