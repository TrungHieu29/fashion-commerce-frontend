import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as discountApi from '../api/discount.api';
import { toast } from 'sonner';
import type { DiscountRequest, DiscountResponse } from '../types/discount.types';

export const useShopDiscounts = (shopId?: number) => {
    return useQuery<DiscountResponse[]>({
        queryKey: ['shop-discounts', shopId],
        queryFn: async () => {
            const data = await discountApi.getShopDiscounts(shopId!);
            // Nếu backend trả về Page object, lấy content, nếu không lấy trực tiếp data
            return Array.isArray(data) ? data : (data as unknown as { content: DiscountResponse[] })?.content || [];
        },
        enabled: !!shopId,
    });
};

export const useCreateDiscount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: DiscountRequest) => discountApi.createDiscount(data),
        onSuccess: async (_, variables) => { // Make onSuccess async
            await queryClient.invalidateQueries({ queryKey: ['shop-discounts', variables.shopId], exact: true });
            await queryClient.refetchQueries({ queryKey: ['shop-discounts', variables.shopId], exact: true }); // Await refetch to ensure data is fresh
            toast.success('Tạo mã giảm giá thành công');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Không thể tạo mã giảm giá');
        }
    });
};

export const useDeleteDiscount = (shopId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => discountApi.deleteDiscount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop-discounts', shopId], exact: true });
            toast.success('Đã xóa mã giảm giá');
        }
    });
};