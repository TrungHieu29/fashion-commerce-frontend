import { api } from '@/lib/axios';

export const getProductsByShop = async (shopId: number, page: number = 0,
    size: number = 10, sort: string = 'id,desc') => {
    const response = await api.get(`/api/products/shop/${shopId}`, {
        params: { page, size, sort }
    });
    return response.data;
};

export const getProducts = async (params?: any) => {
    const response = await api.get('/api/products', { params });
    return response.data;
};

export const createProduct = async (data: any) => {
    const response = await api.post('/api/products', data);
    return response.data;
};

export const updateProduct = async (id: number, data: any) => {
    const response = await api.put(`/api/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id: number) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
};