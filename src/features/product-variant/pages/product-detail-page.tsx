import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Star,
    ShoppingCart,
    ShieldCheck,
    Package // Thêm icon Package vào đây
} from 'lucide-react';

import { toast } from 'sonner';

import { useProductDetail } from '../hooks/use-variant';
import { useAuthStore } from '@/stores/auth.store';
import { useAddToCart } from '@/features/cart/hooks/use-cart';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ProductImageResponse } from '../types/variant.types';

const ProductDetailPage = () => {
    const { id } = useParams();

    const navigate = useNavigate();

    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );

    const { data: product, isLoading, isError } =
        useProductDetail(id);

    // Lấy danh sách ảnh theo sản phẩm
    const { data: productImages } = useQuery<ProductImageResponse[]>({
        queryKey: ['product-images', id],
        queryFn: async () => {
            const res = await api.get(`/api/product-images/product/${id}`);
            return res.data;
        },
        enabled: !!id
    });

    const { mutate: addToCart, isPending: isAdding } =
        useAddToCart();

    // =========================
    // STATE
    // =========================

    const [selectedSize, setSelectedSize] =
        useState<string | null>(null);

    const [selectedColor, setSelectedColor] =
        useState<string | null>(null);

    const [quantity, setQuantity] = useState(1);

    const [mainImage, setMainImage] = useState<string | null>(null);

    // =========================
    // RESET QUANTITY
    // =========================

    // Fix lỗi fresh trang hooks
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
            // Hiển thị ảnh đầu tiên trong danh sách nếu chưa chọn màu
            setMainImage(productImages[0].imageUrl);
        } else if (product?.imageUrl) {
            setMainImage(product.imageUrl);
        }
    }, [selectedColor, productImages, product]);

    // =========================
    // LOADING
    // =========================

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                Đang tải...
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="py-20 text-center">
                Không tìm thấy sản phẩm.
            </div>
        );
    }

    // =========================
    // VARIANT LOGIC
    // =========================

    const hasVariants =
        product.variants &&
        product.variants.length > 0;

    const allSizes = Array.from(
        new Set(product.variants.map((v) => v.size))
    );

    const allColors = Array.from(
        new Set(product.variants.map((v) => v.color))
    );

    // Chỉ disable variant không tồn tại
    const availableSizes = selectedColor
        ? product.variants
            .filter(
                (v) => v.color === selectedColor
            )
            .map((v) => v.size)
        : allSizes;

    const availableColors = selectedSize
        ? product.variants
            .filter(
                (v) => v.size === selectedSize
            )
            .map((v) => v.color)
        : allColors;

    // Variant đang chọn
    const selectedVariant = product.variants.find(
        (v) =>
            v.size === selectedSize &&
            v.color === selectedColor
    );

    // Đã chọn đủ variant chưa
    const isVariantSelected =
        !hasVariants || !!selectedVariant;

    // Hết hàng
    const isOutOfStock = selectedVariant
        ? Number(selectedVariant.stock) <= 0
        : false;

    // Logic hiển thị Badge giảm giá
    const renderDiscountBadge = () => {
        if (!product.discountAmount || product.discountAmount <= 0) return null;

        const percent = Math.round((product.discountAmount / product.originalPrice) * 100);
        return (
            <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-xs font-black uppercase tracking-tight">
                {percent > 0 ? `-${percent}%` : `Giảm ${(product.discountAmount / 1000).toLocaleString()}K`}
            </span>
        );
    };

    // =========================
    // TOGGLE
    // =========================

    const toggleSize = (size: string) => {
        setSelectedSize(
            selectedSize === size ? null : size
        );
    };

    const toggleColor = (color: string) => {
        setSelectedColor(
            selectedColor === color ? null : color
        );
    };

    // =========================
    // ADD TO CART
    // =========================

    const handleAddToCart = () => {
        // Chưa chọn variant
        if (
            hasVariants &&
            !selectedVariant
        ) {
            toast.warning(
                'Vui lòng chọn đầy đủ Size và Màu sắc!'
            );

            return;
        }

        // Hết hàng
        if (isOutOfStock) {
            toast.error(
                'Sản phẩm hiện đã hết hàng'
            );

            return;
        }

        // Chưa đăng nhập
        if (!isAuthenticated) {
            toast.error(
                'Vui lòng đăng nhập để mua sắm!'
            );

            navigate('/login');

            return;
        }

        addToCart({
            productVariantId:
                selectedVariant?.id || 0,
            quantity
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* BACK */}
            <Link
                to="/"
                className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-blue-600"
            >
                <ChevronLeft size={16} />
                Quay lại danh sách
            </Link>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* IMAGE */}
                <div className="aspect-square rounded-3xl bg-[#F9FAFB] border border-[#E5E7EB] overflow-hidden group">
                    {mainImage ? (
                        <img src={mainImage} alt={product.productName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#9CA3AF] space-y-2">
                            <Package size={48} strokeWidth={1} />
                            <span className="text-xs font-bold uppercase tracking-widest">No Image Available</span>
                        </div>
                    )}
                </div>

                {/* INFO */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        {product.brandName && (
                            <span className="px-2 py-0.5 bg-[#111111] text-white text-[10px] font-black rounded uppercase tracking-widest">
                                {product.brandName}
                            </span>
                        )}
                        {product.brandName && product.categoryName && (
                            <span className="text-[11px] text-[#9CA3AF]">/</span>
                        )}
                        {product.categoryName && (
                            <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-tight">
                                {product.categoryName}
                            </span>
                        )}
                    </div>

                    {/* TITLE */}
                    <h1 className="text-3xl font-bold text-gray-900">
                        {product.productName}
                    </h1>

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

                    {/* DETAIL */}
                    <p className="mt-6 border-l-4 border-gray-200 pl-4 italic leading-relaxed text-gray-600">
                        "{product.productDetail}"
                    </p>

                    {/* VARIANT */}
                    <div className="mt-8 space-y-6">
                        {/* SIZE */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                                Chọn Size
                            </h3>

                            <div className="mt-3 flex flex-wrap gap-3">
                                {allSizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() =>
                                            toggleSize(
                                                size
                                            )
                                        }
                                        disabled={
                                            !availableSizes.includes(
                                                size
                                            )
                                        }
                                        className={`
                                            rounded-lg border px-4 py-2 text-sm font-medium transition-all

                                            ${selectedSize ===
                                                size
                                                ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                                                : 'border-gray-200 text-gray-700 hover:border-gray-400'
                                            }

                                            ${!availableSizes.includes(
                                                size
                                            )
                                                ? 'cursor-not-allowed opacity-40'
                                                : ''
                                            }
                                        `}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* COLOR */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                                Chọn Màu sắc
                            </h3>

                            <div className="mt-3 flex flex-wrap gap-3">
                                {allColors.map(
                                    (color) => (
                                        <button
                                            key={
                                                color
                                            }
                                            onClick={() =>
                                                toggleColor(
                                                    color
                                                )
                                            }
                                            disabled={
                                                !availableColors.includes(
                                                    color
                                                )
                                            }
                                            className={`
                                                rounded-lg border px-4 py-2 text-sm font-medium transition-all

                                                ${selectedColor ===
                                                    color
                                                    ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                                                    : 'border-gray-200 text-gray-700 hover:border-gray-400'
                                                }

                                                ${!availableColors.includes(
                                                    color
                                                )
                                                    ? 'cursor-not-allowed opacity-40'
                                                    : ''
                                                }
                                            `}
                                        >
                                            {
                                                color
                                            }
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* STOCK */}
                        {selectedVariant && (
                            <div className="mt-4">
                                <p
                                    className={`text-sm font-medium ${isOutOfStock
                                        ? 'text-red-500'
                                        : 'text-gray-600'
                                        }`}
                                >
                                    {isOutOfStock
                                        ? 'Sản phẩm hiện đã hết hàng'
                                        : `Còn lại ${selectedVariant.stock} sản phẩm`}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ACTION */}
                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        {/* QUANTITY */}
                        <div className="flex items-center rounded-lg border border-gray-300">
                            <button
                                onClick={() =>
                                    setQuantity((q) =>
                                        Math.max(
                                            1,
                                            q - 1
                                        )
                                    )
                                }
                                className="px-4 py-2 text-xl"
                            >
                                -
                            </button>

                            <span className="w-12 text-center font-bold">
                                {quantity}
                            </span>

                            <button
                                onClick={() => {
                                    // Chưa chọn variant
                                    if (
                                        !selectedVariant
                                    ) {
                                        toast.warning(
                                            'Vui lòng chọn phân loại trước'
                                        );

                                        return;
                                    }

                                    // Hết hàng
                                    if (
                                        isOutOfStock
                                    ) {
                                        toast.error(
                                            'Sản phẩm hiện đã hết hàng'
                                        );

                                        return;
                                    }

                                    // Không vượt stock
                                    if (
                                        quantity >=
                                        Number(
                                            selectedVariant.stock
                                        )
                                    ) {
                                        toast.warning(
                                            `Chỉ còn ${selectedVariant.stock} sản phẩm`
                                        );

                                        return;
                                    }

                                    setQuantity(
                                        (q) => q + 1
                                    );
                                }}
                                className="px-4 py-2 text-xl"
                            >
                                +
                            </button>
                        </div>

                        {/* ADD TO CART */}
                        <button
                            onClick={
                                handleAddToCart
                            }
                            disabled={
                                isAdding
                            }
                            className={`
                                flex flex-1 items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-lg font-bold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70

                                ${isAdding
                                    ? 'bg-gray-400'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }
                            `}
                        >
                            {!isAdding && (
                                <ShoppingCart
                                    size={20}
                                />
                            )}

                            {isAdding
                                ? 'Đang thêm...'
                                : !isVariantSelected
                                    ? 'Chọn phân loại'
                                    : 'Thêm vào giỏ hàng'}
                        </button>
                    </div>

                    {/* WARRANTY */}
                    <div className="mt-8 flex items-center gap-2 text-sm font-medium text-green-600">
                        <ShieldCheck size={18} />
                        Bảo hành chính hãng
                        12 tháng
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;