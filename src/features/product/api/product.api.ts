import { api } from '@/lib/axios';
import type { ProductResponse, ProductListResponse } from '../types/product.types';

export const getProducts = async (params?: any): Promise<ProductListResponse> => {
    const response =
        await api.get<ProductListResponse>(
            '/api/products',
            { params }
        );

    return response.data;
};

export const getProductById = async (id: number | string): Promise<ProductResponse> => {
    const response =
        await api.get<ProductResponse>(
            `/api/products/${id}`
        );

    return response.data;
};