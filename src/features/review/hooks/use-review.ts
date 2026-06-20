import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductReviews, createReview, getUserReviews } from '../api/review.api';
import type { ReviewRequest } from '../types/review.types';
import { updateReview, deleteReview } from '../api/review.api';
import { toast } from 'sonner';

export const useProductReviews = (productId: number, page: number = 0, size: number = 5, sort: string = 'rating,desc') => {
    return useQuery({
        queryKey: ['product-reviews', productId, page, size, sort],
        queryFn: () => getProductReviews(productId, page, size, sort),
        enabled: !!productId,
    });
};

export const useCreateReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ReviewRequest) => createReview(data),
        onSuccess: (_, variables) => {
            toast.success('Cảm ơn bạn đã đánh giá sản phẩm!');

            queryClient.invalidateQueries({
                queryKey: ['product-reviews', Number(variables.productId)]
            });

            queryClient.invalidateQueries({
                queryKey: ['product', String(variables.productId)]
            });

            queryClient.invalidateQueries({
                queryKey: ['product', Number(variables.productId)]
            });

            queryClient.invalidateQueries({
                queryKey: ['products']
            });

            // THÊM
            queryClient.invalidateQueries({
                queryKey: ['user-reviews']
            });
        }
    });
};
export const useUpdateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            reviewId,
            data,
        }: {
            reviewId: number;
            data: ReviewRequest;
        }) => updateReview(reviewId, data),

        onSuccess: (_, variables) => {
            toast.success('Cập nhật đánh giá thành công');

            queryClient.invalidateQueries({
                queryKey: ['product-reviews', variables.data.productId],
            });

            queryClient.invalidateQueries({
                queryKey: ['product', variables.data.productId],
            });

            queryClient.invalidateQueries({
                queryKey: ['products'],
            });

            // THÊM
            queryClient.invalidateQueries({
                queryKey: ['user-reviews'],
            });
        },
    });
};
export const useDeleteReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            reviewId,
            productId,
        }: {
            reviewId: number;
            productId: number;
        }) => deleteReview(reviewId),

        onSuccess: (_, variables) => {
            toast.success('Đã xóa đánh giá');

            queryClient.invalidateQueries({
                queryKey: ['product-reviews', variables.productId],
            });

            queryClient.invalidateQueries({
                queryKey: ['product', variables.productId],
            });

            queryClient.invalidateQueries({
                queryKey: ['products'],
            });

            // THÊM
            queryClient.invalidateQueries({
                queryKey: ['user-reviews'],
            });
        },
    });
};
export const useUserReviews = (
    userId: number,
    page: number = 0,
    size: number = 100
) => {
    return useQuery({
        queryKey: ['user-reviews', userId],
        queryFn: () => getUserReviews(userId, page, size),
        enabled: !!userId,
    });
};