import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Star,
    ShoppingCart,
    ShieldCheck,
    Package,
    MessageSquare // 1. Thêm icon MessageSquare ở đây
} from 'lucide-react';

import { toast } from 'sonner';

import { useProductDetail } from '../hooks/use-variant';
import { useAuthStore } from '@/stores/auth.store';
import { useProductReviews } from '@/features/review/hooks/use-review';
import { useAddToCart } from '@/features/cart/hooks/use-cart';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ProductImageResponse } from '../types/variant.types';
import { getProductCategoryLabel } from '@/features/product/types/product.types';

// 2. Import useChatStore để điều khiển đóng/mở Chat Box
import { useChatStore } from '@/stores/use.chat.store';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const { user, token } = useAuthStore(); // Lấy thêm thông tin user và token

    // Lấy hàm mở chat từ zustand store

    const { data: product, isLoading, isError } = useProductDetail(id);

    // Lấy danh sách ảnh theo sản phẩm
    const { data: productImages } = useQuery<ProductImageResponse[]>({
        queryKey: ['product-images', id],
        queryFn: async () => {
            const res = await api.get(`/api/product-images/product/${id}`);
            return res.data;
        },
        enabled: !!id
    });

    // Lấy danh sách đánh giá
    const [isViewAll, setIsViewAll] = useState(false);
    const [reviewPage, setReviewPage] = useState(0);

    const { data: reviewsData, isLoading: isLoadingReviews } = useProductReviews(
        Number(id),
        reviewPage,
        isViewAll ? 5 : 3,
        'rating,desc'
    );

    const { mutate: addToCart, isPending: isAdding } = useAddToCart();

    // =========================
    // STATE
    // =========================
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState<string | null>(null);

    // =========================
    // RESET QUANTITY
    // =========================
    useEffect(() => {
        setQuantity(1);
    }, [selectedSize, selectedColor]);

    // =========================
    // CẬP NHẬT ẢNH THEO MÀU
    // =========================
    useEffect(() => {
        if (selectedColor && productImages) {
            const colorImage = productImages.find(img => img.color === selectedColor);
            if (colorImage) {
                setMainImage(colorImage.imageUrl);
            }
        } else if (productImages && productImages.length > 0) {
            setMainImage(productImages[0].imageUrl);
        } else if (product?.imageUrl) {
            setMainImage(product.imageUrl);
        }
    }, [selectedColor, productImages, product]);

    const openChatPopup = useChatStore((state) => state.openChatPopup);

    const handleChatWithShop = async () => {
        if (!product) return;

        if (!isAuthenticated || !user || !token) {
            toast.error('Vui lòng đăng nhập để chat với shop!');
            navigate('/login');
            return;
        }

        // 1. connect websocket (OK)
        useChatStore.getState().connectWebSocket(token);

        try {
            const response = await api.get('/api/conversations/get-or-create', {
                params: {
                    userId: user.id,
                    shopId: product.shopId
                }
            });

            const conversation = response.data;

            if (conversation) {
                // 2. quan trọng: seed conversation vào store luôn
                useChatStore.setState((state) => ({
                    conversationsMap: {
                        ...state.conversationsMap,
                        [conversation.id]: {
                            id: conversation.id,
                            userId: conversation.userId,
                            userName: conversation.userName,
                            userAvatar: conversation.userAvatar,
                            shopId: conversation.shopId,
                            shopName: conversation.shopName,
                            shopLogo: conversation.shopLogo,
                            lastMessage: conversation.lastMessage || '',
                            updatedAt: conversation.updatedAt || new Date().toISOString(),
                            unreadCount: 0,
                        }
                    }
                }));

                // 3. mở popup
                openChatPopup(conversation.id, conversation.shopName);
            }

        } catch (error) {
            toast.error('Không thể kết nối tới phòng chat.');
        }
    };
    // =========================
    // LOADING & ERROR
    // =========================
    if (isLoading) {
        return <div className="flex h-96 items-center justify-center">Đang tải...</div>;
    }

    if (isError || !product) {
        return <div className="py-20 text-center">Không tìm thấy sản phẩm.</div>;
    }

    // =========================
    // VARIANT LOGIC
    // =========================
    const hasVariants = product.variants && product.variants.length > 0;
    const categoryLabel = getProductCategoryLabel(product);
    const allSizes = Array.from(new Set(product.variants.map((v) => v.size)));
    const allColors = Array.from(new Set(product.variants.map((v) => v.color)));

    const availableSizes = selectedColor
        ? product.variants.filter((v) => v.color === selectedColor).map((v) => v.size)
        : allSizes;

    const availableColors = selectedSize
        ? product.variants.filter((v) => v.size === selectedSize).map((v) => v.color)
        : allColors;

    const selectedVariant = product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
    );

    const isVariantSelected = !hasVariants || !!selectedVariant;
    const isOutOfStock = selectedVariant ? Number(selectedVariant.stock) <= 0 : false;

    const renderDiscountBadge = () => {
        if (!product.discountAmount || product.discountAmount <= 0) return null;
        const percent = Math.round((product.discountAmount / product.originalPrice) * 100);
        return (
            <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-xs font-black uppercase tracking-tight">
                {percent > 0 ? `-${percent}%` : `Giảm ${(product.discountAmount / 1000).toLocaleString()}K`}
            </span>
        );
    };

    const toggleSize = (size: string) => {
        setSelectedSize(selectedSize === size ? null : size);
    };

    const toggleColor = (color: string) => {
        setSelectedColor(selectedColor === color ? null : color);
    };

    // =========================
    // ADD TO CART
    // =========================
    const handleAddToCart = () => {
        if (hasVariants && !selectedVariant) {
            toast.warning('Vui lòng chọn đầy đủ Size và Màu sắc!');
            return;
        }

        if (isOutOfStock) {
            toast.error('Sản phẩm hiện đã hết hàng');
            return;
        }

        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để mua sắm!');
            navigate('/login');
            return;
        }

        addToCart({
            productVariantId: selectedVariant?.id || 0,
            quantity
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* BACK */}
            <Link to="/" className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-blue-600">
                <ChevronLeft size={16} />
                Quay lại danh sách
            </Link>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* IMAGE */}
                <div className="space-y-5">
                    <div className="aspect-square rounded-3xl bg-[#F9FAFB] border border-[#E5E7EB] overflow-hidden group">
                        {mainImage ? (
                            <img src={mainImage} alt={product.productName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#9CA3AF] space-y-2">
                                <Package size={48} strokeWidth={1} />
                                <span className="text-xs font-bold uppercase tracking-widest">Chưa có ảnh</span>
                            </div>
                        )}
                    </div>

                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-black uppercase tracking-wide text-slate-950">Mô tả sản phẩm</h2>
                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                            {product.productDetail || 'Sản phẩm chưa có mô tả chi tiết.'}
                        </p>
                    </section>
                </div>

                {/* INFO */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        {product.brandName && (
                            <span className="px-2 py-0.5 bg-[#111111] text-white text-[10px] font-black rounded uppercase tracking-widest">
                                {product.brandName}
                            </span>
                        )}
                        {product.brandName && categoryLabel && <span className="text-[11px] text-[#9CA3AF]">/</span>}
                        {categoryLabel && (
                            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-tight">
                                {categoryLabel}
                            </span>
                        )}
                    </div>

                    <Link to={`/shops/${product.shopId}`} className="mb-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#A68545] transition hover:text-zinc-950">
                        <StoreIconFallback />
                        {product.shopName || 'Xem shop'}
                    </Link>

                    {/* TITLE */}
                    <h1 className="text-3xl font-bold text-gray-900">{product.productName}</h1>

                    {/* PRICE */}
                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex flex-col">
                            {product.discountAmount > 0 && (
                                <span className="text-sm text-gray-400 line-through decoration-gray-300 font-medium">
                                    {product.originalPrice.toLocaleString()}đ
                                </span>
                            )}
                            <span className="text-3xl font-black text-[#111111] tracking-tight">
                                {product.finalPrice.toLocaleString()}đ
                            </span>
                        </div>
                        {renderDiscountBadge()}
                        <div className="flex items-center gap-1 font-bold text-amber-500">
                            <Star size={18} fill="currentColor" />
                            {product.rating}
                        </div>
                    </div>

                    {/* VARIANT */}
                    <div className="mt-8 space-y-6">
                        {/* SIZE */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Chọn Size</h3>
                            <div className="mt-3 flex flex-wrap gap-3">
                                {allSizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => toggleSize(size)}
                                        disabled={!availableSizes.includes(size)}
                                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${selectedSize === size
                                            ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-400'
                                            } ${!availableSizes.includes(size) ? 'cursor-not-allowed opacity-40' : ''}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* COLOR */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Chọn Màu sắc</h3>
                            <div className="mt-3 flex flex-wrap gap-3">
                                {allColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => toggleColor(color)}
                                        disabled={!availableColors.includes(color)}
                                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${selectedColor === color
                                            ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-400'
                                            } ${!availableColors.includes(color) ? 'cursor-not-allowed opacity-40' : ''}`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* STOCK */}
                        {selectedVariant && (
                            <div className="mt-4">
                                <p className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-gray-600'}`}>
                                    {isOutOfStock ? 'Sản phẩm hiện đã hết hàng' : `Còn lại ${selectedVariant.stock} sản phẩm`}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ACTION BUTTONS SECTION */}
                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        {/* QUANTITY */}
                        <div className="flex items-center rounded-lg border border-gray-300">
                            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-2 text-xl">-</button>
                            <span className="w-12 text-center font-bold">{quantity}</span>
                            <button
                                onClick={() => {
                                    if (!selectedVariant) {
                                        toast.warning('Vui lòng chọn phân loại trước');
                                        return;
                                    }
                                    if (isOutOfStock) {
                                        toast.error('Sản phẩm hiện đã hết hàng');
                                        return;
                                    }
                                    if (quantity >= Number(selectedVariant.stock)) {
                                        toast.warning(`Chỉ còn ${selectedVariant.stock} sản phẩm`);
                                        return;
                                    }
                                    setQuantity((q) => q + 1);
                                }}
                                className="px-4 py-2 text-xl"
                            >
                                +
                            </button>
                        </div>

                        {/* 3. NÚT CHAT NGAY ĐƯỢC THÊM VÀO ĐÂY */}
                        <button
                            onClick={handleChatWithShop}
                            className="flex h-12 flex-col items-center justify-center border border-zinc-300 px-5 text-xs font-semibold text-zinc-700 transition-all hover:border-zinc-950 hover:bg-white active:scale-95"
                        >
                            <MessageSquare size={18} className="text-slate-900 mb-0.5" />
                            <span>Chat ngay</span>
                        </button>

                        {/* ADD TO CART */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-lg font-bold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${isAdding ? 'bg-zinc-400' : 'bg-zinc-950 hover:bg-[#A68545]'}`}
                        >
                            {!isAdding && <ShoppingCart size={20} />}
                            {isAdding ? 'Đang thêm...' : !isVariantSelected ? 'Chọn phân loại' : 'Thêm vào giỏ hàng'}
                        </button>
                    </div>

                    {/* WARRANTY */}
                    <div className="mt-8 flex items-center gap-2 text-sm font-medium text-green-600">
                        <ShieldCheck size={18} />
                        Bảo hành chính hãng 12 tháng
                    </div>

                    {/* REVIEWS SECTION */}
                    <div className="mt-16 border-t border-gray-100 pt-10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-[#111111] uppercase tracking-tight">Đánh giá sản phẩm</h2>
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                                <Star className="text-amber-500" fill="currentColor" size={20} />
                                <span className="text-xl font-black">{product.rating || '0.0'}</span>
                                <span className="text-gray-400 text-sm font-bold">/ 5.0</span>
                            </div>
                        </div>

                        {isLoadingReviews ? (
                            <div className="py-10 text-center text-gray-400 italic">Đang tải đánh giá...</div>
                        ) : reviewsData?.content && reviewsData.content.length > 0 ? (
                            <div className="space-y-6">
                                {reviewsData.content.map((review) => (
                                    <div key={review.id} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold uppercase">
                                                    {review.username.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{review.username}</p>
                                                    <div className="flex items-center gap-0.5 mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={12}
                                                                className={i < review.rating ? "text-amber-400" : "text-gray-200"}
                                                                fill="currentColor"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">
                                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}

                                {!isViewAll && reviewsData.totalElements > 3 && (
                                    <button
                                        onClick={() => setIsViewAll(true)}
                                        className="w-full py-4 border border-dashed border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-widest"
                                    >
                                        Xem tất cả ({reviewsData.totalElements}) đánh giá
                                    </button>
                                )}

                                {isViewAll && reviewsData.totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-8">
                                        <button
                                            disabled={reviewPage === 0}
                                            onClick={() => setReviewPage(p => p - 1)}
                                            className="px-6 py-2 border rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-gray-50"
                                        >
                                            Trang trước
                                        </button>
                                        <button
                                            disabled={reviewPage >= reviewsData.totalPages - 1}
                                            onClick={() => setReviewPage(p => p + 1)}
                                            className="px-6 py-2 border rounded-xl text-xs font-bold disabled:opacity-30 hover:bg-gray-50"
                                        >
                                            Trang sau
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-gray-50/50 rounded-3xl border border-dashed">
                                <p className="text-gray-400 italic">Sản phẩm chưa có đánh giá nào.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;

const StoreIconFallback = () => <span className="inline-block h-2 w-2 bg-[#A68545]" />;
