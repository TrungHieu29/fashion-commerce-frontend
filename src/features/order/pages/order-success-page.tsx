import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, MapPin, CreditCard, Loader2, ShoppingBag } from 'lucide-react';
import { useOrderDetails } from '../hooks/use-order';

const paymentMethodLabels: Record<string, string> = {
    COD: 'Thanh toán khi nhận hàng (COD)',
    VNPAY: 'VNPAY QR mockup',
    MOMO: 'MOMO QR mockup',
};

const OrderSuccessPage = () => {
    const { id } = useParams();
    const { data: order, isLoading } = useOrderDetails(Number(id));

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
            <div className="flex justify-center mb-6">
                <div className="p-4 bg-green-100 text-green-600 rounded-full animate-bounce">
                    <CheckCircle size={64} />
                </div>
            </div>

            <h1 className="text-4xl font-black text-[#111111] mb-2 tracking-tight uppercase">Đặt hàng thành công!</h1>
            <p className="text-gray-500 mb-10 text-lg">Cảm ơn bạn đã tin dùng sản phẩm của chúng tôi. Mã đơn hàng của bạn là <span className="font-bold text-[#111111]">#{id}</span></p>

            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 text-left shadow-sm mb-10">
                <h3 className="font-bold text-xl mb-6 border-b pb-4">Tóm tắt đơn hàng</h3>

                <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                        <MapPin className="text-gray-400 mt-1" size={20} />
                        <div>
                            <p className="font-bold text-sm uppercase text-[#9CA3AF]">Địa chỉ nhận hàng</p>
                            <p className="text-[#111111] font-medium">{order?.addressSnapshot}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <CreditCard className="text-gray-400 mt-1" size={20} />
                        <div>
                            <p className="font-bold text-sm uppercase text-[#9CA3AF]">Phương thức thanh toán</p>
                            <p className="text-[#111111] font-medium">{paymentMethodLabels[order?.payment?.method || 'COD'] || order?.payment?.method || 'COD'}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-[#F3F4F6] flex justify-between items-center">
                    <span className="text-lg font-bold">Tổng thanh toán</span>
                    <span className="text-2xl font-black text-blue-600">{(order?.finalPrice ?? 0).toLocaleString()}đ</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={`/order/${id}`} className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all">
                    Xem chi tiết đơn <ShoppingBag size={20} />
                </Link>
                <Link to="/profile?tab=orders" className="flex items-center justify-center gap-2 px-8 py-4 bg-[#111111] text-white rounded-2xl font-bold hover:bg-black transition-all">
                    Danh sách đơn mua <Package size={20} />
                </Link>
                <Link to="/" className="flex items-center justify-center gap-2 px-8 py-4 border border-[#E5E7EB] text-[#111111] rounded-2xl font-bold hover:bg-gray-50 transition-all">
                    Tiếp tục mua sắm <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccessPage;
