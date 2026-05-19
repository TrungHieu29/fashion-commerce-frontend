import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { loginApi } from '../api/auth.api';

import { useAuthStore } from '@/stores/auth.store';

export const useLogin = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: loginApi,

        onSuccess: (data) => {
            setAuth(
                {
                    id: data.user.id,
                    username: data.user.username,
                    roles: [data.user.roleName], // Chuyển roleName thành mảng để khớp với Store
                },
                data.accessToken
            );
            navigate('/');
        },
    });
};