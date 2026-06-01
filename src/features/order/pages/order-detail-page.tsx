import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetails, useUserOrders } from '../hooks/use-order';
import { Package, MapPin, CreditCard, Truck, ShoppingBag, ArrowLeft, Loader2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: order, isLoading: orderLoading } = useOrderDetails(Number(id));

    const { data: orderShops, isLoading: shopsLoading } = useQuery({
        queryKey: ['order-shops-detail', id],
        queryFn: () => api.get(`/api/order-shops/order/${id}`).then(res => res.data),
        enabled: !!id
    });

    if (orderLoading || shopsLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="container mx-auto px-4 py-10 max-w-4xl">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-black font-bold mb-8 transition-colors">
                <ArrowLeft size={20} /> Quay lại
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Chi tiết đơn hàng #{id}</h1>
                    <p className="text-sm text-gray-500 mt-1">Đặt ngày: {new Date(order?.createdAt || '').toLocaleString('vi-VN')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-600 mb-4 font-bold uppercase text-xs tracking-widest">
                        <MapPin size={16} /> Địa chỉ nhận hàng
                    </div>
                    <p className="text-gray-900 font-bold">{order?.userFullName}</p>
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">{order?.addressSnapshot}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-purple-600 mb-4 font-bold uppercase text-xs tracking-widest">
                        <CreditCard size={16} /> Phương thức thanh toán
                    </div>
                    <p className="text-gray-900 font-bold">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-gray-500 text-xs mt-2 italic">* Vui lòng kiểm tra hàng trước khi thanh toán.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                    <h3 className="font-black text-gray-900 flex items-center gap-2 uppercase text-sm tracking-widest">
                        <ShoppingBag size={18} /> Danh sách sản phẩm
                    </h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {(Array.isArray(orderShops) ? orderShops : (orderShops?.content || [])).map((shop: any) => (
                        <div key={shop.id} className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase">
                                    <Package size={14} /> Shop: {shop.shopName}
                                </div>
                                {shop.status && (
                                    <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-500">{shop.status}</span>
                                )}
                            </div>
                            <div className="space-y-4">
                                {shop.orderItems?.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <img src={item.productImage} className="w-16 h-16 rounded-xl object-cover border" alt="" />
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 text-sm">{item.productName}</p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase mt-1">{item.color} / {item.size}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900 text-sm">{item.price.toLocaleString()}đ</p>
                                            <p className="text-xs text-gray-400 font-bold tracking-tighter">x{item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {shop.shipping && (
                                <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase">
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

            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl">
                <div className="space-y-3">
                    <div className="flex justify-between text-gray-400 text-sm">
                        <span>Tổng tiền hàng</span>
                        <span>{order?.totalPrice.toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm">
                        <span>Giảm giá voucher</span>
                        <span className="text-red-400">-{((order?.totalPrice || 0) - (order?.finalPrice || 0)).toLocaleString()}đ</span>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                        <span className="font-bold">Tổng thanh toán</span>
                        <span className="text-2xl font-black text-blue-400">{order?.finalPrice.toLocaleString()}đ</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;