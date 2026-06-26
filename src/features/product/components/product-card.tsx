import { Link } from 'react-router-dom';
import { Eye, Heart, Package, ShoppingBag, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import { useIsWishlisted, useToggleWishlist } from '@/features/wishlist/hooks/use-wishlist';
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
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const isWishlisted = useIsWishlisted(product.id);
    const toggleWishlist = useToggleWishlist(product.id);

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
        <article className="group min-w-0 bg-transparent">
            <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
                {discountPercent > 0 && (
                    <span className="absolute left-3 top-3 z-10 bg-zinc-950 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                        -{discountPercent}%
                    </span>
                )}
                {isWishlisted && (
                    <span className={`absolute left-3 z-10 bg-zinc-950 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm ${discountPercent > 0 ? 'top-11' : 'top-3'}`}>
                        Đã lưu
                    </span>
                )}

                <Link to={`/product/${product.id}`} className="block h-full w-full">
                    {displayImage ? (
                        <img src={displayImage} alt={product.productName} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-300">
                            <Package size={46} strokeWidth={1.4} />
                        </div>
                    )}
                </Link>

                <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (!isAuthenticated || toggleWishlist.isPending) return;
                            toggleWishlist.mutate();
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition hover:bg-zinc-950 hover:text-white ${isWishlisted ? 'bg-zinc-950 text-white ring-4 ring-[#A68545]/20' : 'bg-white/90 text-zinc-950'}`}
                        aria-label={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
                        title={isAuthenticated ? undefined : 'Đăng nhập để thêm vào yêu thích'}
                    >
                        <Heart size={17} fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>
                    <Link to={`/product/${product.id}`} className="flex h-9 w-9 items-center justify-center bg-white/90 text-zinc-950 shadow-sm backdrop-blur transition hover:bg-zinc-950 hover:text-white" aria-label="Xem nhanh">
                        <Eye size={17} />
                    </Link>
                </div>

                <Link
                    to={`/product/${product.id}`}
                    className="absolute inset-x-3 bottom-3 hidden h-10 items-center justify-center gap-2 bg-white text-xs font-semibold uppercase tracking-[0.16em] text-zinc-950 shadow-sm transition hover:bg-zinc-950 hover:text-white sm:flex sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
                >
                    <ShoppingBag size={15} />
                    Quick view
                </Link>
            </div>

            <div className="min-w-0 pt-3">
                <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                        {categoryLabel || product.brandName || 'Fashion'}
                    </p>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#A68545]">
                        {rating.toFixed(1)} <Star size={12} fill="currentColor" />
                    </span>
                </div>

                <Link to={`/product/${product.id}`}>
                    <h3 className="line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 text-zinc-950 transition-colors hover:text-[#A68545] sm:text-[15px]">
                        {product.productName}
                    </h3>
                </Link>

                <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <p className="text-sm font-semibold text-zinc-950 sm:text-base">
                        {finalPrice.toLocaleString('vi-VN')}đ
                    </p>
                    {discountAmount > 0 && originalPrice > finalPrice && (
                        <p className="text-xs font-medium text-zinc-400 line-through">
                            {originalPrice.toLocaleString('vi-VN')}đ
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
};
