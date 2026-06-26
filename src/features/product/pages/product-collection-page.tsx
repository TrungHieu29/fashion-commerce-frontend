import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BadgePercent, Flame, PackageSearch, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { api } from '@/lib/axios';
import { ProductCard } from '../components/product-card';
import { useProducts } from '../hooks/use-products';
import type { ProductResponse } from '../types/product.types';
import { getProductCategoryLabel, isActiveProduct, productMatchesCategory } from '../types/product.types';

type Category = { id: number; name: string };
type Brand = { id: number; name: string };

const PRICE_RANGES = [
    { id: 'all', label: 'Mọi mức giá', min: 0, max: Number.POSITIVE_INFINITY },
    { id: 'under-200', label: 'Dưới 200K', min: 0, max: 200000 },
    { id: '200-500', label: '200K - 500K', min: 200000, max: 500000 },
    { id: '500-1000', label: '500K - 1 triệu', min: 500000, max: 1000000 },
    { id: 'over-1000', label: 'Trên 1 triệu', min: 1000000, max: Number.POSITIVE_INFINITY },
];

const SORT_OPTIONS = [
    { id: 'newest', label: 'Mới nhất' },
    { id: 'price-asc', label: 'Giá tăng dần' },
    { id: 'price-desc', label: 'Giá giảm dần' },
    { id: 'rating-desc', label: 'Đánh giá cao' },
    { id: 'discount-desc', label: 'Giảm giá nhiều' },
];

const ProductCollectionPage = () => {
    const { type } = useParams();
    const isHot = type === 'hot';
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedBrand, setSelectedBrand] = useState('all');
    const [selectedPriceRange, setSelectedPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState(isHot ? 'rating-desc' : 'discount-desc');
    const [showFilters, setShowFilters] = useState(false);

    const { data: productPage, isLoading, isError } = useProducts({ page: 0, size: 200, sort: 'id,desc' });

    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: () => api.get('/api/categories').then(res => res.data),
    });

    const { data: brands = [] } = useQuery<Brand[]>({
        queryKey: ['brands'],
        queryFn: () => api.get('/api/product-brands').then(res => res.data),
    });

    const products = (productPage?.content || []).filter(isActiveProduct);
    const collectionProducts = useMemo(() => {
        const priceRange = PRICE_RANGES.find(item => item.id === selectedPriceRange) || PRICE_RANGES[0];
        const keyword = searchTerm.trim().toLowerCase();

        const filtered = products.filter((product: ProductResponse) => {
            const belongsToCollection = isHot
                ? (product.rating || 0) >= 4
                : (product.discountAmount || 0) > 0;

            const matchesSearch = keyword
                ? [product.productName, product.productDetail, product.shopName, product.brandName, getProductCategoryLabel(product)]
                    .filter(Boolean)
                    .some(value => String(value).toLowerCase().includes(keyword))
                : true;

            const price = product.finalPrice || 0;

            return belongsToCollection
                && matchesSearch
                && productMatchesCategory(product, selectedCategory)
                && (selectedBrand === 'all' || String(product.brandId) === selectedBrand)
                && price >= priceRange.min
                && price <= priceRange.max;
        });

        return sortProducts(filtered, sortBy);
    }, [products, isHot, searchTerm, selectedCategory, selectedBrand, selectedPriceRange, sortBy]);

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedBrand('all');
        setSelectedPriceRange('all');
        setSortBy(isHot ? 'rating-desc' : 'discount-desc');
    };

    const title = isHot ? 'Sản phẩm hot' : 'Flash Sale';
    const subtitle = isHot ? 'Tất cả sản phẩm từ 4 sao trở lên' : 'Tất cả sản phẩm đang có ưu đãi';
    const Icon = isHot ? Star : Flame;

    if (isError) {
        return (
            <div className="mx-auto flex min-h-[520px] max-w-lg flex-col items-center justify-center px-6 text-center">
                <PackageSearch className="text-red-500" size={42} />
                <h1 className="mt-4 text-xl font-semibold text-zinc-950">Không tải được sản phẩm</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F6F1] px-4 py-10 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-[1440px]">
                <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500 transition hover:text-zinc-950">
                    <ArrowLeft size={16} />
                    Trang chủ
                </Link>

                <section className="border-b border-zinc-200 pb-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center bg-zinc-950 text-white">
                                <Icon size={22} />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A68545]">Collection</p>
                            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">{title}</h1>
                            <p className="mt-4 text-sm leading-6 text-zinc-500">{subtitle}</p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="flex h-11 min-w-0 items-center gap-2 border border-zinc-300 bg-white px-3">
                                <Search className="text-zinc-400" size={18} />
                                <input
                                    value={searchTerm}
                                    onChange={event => setSearchTerm(event.target.value)}
                                    placeholder="Tìm sản phẩm..."
                                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                                />
                            </div>
                            <button onClick={() => setShowFilters(true)} className="inline-flex h-11 items-center justify-center gap-2 border border-zinc-950 bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-[#A68545] hover:border-[#A68545]">
                                <SlidersHorizontal size={17} />
                                Bộ lọc
                            </button>
                            <select value={sortBy} onChange={event => setSortBy(event.target.value)} className="h-11 border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none">
                                {SORT_OPTIONS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    <div className="mb-5 flex items-center justify-between">
                        <p className="text-sm font-semibold text-zinc-500">{collectionProducts.length} sản phẩm phù hợp</p>
                        <button onClick={resetFilters} className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-950">
                            <X size={15} />
                            Xóa lọc
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 12 }).map((_, index) => <div key={index} className="h-[320px] animate-pulse bg-white/70" />)}
                        </div>
                    ) : collectionProducts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
                            {collectionProducts.map(product => <ProductCard key={product.id} product={product} />)}
                        </div>
                    ) : (
                        <div className="border border-dashed border-zinc-300 bg-white/60 py-16 text-center text-sm text-zinc-500">Không có sản phẩm phù hợp.</div>
                    )}
                </section>
            </div>

            {showFilters && (
                <div className="fixed inset-0 z-[60] bg-zinc-950/45 p-3 backdrop-blur-sm">
                    <div className="ml-auto flex h-full w-full max-w-sm flex-col bg-white p-5 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-zinc-950">Bộ lọc</h3>
                            <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-zinc-100"><X size={18} /></button>
                        </div>
                        <FilterGroup title="Danh mục">
                            <FilterButton active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')}>Tất cả</FilterButton>
                            {categories.map(category => <FilterButton key={category.id} active={selectedCategory === String(category.id)} onClick={() => setSelectedCategory(String(category.id))}>{category.name}</FilterButton>)}
                        </FilterGroup>
                        <FilterGroup title="Thương hiệu">
                            <FilterButton active={selectedBrand === 'all'} onClick={() => setSelectedBrand('all')}>Tất cả</FilterButton>
                            {brands.map(brand => <FilterButton key={brand.id} active={selectedBrand === String(brand.id)} onClick={() => setSelectedBrand(String(brand.id))}>{brand.name}</FilterButton>)}
                        </FilterGroup>
                        <FilterGroup title="Khoảng giá">
                            {PRICE_RANGES.map(range => <FilterButton key={range.id} active={selectedPriceRange === range.id} onClick={() => setSelectedPriceRange(range.id)}>{range.label}</FilterButton>)}
                        </FilterGroup>
                    </div>
                </div>
            )}
        </div>
    );
};

const sortProducts = (products: ProductResponse[], sortBy: string) => {
    return [...products].sort((a, b) => {
        if (sortBy === 'price-asc') return (a.finalPrice || 0) - (b.finalPrice || 0);
        if (sortBy === 'price-desc') return (b.finalPrice || 0) - (a.finalPrice || 0);
        if (sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'discount-desc') return (b.discountAmount || 0) - (a.discountAmount || 0);
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
};

const FilterGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-7">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">{title}</h4>
        <div className="flex flex-wrap gap-2">{children}</div>
    </div>
);

const FilterButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} className={`border px-3 py-2 text-xs font-semibold transition-colors ${active ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-950 hover:text-zinc-950'}`}>
        {children}
    </button>
);

export default ProductCollectionPage;
