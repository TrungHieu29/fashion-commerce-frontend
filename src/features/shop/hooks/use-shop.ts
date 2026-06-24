import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import * as shopApi from '../api/shop.api';
import type { ShopRequest, ShopUpdateRequest } from '../types/shop.types';

type CreateShopVariables =
    | ShopRequest
    | {
          data: ShopRequest;
          logoFile?: File | null;
      };

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
    const user = useAuthStore((state) => state.user);

    return useQuery({
        queryKey: ['my-shop', user?.id],
        queryFn: () => shopApi.getShopByOwnerId(user!.id),
        enabled: !!user?.id,
        retry: false,
    });
};

export const useCreateShop = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);

    return useMutation({
        mutationFn: (variables: CreateShopVariables) => {
            if ('data' in variables) {
                return shopApi.createShop(variables.data, variables.logoFile);
            }

            return shopApi.createShop(variables);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-shop', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['shops'] });
            toast.success('Đã gửi đăng ký shop. Vui lòng chờ quản trị viên duyệt.');
        },
        onError: (error: any) => {
            const serverMessage = error.response?.data?.message;
            toast.error(serverMessage || 'Lỗi tạo shop. Vui lòng thử lại.');
        },
    });
};

export const useUpdateShop = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: ShopUpdateRequest }) => shopApi.updateShop(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-shop', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['shops'] });
            toast.success('Cập nhật thông tin shop thành công.');
        },
        onError: (error: any) => {
            const serverMessage = error.response?.data?.message;
            toast.error(serverMessage || 'Lỗi cập nhật shop. Vui lòng thử lại.');
        },
    });
};

export const useDeleteShop = () => {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);

    return useMutation({
        mutationFn: (id: number) => shopApi.deleteShop(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-shop', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['shops'] });
            toast.success('Đã xóa shop.');
        },
        onError: (error: any) => {
            const serverMessage = error.response?.data?.message;
            toast.error(serverMessage || 'Lỗi xóa shop. Vui lòng thử lại.');
        },
    });
};

export const useShopDashboard = (shopId?: number) => {
    return useQuery({
        queryKey: ['shop-dashboard', shopId],
        queryFn: async () => {
            const response = await api.get(`/api/dashboard/shop/${shopId}`);
            return response.data;
        },
        enabled: !!shopId,
        retry: false,
        refetchOnWindowFocus: false,
        refetchInterval: (query) => (query.state.error ? false : 30000),
        staleTime: 15000,
    });
};

export const useShopAnalytics = (shopId?: number | string, period: 'today' | '7days' | '30days' = 'today') => {
    return useQuery({
        queryKey: ['shop-analytics', shopId, period],
        queryFn: async () => {
            const response = await api.get(`/api/dashboard/shop/${shopId}/analytics`, {
                params: { period },
            });
            return response.data;
        },
        enabled: !!shopId,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 5000,
        refetchInterval: (query) => (query.state.error ? false : 10000),
    });
};
