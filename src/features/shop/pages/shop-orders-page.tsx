import React, { useState } from 'react';
import { useMyShop } from '../hooks/use-shop';
import { useShopOrders, useConfirmOrderShop, useUpdateOrderShipping, useCancelOrderShop } from '@/features/order/hooks/use-order'; // Giữ lại useConfirmOrderShop và useCancelOrderShop
import { ShoppingCart, Package, Truck, CheckCircle, Clock, AlertCircle, Loader2, PackageX, Trash2, RotateCcw } from 'lucide-react';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

const ShopOrdersPage = () => {
    const { data: shop } = useMyShop();
    const [page, setPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');

    const STATUS_TABS = [
        { id: 'PENDING', label: 'Chờ xác nhận' },
        { id: 'CONFIRMED', label: 'Đã xác nhận' },
        { id: 'PROCESSING', label: 'Đang chuẩn bị' },
        { id: 'RETURN_REQUESTED', label: 'Yêu cầu trả hàng' },
        { id: 'CANCELLED', label: 'Đã hủy' },
        { id: 'ALL', label: 'Tất cả' },
    ];

    const { data: orderPage, isLoading, isError } = useShopOrders(shop?.id || 0, page, 10, statusFilter === '' ? undefined : statusFilter);

    const confirmMutation = useConfirmOrderShop();
    const cancelMutation = useCancelOrderShop();
    const shippingMutation = useUpdateOrderShipping();

    // Lọc và sắp xếp tại frontend: Phải đặt sau khi đã khai báo orderPage
    const processedOrders = React.useMemo(() => {
        if (!orderPage?.content) return [];
        let content = [...orderPage.content];

        // 1. Lọc theo trạng thái
        if (statusFilter !== 'ALL' && statusFilter !== '') {
            content = content.filter(o => o.status === statusFilter);
        }

        // 2. Sắp xếp mới nhất lên đầu (Sắp xếp tại Frontend để đảm bảo UX)
        return content.sort((a, b) => b.id - a.id);
    }, [orderPage, statusFilter]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'PROCESSING': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'SHIPPED': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'DELIVERED': return 'bg-green-50 text-green-600 border-green-100';
            case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'RETURN_REQUESTED': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    };

    const handleProcessOrder = async (orderShopId: number, nextStatus: string) => {
        const orderShop = orderPage?.content?.find(os => os.id === orderShopId);
        if (!orderShop) return;

        const shippingId = orderShop.shipping?.id;

        if (nextStatus === 'SHIPPED') {
            const trackingCode = window.prompt('Nhập mã vận đơn (Tracking Code):');
            if (!trackingCode) return;
            // Gọi mutation cập nhật shipping
            shippingMutation.mutate(
                {
                    shippingId,
                    orderShopId,
                    data: { shippingStatus: nextStatus, trackingCode }
                },
                {
                    onSuccess: () => {
                        toast.success(`Đã chuyển trạng thái sang ${nextStatus}`);
                    },
                    onError: (err: any) => {
                        toast.error(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
                    }
                }
            );
        } else if (nextStatus === 'DELIVERED' || nextStatus === 'RETURNED') {
            // Gọi mutation cập nhật shipping
            shippingMutation.mutate(
                {
                    shippingId,
                    orderShopId,
                    data: { shippingStatus: nextStatus }
                },
                {
                    onSuccess: () => {
                        toast.success(`Đã chuyển trạng thái sang ${nextStatus}`);
                    },
                    onError: (err: any) => {
                        toast.error(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
                    }
                }
            );
        } else if (nextStatus === 'CONFIRMED') {
            confirmMutation.mutate(orderShop.id, {
                onSuccess: () => {
                    toast.success('Đã xác nhận đơn hàng thành công');
                },
                onError: (err: any) => {
                    toast.error(err.response?.data?.message || 'Lỗi xác nhận đơn hàng');
                }
            });
        } else if (nextStatus === 'CANCELLED') {
            cancelMutation.mutate(orderShop.id, {
                onSuccess: () => {
                    toast.success('Đã hủy đơn hàng thành công');
                },
                onError: (err: any) => {
                    toast.error(err.response?.data?.message || 'Lỗi hủy đơn hàng');
                }
            });
        }
    };

    if (isLoading) return <div className="p-20 text-center flex flex-col items-center gap-4"><Loader2 className="animate-spin text-blue-600" size={32} /> Đang tải đơn hàng...</div>;
    if (isError) return <div className="p-20 text-center text-red-500 flex flex-col items-center gap-2"><AlertCircle size={32} /> Lỗi khi tải dữ liệu đơn hàng shop.</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0F0F0F] tracking-tight flex items-center gap-2">
                        <ShoppingCart size={24} /> Quản lý đơn hàng
                    </h1>
                    <p className="text-[#6B7280] text-sm mt-1">Xác nhận và chuẩn bị đơn hàng mới</p>
                </div>
                <div className="flex gap-2">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setStatusFilter(tab.id === 'ALL' ? '' : tab.id); setPage(0); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${(statusFilter === tab.id || (tab.id === 'ALL' && statusFilter === ''))
                                ? 'bg-[#111111] text-white border-[#111111]'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
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
                        {processedOrders.map((orderShop: any) => (
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
                                                <button onClick={() => handleProcessOrder(orderShop.id, 'CONFIRMED')} className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-all">Xác nhận đơn</button>
                                                <button onClick={() => handleProcessOrder(orderShop.id, 'CANCELLED')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Hủy đơn"><Trash2 size={16} /></button>
                                            </>
                                        )}
                                        {(orderShop.status === 'CONFIRMED' || orderShop.status === 'PROCESSING') && (
                                            <button onClick={() => handleProcessOrder(orderShop.id, 'SHIPPED')} className="px-3 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 transition-all">Giao hàng</button>
                                        )}
                                        {orderShop.status === 'SHIPPED' && (
                                            <button onClick={() => handleProcessOrder(orderShop.id, 'DELIVERED')} className="px-3 py-1.5 bg-green-600 text-white text-[11px] font-bold rounded-lg hover:bg-green-700 transition-all">Đã giao</button>
                                        )}
                                        {orderShop.status === 'DELIVERED' && (
                                            <button onClick={() => handleProcessOrder(orderShop.id, 'RETURNED')} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-all" title="Trả hàng"><RotateCcw size={16} /></button>
                                        )}
                                        {orderShop.status === 'RETURN_REQUESTED' && (
                                            <button
                                                onClick={() => handleProcessOrder(orderShop.id, 'RETURNED')}
                                                className="px-3 py-1.5 bg-orange-600 text-white text-[11px] font-bold rounded-lg hover:bg-orange-700 transition-all shadow-sm flex items-center gap-1"
                                            >
                                                <RotateCcw size={14} /> Xác nhận nhận hàng trả
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {processedOrders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center text-[#9CA3AF] italic text-sm flex flex-col items-center gap-2">
                                    <PackageX size={32} className="text-gray-300" />
                                    Chưa có đơn hàng nào được tìm thấy.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {orderPage && orderPage.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 py-6 border-t border-[#E5E7EB] bg-[#FAFAFA]">
                        <button
                            disabled={page === 0}
                            onClick={() => {
                                setPage(old => Math.max(0, old - 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-4 py-2 text-sm font-bold text-[#6B7280] bg-white border border-[#E5E7EB] rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
                        >
                            Trang trước
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#111111]">Trang {page + 1}</span>
                            <span className="text-sm text-[#9CA3AF]">/</span>
                            <span className="text-sm text-[#9CA3AF]">{orderPage.totalPages}</span>
                        </div>
                        <button
                            disabled={page >= orderPage.totalPages - 1}
                            onClick={() => {
                                setPage(old => old + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-4 py-2 text-sm font-bold text-[#6B7280] bg-white border border-[#E5E7EB] rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopOrdersPage;
