import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { loginApi } from '../api/auth.api';

import { useAuthStore } from '@/stores/auth.store';

export const useLogin = () => {
    const navigate = useNavigate();
    const setToken = useAuthStore(
        (state) => state.setToken
    );

    return useMutation({
        mutationFn: loginApi,

        onSuccess: (data) => {
            setToken(data.accessToken);
            navigate('/');
        },
    });
};