import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, CreditCard, Loader2, MapPin, QrCode, ShoppingBag, Tag, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import { useAddresses, useAddAddress } from '@/features/user/hooks/use-user';
import { addressSchema } from '@/features/user/schemas/profile.schema';
import { useApplyVoucher, useCreateOrder, useProcessOnlinePayment } from '../hooks/use-order';

const SELECTED_CART_ITEMS_KEY = 'selected-cart-item-ids';

type CheckoutCartItem = {
    id: number;
    shopId: number;
    shopName: string;
    imageUrl?: string;
    productName: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
};

type ShopGroup = {
    shopId: number;
    shopName: string;
    items: CheckoutCartItem[];
    subtotal: number;
};

const CheckoutPage = () => {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY' | 'MOMO'>('COD');
    const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
    const [createdPaymentId, setCreatedPaymentId] = useState<number | null>(null);
    const [createdPaymentAmount, setCreatedPaymentAmount] = useState<number>(0);
    const [appliedVouchers, setAppliedVouchers] = useState<Record<number, string>>({});
    const [shopDiscounts, setShopDiscounts] = useState<Record<number, number>>({});
    const [selectedCartItemIds] = useState<number[]>(() => {
        try {
            const storedIds = sessionStorage.getItem(SELECTED_CART_ITEMS_KEY);
            return storedIds ? JSON.parse(storedIds) : [];
        } catch {
            return [];
        }
    });

    const { data: cart, isLoading: isLoadingCart } = useQuery({
        queryKey: ['cart', user?.id],
        queryFn: () => api.get(`/api/carts/user/${user?.id}`).then((res) => res.data),
        enabled: !!user?.id,
    });

    const { data: addresses, refetch: refetchAddresses } = useAddresses();
    const checkoutMutation = useCreateOrder();
    const processPaymentMutation = useProcessOnlinePayment();

    useEffect(() => {
        if (!addresses || selectedAddressId) return;

        const defaultAddress = addresses.find((address: any) => address.isDefault);
        setSelectedAddressId(defaultAddress?.id ?? addresses[0]?.id ?? null);
    }, [addresses, selectedAddressId]);

    const cartItems: CheckoutCartItem[] = cart?.cartItems || [];
    const selectedCartItems = useMemo(() => {
        if (!cartItems.length) return [];
        if (!selectedCartItemIds.length) return cartItems;

        const selectedIds = new Set(selectedCartItemIds);
        return cartItems.filter((item) => selectedIds.has(item.id));
    }, [cartItems, selectedCartItemIds]);

    const groupedShops = useMemo(() => {
        const groups: Record<number, ShopGroup> = {};

        selectedCartItems.forEach((item) => {
            const shopId = item.shopId || 0;
            if (!groups[shopId]) {
                groups[shopId] = {
                    shopId,
                    shopName: item.shopName || 'Cửa hàng',
                    items: [],
                    subtotal: 0,
                };
            }

            groups[shopId].items.push(item);
            groups[shopId].subtotal += item.price * item.quantity;
        });

        return Object.values(groups);
    }, [selectedCartItems]);

    const selectedSubtotal = useMemo(
        () => selectedCartItems.reduce((total, item) => total + item.price * item.quantity, 0),
        [selectedCartItems]
    );
    const totalDiscount = useMemo(
        () => Object.values(shopDiscounts).reduce((total, discount) => total + discount, 0),
        [shopDiscounts]
    );
    const finalAmount = Math.max(selectedSubtotal - totalDiscount, 0);

    const handlePlaceOrder = () => {
        if (!selectedAddressId) {
            toast.error('Vui lòng chọn địa chỉ nhận hàng');
            return;
        }

        if (!user) return;

        if (!selectedCartItems.length) {
            toast.error('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
            navigate('/cart');
            return;
        }

        checkoutMutation.mutate(
            {
                userId: user.id,
                cartItemIds: selectedCartItems.map((item) => item.id),
                addressId: selectedAddressId,
                paymentMethod,
                shopVoucherCodes: appliedVouchers,
                voucherCode: Object.values(appliedVouchers).filter(Boolean).join(','),
            },
            {
                onSuccess: (data) => {
                    sessionStorage.removeItem(SELECTED_CART_ITEMS_KEY);

                    if (paymentMethod !== 'COD') {
                        setCreatedOrderId(data.id);
                        setCreatedPaymentId(data.payment?.id ?? null);
                        setCreatedPaymentAmount(data.payment?.amount ?? data.finalPrice ?? finalAmount);
                        setShowQRModal(true);
                        return;
                    }

                    toast.success('Đặt hàng thành công');
                    navigate(`/order-success/${data.id}`);
                },
                onError: (error: any) => {
                    toast.error(`Đặt hàng thất bại: ${error.response?.data?.message || error.message}`);
                },
            }
        );
    };

    const handleConfirmPaymentMockup = () => {
        if (!createdOrderId || !createdPaymentId) {
            toast.error('Không tìm thấy mã thanh toán của đơn hàng');
            return;
        }

        processPaymentMutation.mutate(
            { paymentId: createdPaymentId, status: 'COMPLETED' },
            {
                onSuccess: () => {
                    toast.success('Thanh toán thành công');
                    navigate(`/order-success/${createdOrderId}`);
                },
            }
        );
    };

    const handleCancelPaymentMockup = () => {
        if (!createdOrderId || !createdPaymentId) {
            setShowQRModal(false);
            return;
        }

        processPaymentMutation.mutate(
            { paymentId: createdPaymentId, status: 'FAILED' },
            {
                onSuccess: () => {
                    toast.warning('Đã hủy thanh toán');
                    navigate(`/order/${createdOrderId}`);
                },
            }
        );
    };

    if (isLoadingCart) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" />
            </div>
        );
    }

    if (!selectedCartItems.length && !showQRModal) {
        return (
            <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
                <AlertCircle className="mb-4 text-amber-500" size={44} />
                <h1 className="text-2xl font-black text-slate-950">Chưa có sản phẩm để thanh toán</h1>
                <p className="mt-2 text-sm text-slate-500">Vui lòng quay lại giỏ hàng và chọn sản phẩm bạn muốn mua.</p>
                <button
                    onClick={() => navigate('/cart')}
                    className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white hover:bg-blue-700"
                >
                    Quay lại giỏ hàng
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F6F1] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A68545]">Checkout</p>
                    <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-950">Thanh toán</h1>
                </div>
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                    <X size={20} /> Hủy và quay lại
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                    <section className="border border-zinc-200 bg-white p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-blue-600">
                                <MapPin size={20} />
                                <h2 className="text-lg font-black text-slate-950">Địa chỉ nhận hàng</h2>
                            </div>
                            <button onClick={() => setIsAddAddressOpen(true)} className="text-sm font-bold text-blue-600 hover:underline">
                                Thêm địa chỉ mới
                            </button>
                        </div>

                        <div className="space-y-4">
                            {addresses?.map((address: any) => (
                                <label
                                    key={address.id}
                                    className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors ${
                                        selectedAddressId === address.id ? 'border-blue-600 bg-blue-50/40' : 'border-slate-100 hover:border-slate-200'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="address"
                                        className="mt-1"
                                        checked={selectedAddressId === address.id}
                                        onChange={() => setSelectedAddressId(address.id)}
                                    />
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-black text-slate-950">{address.receiverName}</span>
                                            <span className="text-slate-300">|</span>
                                            <span className="text-slate-600">{address.phone}</span>
                                            {address.isDefault && (
                                                <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">Mặc định</span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {address.addressLine}, {address.district}, {address.city}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className="border border-zinc-200 bg-white p-6">
                        <div className="mb-6 flex items-center gap-2 text-[#A68545]">
                            <CreditCard size={20} />
                            <h2 className="text-lg font-black text-slate-950">Phương thức thanh toán</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <button
                                onClick={() => setPaymentMethod('COD')}
                                className={`rounded-xl border-2 p-4 text-sm font-black transition-colors ${
                                    paymentMethod === 'COD' ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-slate-100 text-slate-700'
                                }`}
                            >
                                Thanh toán khi nhận hàng
                            </button>
                            <button
                                onClick={() => setPaymentMethod('VNPAY')}
                                className={`rounded-xl border-2 p-4 text-sm font-black transition-colors ${
                                    paymentMethod === 'VNPAY' ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-slate-100 text-slate-700'
                                }`}
                            >
                                VNPAY QR mockup
                            </button>
                            <button
                                onClick={() => setPaymentMethod('MOMO')}
                                className={`rounded-xl border-2 p-4 text-sm font-black transition-colors ${
                                    paymentMethod === 'MOMO' ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-slate-100 text-slate-700'
                                }`}
                            >
                                MOMO QR mockup
                            </button>
                        </div>
                    </section>

                    <section className="space-y-8 border border-zinc-200 bg-white p-6">
                        <div className="flex items-center gap-2 text-violet-600">
                            <ShoppingBag size={20} />
                            <h2 className="text-lg font-black text-slate-950">Sản phẩm đặt mua</h2>
                        </div>

                        {groupedShops.map((group) => (
                            <ShopOrderGroup
                                key={group.shopId}
                                group={group}
                                appliedVoucher={appliedVouchers[group.shopId]}
                                onApplyVoucher={(code) => setAppliedVouchers((prev) => ({ ...prev, [group.shopId]: code }))}
                                onDiscountUpdate={(amount) => setShopDiscounts((prev) => ({ ...prev, [group.shopId]: amount }))}
                            />
                        ))}
                    </section>
                </div>

                <aside className="lg:col-span-1">
                    <div className="sticky top-24 bg-zinc-950 p-8 text-white shadow-xl">
                        <h3 className="mb-6 text-xl font-black tracking-tight">Tổng đơn hàng</h3>
                        <div className="space-y-4 text-sm font-medium">
                            <div className="flex justify-between text-slate-300">
                                <span>Sản phẩm đã chọn</span>
                                <span>{selectedCartItems.length}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>Tạm tính</span>
                                <span>{selectedSubtotal.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>Phí vận chuyển</span>
                                <span>Miễn phí</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>Giảm giá</span>
                                <span className="text-red-300">-{totalDiscount.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex items-end justify-between border-t border-white/10 pt-4">
                                <span className="text-lg font-bold">Thanh toán</span>
                                <span className="text-2xl font-black text-blue-300">{finalAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={checkoutMutation.isPending}
                            className="mt-8 flex w-full items-center justify-center gap-2 bg-white py-4 font-semibold text-zinc-950 transition-colors hover:bg-[#D6B36A] disabled:opacity-50"
                        >
                            {checkoutMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : 'Đặt hàng ngay'}
                        </button>
                    </div>
                </aside>
            </div>

            {showQRModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="p-8 text-center">
                            <QrCode size={48} className="mx-auto mb-4 text-blue-600" />
                            <h3 className="mb-2 text-2xl font-black">Quét mã thanh toán {paymentMethod}</h3>
                            <p className="mb-8 text-slate-500">
                                Đây là màn hình giả lập thanh toán. Quét mã hoặc dùng nút bên dưới để gửi kết quả thanh toán cho đơn hàng <span className="font-bold text-slate-950">#{createdOrderId}</span>.
                            </p>
                            <div className="mx-auto mb-8 flex aspect-square w-64 items-center justify-center rounded-2xl border-2 border-dashed bg-slate-50">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${paymentMethod}_ORDER_${createdOrderId}_PAYMENT_${createdPaymentId}_AMOUNT_${createdPaymentAmount || finalAmount}`}
                                    alt="Mã QR thanh toán"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <button
                                    onClick={handleCancelPaymentMockup}
                                    disabled={processPaymentMutation.isPending}
                                    className="rounded-2xl border border-slate-200 py-4 font-black text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Hủy thanh toán
                                </button>
                                <button
                                    onClick={handleConfirmPaymentMockup}
                                    disabled={processPaymentMutation.isPending || !createdPaymentId}
                                    className="rounded-2xl bg-blue-600 py-4 font-black text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processPaymentMutation.isPending ? 'Đang xác nhận...' : 'Xác nhận đã chuyển khoản'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isAddAddressOpen && (
                <AddAddressInlineModal
                    onClose={() => setIsAddAddressOpen(false)}
                    onSuccess={() => {
                        refetchAddresses();
                        setIsAddAddressOpen(false);
                    }}
                />
            )}
        </div>
        </div>
    );
};

const ShopOrderGroup = ({
    group,
    onApplyVoucher,
    appliedVoucher,
    onDiscountUpdate,
}: {
    group: ShopGroup;
    onApplyVoucher: (code: string) => void;
    appliedVoucher?: string;
    onDiscountUpdate?: (amount: number) => void;
}) => {
    const [showVoucherModal, setShowVoucherModal] = useState(false);
    const applyVoucherMutation = useApplyVoucher();

    const { data: vouchers } = useQuery({
        queryKey: ['shop-vouchers', group.shopId],
        queryFn: () => api.get(`/api/discounts/shops/${group.shopId}/active`).then((res) => res.data),
    });

    const handleApply = (code: string) => {
        if (!code) {
            toast.error('Mã giảm giá không hợp lệ');
            return;
        }

        applyVoucherMutation.mutate(
            {
                shopId: group.shopId,
                voucherCode: code,
                subtotal: group.subtotal,
            },
            {
                onSuccess: (discountAmount) => {
                    if (discountAmount > 0) {
                        onApplyVoucher(code);
                        onDiscountUpdate?.(discountAmount);
                        toast.success(`Đã áp dụng mã giảm ${discountAmount.toLocaleString('vi-VN')}đ`);
                        setShowVoucherModal(false);
                        return;
                    }

                    toast.error('Mã voucher không hợp lệ hoặc chưa đủ điều kiện');
                },
            }
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShoppingBag size={18} className="text-blue-600" />
                <span className="text-sm font-black uppercase tracking-wide text-slate-950">{group.shopName}</span>
            </div>

            <div className="divide-y divide-slate-100">
                {group.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-4">
                        <img src={item.imageUrl} className="h-16 w-16 rounded-xl border object-cover" alt={item.productName} />
                        <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-1 text-sm font-bold text-slate-950">{item.productName}</h4>
                            <p className="mt-1 text-xs font-bold uppercase text-slate-400">{item.color} / {item.size}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-slate-950">{item.price.toLocaleString('vi-VN')}đ</p>
                            <p className="text-xs text-slate-400">x{item.quantity}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                    <Tag size={16} className="text-red-500" />
                    <span className="text-xs font-bold text-slate-600">
                        {appliedVoucher ? `Đã chọn: ${appliedVoucher}` : 'Tất cả voucher của shop'}
                    </span>
                </div>
                <button onClick={() => setShowVoucherModal(true)} className="text-xs font-black uppercase text-blue-600 hover:underline">
                    {appliedVoucher ? 'Thay đổi' : 'Chọn mã'}
                </button>
            </div>

            {showVoucherModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b p-6 font-black">
                            Voucher: {group.shopName}
                            <button onClick={() => setShowVoucherModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="max-h-[400px] space-y-3 overflow-y-auto p-6">
                            {vouchers?.map((voucher: any) => {
                                const isEligible = group.subtotal >= (voucher.minOrderValue || 0);
                                return (
                                    <div
                                        key={voucher.id}
                                        className={`flex items-center justify-between rounded-2xl border-2 p-4 ${
                                            isEligible ? 'border-slate-100 hover:border-blue-200' : 'pointer-events-none opacity-40 grayscale'
                                        }`}
                                    >
                                        <div className="flex-1">
                                            {voucher.code && (
                                                <div className="mb-1 text-[10px] font-black uppercase tracking-wide text-blue-600">{voucher.code}</div>
                                            )}
                                            <p className="font-black text-slate-950">
                                                Giảm {voucher.discountValue.toLocaleString('vi-VN')}{voucher.discountType === 'PERCENT' ? '%' : 'đ'}
                                            </p>
                                            <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">
                                                Đơn tối thiểu {voucher.minOrderValue.toLocaleString('vi-VN')}đ
                                            </p>
                                        </div>
                                        <button
                                            disabled={!isEligible || !voucher.code}
                                            onClick={() => handleApply(voucher.code)}
                                            className={`rounded-xl px-4 py-2 text-xs font-black uppercase text-white transition-colors ${
                                                appliedVoucher === voucher.code ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
                                            } disabled:cursor-not-allowed disabled:opacity-40`}
                                        >
                                            {appliedVoucher === voucher.code && voucher.code ? <Check size={16} /> : 'Áp dụng'}
                                        </button>
                                    </div>
                                );
                            })}
                            {!vouchers?.length && <p className="text-center text-sm italic text-slate-400">Shop hiện không có voucher.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AddAddressInlineModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
    const addAddress = useAddAddress();
    const userId = useAuthStore((state) => state.user?.id);
    const { register, handleSubmit } = useForm({ resolver: zodResolver(addressSchema) });

    const onSubmit = (data: any) => {
        if (!userId) return;
        addAddress.mutate({ ...data, userId }, { onSuccess });
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                <h3 className="mb-6 text-xl font-black text-slate-950">Địa chỉ mới</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input {...register('receiverName')} placeholder="Người nhận" className="w-full rounded-xl border px-4 py-2 outline-none focus:border-blue-500" />
                    <input {...register('phone')} placeholder="Số điện thoại" className="w-full rounded-xl border px-4 py-2 outline-none focus:border-blue-500" />
                    <input {...register('addressLine')} placeholder="Địa chỉ cụ thể" className="w-full rounded-xl border px-4 py-2 outline-none focus:border-blue-500" />
                    <div className="grid grid-cols-2 gap-4">
                        <input {...register('district')} placeholder="Quận/Huyện" className="w-full rounded-xl border px-4 py-2 outline-none focus:border-blue-500" />
                        <input {...register('city')} placeholder="Tỉnh/Thành phố" className="w-full rounded-xl border px-4 py-2 outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-slate-400">
                            Hủy
                        </button>
                        <button type="submit" disabled={addAddress.isPending} className="flex-1 rounded-xl bg-blue-600 py-3 font-black text-white disabled:opacity-50">
                            Lưu địa chỉ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
