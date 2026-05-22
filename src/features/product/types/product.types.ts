export interface ProductResponse {
    id: number;
    productName: string;
    productDetail: string;
    price: number;
    status: string;
    rating?: number;
    imageUrl?: string;
    shopId: number;
    shopName?: string;
    categoryId: number;
    categoryName?: string;
    brandId: number;
    brandName?: string;
    createdAt: string;
}

export interface ProductListResponse {
    content: ProductResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// Nếu sau này bạn làm trang Admin thêm sản phẩm
export interface CreateProductRequest {
    productName: string;
    productDetail: string;
    price: number;
    categoryId: number;
    brandId: number;
}