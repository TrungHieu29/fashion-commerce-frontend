import { api } from '@/lib/axios';
import type { ReviewRequest, ReviewResponse, PageReviewResponse } from '../types/review.types';

export const getProductReviews = async (productId: number, page: number = 0, size: number = 5, sort: string = 'rating,desc'): Promise<PageReviewResponse> => {
    const response = await api.get(`/api/reviews/products/${productId}`, {
        params: { page, size, sort }
    });
    return response.data;
};

export const createReview = async (data: ReviewRequest): Promise<ReviewResponse> => {
    const response = await api.post('/api/reviews', data);
    return response.data;
};

export const getUserReviews = async (userId: number, page: number = 0, size: number = 10): Promise<PageReviewResponse> => {
    const response = await api.get(`/api/reviews/users/${userId}`, { params: { page, size } });
    return response.data;
};

export const updateReview = async (
    reviewId: number,
    data: ReviewRequest
): Promise<ReviewResponse> => {
    const response = await api.put(`/api/reviews/${reviewId}`, data);
    return response.data;
};

export const deleteReview = async (
    reviewId: number
): Promise<void> => {
    await api.delete(`/api/reviews/${reviewId}`);
};