import { api } from '@/lib/axios';
import type { ShopResponse, ShopRequest, ShopUpdateRequest } from '../types/shop.types';

// Shop APIs
export const getShops = async (): Promise<ShopResponse[]> => {
    const response = await api.get('/api/shops');
    return response.data;
};

export const getShopById = async (id: number): Promise<ShopResponse> => {
    const response = await api.get(`/api/shops/${id}`);
    return response.data;
};

export const getShopByOwnerId = async (ownerId: number): Promise<ShopResponse | null> => {
    try {
        const response = await api.get(`/api/shops/owner/${ownerId}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

export const createShop = async (data: ShopRequest, logoFile?: File | null): Promise<ShopResponse> => {
    const formData = new FormData();
    formData.append(
        'shop',
        new Blob([JSON.stringify(data)], {
            type: 'application/json',
        })
    );

    if (logoFile) {
        formData.append('logo', logoFile);
    }

    const response = await api.post('/api/shops', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const updateShop = async (id: number, data: ShopUpdateRequest): Promise<ShopResponse> => {
    const response = await api.put(`/api/shops/${id}`, data);
    return response.data;
};

export const deleteShop = async (id: number): Promise<void> => {
    await api.delete(`/api/shops/${id}`);
};
