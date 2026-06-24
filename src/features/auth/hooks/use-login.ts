import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth.store';
import { getUserStatusMessage } from '@/lib/status-messages';
import { loginApi } from '../api/auth.api';

export const useLogin = () => {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: async (payload: Parameters<typeof loginApi>[0]) => {
            const data = await loginApi(payload);

            if (data.user.status && data.user.status !== 'ACTIVE') {
                throw new Error(getUserStatusMessage(data.user.status));
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
                    roles: [data.user.roleName],
                },
                data.accessToken
            );
            navigate('/');
        },
    });
};
