import { api } from '@/lib/axios';

export const getProductsByShop = async (shopId: number) => {
    const response = await api.get(`/api/products/shop/${shopId}`);
    return response.data;
};

export const getProducts = async () => {
    const response = await api.get('/api/products');
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