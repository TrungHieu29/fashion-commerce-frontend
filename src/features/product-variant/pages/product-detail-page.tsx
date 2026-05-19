import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, ShoppingCart, ShieldCheck } from 'lucide-react';
import { useProductDetail } from '../hooks/use-variant';
import { useAuthStore } from '@/stores/auth.store';

import { toast } from 'sonner';
import { useAddToCart } from '@/features/cart/hooks/use-cart';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const { data: product, isLoading, isError } = useProductDetail(id);
    const { mutate: addToCart, isPending: isAdding } = useAddToCart();

    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    if (isLoading) return <div className="flex h-96 items-center justify-center">Đang tải...</div>;
    if (isError || !product) return <div className="py-20 text-center">Không tìm thấy sản phẩm.</div>;

    // Lấy danh sách các Size và Màu sắc duy nhất
    const allSizes = Array.from(new Set(product.variants.map((v) => v.size)));
    const allColors = Array.from(new Set(product.variants.map((v) => v.color)));

    // Logic lọc: Nếu đã chọn Size, chỉ hiện các Màu có Size đó. Ngược lại nếu chọn Màu, chỉ hiện Size có Màu đó.
    const availableSizes = selectedColor
        ? product.variants.filter((v) => v.color === selectedColor).map((v) => v.size)
        : allSizes;

    const availableColors = selectedSize
        ? product.variants.filter((v) => v.size === selectedSize).map((v) => v.color)
        : allColors;

    const selectedVariant = product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
    );

    const currentPrice = product.price + (selectedVariant?.priceAdjustment || 0);

    const handleAddToCart = () => {
        // 1. Kiểm tra chọn biến thể trước (UX tốt hơn cho cả khách vãng lai)
        if (product.variants && product.variants.length > 0 && !selectedVariant) {
            toast.warning('Vui lòng chọn đầy đủ Size và Màu sắc!');
            return;
        }

        // 2. Kiểm tra đăng nhập sau khi đã chọn xong sản phẩm
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để mua sắm!');
            navigate('/login'); // Chuyển hướng sau khi hiển thị toast
            return;
        }

        addToCart({
            productVariantId: selectedVariant?.id || 0,
            quantity: quantity
        });
    };

    const toggleSize = (size: string) => {
        setSelectedSize(selectedSize === size ? null : size);
    };

    const toggleColor = (color: string) => {
        setSelectedColor(selectedColor === color ? null : color);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/" className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-blue-600">
                <ChevronLeft size={16} /> Quay lại danh sách
            </Link>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* Ảnh sản phẩm (Placeholder) */}
                <div className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <span className="text-xl font-medium uppercase tracking-widest">Product Image</span>
                </div>

                {/* Thông tin sản phẩm */}
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-900">{product.productName}</h1>

                    <div className="mt-4 flex items-center gap-4">
                        <span className="text-2xl font-extrabold text-blue-600">{currentPrice.toLocaleString()}đ</span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star size={18} fill="currentColor" /> {product.rating}
                        </div>
                    </div>

                    <p className="mt-6 text-gray-600 leading-relaxed italic border-l-4 border-gray-200 pl-4">
                        "{product.productDetail}"
                    </p>

                    {/* Lựa chọn biến thể (Size/Màu) */}
                    <div className="mt-8 space-y-6">

                        {/* Chọn Size */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                                Chọn Size
                            </h3>

                            <div className="mt-3 flex flex-wrap gap-3">
                                {allSizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => toggleSize(size)}
                                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all
                        ${selectedSize === size
                                                ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-400 text-gray-700'
                                            }
                        ${!availableSizes.includes(size)
                                                ? 'cursor-not-allowed opacity-50'
                                                : ''
                                            }
                    `}
                                        disabled={!availableSizes.includes(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chọn Màu sắc */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                                Chọn Màu sắc
                            </h3>

                            <div className="mt-3 flex flex-wrap gap-3">
                                {allColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => toggleColor(color)}
                                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all
                        ${selectedColor === color
                                                ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-400 text-gray-700'
                                            }
                        ${!availableColors.includes(color)
                                                ? 'cursor-not-allowed opacity-50'
                                                : ''
                                            }
                    `}
                                        disabled={!availableColors.includes(color)}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                    {/* Số lượng và Add to Cart */}
                    <div className="mt-10 flex flex-wrap items-center gap-4">
                        <div className="flex items-center rounded-lg border border-gray-300">
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 text-xl">-</button>
                            <span className="w-12 text-center font-bold">{quantity}</span>
                            <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2 text-xl">+</button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-lg font-bold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-70"
                        >
                            <ShoppingCart size={20} />
                            {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                        </button>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-sm text-green-600 font-medium">
                        <ShieldCheck size={18} /> Bảo hành chính hãng 12 tháng
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;