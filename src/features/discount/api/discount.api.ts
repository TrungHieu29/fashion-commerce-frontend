import { api } from '@/lib/axios';
import type { DiscountResponse, DiscountRequest } from '../types/discount.types';

export const getShopDiscounts = async (shopId: number): Promise<DiscountResponse[]> => {
    const response = await api.get(`/api/discounts/shops/${shopId}`);
    return response.data;
};

export const getActiveShopDiscounts = async (shopId: number): Promise<DiscountResponse[]> => {
    const response = await api.get(`/api/discounts/shops/${shopId}/active`);
    return response.data;
};

export const createDiscount = async (data: DiscountRequest): Promise<DiscountResponse> => {
    const response = await api.post('/api/discounts', data);
    return response.data;
};

export const deleteDiscount = async (id: number): Promise<void> => {
    await api.delete(`/api/discounts/${id}`);
};