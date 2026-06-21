import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { loginApi } from '../api/auth.api';

import { useAuthStore } from '@/stores/auth.store';

export const useLogin = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: async (payload: Parameters<typeof loginApi>[0]) => {
            const data = await loginApi(payload);

            if (data.user.status === 'PENDING') {
                throw new Error('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để nhập mã xác thực.');
            }

            return data;
        },

        onSuccess: (data) => {
            setAuth(
                {
                    id: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    status: data.user.status,
                    roles: [data.user.roleName], // Chuyển roleName thành mảng để khớp với Store
                },
                data.accessToken
            );
            navigate('/');
        },
    });
};
