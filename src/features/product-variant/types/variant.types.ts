import type { ProductResponse } from "@/features/product/types/product.types";


export interface ProductVariantResponse {
    id: number;
    productId: number;
    size: string;
    color: string;
    stock: number;
    // Giá cộng thêm (nếu size lớn hơn hoặc màu đặc biệt thì đắt hơn)
    priceAdjustment: number;
    sku: string;
}

export interface ProductDetailResponse extends ProductResponse {
    // Thông tin chi tiết sẽ bao gồm một danh sách các biến thể
    variants: ProductVariantResponse[];
}