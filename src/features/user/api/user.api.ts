import { api } from '@/lib/axios';
import type { ShippingAddressRequest, ShippingAddressResponse, UserResponse, UserUpdateRequest } from '../types/user.types';

// User Profile APIs
export const getUserProfile = async (id: number): Promise<UserResponse> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
};

export const updateUserProfile = async (id: number, data: UserUpdateRequest): Promise<UserResponse> => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
};

// Shipping Address APIs
export const getAddresses = async (userId: number): Promise<ShippingAddressResponse[]> => {
    const response = await api.get(`/api/shipping-addresses/user/${userId}`);
    return response.data;
};

export const addAddress = async (data: ShippingAddressRequest): Promise<ShippingAddressResponse> => {
    const response = await api.post('/api/shipping-addresses', data);
    return response.data;
};

export const updateAddress = async (id: number, data: Partial<ShippingAddressRequest>): Promise<ShippingAddressResponse> => {
    const response = await api.put(`/api/shipping-addresses/${id}`, data);
    return response.data;
};

export const deleteAddress = async (id: number): Promise<void> => {
    await api.delete(`/api/shipping-addresses/${id}`);
};

export const setDefaultAddress = async (id: number): Promise<void> => {
    await api.put(`/api/shipping-addresses/${id}/set-default`);
};