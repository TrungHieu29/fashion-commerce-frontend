import { Link } from 'react-router-dom';
import { Package, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ProductImageResponse } from '@/features/product-variant/types/variant.types';
import type { ProductResponse } from '../types/product.types';
import { getProductCategoryLabel } from '../types/product.types';

interface ProductCardProps {
    product: ProductResponse;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    const originalPrice = product.originalPrice ?? 0;
    const finalPrice = product.finalPrice ?? 0;
    const discountAmount = product.discountAmount ?? 0;
    const rating = product.rating ?? 0;
    const categoryLabel = getProductCategoryLabel(product);

    const { data: productImages } = useQuery<ProductImageResponse[]>({
        queryKey: ['product-images', product.id],
        queryFn: async () => {
            const res = await api.get(`/api/product-images/product/${product.id}`);
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
    });

    const displayImage = productImages && productImages.length > 0
        ? productImages[0].imageUrl
        : product.imageUrl;

    const discountPercent = discountAmount > 0 && originalPrice > 0
        ? Math.round((discountAmount / originalPrice) * 100)
        : 0;

    return (
        <div className="relative flex min-h-[340px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            {discountPercent > 0 && (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-red-600 px-2.5 py-1 text-xs font-black text-white shadow-sm">
                    -{discountPercent}%
                </span>
            )}

            <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden bg-slate-100">
                {displayImage ? (
                    <img src={displayImage} alt={product.productName} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <Package size={46} strokeWidth={1.4} />
                    </div>
                )}
            </Link>

            <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {categoryLabel && <span className="truncate">{categoryLabel}</span>}
                    {product.brandName && <span className="truncate rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">{product.brandName}</span>}
                </div>

                <Link to={`/product/${product.id}`}>
                    <h3 className="line-clamp-2 text-base font-black leading-snug text-slate-950 transition-colors hover:text-blue-600">
                        {product.productName}
                    </h3>
                </Link>

                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div className="min-w-0">
                        {discountAmount > 0 && originalPrice > finalPrice && (
                            <p className="text-xs font-semibold text-slate-400 line-through">
                                {originalPrice.toLocaleString('vi-VN')}đ
                            </p>
                        )}
                        <p className="text-xl font-black text-blue-600">
                            {finalPrice.toLocaleString('vi-VN')}đ
                        </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-black text-amber-600">
                        {rating.toFixed(1)} <Star size={13} fill="currentColor" />
                    </span>
                </div>

                <Link to={`/product/${product.id}`} className="mt-4">
                    <button className="h-10 w-full rounded-xl bg-slate-950 text-sm font-bold text-white transition-colors hover:bg-blue-600">
                        Xem chi tiết
                    </button>
                </Link>
            </div>
        </div>
    );
};
