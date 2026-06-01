import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderPaymentStatus,
    updateOrderShopStatus,
    updateOrderShipping,
    applyVoucher,
    createOrderShipping,
    cancelOrderShop,
    confirmOrderShop,
    confirmOrderShopDelivery,
    requestOrderShopReturn,
    processOnlinePaymentResult,
    getShopOrders, // Giữ lại getShopOrders
    type ApplyVoucherRequest
} from '../api/order.api';
import type { OrderRequest, OrderShippingRequest } from '../types/order.types';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

// Hook đặt hàng
export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: OrderRequest) => {
            return await createOrder(data);
        },
        onSuccess: () => {
            // Sau khi đặt hàng thành công, cần làm mới giỏ hàng
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        }
    });
};

// Hook lấy lịch sử đơn hàng của User
export const useUserOrders = (userId: number, page: number = 0, size: number = 10, status?: string) => {
    return useQuery({
        queryKey: ['user-orders', userId, page, status],
        queryFn: () => getUserOrders(userId, page, size, status),
        enabled: !!userId,
    });
};

// Hook lấy chi tiết đơn hàng
export const useOrderDetails = (orderId?: number) => {
    return useQuery({
        queryKey: ['order-details', orderId],
        queryFn: () => getOrderById(orderId!),
        enabled: !!orderId,
    });
};

// Hook lấy đơn hàng cho Shop (Kênh người bán)
export const useShopOrders = (shopId: number, page: number = 0, size: number = 10, status?: string) => {
    return useQuery({
        queryKey: ['shop-orders', shopId, page, status],
        queryFn: () => getShopOrders(shopId, page, size, status),
        enabled: !!shopId,
    });
};

// Hook kiểm tra Voucher (Mới theo Backend cập nhật)
export const useApplyVoucher = () => {
    return useMutation({
        mutationFn: (data: ApplyVoucherRequest) => applyVoucher(data),
    });
};

// Hook cập nhật trạng thái chung cho OrderShop
export const useUpdateOrderShopStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: number, status: string }) =>
            updateOrderShopStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop-orders'] });
        }
    });
};

// Hook cập nhật vận chuyển (Sửa lại import)
export const useUpdateOrderShipping = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ shippingId, orderShopId, data }: { shippingId?: number, orderShopId?: number, data: OrderShippingRequest }) =>
            shippingId ? updateOrderShipping(shippingId, data) : createOrderShipping(orderShopId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop-orders'] });
        }
    });
};

export const useUpdateOrderPaymentStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ orderId, status }: { orderId: number, status: string }) =>
            updateOrderPaymentStatus(orderId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['order-details'] });
        }
    });
};

// Hook xác nhận OrderShop (Chuyển từ PENDING sang CONFIRMED)
export const useConfirmOrderShop = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => confirmOrderShop(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shop-orders'] });
            toast.success('Đã xác nhận đơn hàng thành công');
        }
    });
};
// Hook cập nhật kết quả thanh toán Online
export const useProcessOnlinePayment = () => {
    return useMutation({
        mutationFn: ({ paymentId, status }: { paymentId: number, status: string }) =>
            processOnlinePaymentResult(paymentId, status),
    });
};

// Hook hủy OrderShop (API mới hỗ trợ hoàn kho/tiền)
export const useCancelOrderShop = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => cancelOrderShop(id),
        onSuccess: () => {
            toast.success('Đã hủy đơn hàng shop thành công');
            queryClient.invalidateQueries({ queryKey: ['user-orders'] });
            queryClient.invalidateQueries({ queryKey: ['shop-orders'] });
            queryClient.invalidateQueries({ queryKey: ['order-details'] });
            queryClient.invalidateQueries({ queryKey: ['order-shops-detail'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng này');
        }
    });
};

// Hook khách hàng xác nhận nhận hàng cho từng Shop
export const useConfirmDelivery = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderShopId: number) => confirmOrderShopDelivery(orderShopId),
        onSuccess: () => {
            toast.success('Xác nhận nhận hàng thành công. Đơn hàng đã hoàn thành!');
            queryClient.invalidateQueries({ queryKey: ['user-orders'] });
            queryClient.invalidateQueries({ queryKey: ['order-shops-detail'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    });
};

// Hook khách hàng yêu cầu trả hàng cho từng Shop
export const useRequestReturn = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (orderShopId: number) => requestOrderShopReturn(orderShopId),
        onSuccess: () => {
            toast.success('Đã gửi yêu cầu trả hàng cho shop');
            queryClient.invalidateQueries({ queryKey: ['user-orders'] });
            queryClient.invalidateQueries({ queryKey: ['order-shops-detail'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Không thể gửi yêu cầu trả hàng');
        }
    });
};