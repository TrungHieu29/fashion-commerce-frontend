import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Mail, MapPin, Phone, Search, Store, UserRound } from 'lucide-react';
import { api } from '@/lib/axios';
import { ProductCard } from '@/features/product/components/product-card';
import type { ProductResponse } from '@/features/product/types/product.types';
import { getProductCategoryLabel } from '@/features/product/types/product.types';
import { useShopById } from '../hooks/use-shop';

const ShopDetailPage = () => {
    const { id } = useParams();
    const shopId = Number(id);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const { data: shop, isLoading: isLoadingShop, isError } = useShopById(shopId);
    const { data: productPage, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['public-shop-products', shopId],
        queryFn: async () => {
            const response = await api.get(`/api/products/shop/${shopId}`, {
                params: { page: 0, size: 100, sort: 'id,desc' }
            });
            return response.data;
        },
        enabled: !!shopId,
    });

    const products = productPage?.content || [];
    const filteredProducts = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return products
            .filter((product: ProductResponse) => keyword
                ? [product.productName, product.productDetail, product.brandName, getProductCategoryLabel(product)]
                    .filter(Boolean)
                    .some(value => String(value).toLowerCase().includes(keyword))
                : true
            )
            .sort((a: ProductResponse, b: ProductResponse) => {
                if (sortBy === 'price-asc') return (a.finalPrice || 0) - (b.finalPrice || 0);
                if (sortBy === 'price-desc') return (b.finalPrice || 0) - (a.finalPrice || 0);
                if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });
    }, [products, searchTerm, sortBy]);

    if (isLoadingShop) return <div className="p-20 text-center text-sm text-slate-500">Đang tải shop...</div>;
    if (isError || !shop) return <div className="p-20 text-center text-sm text-red-500">Không tìm thấy shop.</div>;

    return (
        <div className="min-h-screen bg-[#F8F6F1]">
            <section className="border-b border-zinc-200 bg-white">
                <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
                    <Link to="/shops" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500 hover:text-zinc-950">
                        <ChevronLeft size={16} /> Quay lại danh sách shop
                    </Link>

                    <div className="bg-zinc-950 p-6 text-white lg:p-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden bg-white/10">
                                {shop.logo ? (
                                    <img src={shop.logo} alt={shop.shopName} className="h-full w-full object-cover" />
                                ) : (
                                    <Store size={34} />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-3xl font-semibold tracking-tight">{shop.shopName}</h1>
                                    <span className="bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold uppercase text-emerald-200">{shop.status || 'Đang hoạt động'}</span>
                                </div>
                                <p className="mt-2 flex items-center gap-2 text-sm text-slate-300"><UserRound size={15} /> {shop.ownerFullName || 'Chủ shop'}</p>
                                <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
                                    <p className="flex items-center gap-2"><Mail size={15} /> {shop.email || 'N/A'}</p>
                                    <p className="flex items-center gap-2"><Phone size={15} /> {shop.phone || 'N/A'}</p>
                                    <p className="flex items-center gap-2"><MapPin size={15} /> {shop.address || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:w-56">
                                <ShopStat label="Sản phẩm" value={(productPage?.totalElements || products.length).toLocaleString('vi-VN')} />
                                <ShopStat label="Đánh giá TB" value={getAverageRating(products)} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
                <div className="mb-5 flex flex-col gap-3 border border-zinc-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-950">Sản phẩm của shop</h2>
                        <p className="text-sm text-zinc-500">{filteredProducts.length} sản phẩm đang hiển thị</p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="flex h-10 items-center gap-2 border border-zinc-300 bg-[#F8F6F1] px-3">
                            <Search size={16} className="text-slate-400" />
                            <input
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Tìm trong shop..."
                                className="min-w-0 bg-transparent text-sm outline-none"
                            />
                        </div>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="h-10 border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-600 outline-none">
                            <option value="newest">Mới nhất</option>
                            <option value="price-asc">Giá tăng dần</option>
                            <option value="price-desc">Giá giảm dần</option>
                            <option value="rating-desc">Đánh giá cao</option>
                        </select>
                    </div>
                </div>

                {isLoadingProducts ? (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-[390px] animate-pulse rounded-2xl bg-white" />)}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {filteredProducts.map((product: ProductResponse) => <ProductCard key={product.id} product={product} />)}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-sm text-slate-400">
                        Shop chưa có sản phẩm phù hợp.
                    </div>
                )}
            </main>
        </div>
    );
};

const getAverageRating = (products: ProductResponse[]) => {
    if (!products.length) return '0.0';
    const total = products.reduce((sum, product) => sum + (product.rating || 0), 0);
    return (total / products.length).toFixed(1);
};

const ShopStat = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-2xl bg-white/10 p-4">
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-xs font-bold uppercase text-slate-300">{label}</p>
    </div>
);

export default ShopDetailPage;
