export interface ProductCategory {
    id: number;
    name?: string;
    categoryName?: string;
}

export interface ProductResponse {
    id: number;
    productName: string;
    productDetail: string;
    originalPrice: number;
    finalPrice: number;
    discountAmount: number;
    status: string;
    rating?: number;
    imageUrl?: string;
    shopId: number;
    shopName?: string;
    categoryId?: number;
    categoryName?: string;
    categoryIds?: number[];
    categories?: ProductCategory[];
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

export interface CreateProductRequest {
    productName: string;
    productDetail: string;
    price: number;
    categoryIds: number[];
    brandId: number;
}

export const getProductCategoryIds = (product: Pick<ProductResponse, 'categoryId' | 'categoryIds' | 'categories'>): number[] => {
    if (Array.isArray(product.categoryIds) && product.categoryIds.length > 0) {
        return product.categoryIds.map(Number).filter(Number.isFinite);
    }

    if (Array.isArray(product.categories) && product.categories.length > 0) {
        return product.categories.map((category) => Number(category.id)).filter(Number.isFinite);
    }

    return product.categoryId ? [Number(product.categoryId)] : [];
};

export const getProductCategoryNames = (product: Pick<ProductResponse, 'categoryName' | 'categories'>): string[] => {
    if (Array.isArray(product.categories) && product.categories.length > 0) {
        return product.categories
            .map((category) => category.categoryName || category.name)
            .filter((name): name is string => Boolean(name));
    }

    return product.categoryName ? [product.categoryName] : [];
};

export const getProductCategoryLabel = (product: Pick<ProductResponse, 'categoryName' | 'categories'>) => {
    const names = getProductCategoryNames(product);
    return names.length > 0 ? names.join(', ') : '';
};

export const productMatchesCategory = (product: Pick<ProductResponse, 'categoryId' | 'categoryIds' | 'categories'>, categoryId: string) => {
    if (categoryId === 'all') return true;
    return getProductCategoryIds(product).some((id) => String(id) === categoryId);
};
