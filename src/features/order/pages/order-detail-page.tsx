import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, Loader2, MapPin, Package, ShoppingBag, Truck } from 'lucide-react';
import { api } from '@/lib/axios';
import { useOrderDetails } from '../hooks/use-order';
import type { OrderShopResponse } from '../types/order.types';

const paymentMethodLabels: Record<string, string> = {
    COD: 'Thanh toán khi nhận hàng (COD)',
    VNPAY: 'VNPAY QR mockup',
    MOMO: 'MOMO QR mockup',
};

const paymentStatusLabels: Record<string, string> = {
    PENDING: 'Đang chờ thanh toán',
    COMPLETED: 'Đã thanh toán',
    FAILED: 'Thanh toán thất bại',
    REFUND_INITIATED: 'Đang hoàn tiền',
    REFUNDED: 'Đã hoàn tiền',
};

const orderStatusLabels: Record<string, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    PROCESSING: 'Đang xử lý',
    SHIPPED: 'Đang giao',
    DELIVERED: 'Đã giao',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
    RETURN_REQUESTED: 'Yêu cầu trả hàng',
    RETURNED: 'Đã hoàn trả',
};

const formatCurrency = (value: number) => `${Math.max(value || 0, 0).toLocaleString('vi-VN')}đ`;

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const orderId = Number(id);
    const { data: order, isLoading: orderLoading } = useOrderDetails(orderId);

    const { data: orderShopsPage, isLoading: shopsLoading } = useQuery({
        queryKey: ['order-shops-detail', id],
        queryFn: () => api.get(`/api/order-shops/order/${id}`).then((res) => res.data),
        enabled: !!id,
    });

    const orderShops: OrderShopResponse[] = useMemo(() => {
        if (Array.isArray(orderShopsPage)) return orderShopsPage;
        if (orderShopsPage?.content) return orderShopsPage.content;
        return order?.orderShops || [];
    }, [orderShopsPage, order?.orderShops]);

    const totals = useMemo(() => {
        const totalPrice = orderShops.reduce((sum, shop) => sum + (shop.totalPrice || 0), 0);
        const finalPrice = orderShops.reduce((sum, shop) => sum + (shop.finalPrice || 0), 0);

        return {
            totalPrice: totalPrice || order?.totalPrice || 0,
            finalPrice: finalPrice || order?.finalPrice || 0,
            discount: Math.max((totalPrice || order?.totalPrice || 0) - (finalPrice || order?.finalPrice || 0), 0),
        };
    }, [orderShops, order?.finalPrice, order?.totalPrice]);

    if (orderLoading || shopsLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 font-bold text-slate-500 transition-colors hover:text-slate-950">
                <ArrowLeft size={20} /> Quay lại
            </button>

            <div className="mb-8 flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-950">Chi tiết đơn hàng #{id}</h1>
                    <p className="mt-1 text-sm text-slate-500">Đặt ngày: {new Date(order?.createdAt || '').toLocaleString('vi-VN')}</p>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-blue-600">
                        <MapPin size={16} /> Địa chỉ nhận hàng
                    </div>
                    <p className="font-bold text-slate-950">{order?.userFullName}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{order?.addressSnapshot}</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-violet-600">
                        <CreditCard size={16} /> Phương thức thanh toán
                    </div>
                    <p className="font-bold text-slate-950">{paymentMethodLabels[order?.payment?.method || 'COD'] || order?.payment?.method || 'COD'}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                        Trạng thái: {paymentStatusLabels[order?.payment?.status || 'PENDING'] || order?.payment?.status || 'Đang chờ'}
                    </p>
                </div>
            </div>

            <div className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/60 p-6">
                    <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-slate-950">
                        <ShoppingBag size={18} /> Danh sách sản phẩm
                    </h3>
                </div>

                <div className="divide-y divide-slate-100">
                    {orderShops.map((shop) => (
                        <div key={shop.id} className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-black uppercase text-blue-600">
                                    <Package size={14} /> Shop: {shop.shopName}
                                </div>
                                {shop.status && (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                                        {orderStatusLabels[shop.status] || shop.status}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4">
                                {shop.orderItems?.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <img src={item.productImage} className="h-16 w-16 rounded-xl border object-cover" alt={item.productName} />
                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-1 text-sm font-bold text-slate-950">{item.productName}</p>
                                            <p className="mt-1 text-[10px] font-black uppercase text-slate-400">{item.color} / {item.size}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-950">{formatCurrency(item.price)}</p>
                                            <p className="text-xs font-bold text-slate-400">x{item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
                                <div className="flex justify-between text-slate-500">
                                    <span>Tổng tiền shop</span>
                                    <span className="font-bold">{formatCurrency(shop.totalPrice)}</span>
                                </div>
                                <div className="mt-2 flex justify-between text-slate-500">
                                    <span>Giảm giá shop</span>
                                    <span className="font-bold text-red-500">-{formatCurrency((shop.totalPrice || 0) - (shop.finalPrice || 0))}</span>
                                </div>
                                <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-black text-slate-950">
                                    <span>Thanh toán shop</span>
                                    <span>{formatCurrency(shop.finalPrice)}</span>
                                </div>
                            </div>

                            {shop.shipping && (
                                <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600">
                                        <Truck size={14} /> Vận chuyển: {shop.shipping.shippingStatus}
                                    </div>
                                    {shop.shipping.trackingCode && (
                                        <span className="text-[10px] font-mono text-blue-500">Mã: {shop.shipping.trackingCode}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
                <div className="space-y-3">
                    <div className="flex justify-between text-sm text-slate-300">
                        <span>Tổng tiền hàng</span>
                        <span>{formatCurrency(totals.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-300">
                        <span>Giảm giá voucher</span>
                        <span className="text-red-300">-{formatCurrency(totals.discount)}</span>
                    </div>
                    <div className="flex items-end justify-between border-t border-white/10 pt-4">
                        <span className="font-bold">Tổng thanh toán</span>
                        <span className="text-2xl font-black text-blue-300">{formatCurrency(totals.finalPrice)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
