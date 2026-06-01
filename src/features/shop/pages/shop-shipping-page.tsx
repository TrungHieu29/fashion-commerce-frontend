import React, { useState } from 'react';
import { useMyShop } from '../hooks/use-shop';
import { useShopOrders, useUpdateOrderShipping } from '@/features/order/hooks/use-order';
import { Truck, Package, Search, ChevronDown, Loader2, MapPin, ClipboardList, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const ShopShippingPage = () => {
    const { data: shop } = useMyShop();
    const [page, setPage] = useState(0);
    // Trang này tập trung vào 2 trạng thái chính của vận chuyển
    const [statusFilter, setStatusFilter] = useState<string>('PROCESSING');

    const { data: orderPage, isLoading } = useShopOrders(shop?.id || 0, page, 10, statusFilter === 'ALL' ? undefined : statusFilter);
    const shippingMutation = useUpdateOrderShipping();

    // Sắp xếp vận đơn mới nhất lên đầu
    const sortedShippingOrders = React.useMemo(() => {
        if (!orderPage?.content) return [];
        return [...orderPage.content].sort((a, b) => b.id - a.id);
    }, [orderPage]);

    const handleUpdateShipping = async (orderShop: any, nextStatus: string) => {
        const shippingId = orderShop.shipping?.id;
        const orderShopId = orderShop.id;

        let trackingCode = orderShop.shipping?.trackingCode;

        if (nextStatus === 'SHIPPED') {
            const code = window.prompt('Nhập mã vận đơn (Tracking Code) cho đơn hàng này:', trackingCode || '');
            if (!code) return;
            trackingCode = code;
        }

        shippingMutation.mutate(
            {
                shippingId,
                orderShopId,
                data: { shippingStatus: nextStatus, trackingCode }
            },
            {
                onSuccess: () => toast.success(`Cập nhật trạng thái vận chuyển: ${nextStatus}`)
            }
        );
    };

    if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin inline-block mr-2" /> Đang tải dữ liệu vận chuyển...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0F0F0F] tracking-tight flex items-center gap-2">
                        <Truck size={24} /> Quản lý vận chuyển
                    </h1>
                    <p className="text-[#6B7280] text-sm mt-1">Xử lý giao hàng và quản lý mã vận đơn</p>
                </div>

                <div className="flex gap-2">
                    {['PROCESSING', 'SHIPPED', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(0); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${statusFilter === status
                                ? 'bg-[#111111] text-white border-[#111111]'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                }`}
                        >
                            {status === 'PROCESSING' ? 'Chờ lấy hàng' :
                                status === 'SHIPPED' ? 'Đang giao' :
                                    status === 'DELIVERED' ? 'Đã giao' :
                                        status === 'RETURN_REQUESTED' ? 'Yêu cầu trả hàng' : 'Đã trả hàng'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB]">
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#6B7280]">Thông tin kiện hàng</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#6B7280]">Địa chỉ nhận hàng</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#6B7280]">Đơn vị vận chuyển</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#6B7280]">Mã vận đơn</th>
                                <th className="px-6 py-4 text-[11px] font-bold uppercase text-[#6B7280] text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E7EB]">
                            {sortedShippingOrders.map((orderShop: any) => (
                                <tr key={orderShop.id} className="hover:bg-[#F9FAFB]/30">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-[#111111]">Mã đơn shop: #{orderShop.id}</p>
                                                <p className="text-[10px] text-[#9CA3AF] uppercase font-bold">{orderShop.orderItems?.length} sản phẩm</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-2 max-w-[250px]">
                                            <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                            <p className="text-[12px] text-gray-600 leading-relaxed line-clamp-2">
                                                {orderShop.addressSnapshot}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[12px] font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                            Fashion Express (Nội bộ)
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {orderShop.shipping?.trackingCode ? (
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[12px] font-bold text-blue-600">{orderShop.shipping.trackingCode}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-gray-400 italic">Chưa có mã</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {statusFilter === 'PROCESSING' && (
                                            <button
                                                onClick={() => handleUpdateShipping(orderShop, 'SHIPPED')}
                                                className="px-4 py-2 bg-blue-600 text-white text-[11px] font-bold rounded-xl hover:bg-blue-700 shadow-sm"
                                            >
                                                Giao cho nhà vận chuyển
                                            </button>
                                        )}
                                        {statusFilter === 'SHIPPED' && (
                                            <button
                                                onClick={() => handleUpdateShipping(orderShop, 'DELIVERED')}
                                                className="px-4 py-2 bg-green-600 text-white text-[11px] font-bold rounded-xl hover:bg-green-700 shadow-sm"
                                            >
                                                Xác nhận đã giao
                                            </button>
                                        )}
                                        {statusFilter === 'RETURN_REQUESTED' && (
                                            <button
                                                onClick={() => handleUpdateShipping(orderShop, 'RETURNED')}
                                                className="px-4 py-2 bg-orange-600 text-white text-[11px] font-bold rounded-xl hover:bg-orange-700 shadow-sm"
                                            >
                                                Xác nhận nhận hàng trả
                                            </button>
                                        )}
                                        {(statusFilter === 'DELIVERED' || statusFilter === 'RETURNED') && (
                                            <div className="flex items-center justify-end gap-1 text-gray-400">
                                                <CheckCircle size={14} />
                                                <span className="text-[11px] font-bold uppercase">Hoàn tất</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(!orderPage?.content || orderPage.content.length === 0) && (
                    <div className="py-20 text-center flex flex-col items-center gap-2">
                        <ClipboardList size={40} className="text-gray-200" />
                        <p className="text-gray-400 text-sm italic">Không có vận đơn nào ở trạng thái này.</p>
                    </div>
                )}

                {orderPage && orderPage.totalPages > 1 && (
                    <div className="p-4 bg-gray-50 border-t flex justify-center gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border rounded bg-white disabled:opacity-50 text-xs font-bold"
                        >
                            Trước
                        </button>
                        <button
                            disabled={page >= orderPage.totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border rounded bg-white disabled:opacity-50 text-xs font-bold"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopShippingPage;