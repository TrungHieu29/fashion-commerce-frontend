import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { getCart, addToCart, updateCartItemQuantity, updateCartItemVariant, removeFromCart } from '../api/cart.api';

import { toast } from 'sonner';
import type { AddToCartRequest } from '../types/cart.types';

export const useCart = () => {
    const user = useAuthStore((state) => state.user);
    return useQuery({
        queryKey: ['cart', user?.id],
        queryFn: () => getCart(user!.id),
        enabled: !!user?.id,
        // Tự động sắp xếp sản phẩm theo ID để tránh việc nhảy vị trí khi cập nhật
        select: (data) => ({
            ...data,
            cartItems: [...(data.cartItems || [])].sort((a, b) => a.id - b.id),
        }),
    });
};

export const useAddToCart = () => {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AddToCartRequest) => addToCart(user!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
            toast.success('Đã thêm vào giỏ hàng');
        },
        onError: () => {
            toast.error('Sản phẩm hiện đã hết hàng');
        }
    });
};

// Hook để cập nhật CHỈ SỐ LƯỢNG của một cart item
export const useUpdateCartItemQuantity = () => {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
            updateCartItemQuantity(user!.id, itemId, { quantity }), // Gọi API cập nhật số lượng với object { quantity }
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
            toast.success('Đã cập nhật số lượng sản phẩm');
        },
        onError: (error: any) => {
            const serverMessage = error.response?.data?.message || '';
            if (serverMessage.toLowerCase().includes('stock') || error.response?.status === 400) {
                toast.error('Số lượng sản phẩm vượt quá tồn kho');
            } else {
                toast.error(`Lỗi cập nhật số lượng: ${error.message}`);
            }
        }
    });
};

// Hook để cập nhật BIẾN THỂ (size/color) của một cart item
// Hook này sẽ gọi API updateCartItemVariant, giả định backend có API tương ứng.
export const useUpdateCartItemVariant = () => {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, productVariantId }: { itemId: number; productVariantId: number }) =>
            updateCartItemVariant(user!.id, itemId, { productVariantId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
            toast.success('Đã cập nhật sản phẩm'); // Đã có, giữ nguyên
        },
        onError: (error) => {
            toast.error(`Lỗi cập nhật biến thể: ${error.message}`);
        }
    });
};

export const useRemoveFromCart = () => {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemId: number) => removeFromCart(user!.id, itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart', user?.id] });
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
        }
    });
};