import { api } from '@/lib/axios';
import type { AddToCartRequest, UpdateCartItemRequest, CartResponse } from '../types/cart.types';


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
    quantity: number // Backend mong đợi raw integer
): Promise<void> => {
    await api.put(`/api/carts/user/${userId}/items/${itemId}`, quantity); // Gửi raw integer
};

// API để cập nhật BIẾN THỂ (size/color) của một cart item.
// Backend cần một endpoint riêng biệt hoặc cấu trúc request body khác cho việc này.
export const updateCartItemVariant = async (
    userId: number,
    itemId: number,
    data: UpdateCartItemRequest // Frontend gửi { productVariantId, quantity }
): Promise<void> => {
    // Giả định backend có một endpoint chấp nhận UpdateCartItemRequest object
    // Nếu không, bạn cần điều chỉnh backend hoặc sử dụng cách khác (ví dụ: xóa item cũ, thêm item mới)
    await api.put(`/api/carts/user/${userId}/items/${itemId}/variant`, data); // Ví dụ endpoint cho cập nhật biến thể
};

export const removeFromCart = async (userId: number, itemId: number): Promise<void> => {
    await api.delete(`/api/carts/user/${userId}/items/${itemId}`);
};

export const clearCart = async (userId: number): Promise<void> => {
    await api.delete(`/api/carts/user/${userId}`);
};