import { api } from '@/lib/axios';

import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    VerifyOtpRequest,
    ResendOtpRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
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

export const resendOtpApi = async (data: ResendOtpRequest): Promise<string> => {
    const response = await api.post('/api/auth/resend-otp', data);
    return response.data;
};

export const forgotPasswordApi = async (data: ForgotPasswordRequest): Promise<string> => {
    const response = await api.post('/api/auth/forgot-password', data);
    return response.data;
};

export const resendResetOtpApi = async (data: ForgotPasswordRequest): Promise<string> => {
    const response = await api.post('/api/auth/resend-reset-otp', data);
    return response.data;
};

export const resetPasswordApi = async (data: ResetPasswordRequest): Promise<string> => {
    const response = await api.post('/api/auth/reset-password', data);
    return response.data;
};
