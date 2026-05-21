import { api } from '@/lib/axios';
import type { AddToCartRequest, UpdateCartItemQuantityRequest, UpdateCartItemVariantRequest, CartResponse } from '../types/cart.types';


// Giả sử userId được truyền vào từ hook lấy từ authStore
export const getCart = async (userId: number): Promise<CartResponse> => {
    const response = await api.get(`/api/carts/user/${userId}`);
    return response.data;
};

export const addToCart = async (userId: number, data: AddToCartRequest): Promise<void> => {
    await api.post(`/api/carts/user/${userId}/items`, data);
};

// API để cập nhật SỐ LƯỢNG của một cart item hiện có.
// Backend mong đợi một giá trị số nguyên (quantity) trực tiếp trong request body.
export const updateCartItemQuantity = async (
    userId: number,
    itemId: number,
    data: UpdateCartItemQuantityRequest // Backend mong đợi { quantity: number }
): Promise<void> => {
    // Gửi object { quantity: number }
    await api.put(`/api/carts/user/${userId}/items/${itemId}`, data, {
        headers: { 'Content-Type': 'application/json' }
    });
};

// API để cập nhật BIẾN THỂ (size/color) của một cart item.
export const updateCartItemVariant = async (
    userId: number,
    itemId: number,
    data: UpdateCartItemVariantRequest // Frontend gửi { productVariantId }
): Promise<void> => {
    await api.put(`/api/carts/user/${userId}/items/${itemId}/variant`, data);
};

export const removeFromCart = async (userId: number, itemId: number): Promise<void> => {
    await api.delete(`/api/carts/user/${userId}/items/${itemId}`);
};

export const clearCart = async (userId: number): Promise<void> => {
    await api.delete(`/api/carts/user/${userId}`);
};