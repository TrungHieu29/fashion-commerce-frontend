import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import { useAddresses, useAddAddress } from '@/features/user/hooks/use-user'; // Giữ lại useAddresses, useAddAddress
import { useCreateOrder, useApplyVoucher, useProcessOnlinePayment } from '../hooks/use-order';
import { MapPin, CreditCard, Truck, ShoppingBag, ChevronRight, Loader2, Tag, QrCode, Check, AlertCircle, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '@/features/user/schemas/profile.schema';

const CheckoutPage = () => {
    const user = useAuthStore(state => state.user);
    const navigate = useNavigate();
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANKING'>('COD');
    const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
    const [appliedVouchers, setAppliedVouchers] = useState<Record<number, string>>({}); // shopId -> voucherCode
    const [shopDiscounts, setShopDiscounts] = useState<Record<number, number>>({}); // shopId -> discountAmount

    const { data: cart, isLoading: isLoadingCart } = useQuery({
        queryKey: ['cart', user?.id],
        queryFn: () => api.get(`/api/carts/user/${user?.id}`).then(res => res.data),
        enabled: !!user?.id
    });

    const { data: addresses, refetch: refetchAddresses } = useAddresses();

    // Thiết lập địa chỉ mặc định khi dữ liệu địa chỉ tải xong
    useEffect(() => {
        if (addresses && !selectedAddressId) {
            const defaultAddr = addresses.find((a: any) => a.isDefault);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            else if (addresses.length > 0) setSelectedAddressId(addresses[0].id);
        }
    }, [addresses, selectedAddressId]);

    // Gom sản phẩm theo Shop
    const groupedShops = useMemo(() => {
        if (!cart?.cartItems) return [];
        const groups: Record<number, { shopId: number, shopName: string, items: any[], subtotal: number }> = {};

        cart.cartItems.forEach((item: any) => {
            const sid = item.shopId || 0;
            const sname = item.shopName || 'Cửa hàng';
            if (!groups[sid]) {
                groups[sid] = { shopId: sid, shopName: sname, items: [], subtotal: 0 };
            }
            groups[sid].items.push(item);
            groups[sid].subtotal += (item.price * item.quantity);
        });

        return Object.values(groups);
    }, [cart]);

    // Tính tổng tiền sau giảm giá
    const totalDiscount = useMemo(() => Object.values(shopDiscounts).reduce((a, b) => a + b, 0), [shopDiscounts]);
    const finalAmount = useMemo(() => (cart?.totalAmount || 0) - totalDiscount, [cart, totalDiscount]);

    // 3. Mutation đặt hàng
    const checkoutMutation = useCreateOrder();
    const processPaymentMutation = useProcessOnlinePayment();

    const handlePlaceOrder = () => {
        if (!selectedAddressId) {
            toast.error('Vui lòng chọn địa chỉ nhận hàng');
            return;
        }
        if (!user) return;

        checkoutMutation.mutate(
            {
                userId: user.id,
                addressId: selectedAddressId,
                paymentMethod: paymentMethod,
                voucherCode: Object.values(appliedVouchers).join(',') // Gửi chuỗi các mã voucher
            },
            {
                onSuccess: (data) => {
                    if (paymentMethod === 'BANKING') {
                        setCreatedOrderId(data.id);
                        setShowQRModal(true);
                    } else {
                        toast.success('Đặt hàng thành công!');
                        navigate(`/order-success/${data.id}`);
                    }
                },
                onError: (err: any) => {
                    toast.error('Đặt hàng thất bại: ' + (err.response?.data?.message || err.message));
                },
            }
        );
    };

    const handleConfirmPaymentMockup = () => {
        if (createdOrderId) {
            processPaymentMutation.mutate({ paymentId: createdOrderId, status: 'COMPLETED' }, { // paymentId thay vì orderId
                onSuccess: () => { // status là COMPLETED hoặc FAILED
                    toast.success('Thanh toán thành công!');
                    navigate(`/order-success/${createdOrderId}`);
                }
            });
        }
    };

    if (isLoadingCart) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="container mx-auto px-4 py-10 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-[#111111] tracking-tight uppercase">Checkout</h1>
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-500 font-bold transition-all px-4 py-2 rounded-xl hover:bg-red-50 group"
                >
                    <X size={20} className="group-hover:rotate-90 transition-transform" /> Hủy & Quay lại
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Địa chỉ nhận hàng */}
                    <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2 text-blue-600">
                                <MapPin size={20} />
                                <h2 className="font-bold text-lg text-[#111111]">Địa chỉ nhận hàng</h2>
                            </div>
                            <button
                                onClick={() => setIsAddAddressOpen(true)}
                                className="text-sm font-bold text-blue-600 hover:underline"
                            >
                                + Thêm địa chỉ mới
                            </button>
                        </div>
                        <div className="space-y-4">
                            {addresses?.map((addr: any) => (
                                <label key={addr.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-blue-600 bg-blue-50/30' : 'border-[#F3F4F6] hover:border-[#E5E7EB]'}`}>
                                    <input
                                        type="radio"
                                        name="address"
                                        className="mt-1"
                                        checked={selectedAddressId === addr.id}
                                        onChange={() => setSelectedAddressId(addr.id)}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[#111111]">{addr.receiverName}</span>
                                            <span className="text-[#9CA3AF]">|</span>
                                            <span className="text-[#6B7280]">{addr.phone}</span>
                                            {addr.isDefault && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-black uppercase">Mặc định</span>}
                                        </div>
                                        <p className="text-sm text-[#6B7280] mt-1">{addr.addressLine}, {addr.district}, {addr.city}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Phương thức thanh toán */}
                    <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-green-600">
                            <CreditCard size={20} />
                            <h2 className="font-bold text-lg text-[#111111]">Phương thức thanh toán</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setPaymentMethod('COD')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'COD' ? 'border-green-600 bg-green-50/30' : 'border-[#F3F4F6]'}`}
                            >
                                <span className="font-bold text-sm">Thanh toán khi nhận hàng (COD)</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('BANKING')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'BANKING' ? 'border-green-600 bg-green-50/30' : 'border-[#F3F4F6]'}`}
                            >
                                <span className="font-bold text-sm">Chuyển khoản Ngân hàng</span>
                            </button>
                        </div>
                    </div>

                    {/* Danh sách sản phẩm tóm tắt */}
                    <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-8">
                        <div className="flex items-center gap-2 mb-6 text-purple-600">
                            <ShoppingBag size={20} />
                            <h2 className="font-bold text-lg text-[#111111]">Sản phẩm đặt mua</h2>
                        </div>
                        <div className="space-y-12">
                            {groupedShops.map((group) => (
                                <ShopOrderGroup
                                    key={group.shopId}
                                    group={group}
                                    onApplyVoucher={(code) => setAppliedVouchers(prev => ({ ...prev, [group.shopId]: code }))}
                                    appliedVoucher={appliedVouchers[group.shopId]}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cột tổng kết đơn hàng */}
                <div className="lg:col-span-1">
                    <div className="bg-[#111111] text-white p-8 rounded-3xl shadow-xl sticky top-8">
                        <h3 className="text-xl font-black mb-6 tracking-tight">TỔNG ĐƠN HÀNG</h3>
                        <div className="space-y-4 text-sm font-medium">
                            <div className="flex justify-between text-gray-400">
                                <span>Tạm tính</span>
                                <span>{cart?.totalAmount.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Phí vận chuyển</span>
                                <span>Miễn phí</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>Giảm giá</span>
                                <span className="text-red-400">-{totalDiscount.toLocaleString()}đ</span>
                            </div>
                            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                <span className="text-lg font-bold">Thanh toán</span>
                                <span className="text-2xl font-black text-blue-400">{finalAmount.toLocaleString()}đ</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={checkoutMutation.isPending}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black mt-8 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {checkoutMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : 'ĐẶT HÀNG NGAY'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Mockup Modal */}
            {showQRModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-8 text-center">
                            <QrCode size={48} className="mx-auto text-blue-600 mb-4" />
                            <h3 className="text-2xl font-black mb-2">Quét mã thanh toán</h3>
                            <p className="text-gray-500 mb-8">Vui lòng quét mã để thanh toán cho đơn hàng <span className="font-bold text-black">#{createdOrderId}</span></p>
                            <div className="aspect-square w-64 mx-auto bg-gray-50 rounded-2xl mb-8 flex items-center justify-center border-2 border-dashed">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PAYMENT_ID_${createdOrderId}`} alt="QR" /> {/* Đổi data thành PAYMENT_ID */}
                            </div>
                            <button
                                onClick={handleConfirmPaymentMockup}
                                disabled={processPaymentMutation.isPending}
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all"
                            >
                                {processPaymentMutation.isPending ? 'Đang xác nhận...' : 'Xác nhận đã chuyển khoản'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inline Add Address Modal */}
            {isAddAddressOpen && (
                <AddAddressInlineModal
                    onClose={() => setIsAddAddressOpen(false)}
                    onSuccess={() => { refetchAddresses(); setIsAddAddressOpen(false); }}
                />
            )}
        </div>
    );
};

// --- Component Gom nhóm Shop & Voucher ---
const ShopOrderGroup = ({ group, onApplyVoucher, appliedVoucher, onDiscountUpdate }: {
    group: any,
    onApplyVoucher: (code: string) => void,
    appliedVoucher?: string,
    onDiscountUpdate?: (amount: number) => void
}) => {
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const applyVoucherMutation = useApplyVoucher();

    const { data: vouchers } = useQuery({
        queryKey: ['shop-vouchers', group.shopId],
        queryFn: () => api.get(`/api/discounts/shops/${group.shopId}/active`).then(res => res.data),
    });

    const handleApply = (code: string) => {
        if (!code) {
            toast.error('Mã giảm giá không hợp lệ (Trống)');
            return;
        }

        applyVoucherMutation.mutate({
            shopId: group.shopId,
            voucherCode: code,
            subtotal: group.subtotal
        }, {
            onSuccess: (discountAmount) => {
                if (discountAmount > 0) {
                    onApplyVoucher(code);
                    onDiscountUpdate?.(discountAmount);
                    toast.success(`Đã áp dụng mã giảm ${(discountAmount).toLocaleString()}đ`);
                    setShowVoucherModal(false);
                } else {
                    toast.error('Mã voucher không hợp lệ hoặc không đủ điều kiện');
                }
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <ShoppingBag size={18} className="text-blue-600" />
                <span className="font-black text-sm uppercase tracking-widest">{group.shopName}</span>
            </div>
            <div className="divide-y divide-gray-50">
                {group.items.map((item: any) => (
                    <div key={item.id} className="py-4 flex items-center gap-4">
                        <img src={item.imageUrl} className="w-16 h-16 rounded-xl object-cover border" alt="" />
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">{item.productName}</h4>
                            <p className="text-[10px] text-gray-400 font-black uppercase">{item.color} / {item.size}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black">{item.price.toLocaleString()}đ</p>
                            <p className="text-xs text-gray-400">x{item.quantity}</p>
                        </div>
                    </div>
                ))}
            </div>
            {/* Voucher UI */}
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Tag size={16} className="text-red-500" />
                    <span className="text-xs font-bold text-gray-600">
                        {appliedVoucher ? `Đã chọn: ${appliedVoucher}` : 'Tất cả voucher của shop'}
                    </span>
                </div>
                <button onClick={() => setShowVoucherModal(true)} className="text-xs font-black text-blue-600 uppercase hover:underline">
                    {appliedVoucher ? 'Thay đổi' : 'Chọn mã'}
                </button>
            </div>

            {showVoucherModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center font-black">
                            VOUCHER: {group.shopName}
                            <button onClick={() => setShowVoucherModal(false)}><X size={20} /></button>
                        </div>
                        <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
                            {vouchers?.map((v: any) => {
                                const isEligible = group.subtotal >= (v.minOrderValue || 0);
                                return (
                                    <div key={v.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between ${isEligible ? 'border-gray-100 hover:border-blue-200' : 'opacity-40 grayscale pointer-events-none'}`}>
                                        <div className="flex-1">
                                            {v.code && (
                                                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{v.code}</div>
                                            )}
                                            <p className="font-black text-gray-900">GIẢM {v.discountValue.toLocaleString()}{v.discountType === 'PERCENT' ? '%' : 'đ'}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Đơn tối thiểu {v.minOrderValue.toLocaleString()}đ</p>
                                        </div>
                                        <button
                                            disabled={!isEligible || !v.code}
                                            onClick={() => handleApply(v.code)}
                                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${appliedVoucher === v.code ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'} disabled:opacity-40 disabled:cursor-not-allowed`}
                                        >
                                            {appliedVoucher === v.code && v.code ? <Check size={16} /> : 'Áp dụng'}
                                        </button>
                                    </div>
                                );
                            })}
                            {!vouchers?.length && <p className="text-center text-gray-400 text-sm italic">Shop hiện không có voucher.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Component Form địa chỉ trực tiếp ---
const AddAddressInlineModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
    const addAddress = useAddAddress();
    const userId = useAuthStore(state => state.user?.id);
    const { register, handleSubmit } = useForm({ resolver: zodResolver(addressSchema) });

    const onSubmit = (data: any) => {
        if (!userId) return;
        addAddress.mutate({ ...data, userId }, { onSuccess });
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
                <h3 className="text-xl font-black mb-6">ĐỊA CHỈ MỚI</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input {...register('receiverName')} placeholder="Người nhận" className="w-full px-4 py-2 border rounded-xl" />
                    <input {...register('phone')} placeholder="Số điện thoại" className="w-full px-4 py-2 border rounded-xl" />
                    <input {...register('addressLine')} placeholder="Địa chỉ cụ thể" className="w-full px-4 py-2 border rounded-xl" />
                    <div className="grid grid-cols-2 gap-4">
                        <input {...register('district')} placeholder="Quận/Huyện" className="w-full px-4 py-2 border rounded-xl" />
                        <input {...register('city')} placeholder="Tỉnh/Thành phố" className="w-full px-4 py-2 border rounded-xl" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-gray-400">Hủy</button>
                        <button type="submit" disabled={addAddress.isPending} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black">LƯU ĐỊA CHỈ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
