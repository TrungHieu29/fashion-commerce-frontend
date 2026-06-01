import { api } from '@/lib/axios';
import type {
    OrderRequest,
    OrderResponse,
    PageOrderResponse,
    OrderShopResponse,
    PageOrderShopResponse,
    OrderShippingRequest
} from '../types/order.types';

export interface ApplyVoucherRequest {
    shopId: number;
    voucherCode: string;
    subtotal: number;
}

// Khách hàng đặt hàng
export const createOrder = async (data: OrderRequest): Promise<OrderResponse> => {
    const response = await api.post('/api/orders', data);
    return response.data;
};

// API kiểm tra Voucher tạm thời
export const applyVoucher = async (data: ApplyVoucherRequest): Promise<number> => {
    const response = await api.post('/api/discounts/apply-voucher', data);
    return response.data;
};

// Khách hàng xem lịch sử đơn hàng
export const getUserOrders = async (userId: number, page: number = 0, size: number = 10, status?: string): Promise<PageOrderResponse> => {
    const response = await api.get(`/api/orders/user/${userId}`, {
        params: {
            page,
            size,
            sort: 'id,desc',
            ...(status && status !== 'ALL' && { status })
        }
    });
    return response.data;
};

// Shop xác nhận đơn hàng (Chuyển sang CONFIRMED và trừ kho)
export const confirmOrderShop = async (orderShopId: number): Promise<void> => {
    await api.put(`/api/order-shops/${orderShopId}/confirm-order`);
};

// Hủy một OrderShop cụ thể (Dành cho khách hàng/Shop - Hỗ trợ hoàn tiền & hoàn kho)
export const cancelOrderShop = async (orderShopId: number): Promise<void> => {
    await api.put(`/api/order-shops/${orderShopId}/cancel`);
};

// Khách hàng xác nhận đã nhận hàng cho một Shop cụ thể (Chuyển sang COMPLETED)
export const confirmOrderShopDelivery = async (orderShopId: number): Promise<void> => {
    await api.put(`/api/order-shops/${orderShopId}/confirm-delivery`);
};

// Khách hàng yêu cầu trả hàng cho một Shop cụ thể (Chuyển sang RETURN_REQUESTED)
export const requestOrderShopReturn = async (orderShopId: number): Promise<void> => {
    await api.put(`/api/order-shops/${orderShopId}/request-return`);
};

// Xem chi tiết một đơn hàng lớn
export const getOrderById = async (id: number): Promise<OrderResponse> => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
};

// Chủ Shop lấy danh sách đơn hàng thuộc về shop mình
export const getShopOrders = async (shopId: number, page: number = 0, size: number = 10, status?: string): Promise<PageOrderShopResponse> => {
    const response = await api.get(`/api/order-shops/shop/${shopId}`, {
        params: {
            page,
            size,
            sort: 'id,desc',
            ...(status && status !== 'ALL' && { status })
        }
    });
    return response.data;
};

// Cập nhật kết quả thanh toán online (VNPay/Momo)
export const processOnlinePaymentResult = async (paymentId: number, resultStatus: string) => {
    const response = await api.put(`/api/payments/${paymentId}/process-online-result`, null, {
        params: { resultStatus }
    });
    return response.data;
};

// Cập nhật thông tin vận chuyển hiện có (PUT)
export const updateOrderShipping = async (shippingId: number, data: OrderShippingRequest) => {
    const response = await api.put(`/api/order-shippings/${shippingId}`, data);
    return response.data;
};

// Tạo mới thông tin vận chuyển cho một OrderShop (Dành cho chủ Shop)
export const createOrderShipping = async (orderShopId: number, data: OrderShippingRequest) => {
    const response = await api.post(`/api/order-shippings/order-shop/${orderShopId}`, data);
    return response.data;
};

// Alias cho processOnlinePaymentResult để tránh lỗi "không tìm thấy" ở một số nơi gọi cũ
export const updateOrderPaymentStatus = async (paymentId: number, status: string) => {
    return processOnlinePaymentResult(paymentId, status);
};

// API cập nhật trạng thái OrderShop (Dùng cho các trường hợp cập nhật chung nếu cần)
export const updateOrderShopStatus = async (orderShopId: number, status: string) => {
    const response = await api.put(`/api/order-shops/${orderShopId}`, null, {
        params: { status }
    });
    return response.data;
};