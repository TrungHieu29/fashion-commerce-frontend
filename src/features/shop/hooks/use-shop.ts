import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import * as shopApi from '../api/shop.api';
import { toast } from 'sonner';
import type { ShopRequest, ShopUpdateRequest } from '../types/shop.types';

export const useShops = () => {
    return useQuery({
        queryKey: ['shops'],
        queryFn: shopApi.getShops,
    });
};

export const useShopById = (shopId: number) => {
    return useQuery({
        queryKey: ['shop', shopId],
        queryFn: () => shopApi.getShopById(shopId),
        enabled: !!shopId,
    });
};

export const useMyShop = () => {
    const user = useAuthStore(state => state.user);
    return useQuery({
        queryKey: ['my-shop', user?.id],
        queryFn: () => shopApi.getShopByOwnerId(user!.id),
        enabled: !!user?.id,
        retry: false, // If a user doesn't have a shop, it's not an error to retry
    });
};

export const useCreateShop = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore(state => state.user);
    return useMutation({
        mutationFn: (data: ShopRequest) => shopApi.createShop(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-shop', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['shops'] });
            toast.success('Tạo shop thành công');
        },
        onError: (error: any) => {
            const serverMessage = error.response?.data?.message;
            toast.error(serverMessage || 'Lỗi tạo shop. Vui lòng thử lại.');
        }
    });
};

export const useUpdateShop = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore(state => state.user);
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ShopUpdateRequest }) => shopApi.updateShop(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-shop', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['shops'] });
            toast.success('Cập nhật thông tin shop thành công');
        },
        onError: (error: any) => {
            const serverMessage = error.response?.data?.message;
            toast.error(serverMessage || 'Lỗi cập nhật shop. Vui lòng thử lại.');
        }
    });
};

export const useDeleteShop = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore(state => state.user);
    return useMutation({
        mutationFn: (id: number) => shopApi.deleteShop(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-shop', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['shops'] });
            toast.success('Đã xóa shop');
        },
        onError: (error: any) => {
            const serverMessage = error.response?.data?.message;
            toast.error(serverMessage || 'Lỗi xóa shop. Vui lòng thử lại.');
        }
    });
};