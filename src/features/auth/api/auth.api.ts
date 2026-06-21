import { api } from '@/lib/axios';

import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    VerifyOtpRequest,
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

export const verifyOtpApi = async (data: VerifyOtpRequest): Promise<string> => {
    const response = await api.post('/api/auth/verify', null, {
        params: {
            email: data.email,
            otp: data.otp,
        },
    });

    return response.data;
};
