export interface UserResponse {
    id: number;
    username: string;
    fullName: string;
    phone: string;
    status: string;
    email: string;
    avatar: string;
    gender: string;
    dateOfBirth: string;
    createdAt: string;
    roleName: string;
}

export interface UserUpdateRequest {
    // These are required by the backend's UserRequestDto for PUT operations
    username: string;
    password: string; // Assuming password is required for update validation or change
    fullName?: string;
    email?: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    avatar?: string;
}

export interface ShippingAddressResponse {
    id: number;
    userId: number;
    receiverName: string;
    phone: string;
    addressLine: string;
    city: string;
    district: string;
    isDefault: boolean;
}

export interface ShippingAddressRequest extends Omit<ShippingAddressResponse, 'id'> { }