import React, { useState, useMemo, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useUserOrders, useOrderDetails, useConfirmDelivery, useRequestReturn, useCancelOrderShop } from '../hooks/use-order';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, Loader2, Star, RefreshCcw, ShoppingBag, Trash2, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getUserReviews } from '@/features/review/api/review.api';
import { useQuery } from '@tanstack/react-query';
import {
    useCreateReview, useUpdateReview,
    useDeleteReview
} from '@/features/review/hooks/use-review';
import { api } from '@/lib/axios';

const ACTIVE_TABS = [
    { id: 'WAITING', label: 'Chờ xác nhận', statuses: ['PENDING', 'CONFIRMED'] },
    { id: 'PROCESSING', label: 'Chờ giao hàng', statuses: ['PROCESSING'] },
    { id: 'SHIPPING', label: 'Đang giao', statuses: ['SHIPPED'] },
    { id: 'DELIVERED', label: 'Đã giao', statuses: ['DELIVERED'] },
    { id: 'RETURNS_REQUEST', label: 'Trả hàng', statuses: ['RETURN_REQUESTED'] },
];

const HISTORY_TABS = [
    { id: 'COMPLETED', label: 'Đã hoàn thành', statuses: ['COMPLETED'] },
    { id: 'CANCELLED', label: 'Đơn đã hủy', statuses: ['CANCELLED'] },
    { id: 'RETURNED', label: 'Đã trả hàng', statuses: ['RETURNED'] },
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
        return [...ACTIVE_TABS, ...HISTORY_TABS];
    }, [mode]);

    const [activeTab, setActiveTab] = useState(tabs[0].id);

    useEffect(() => {
        setActiveTab(tabs[0].id);
        setPage(0);
    }, [mode, tabs]);

    const currentStatuses = useMemo(() => tabs.find(t => t.id === activeTab)?.statuses || [], [activeTab, tabs]);

    const { data: orderPage, isLoading } = useUserOrders(user?.id || 0, page, 10, currentStatuses);
    const { data: userReviews } = useQuery({
        queryKey: ['user-reviews', user?.id],
        queryFn: async () => {
            const res = await api.get(`/api/reviews/users/${user?.id}`, {
                params: {
                    page: 0,
                    size: 100
                }
            });

            return res.data;
        },
        enabled: !!user?.id
    });

    // Backend đã xử lý sắp xếp id,desc trên Database. Frontend chỉ việc hiển thị content.
    const processedOrders = useMemo(() => {
        return orderPage?.content || [];
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

                                {/* Backend đã lọc orderShops theo tab, chỉ việc hiển thị */}
                                <OrderShopsList
                                    shops={order.orderShops || []}
                                    reviews={userReviews?.content || []}
                                />
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
const OrderShopsList = ({ shops, reviews }: { shops: any[], reviews: any[] }) => {
    const confirmDeliveryMutation = useConfirmDelivery();
    const requestReturnMutation = useRequestReturn();
    const cancelOrderShopMutation = useCancelOrderShop();
    const updateReviewMutation = useUpdateReview();
    const deleteReviewMutation = useDeleteReview();
    const [editingReview, setEditingReview] = useState<any>(null);
    const [reviewingItem, setReviewingItem] = useState<{ productId: number, orderItemId: number, productName: string } | null>(null);

    if (shops.length === 0) return null;

    return (
        <>
            <div className="divide-y divide-gray-100 border-b border-gray-50">
                {shops.map((shop: any) => (
                    <div key={shop.id} className="p-6 space-y-4">
                        <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2">
                                <ShoppingBag size={14} className="text-blue-600" />
                                <span className="text-xs font-black text-gray-800 uppercase tracking-tight">{shop.shopName}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${shop.status === 'DELIVERED' || shop.status === 'COMPLETED' ? 'text-green-600 border-green-100 bg-green-50' :
                                shop.status === 'CANCELLED' ? 'text-red-600 border-red-100 bg-red-50' :
                                    'text-blue-600 border-blue-100 bg-blue-50'
                                }`}>
                                {shop.status}
                            </span>
                        </div>
                        {shop.orderItems?.map((item: any) => {

                            const review = reviews.find(
                                (r) => r.orderItemId === item.id
                            );

                            return (
                                <div key={item.id} className="flex items-center gap-4">
                                    <img
                                        src={item.productImage}
                                        alt=""
                                        className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                                    />

                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">
                                            {item.productName}
                                        </p>

                                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                                            {item.color} / {item.size}
                                        </p>
                                    </div>

                                    <div className="text-right flex flex-col items-end gap-1">
                                        <p className="text-sm font-black text-gray-900">
                                            {item.price.toLocaleString()}đ
                                        </p>

                                        <p className="text-[10px] text-gray-400 font-bold">
                                            x{item.quantity}
                                        </p>

                                        {shop.status === 'COMPLETED' && !review && (
                                            <button
                                                onClick={() => {
                                                    setReviewingItem({
                                                        productId: item.productId,
                                                        orderItemId: item.id,
                                                        productName: item.productName
                                                    });
                                                }}
                                                className="mt-2 flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded border border-amber-100 hover:bg-amber-100 transition-colors uppercase"
                                            >
                                                <Star size={10} fill="currentColor" />
                                                Đánh giá
                                            </button>
                                        )}

                                        {review && (
                                            <div className="mt-2 p-2 bg-gray-50 border rounded-lg max-w-[250px]">
                                                <div className="flex justify-between items-center mb-1">

                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star
                                                                key={s}
                                                                size={10}
                                                                className={
                                                                    s <= review.rating
                                                                        ? 'text-amber-400'
                                                                        : 'text-gray-200'
                                                                }
                                                                fill={
                                                                    s <= review.rating
                                                                        ? 'currentColor'
                                                                        : 'none'
                                                                }
                                                            />
                                                        ))}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingReview(review)}
                                                        >
                                                            <Pencil
                                                                size={12}
                                                                className="text-blue-600"
                                                            />
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                if (
                                                                    window.confirm(
                                                                        'Bạn có muốn xóa đánh giá này?'
                                                                    )
                                                                ) {
                                                                    deleteReviewMutation.mutate({
                                                                        reviewId: review.id,
                                                                        productId: review.productId
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <Trash2
                                                                size={12}
                                                                className="text-red-600"
                                                            />
                                                        </button>
                                                    </div>

                                                </div>

                                                <p className="text-xs text-gray-600">
                                                    {review.comment}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

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
                        </div>
                    </div>
                ))}
            </div>

            {reviewingItem && (
                <ReviewModal
                    item={reviewingItem}
                    onClose={() => setReviewingItem(null)}
                />
            )}
            {editingReview && (
                <ReviewModal
                    item={{
                        productId: editingReview.productId,
                        orderItemId: editingReview.orderItemId,
                        productName: editingReview.productName
                    }}
                    review={editingReview}
                    onClose={() => setEditingReview(null)}
                />
            )}
        </>
    );
};

const ReviewModal = ({ item, review, onClose }: { item: { productId: number, orderItemId: number, productName: string }, review?: any, onClose: () => void }) => {
    const user = useAuthStore(state => state.user);
    const createReviewMutation = useCreateReview();
    const updateReviewMutation = useUpdateReview();
    const [rating, setRating] = useState(review?.rating || 5);
    const [comment, setComment] = useState(review?.comment || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (review) {
            updateReviewMutation.mutate(
                {
                    reviewId: review.id,
                    data: {
                        userId: user.id,
                        productId: item.productId,
                        orderItemId: item.orderItemId,
                        rating,
                        comment
                    }
                },
                {
                    onSuccess: () => onClose()
                }
            );
        } else {
            createReviewMutation.mutate(
                {
                    userId: user.id,
                    productId: item.productId,
                    orderItemId: item.orderItemId,
                    rating,
                    comment
                },
                {
                    onSuccess: () => onClose()
                }
            );
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-black text-lg text-gray-900 uppercase">Đánh giá sản phẩm</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><XCircle size={20} className="text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="text-center">
                        <p className="text-sm font-bold text-gray-500 mb-1">Bạn thấy thế nào về sản phẩm?</p>
                        <p className="font-black text-gray-900 line-clamp-1">{item.productName}</p>
                    </div>

                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setRating(s)}
                                className="transition-transform active:scale-90"
                            >
                                <Star
                                    size={32}
                                    className={s <= rating ? "text-amber-400" : "text-gray-200"}
                                    fill={s <= rating ? "currentColor" : "none"}
                                />
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="block text-[11px] font-black text-gray-400 uppercase mb-2">Chia sẻ trải nghiệm của bạn</label>
                        <textarea
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chất lượng sản phẩm tuyệt vời, đóng gói kỹ càng..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-600 transition-all h-32 resize-none text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={createReviewMutation.isPending}
                        className="w-full py-4 bg-[#111111] text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {review
                            ? 'Cập nhật đánh giá'
                            : 'Gửi đánh giá ngay'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileOrdersPage;