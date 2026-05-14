import { api } from '@/lib/axios';

import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
} from '../types/auth.types';

export const loginApi = async (
    data: LoginRequest
): Promise<AuthResponse> => {
    const response = await api.post(
        '/api/auth/authenticate',
        data
    );

    return response.data;
};

export const registerApi = async (
    data: RegisterRequest
) => {
    const response = await api.post(
        '/api/auth/register',
        data
    );

    return response.data;
};