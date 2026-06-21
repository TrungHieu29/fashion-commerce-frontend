export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    fullName?: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        username: string;
        fullName: string;
        email: string;
        roleName: string;
        status?: string;
        [key: string]: any; // Cho phép các trường mở rộng khác
    };
}
