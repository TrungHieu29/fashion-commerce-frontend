import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Package } from 'lucide-react'; // Thêm import Star và Package
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ProductResponse } from '../types/product.types';
import type { ProductImageResponse } from '@/features/product-variant/types/variant.types';

interface ProductCardProps {
    product: ProductResponse;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    // Đảm bảo các giá trị số luôn là number, mặc định là 0 nếu undefined/null
    const originalPrice = product.originalPrice ?? 0;
    const finalPrice = product.finalPrice ?? 0;
    const discountAmount = product.discountAmount ?? 0;
    const rating = product.rating ?? 0;

    // Lấy danh sách ảnh giống như ProductDetailPage để hiển thị ảnh đầu tiên (màu đầu tiên)
    const { data: productImages } = useQuery<ProductImageResponse[]>({
        queryKey: ['product-images', product.id],
        queryFn: async () => {
            const res = await api.get(`/api/product-images/product/${product.id}`);
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // Cache 5 phút để tránh gọi API quá nhiều khi scroll
    });

    const displayImage = productImages && productImages.length > 0
        ? productImages[0].imageUrl
        : product.imageUrl;

    // Logic hiển thị Badge giảm giá
    const renderDiscountBadge = () => {
        // Chỉ hiển thị badge nếu có giảm giá và giá gốc hợp lệ
        if (discountAmount <= 0 || originalPrice <= 0) return null;

        const percent = Math.round((discountAmount / originalPrice) * 100);
        if (percent > 0) {
            return (
                <span className="absolute top-2 right-2 bg-red-50 text-red-600 px-2 py-1 rounded-lg text-xs font-black uppercase tracking-tight">
                    -{percent}%
                </span>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md relative"> {/* Thêm relative cho badge */}
            {renderDiscountBadge()}
            {/* Placeholder cho ảnh sản phẩm */}
            <div className="mb-4 flex aspect-square w-full items-center justify-center rounded-lg bg-gray-100 text-gray-400 overflow-hidden">
                {displayImage ? (
                    <img src={displayImage} alt={product.productName} className="w-full h-full object-cover" />
                ) : (
                    <Package size={48} strokeWidth={1} />
                )}
            </div>

            <Link to={`/product/${product.id}`}>
                <h3 className="mb-1 text-lg font-bold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer">
                    {product.productName}
                </h3>
            </Link>

            <p className="mb-4 flex-grow text-sm text-gray-500 line-clamp-2">{product.productDetail}</p>

            <div className="mt-auto">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex flex-col"> {/* Hiển thị giá gốc gạch ngang nếu có */}
                        {discountAmount > 0 && originalPrice > finalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                                {originalPrice.toLocaleString()}đ
                            </span>
                        )}
                        <span className="text-xl font-bold text-blue-600">
                            {finalPrice.toLocaleString()}đ
                        </span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-amber-500">
                        {rating.toFixed(1)} <Star size={12} fill="currentColor" /> {/* Hiển thị rating với 1 chữ số thập phân và icon */}
                    </span>
                </div>
                <Link to={`/product/${product.id}`}>
                    <button className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98]">
                        Xem chi tiết
                    </button>
                </Link>
            </div>
        </div>
    );
};