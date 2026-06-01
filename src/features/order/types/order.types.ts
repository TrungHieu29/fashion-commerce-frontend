export interface OrderRequest {
    userId: number;
    voucherCode?: string;
    addressId?: number;
    receiverName?: string;
    phone?: string;
    addressLine?: string;
    city?: string;
    district?: string;
    paymentMethod: 'COD' | 'BANKING' | 'VNPAY' | 'MOMO';
}

export interface OrderResponse {
    id: number;
    userId: number;
    userFullName: string;
    totalPrice: number;
    finalPrice: number;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
    addressSnapshot: string;
    createdAt: string;
    updatedAt: string;
}

export interface PageOrderResponse {
    content: OrderResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface OrderShopResponse {
    createdAt: string | number | Date;
    id: number;
    orderId: number;
    shopId: number;
    shopName: string;
    totalPrice: number;
    finalPrice: number;
    discountId?: number;
    addressSnapshot: string;
    status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'RETURNED' | 'RETURN_REQUESTED';
    orderItems: OrderItemResponse[];
    shipping?: OrderShippingResponse;
}

export interface PageOrderShopResponse {
    content: OrderShopResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface OrderItemResponse {
    id: number;
    productVariantId: number;
    productName: string;
    productImage: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    shopId: number;
    shopName: string;
}

export interface OrderShippingRequest {
    shippingStatus: string;
    trackingCode?: string;
}

export interface OrderShippingResponse {
    id: number;
    addressSnapshot: string;
    shippingStatus: string; // PENDING, PICKED_UP, IN_TRANSIT, DELIVERED, FAILED
    trackingCode?: string;
}

export interface PaymentRequest {
    method: string; // COD, VNPAY, etc.
    status?: string;
    transactionCode?: string;
}