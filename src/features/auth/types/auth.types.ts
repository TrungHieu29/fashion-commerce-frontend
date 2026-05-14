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

export interface AuthResponse {
    accessToken: string;
    type: string;
    username: string;
    roles: string[];
}