import { api } from '@/lib/axios';
import type { ProductDetailResponse, ProductVariantResponse } from '../types/variant.types';
import type { ProductResponse } from '@/features/product/types/product.types';


export const fetchProductBaseDetail = async (id: number | string): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>(`/api/products/${id}`);
    return response.data;
};

export const fetchProductVariants = async (productId: number | string): Promise<ProductVariantResponse[]> => {
    const response = await api.get<ProductVariantResponse[]>(`/api/product-variants/product/${productId}`);
    return response.data;
};