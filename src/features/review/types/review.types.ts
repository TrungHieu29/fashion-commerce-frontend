export interface ReviewRequest {
    userId: number;
    productId: number;
    orderItemId: number;
    rating: number;
    comment: string;
}

export interface ReviewResponse {
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

export interface PageReviewResponse {
    content: ReviewResponse[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}