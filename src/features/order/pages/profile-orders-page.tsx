import React, { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useUserOrders, useOrderDetails, useConfirmDelivery, useRequestReturn, useCancelOrderShop } from '../hooks/use-order';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, Loader2, Star, RefreshCcw, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

const ORDER_TABS = [
    { id: 'ALL', label: 'Tất cả', status: undefined },
    { id: 'PENDING', label: 'Chờ xác nhận', status: 'PENDING' },
    { id: 'CONFIRMED', label: 'Đã xác nhận', status: 'CONFIRMED' },
    { id: 'PROCESSING', label: 'Chờ giao hàng', status: 'PROCESSING' },
    { id: 'SHIPPED', label: 'Đang giao', status: 'SHIPPED' },
    { id: 'DELIVERED', label: 'Đã giao', status: 'DELIVERED' },
    { id: 'COMPLETED', label: 'Hoàn thành', status: 'COMPLETED' },
    { id: 'CANCELLED', label: 'Đã hủy', status: 'CANCELLED' },
    { id: 'RETURN_REQUESTED', label: 'Chờ trả hàng', status: 'RETURN_REQUESTED' },
    { id: 'RETURNED', label: 'Đã trả hàng', status: 'RETURNED' },
];

const ACTIVE_TABS = [
    { id: 'PENDING', label: 'Chờ xác nhận', status: 'PENDING' },
    { id: 'PROCESSING', label: 'Chờ giao hàng', status: 'PROCESSING' },
    { id: 'SHIPPED', label: 'Đang giao', status: 'SHIPPED' },
    { id: 'CANCELLED', label: 'Đã hủy', status: 'CANCELLED' },
    { id: 'RETURNED', label: 'Trả hàng', status: 'RETURNED' },
];

const HISTORY_TABS = [
    { id: 'COMPLETED', label: 'Lịch sử mua hàng', status: 'COMPLETED' },
];

interface ProfileOrdersPageProps {
    mode?: 'ACTIVE' | 'HISTORY' | 'ALL';
    isNested?: boolean;
}

const ProfileOrdersPage = ({ mode = 'ALL', isNested = false }: ProfileOrdersPageProps) => {
    const user = useAuthStore(state => state.user);
    const [page, setPage] = useState(0);

    const tabs = useMemo(() => {
        if (mode === 'ACTIVE') return ACTIVE_TABS;
        if (mode === 'HISTORY') return HISTORY_TABS;
        return ORDER_TABS;
    }, [mode]);

    const [activeTab, setActiveTab] = useState(tabs[0].id);

    useEffect(() => {
        setActiveTab(tabs[0].id);
        setPage(0);
    }, [mode, tabs]);

    const currentStatus = useMemo(() => tabs.find(t => t.id === activeTab)?.status, [activeTab, tabs]);

    const { data: orderPage, isLoading } = useUserOrders(user?.id || 0, page, 10, currentStatus);

    // Logic xử lý dữ liệu: Phải đặt SAU khi gọi useUserOrders
    const processedOrders = useMemo(() => {
        if (!orderPage?.content) return [];
        let content = [...orderPage.content];

        // Sắp xếp ID giảm dần (Mới nhất lên đầu)
        return content.sort((a: any, b: any) => b.id - a.id);
    }, [orderPage]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING': return { label: 'Chờ xác nhận', icon: <Clock size={16} />, color: 'text-amber-600 bg-amber-50 border-amber-100' };
            case 'CONFIRMED': return { label: 'Shop đã nhận đơn', icon: <CheckCircle size={16} />, color: 'text-blue-600 bg-blue-50 border-blue-100' };
            case 'PROCESSING': return { label: 'Đang xử lý', icon: <Package size={16} />, color: 'text-blue-600 bg-blue-50 border-blue-100' };
            case 'SHIPPED': return { label: 'Đang giao hàng', icon: <Truck size={16} />, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
            case 'DELIVERED': return { label: 'Đã giao hàng', icon: <CheckCircle size={16} />, color: 'text-green-600 bg-green-50 border-green-100' };
            case 'COMPLETED': return { label: 'Hoàn thành', icon: <CheckCircle size={16} />, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
            case 'CANCELLED': return { label: 'Đã hủy', icon: <XCircle size={16} />, color: 'text-red-600 bg-red-50 border-red-100' };
            case 'RETURN_REQUESTED': return { label: 'Đang yêu cầu trả hàng', icon: <RefreshCcw size={16} />, color: 'text-orange-600 bg-orange-50 border-orange-100' };
            default: return { label: status, icon: <Package size={16} />, color: 'text-gray-600 bg-gray-50 border-gray-100' };
        }
    };

    if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className={isNested ? "" : "container mx-auto px-4 py-10 max-w-4xl"}>
            {!isNested && (
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#111111] tracking-tight uppercase">Đơn mua</h1>
                        <p className="text-gray-500 text-sm mt-1">Quản lý và theo dõi trạng thái các đơn hàng của bạn</p>
                    </div>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto no-scrollbar bg-white sticky top-0 z-10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setPage(0); }}
                        className={`flex-1 min-w-fit px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {processedOrders.length > 0 ? (
                    processedOrders.map((order) => {
                        return (
                            <div key={order.id} className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden mb-4">
                                <div className="p-6 border-b border-gray-50">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                                                <Package size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#111111]">Mã đơn: #{order.id}</p>
                                                <p className="text-xs text-[#9CA3AF]">{new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Hiển thị chi tiết đơn hàng thay vì tóm tắt */}
                                <OrderItemsList orderId={order.id} />

                                <div className="bg-gray-50/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-[#9CA3AF] uppercase mb-1">Địa chỉ giao hàng</p>
                                        <p className="text-sm text-[#6B7280] line-clamp-1">{order.addressSnapshot}</p>
                                    </div>
                                    <div className="flex items-center justify-end gap-6">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-[#9CA3AF] uppercase mb-1">Tổng thanh toán</p>
                                            <p className="text-lg font-black text-blue-600">{order.finalPrice.toLocaleString()}đ</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Bar */}
                                <div className="p-4 bg-white border-t border-dashed border-[#F3F4F6] flex items-center justify-between gap-3">
                                    <Link to={`/order/${order.id}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1">
                                        Xem chi tiết đơn hàng <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white border border-dashed border-[#E5E7EB] rounded-3xl p-20 text-center">
                        <div className="flex justify-center mb-4 text-[#E5E7EB]">
                            <Package size={64} />
                        </div>
                        <p className="text-[#9CA3AF] font-medium italic">Bạn chưa có đơn hàng nào.</p>
                        <Link to="/" className="inline-block mt-6 text-blue-600 font-bold hover:underline">Tiếp tục mua sắm</Link>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {orderPage && orderPage.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                    <button
                        disabled={page === 0}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        className="px-4 py-2 border border-[#E5E7EB] rounded-xl font-bold text-sm disabled:opacity-50"
                    >
                        Trước
                    </button>
                    <span className="text-sm font-bold">Trang {page + 1} / {orderPage.totalPages}</span>
                    <button
                        disabled={page >= orderPage.totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 border border-[#E5E7EB] rounded-xl font-bold text-sm disabled:opacity-50"
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    );
};

// Component hiển thị chi tiết các item trong đơn hàng
const OrderItemsList = ({ orderId }: { orderId: number }) => {
    const confirmDeliveryMutation = useConfirmDelivery();
    const requestReturnMutation = useRequestReturn();
    const cancelOrderShopMutation = useCancelOrderShop();

    // Dùng API lấy danh sách OrderShop của đơn hàng này để lấy Item chi tiết
    const { data: orderShops, isLoading } = useQuery({
        queryKey: ['order-shops-detail', orderId],
        queryFn: () => api.get(`/api/order-shops/order/${orderId}`).then(res => res.data)
    });

    if (isLoading) return <div className="p-6 border-b border-gray-50"><Loader2 className="animate-spin text-gray-200 mx-auto" size={20} /></div>;

    const shopsArray = Array.isArray(orderShops) ? orderShops : (orderShops?.content || []);

    if (shopsArray.length === 0) return <p className="p-6 text-center text-gray-400 italic text-sm">Không có dữ liệu chi tiết sản phẩm.</p>;

    return (
        <div className="divide-y divide-gray-100 border-b border-gray-50">
            {shopsArray.map((shop: any) => (
                <div key={shop.id} className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-[11px] font-black text-blue-600 uppercase tracking-widest">
                        <ShoppingBag size={12} /> {shop.shopName}
                        <div className="ml-auto flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] ${shop.status === 'DELIVERED' ? 'text-green-600 border-green-100 bg-green-50' :
                                shop.status === 'COMPLETED' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' :
                                    shop.status === 'CANCELLED' ? 'text-red-600 border-red-100 bg-red-50' :
                                        'text-blue-600 border-blue-100 bg-blue-50'
                                }`}>
                                {shop.status}
                            </span>
                        </div>
                    </div>
                    {shop.orderItems?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4">
                            <img src={item.productImage} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">{item.productName}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">{item.color} / {item.size}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-gray-900">{item.price.toLocaleString()}đ</p>
                                <p className="text-[10px] text-gray-400 font-bold">x{item.quantity}</p>
                            </div>
                        </div>
                    ))}

                    {/* Nút hành động cho từng Shop */}
                    <div className="flex justify-end gap-2 pt-2">
                        {(shop.status === 'PENDING' || shop.status === 'CONFIRMED' || shop.status === 'PROCESSING') && (
                            <button
                                onClick={() => window.confirm('Hủy đơn hàng của shop này?') && cancelOrderShopMutation.mutate(shop.id)}
                                className="px-3 py-1 border border-red-200 text-red-600 text-xs font-bold rounded-lg hover:bg-red-50"
                            >
                                Hủy đơn shop
                            </button>
                        )}
                        {shop.status === 'DELIVERED' && (
                            <button
                                onClick={() => window.confirm('Xác nhận đã nhận hàng cho shop này?') && confirmDeliveryMutation.mutate(shop.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                            >
                                Đã nhận hàng
                            </button>
                        )}
                        {(shop.status === 'DELIVERED' || shop.status === 'COMPLETED') && (
                            <button
                                onClick={() => window.confirm('Bạn muốn yêu cầu trả hàng cho shop này?') && requestReturnMutation.mutate(shop.id)}
                                className="px-3 py-1 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 flex items-center gap-1"
                            >
                                <RefreshCcw size={12} /> Trả hàng
                            </button>
                        )}
                        {shop.status === 'COMPLETED' && (
                            <button className="px-3 py-1 bg-[#111111] text-white text-xs font-bold rounded-lg hover:bg-black flex items-center gap-1">
                                <Star size={12} className="text-amber-400" fill="currentColor" /> Đánh giá
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProfileOrdersPage;