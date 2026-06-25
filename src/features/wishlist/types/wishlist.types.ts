import type { ProductResponse } from '@/features/product/types/product.types';

export interface WishlistItem {
    id?: number;
    userId?: number;
    productId?: number;
    product?: ProductResponse;
    createdAt?: string;
}
