export interface AdminUser {
    id: number;
    username: string;
    fullName?: string;
    phone?: string;
    status?: string;
    email?: string;
    avatar?: string;
    gender?: string;
    dateOfBirth?: string;
    createdAt?: string;
    roleName?: string;
}

export interface AdminShop {
    id: number;
    shopName: string;
    logo?: string;
    phone?: string;
    status?: string;
    address?: string;
    email?: string;
    createdAt?: string;
    ownerId?: number;
    ownerFullName?: string;
}

export interface AdminProduct {
    id: number;
    productName: string;
    productDetail?: string;
    rating?: number;
    status?: string;
    originalPrice?: number;
    finalPrice?: number;
    discountAmount?: number;
    shopId?: number;
    shopName?: string;
    brandId?: number;
    brandName?: string;
    categoryId?: number;
    categoryName?: string;
    categoryIds?: number[];
    categories?: Array<{
        id: number;
        name?: string;
        categoryName?: string;
    }>;
    createdAt?: string;
}

export interface AdminCategory {
    id: number;
    name: string;
}

export interface AdminBrand {
    id: number;
    name: string;
    description?: string;
}

export interface AdminOrderShop {
    id: number;
    orderId: number;
    shopId: number;
    shopName: string;
    totalPrice: number;
    finalPrice: number;
    status: string;
    createdAt?: string;
    orderItems?: Array<{
        id: number;
        productName: string;
        quantity: number;
        price: number;
    }>;
}

export interface AdminReview {
    id: number;
    userId: number;
    username: string;
    productId: number;
    productName: string;
    orderItemId: number;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
