import { api } from '@/lib/axios';
import type { WishlistItem } from '../types/wishlist.types';

export const getWishlist = async (userId: number): Promise<WishlistItem[]> => {
    try {
        const response = await api.get(`/api/wishlist/user/${userId}`);
        return Array.isArray(response.data) ? response.data : response.data?.content || [];
    } catch (error) {
        if (isMissingEndpointError(error)) return [];
        throw error;
    }
};

export const addWishlistProduct = async (userId: number, productId: number): Promise<WishlistItem> => {
    const response = await api.post(`/api/wishlist/user/${userId}/products/${productId}`);
    return response.data;
};

export const removeWishlistProduct = async (userId: number, productId: number): Promise<void> => {
    await api.delete(`/api/wishlist/user/${userId}/products/${productId}`);
};

export const wishlistProductExists = async (userId: number, productId: number): Promise<boolean> => {
    try {
        const response = await api.get(`/api/wishlist/user/${userId}/products/${productId}/exists`);
        return Boolean(response.data);
    } catch (error) {
        if (isMissingEndpointError(error)) return false;
        throw error;
    }
};

export const isMissingWishlistEndpointError = isMissingEndpointError;

function isMissingEndpointError(error: unknown) {
    const message = String((error as any)?.response?.data?.message || (error as any)?.message || '').toLowerCase();
    return message.includes('no static resource') && message.includes('wishlist');
}
