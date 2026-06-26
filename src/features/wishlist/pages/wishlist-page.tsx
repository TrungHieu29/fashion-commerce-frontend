import { Link } from 'react-router-dom';
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';
import { Heart, Loader2, PackageSearch, Trash2 } from 'lucide-react';
import { api } from '@/lib/axios';
import { ProductCard } from '@/features/product/components/product-card';
import type { ProductResponse } from '@/features/product/types/product.types';
import { useAuthStore } from '@/stores/auth.store';
import { removeWishlistProduct } from '../api/wishlist.api';
import { useWishlist } from '../hooks/use-wishlist';

const WishlistPage = () => {
    const user = useAuthStore(state => state.user);
    const queryClient = useQueryClient();
    const { data: wishlist = [], isLoading } = useWishlist();

    const productIds = wishlist
        .map(item => item.product?.id ?? item.productId)
        .filter((id): id is number => Number.isFinite(Number(id)))
        .map(Number);

    const missingProductIds = wishlist
        .filter(item => !item.product && item.productId)
        .map(item => Number(item.productId));

    const productQueries = useQueries({
        queries: missingProductIds.map(productId => ({
            queryKey: ['product', productId],
            queryFn: async () => {
                const response = await api.get(`/api/products/${productId}`);
                return response.data as ProductResponse;
            },
            enabled: !!productId,
            staleTime: 1000 * 60 * 5,
        })),
    });

    const productMap = new Map<number, ProductResponse>();
    wishlist.forEach(item => {
        const product = item.product;
        if (product?.id) {
            productMap.set(product.id, product);
        }
    });

    productQueries.forEach(query => {
        if (query.data?.id) {
            productMap.set(query.data.id, query.data);
        }
    });

    const products = productIds
        .map(productId => productMap.get(productId))
        .filter((product): product is ProductResponse => Boolean(product));

    const removeMutation = useMutation({
        mutationFn: (productId: number) => removeWishlistProduct(user!.id, productId),
        onSuccess: (_, productId) => {
            queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
            window.dispatchEvent(new CustomEvent('wishlist-updated', {
                detail: { action: 'removed', productId },
            }));
        },
    });

    const isFetchingProducts = productQueries.some(query => query.isLoading);

    return (
        <div className="min-h-screen bg-[#F8F6F1] px-4 py-10 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-[1440px]">
                <div className="mb-8 flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A68545]">Wishlist</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">Sản phẩm yêu thích</h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                            Những sản phẩm bạn đã lưu để xem lại và mua sau.
                        </p>
                    </div>
                    <Link to="/" className="inline-flex h-11 items-center justify-center border border-zinc-950 px-5 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950 transition hover:bg-zinc-950 hover:text-white">
                        Tiếp tục mua sắm
                    </Link>
                </div>

                {isLoading || isFetchingProducts ? (
                    <div className="flex min-h-[360px] items-center justify-center text-zinc-500">
                        <Loader2 className="animate-spin" size={28} />
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
                        {products.map(product => (
                            <div key={product.id} className="relative">
                                <ProductCard product={product} />
                                <button
                                    onClick={() => removeMutation.mutate(product.id)}
                                    disabled={removeMutation.isPending}
                                    className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center bg-white/90 text-red-500 shadow-sm backdrop-blur transition hover:bg-red-600 hover:text-white disabled:opacity-60"
                                    aria-label="Bỏ khỏi yêu thích"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[420px] flex-col items-center justify-center border border-dashed border-zinc-300 bg-white/60 px-6 text-center">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center bg-zinc-950 text-white">
                            <Heart size={28} />
                        </div>
                        <h2 className="text-xl font-semibold text-zinc-950">Bạn chưa lưu sản phẩm nào</h2>
                        <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                            Bấm biểu tượng trái tim trên sản phẩm để thêm vào danh sách yêu thích.
                        </p>
                        <Link to="/" className="mt-6 inline-flex h-11 items-center gap-2 bg-zinc-950 px-5 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#A68545]">
                            <PackageSearch size={17} />
                            Khám phá sản phẩm
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
