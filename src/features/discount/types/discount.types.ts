export type DiscountType = 'PERCENT' | 'FIXED';
export type DiscountStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type DiscountTarget = 'SHOP' | 'PRODUCT' | 'ORDER';

export interface DiscountResponse {
    id: number;
    shopId: number;
    discountTarget: DiscountTarget;
    discountType: DiscountType;
    discountValue: number;
    code?: string;
    startDate: string;
    endDate: string;
    status: DiscountStatus;
    minOrderValue?: number | null;
}

export interface DiscountRequest {
    shopId: number;
    discountTarget: DiscountTarget;
    discountType: DiscountType;
    discountValue: number;
    code?: string;
    startDate: string;
    endDate: string;
    status: DiscountStatus;
    minOrderValue?: number | null;
    productIds?: number[];
}