import { api } from '@/lib/axios';
import type {
    AdminBrand,
    AdminCategory,
    AdminOrderShop,
    AdminProduct,
    AdminReview,
    AdminShop,
    AdminUser,
    PageResponse,
} from '../types/admin.types';

const unwrapPage = <T>(data: T[] | PageResponse<T>): T[] => (Array.isArray(data) ? data : data.content || []);

export const adminApi = {
    getUsers: async (): Promise<AdminUser[]> => {
        const response = await api.get('/api/users');
        return response.data;
    },

    deleteUser: async (id: number) => {
        await api.delete(`/api/users/${id}`);
    },

    updateUserStatus: async (user: AdminUser, status: string): Promise<AdminUser> => {
        const response = await api.patch(`/api/users/${user.id}/status`, {
            status,
        });
        return response.data;
    },

    getShops: async (): Promise<AdminShop[]> => {
        const response = await api.get('/api/shops');
        return response.data;
    },

    deleteShop: async (id: number) => {
        await api.delete(`/api/shops/${id}`);
    },

    updateShopStatus: async (shop: AdminShop, status: string): Promise<AdminShop> => {
        const response = await api.patch(`/api/shops/${shop.id}/status`, {
            status,
        });
        return response.data;
    },

    getProducts: async (params?: Record<string, unknown>): Promise<PageResponse<AdminProduct>> => {
        const response = await api.get('/api/products', { params: { page: 0, size: 100, sort: 'id,desc', ...params } });
        return response.data;
    },

    deleteProduct: async (id: number) => {
        await api.delete(`/api/products/${id}`);
    },

    getCategories: async (): Promise<AdminCategory[]> => {
        const response = await api.get('/api/categories');
        return response.data;
    },

    createCategory: async (data: { name: string }) => {
        const response = await api.post('/api/categories', data);
        return response.data;
    },

    updateCategory: async (id: number, data: { name: string }) => {
        const response = await api.put(`/api/categories/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: number) => {
        await api.delete(`/api/categories/${id}`);
    },

    getBrands: async (): Promise<AdminBrand[]> => {
        const response = await api.get('/api/product-brands');
        return response.data;
    },

    createBrand: async (data: { name: string; description?: string }) => {
        const response = await api.post('/api/product-brands', data);
        return response.data;
    },

    updateBrand: async (id: number, data: { name: string; description?: string }) => {
        const response = await api.put(`/api/product-brands/${id}`, data);
        return response.data;
    },

    deleteBrand: async (id: number) => {
        await api.delete(`/api/product-brands/${id}`);
    },

    getReviewsByProduct: async (productId: number): Promise<PageResponse<AdminReview>> => {
        const response = await api.get(`/api/reviews/products/${productId}`, { params: { page: 0, size: 50, sort: 'id,desc' } });
        return response.data;
    },

    getAllReviewsByProducts: async (products: AdminProduct[]): Promise<AdminReview[]> => {
        const productIds = products.map((product) => product.id).slice(0, 80);
        const results = await Promise.allSettled(productIds.map((productId) => adminApi.getReviewsByProduct(productId)));
        return results.flatMap((result) => (result.status === 'fulfilled' ? unwrapPage(result.value) : []));
    },

    deleteReview: async (id: number) => {
        await api.delete(`/api/reviews/${id}`);
    },

    getOrderShopsByShop: async (shopId: number, params?: Record<string, unknown>): Promise<PageResponse<AdminOrderShop>> => {
        const response = await api.get(`/api/order-shops/shop/${shopId}`, {
            params: { page: 0, size: 50, sort: 'id,desc', ...params },
        });
        return response.data;
    },

    getAllOrderShops: async (shops: AdminShop[]): Promise<AdminOrderShop[]> => {
        const results = await Promise.allSettled(shops.map((shop) => adminApi.getOrderShopsByShop(shop.id, { size: 30 })));
        return results.flatMap((result) => (result.status === 'fulfilled' ? unwrapPage(result.value) : []));
    },
};
