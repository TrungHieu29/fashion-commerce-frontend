import React, { useState } from 'react';
import { useMyShop } from '@/features/shop/hooks/use-shop';
import { useShopOrders, useConfirmOrderShop, useCancelOrderShop, useUpdateOrderShipping } from '@/features/order/hooks/use-order';
import { ShoppingCart, Package, Truck, CheckCircle, Clock, Search, Filter, AlertCircle, Loader2, PackageX, Trash2, RotateCcw } from 'lucide-react';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

const ShopOrdersPage = () => {
    const { data: shop } = useMyShop();
    const [page, setPage] = useState(0);

    const { data: orderPage, isLoading, isError } = useShopOrders(shop?.id || 0, page, 10);

    const confirmMutation = useConfirmOrderShop();
    const cancelMutation = useCancelOrderShop();
    const shippingMutation = useUpdateOrderShipping();

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'PROCESSING': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'SHIPPED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'DELIVERED': return 'bg-green-50 text-green-600 border-green-100';
            default: return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    };

    const handleProcessOrder = async (orderShopId: number, nextStatus: string) => {
        const orderShop = orderPage?.content?.find(os => os.id === orderShopId);
        if (!orderShop) {
            toast.error('Không tìm thấy đơn hàng shop.');
            return;
        }

        try {
            if (nextStatus === 'PROCESSING') {
                // Cập nhật qua shipping mutation theo flow Backend
                shippingMutation.mutate({
                    shippingId: orderShop.shipping?.id,
                    orderShopId,
                    data: { shippingStatus: 'PROCESSING' }
                });
            } else if (nextStatus === 'SHIPPED') {
                const trackingCode = window.prompt('Nhập mã vận đơn (Tracking Code):') || `TRK${Date.now()}`;
                shippingMutation.mutate({
                    shippingId: orderShop.shipping?.id,
                    orderShopId,
                    data: { shippingStatus: 'SHIPPED', trackingCode }
                });
            } else if (nextStatus === 'DELIVERED') {
                shippingMutation.mutate({
                    shippingId: orderShop.shipping?.id,
                    orderShopId,
                    data: { shippingStatus: 'DELIVERED' }
                });
            } else if (nextStatus === 'CONFIRMED') {
                confirmMutation.mutate(orderShopId);
            } else if (nextStatus === 'CANCELLED') {
                cancelMutation.mutate(orderShopId);
            }
        } catch (error: any) {
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái: ' + (error.response?.data?.message || error.message));
        }
    };

    if (isLoading) return <div className="p-20 text-center flex flex-col items-center gap-4"><Loader2 className="animate-spin text-blue-600" size={24} /> Đang tải đơn hàng...</div>;
    if (isError) return <div className="p-20 text-center text-red-500 flex flex-col items-center gap-2"><AlertCircle size={24} /> Lỗi khi tải dữ liệu đơn hàng shop.</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0F0F0F] tracking-tight flex items-center gap-2">
                        <ShoppingCart size={24} /> Quản lý đơn hàng
                    </h1>
                    <p className="text-[#6B7280] text-sm mt-1">Theo dõi và xử lý các đơn hàng từ khách hàng</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB]">
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#6B7280]">Đơn hàng</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#6B7280]">Sản phẩm</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#6B7280]">Khách hàng & Địa chỉ</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#6B7280]">Tổng tiền</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#6B7280]">Trạng thái</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#6B7280] text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                        {orderPage?.content && orderPage.content.map((orderShop: any) => (
                            <tr key={orderShop.id} className="hover:bg-[#F9FAFB]/30">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-[#111111] text-sm">#{orderShop.id}</p>
                                    <p className="text-[10px] text-[#9CA3AF] mt-1 font-mono uppercase">Order: #{orderShop.orderId}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex -space-x-3 overflow-hidden">
                                        {orderShop.orderItems.map((item: any) => (
                                            <img key={item.id} src={item.productImage} className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" title={item.productName} />
                                        ))}
                                        {orderShop.orderItems.length > 3 && (
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white text-[10px] font-bold text-gray-400">
                                                +{orderShop.orderItems.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-[13px] text-[#111111] font-medium line-clamp-2">{orderShop.addressSnapshot}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-black text-blue-600 text-sm">{orderShop.finalPrice.toLocaleString()}đ</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(orderShop.status)}`}>
                                        {orderShop.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {orderShop.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => handleProcessOrder(orderShop.id, 'PROCESSING')} className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-all">Xác nhận</button>
                                                <button onClick={() => handleProcessOrder(orderShop.id, 'CANCELLED')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Hủy đơn"><Trash2 size={16} /></button>
                                            </>
                                        )}
                                        {orderShop.status === 'PROCESSING' && (
                                            <button onClick={() => handleProcessOrder(orderShop.id, 'SHIPPED')} className="px-3 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 transition-all">Giao hàng</button>
                                        )}
                                        {orderShop.status === 'SHIPPED' && (
                                            <button onClick={() => handleProcessOrder(orderShop.id, 'DELIVERED')} className="px-3 py-1.5 bg-green-600 text-white text-[11px] font-bold rounded-lg hover:bg-green-700 transition-all">Đã giao</button>
                                        )}
                                        {orderShop.status === 'DELIVERED' && (
                                            <button onClick={() => handleProcessOrder(orderShop.id, 'RETURNED')} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-all" title="Trả hàng"><RotateCcw size={16} /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {(!orderPage?.content || orderPage.content.length === 0) && (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-[#9CA3AF] italic text-sm">
                                    Chưa có đơn hàng nào được đặt.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ShopOrdersPage;
