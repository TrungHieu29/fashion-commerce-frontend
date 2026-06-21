import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi } from '../api/admin.api';

export const adminKeys = {
    users: ['admin-users'] as const,
    shops: ['admin-shops'] as const,
    products: ['admin-products'] as const,
    categories: ['admin-categories'] as const,
    brands: ['admin-brands'] as const,
    reviews: ['admin-reviews'] as const,
    orders: ['admin-orders'] as const,
    overview: ['admin-overview'] as const,
};

const useAdminDelete = (mutationFn: (id: number) => Promise<unknown>, invalidateKeys: readonly unknown[], message: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn,
        onSuccess: () => {
            toast.success(message);
            queryClient.invalidateQueries({ queryKey: invalidateKeys });
            queryClient.invalidateQueries({ queryKey: adminKeys.overview });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Không thể thực hiện thao tác này');
        },
    });
};

export const useAdminUsers = () => useQuery({ queryKey: adminKeys.users, queryFn: adminApi.getUsers });
export const useDeleteAdminUser = () => useAdminDelete(adminApi.deleteUser, adminKeys.users, 'Đã xóa người dùng');
export const useUpdateAdminUserStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ user, status }: { user: any; status: string }) => adminApi.updateUserStatus(user, status),
        onSuccess: () => {
            toast.success('Đã cập nhật trạng thái người dùng');
            queryClient.invalidateQueries({ queryKey: adminKeys.users });
            queryClient.invalidateQueries({ queryKey: adminKeys.overview });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Backend chưa cho phép cập nhật trạng thái người dùng');
        },
    });
};

export const useAdminShops = () => useQuery({ queryKey: adminKeys.shops, queryFn: adminApi.getShops });
export const useDeleteAdminShop = () => useAdminDelete(adminApi.deleteShop, adminKeys.shops, 'Đã xóa shop');
export const useUpdateAdminShopStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ shop, status }: { shop: any; status: string }) => adminApi.updateShopStatus(shop, status),
        onSuccess: () => {
            toast.success('Đã cập nhật trạng thái shop');
            queryClient.invalidateQueries({ queryKey: adminKeys.shops });
            queryClient.invalidateQueries({ queryKey: adminKeys.overview });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Backend chưa cho phép cập nhật trạng thái shop');
        },
    });
};

export const useAdminProducts = () => useQuery({ queryKey: adminKeys.products, queryFn: () => adminApi.getProducts() });
export const useDeleteAdminProduct = () => useAdminDelete(adminApi.deleteProduct, adminKeys.products, 'Đã xóa sản phẩm');

export const useAdminCategories = () => useQuery({ queryKey: adminKeys.categories, queryFn: adminApi.getCategories });
export const useAdminBrands = () => useQuery({ queryKey: adminKeys.brands, queryFn: adminApi.getBrands });

export const useCreateAdminCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminApi.createCategory,
        onSuccess: () => {
            toast.success('Đã tạo danh mục');
            queryClient.invalidateQueries({ queryKey: adminKeys.categories });
        },
    });
};

export const useUpdateAdminCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name }: { id: number; name: string }) => adminApi.updateCategory(id, { name }),
        onSuccess: () => {
            toast.success('Đã cập nhật danh mục');
            queryClient.invalidateQueries({ queryKey: adminKeys.categories });
        },
    });
};

export const useDeleteAdminCategory = () => useAdminDelete(adminApi.deleteCategory, adminKeys.categories, 'Đã xóa danh mục');

export const useCreateAdminBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminApi.createBrand,
        onSuccess: () => {
            toast.success('Đã tạo thương hiệu');
            queryClient.invalidateQueries({ queryKey: adminKeys.brands });
        },
    });
};

export const useUpdateAdminBrand = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name, description }: { id: number; name: string; description?: string }) => adminApi.updateBrand(id, { name, description }),
        onSuccess: () => {
            toast.success('Đã cập nhật thương hiệu');
            queryClient.invalidateQueries({ queryKey: adminKeys.brands });
        },
    });
};

export const useDeleteAdminBrand = () => useAdminDelete(adminApi.deleteBrand, adminKeys.brands, 'Đã xóa thương hiệu');

export const useAdminReviews = () => useQuery({
    queryKey: adminKeys.reviews,
    queryFn: async () => {
        const productsPage = await adminApi.getProducts({ size: 100 });
        const reviews = await adminApi.getAllReviewsByProducts(productsPage.content || []);
        return {
            content: reviews,
            totalElements: reviews.length,
            totalPages: 1,
            size: reviews.length,
            number: 0,
        };
    },
});
export const useDeleteAdminReview = () => useAdminDelete(adminApi.deleteReview, adminKeys.reviews, 'Đã xóa đánh giá');

export const useAdminOrderShops = () => {
    return useQuery({
        queryKey: adminKeys.orders,
        queryFn: async () => {
            const shops = await adminApi.getShops();
            return adminApi.getAllOrderShops(shops);
        },
    });
};

export const useAdminOverview = () => {
    return useQuery({
        queryKey: adminKeys.overview,
        queryFn: async () => {
            const [users, shops, productsPage, categories, brands] = await Promise.all([
                adminApi.getUsers(),
                adminApi.getShops(),
                adminApi.getProducts({ size: 100 }),
                adminApi.getCategories(),
                adminApi.getBrands(),
            ]);
            const reviews = await adminApi.getAllReviewsByProducts(productsPage.content || []);
            const orderShops = await adminApi.getAllOrderShops(shops.slice(0, 20));
            const revenue = orderShops
                .filter((order) => ['DELIVERED', 'COMPLETED'].includes(order.status))
                .reduce((sum, order) => sum + (order.finalPrice || 0), 0);

            return {
                users,
                shops,
                products: productsPage.content || [],
                totalProducts: productsPage.totalElements || productsPage.content?.length || 0,
                categories,
                brands,
                reviews,
                orders: orderShops,
                revenue,
                pendingOrders: orderShops.filter((order) => order.status === 'PENDING').length,
            };
        },
    });
};
