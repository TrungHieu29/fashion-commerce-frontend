import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowRight,
    BadgePercent,
    ChevronLeft,
    ChevronRight,
    Filter,
    PackageSearch,
    Search,
    ShieldCheck,
    ShoppingBag,
    SlidersHorizontal,
    Sparkles,
    Star,
    Truck,
    X,
} from 'lucide-react';
import { api } from '@/lib/axios';
import image1 from '@/assets/images/image1.png';
import image2 from '@/assets/images/image2.png';
import image3 from '@/assets/images/image3.png';
import { useProducts } from '../hooks/use-products';
import { ProductCard } from '../components/product-card';
import type { ProductResponse } from '../types/product.types';
import { getProductCategoryLabel, productMatchesCategory } from '../types/product.types';

type Category = { id: number; name: string };
type Brand = { id: number; name: string };

const PAGE_STEP = 8;

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

const BANNERS = [
    {
        image: image1,
        eyebrow: 'Spring Editorial',
        title: 'Minimal silhouettes for everyday confidence',
        description: 'Khám phá các thiết kế mới với phom dáng tinh gọn, chất liệu dễ mặc và tinh thần thành thị.',
    },
    {
        image: image2,
        eyebrow: 'New Arrivals',
        title: 'Curated layers, quiet luxury details',
        description: 'Những lựa chọn nổi bật từ các shop đang bán chạy, được sắp xếp để bạn dễ tìm cảm hứng.',
    },
    {
        image: image3,
        eyebrow: 'Seasonal Sale',
        title: 'Elevated essentials at better prices',
        description: 'Săn ưu đãi thời trang theo danh mục, thương hiệu và khoảng giá phù hợp.',
    },
];

const ProductsPage = () => {
    const [page] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedBrand, setSelectedBrand] = useState('all');
    const [selectedPriceRange, setSelectedPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [activeBanner, setActiveBanner] = useState(0);
    const [visibleCount, setVisibleCount] = useState(12);

    const { data: productPage, isLoading, isError } = useProducts({ page, size: 96, sort: 'id,desc' });

    const { data: categories = [] } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: () => api.get('/api/categories').then(res => res.data),
    });

    const { data: brands = [] } = useQuery<Brand[]>({
        queryKey: ['brands'],
        queryFn: () => api.get('/api/product-brands').then(res => res.data),
    });

    useEffect(() => {
        const timer = window.setInterval(() => {
            setActiveBanner(current => (current + 1) % BANNERS.length);
        }, 5200);

        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        setVisibleCount(12);
    }, [searchTerm, selectedCategory, selectedBrand, selectedPriceRange, sortBy]);

    const allProducts = productPage?.content || [];

    const filteredProducts = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const priceRange = PRICE_RANGES.find(item => item.id === selectedPriceRange) || PRICE_RANGES[0];

        const filtered = allProducts.filter((product: ProductResponse) => {
            const price = product.finalPrice ?? 0;
            const matchesSearch = normalizedSearch
                ? [product.productName, product.productDetail, product.shopName, product.brandName, getProductCategoryLabel(product)]
                    .filter(Boolean)
                    .some(value => String(value).toLowerCase().includes(normalizedSearch))
                : true;

            return matchesSearch
                && productMatchesCategory(product, selectedCategory)
                && (selectedBrand === 'all' || String(product.brandId) === selectedBrand)
                && price >= priceRange.min
                && price <= priceRange.max;
        });

        return sortProducts(filtered, sortBy);
    }, [allProducts, searchTerm, selectedCategory, selectedBrand, selectedPriceRange, sortBy]);

    const heroProduct = filteredProducts[0] || allProducts[0];
    const saleProducts = useMemo(() => filteredProducts.filter(product => (product.discountAmount || 0) > 0).slice(0, 4), [filteredProducts]);
    const topProducts = useMemo(() => filteredProducts.filter(product => (product.rating || 0) >= 4).slice(0, 4), [filteredProducts]);
    const visibleProducts = filteredProducts.slice(0, visibleCount);
    const activeFilterCount = [selectedCategory, selectedBrand, selectedPriceRange].filter(value => value !== 'all').length + (searchTerm.trim() ? 1 : 0);

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedBrand('all');
        setSelectedPriceRange('all');
        setSortBy('newest');
    };

    const nextBanner = () => setActiveBanner(current => (current + 1) % BANNERS.length);
    const prevBanner = () => setActiveBanner(current => (current - 1 + BANNERS.length) % BANNERS.length);

    if (isError) {
        return (
            <div className="mx-auto flex min-h-[520px] max-w-lg flex-col items-center justify-center px-6 text-center">
                <PackageSearch className="text-red-500" size={42} />
                <h1 className="mt-4 text-xl font-black text-zinc-950">Không tải được sản phẩm</h1>
                <p className="mt-2 text-sm text-zinc-500">Vui lòng kiểm tra backend hoặc thử tải lại trang.</p>
            </div>
        );
    }

    return (
        <div className="bg-[#F8F6F1] text-zinc-950">
            <HeroEditorial
                activeIndex={activeBanner}
                product={heroProduct}
                onPrev={prevBanner}
                onNext={nextBanner}
                onSelect={setActiveBanner}
            />

            <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
                <CategoryBar categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />

                <section className="mt-8 grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
                    <EditorialPanel title="New Arrivals" text="Những sản phẩm mới được chọn lọc cho phong cách hiện đại, gọn và dễ phối." products={filteredProducts.slice(0, 2)} />
                    <EditorialPanel title="Shop the Look" text="Gợi ý phối đồ nhanh từ các sản phẩm nổi bật trong bộ sưu tập hiện tại." products={topProducts.slice(0, 2)} compact />
                </section>

                <section className="mt-10">
                    <div className="flex flex-col gap-4 border-y border-zinc-200 py-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A68545]">Curated Catalog</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">Sản phẩm nổi bật</h2>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex h-11 min-w-0 items-center gap-2 border border-zinc-300 bg-white px-3">
                                <Search className="text-zinc-400" size={18} />
                                <input
                                    value={searchTerm}
                                    onChange={event => setSearchTerm(event.target.value)}
                                    placeholder="Tìm áo khoác, váy, sneaker..."
                                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(true)}
                                className="inline-flex h-11 items-center justify-center gap-2 border border-zinc-950 bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-[#A68545] hover:border-[#A68545]"
                            >
                                <SlidersHorizontal size={17} />
                                Bộ lọc {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                            </button>
                            <select
                                value={sortBy}
                                onChange={event => setSortBy(event.target.value)}
                                className="h-11 border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none focus:border-zinc-950"
                            >
                                {SORT_OPTIONS.map(option => (
                                    <option key={option.id} value={option.id}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {activeFilterCount > 0 && (
                        <button onClick={resetFilters} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 transition hover:text-zinc-950">
                            <X size={15} /> Xóa bộ lọc hiện tại
                        </button>
                    )}
                </section>

                <ProductSection
                    title="Sale Edit"
                    subtitle="Ưu đãi đang nổi bật"
                    products={saleProducts}
                    icon={BadgePercent}
                    loading={isLoading}
                    subtle
                />

                <section className="mt-10">
                    {isLoading ? (
                        <ProductSkeleton />
                    ) : visibleProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
                                {visibleProducts.map(product => <ProductCard key={product.id} product={product} />)}
                            </div>
                            {visibleCount < filteredProducts.length && (
                                <div className="mt-10 flex justify-center">
                                    <button
                                        onClick={() => setVisibleCount(count => count + PAGE_STEP)}
                                        className="inline-flex h-12 items-center gap-2 border border-zinc-950 bg-white px-6 text-sm font-semibold uppercase tracking-[0.18em] transition hover:bg-zinc-950 hover:text-white"
                                    >
                                        Xem thêm <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="border border-dashed border-zinc-300 bg-white/60 py-16 text-center text-sm text-zinc-500">Chưa có sản phẩm phù hợp.</div>
                    )}
                </section>

                <ProductSection
                    title="Customer Favorites"
                    subtitle="Sản phẩm được đánh giá tốt"
                    products={topProducts}
                    icon={Star}
                    loading={isLoading}
                />
            </main>

            <section className="border-t border-zinc-200 bg-white">
                <div className="mx-auto grid max-w-[1440px] gap-0 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-10">
                    <TrustItem icon={Truck} title="Giao hàng linh hoạt" text="Theo dõi đơn và vận chuyển theo từng shop." />
                    <TrustItem icon={ShieldCheck} title="Shop xác thực" text="Thông tin shop, đánh giá và sản phẩm rõ ràng." />
                    <TrustItem icon={BadgePercent} title="Ưu đãi theo shop" text="Áp dụng voucher và giá giảm khi thanh toán." />
                </div>
            </section>

            {showFilters && (
                <div className="fixed inset-0 z-[60] bg-zinc-950/45 p-3 backdrop-blur-sm">
                    <div className="ml-auto flex h-full w-full max-w-sm flex-col bg-white p-5 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A68545]">Refine</p>
                                <h3 className="text-xl font-semibold text-zinc-950">Bộ lọc</h3>
                            </div>
                            <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-zinc-100" aria-label="Đóng bộ lọc"><X size={18} /></button>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <FilterPanel
                                brands={brands}
                                selectedBrand={selectedBrand}
                                selectedPriceRange={selectedPriceRange}
                                onBrandChange={setSelectedBrand}
                                onPriceRangeChange={setSelectedPriceRange}
                                onReset={resetFilters}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const sortProducts = (products: ProductResponse[], sortBy: string) => {
    return [...products].sort((a, b) => {
        switch (sortBy) {
            case 'price-asc':
                return (a.finalPrice || 0) - (b.finalPrice || 0);
            case 'price-desc':
                return (b.finalPrice || 0) - (a.finalPrice || 0);
            case 'rating-desc':
                return (b.rating || 0) - (a.rating || 0);
            case 'discount-desc':
                return (b.discountAmount || 0) - (a.discountAmount || 0);
            default:
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
    });
};

const HeroEditorial = ({
    activeIndex,
    product,
    onPrev,
    onNext,
    onSelect,
}: {
    activeIndex: number;
    product?: ProductResponse;
    onPrev: () => void;
    onNext: () => void;
    onSelect: (index: number) => void;
}) => {
    const banner = BANNERS[activeIndex];

    return (
        <section className="relative min-h-[calc(100svh-72px)] overflow-hidden bg-zinc-950 text-white">
            <img src={banner.image} alt={banner.title} className="absolute inset-0 h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/44 to-zinc-950/10" />
            <div className="relative mx-auto flex min-h-[calc(100svh-72px)] max-w-[1440px] flex-col justify-end px-4 pb-12 pt-24 sm:px-6 lg:px-10 lg:pb-16">
                <div className="max-w-3xl">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#D6B36A]">{banner.eyebrow}</p>
                    <h1 className="text-4xl font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">{banner.title}</h1>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-white/78 sm:text-base">{banner.description}</p>
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <a href="#catalog" className="inline-flex h-12 items-center gap-2 bg-white px-5 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950 transition hover:bg-[#D6B36A]">
                            Shop now <ShoppingBag size={16} />
                        </a>
                        {product && (
                            <a href={`/product/${product.id}`} className="inline-flex h-12 items-center gap-2 border border-white/45 px-5 text-sm font-semibold uppercase tracking-[0.18em] transition hover:border-white hover:bg-white/10">
                                Featured piece <ArrowRight size={16} />
                            </a>
                        )}
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {BANNERS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => onSelect(index)}
                                className={`h-0.5 transition-all ${activeIndex === index ? 'w-12 bg-white' : 'w-6 bg-white/35'}`}
                                aria-label={`Chọn banner ${index + 1}`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onPrev} className="flex h-11 w-11 items-center justify-center border border-white/35 bg-white/10 backdrop-blur transition hover:bg-white hover:text-zinc-950" aria-label="Banner trước">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={onNext} className="flex h-11 w-11 items-center justify-center border border-white/35 bg-white/10 backdrop-blur transition hover:bg-white hover:text-zinc-950" aria-label="Banner sau">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

const CategoryBar = ({ categories, selectedCategory, onSelect }: { categories: Category[]; selectedCategory: string; onSelect: (categoryId: string) => void }) => (
    <section className="flex gap-2 overflow-x-auto border-b border-zinc-200 pb-5">
        <CategoryButton active={selectedCategory === 'all'} onClick={() => onSelect('all')}>Tất cả</CategoryButton>
        {categories.map(category => (
            <CategoryButton key={category.id} active={selectedCategory === String(category.id)} onClick={() => onSelect(String(category.id))}>
                {category.name}
            </CategoryButton>
        ))}
    </section>
);

const CategoryButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => (
    <button
        onClick={onClick}
        className={`shrink-0 border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${active
            ? 'border-zinc-950 bg-zinc-950 text-white'
            : 'border-zinc-300 bg-transparent text-zinc-600 hover:border-zinc-950 hover:text-zinc-950'
            }`}
    >
        {children}
    </button>
);

const EditorialPanel = ({ title, text, products, compact = false }: { title: string; text: string; products: ProductResponse[]; compact?: boolean }) => (
    <article className="grid overflow-hidden bg-white md:grid-cols-2">
        <div className="flex min-h-[260px] flex-col justify-between p-6 sm:p-8">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A68545]">Editorial</p>
                <h2 className={`${compact ? 'text-2xl' : 'text-3xl sm:text-4xl'} mt-3 font-semibold tracking-tight`}>{title}</h2>
                <p className="mt-4 text-sm leading-6 text-zinc-500">{text}</p>
            </div>
            {products[0] && (
                <a href={`/product/${products[0].id}`} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">
                    Khám phá <ArrowRight size={16} />
                </a>
            )}
        </div>
        <div className="grid min-h-[260px] grid-cols-2 gap-px bg-zinc-200">
            {(products.length ? products : [undefined, undefined]).slice(0, 2).map((product, index) => (
                <a key={product?.id || index} href={product ? `/product/${product.id}` : '#catalog'} className="group relative overflow-hidden bg-zinc-100">
                    {product?.imageUrl ? (
                        <img src={product.imageUrl} alt={product.productName} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-zinc-300"><Sparkles size={34} /></div>
                    )}
                </a>
            ))}
        </div>
    </article>
);

const ProductSection = ({ title, subtitle, products, icon: Icon, loading, subtle = false }: { title: string; subtitle: string; products: ProductResponse[]; icon: any; loading: boolean; subtle?: boolean }) => {
    if (!loading && products.length === 0) return null;

    return (
        <section id={title === 'Sale Edit' ? 'catalog' : undefined} className={`mt-10 ${subtle ? 'bg-[#EFE8DB]' : 'bg-white'} p-4 sm:p-6`}>
            <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center bg-zinc-950 text-white">
                        <Icon size={19} />
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">{title}</h2>
                    <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">{products.length} items</span>
            </div>
            {loading ? (
                <ProductSkeleton />
            ) : (
                <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-4">
                    {products.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
            )}
        </section>
    );
};

const ProductSkeleton = () => (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-4">
        {Array.from({ length: PAGE_STEP }).map((_, index) => (
            <div key={index} className="h-[320px] animate-pulse bg-white/70" />
        ))}
    </div>
);

const FilterPanel = ({
    brands,
    selectedBrand,
    selectedPriceRange,
    onBrandChange,
    onPriceRangeChange,
    onReset,
}: {
    brands: Brand[];
    selectedBrand: string;
    selectedPriceRange: string;
    onBrandChange: (value: string) => void;
    onPriceRangeChange: (value: string) => void;
    onReset: () => void;
}) => (
    <div className="space-y-7">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Filter size={17} className="text-zinc-500" />
                <h3 className="font-semibold text-zinc-950">Tinh chỉnh sản phẩm</h3>
            </div>
            <button onClick={onReset} className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A68545]">Đặt lại</button>
        </div>
        <FilterSection title="Thương hiệu">
            <FilterButton active={selectedBrand === 'all'} onClick={() => onBrandChange('all')}>Tất cả</FilterButton>
            {brands.map(brand => <FilterButton key={brand.id} active={selectedBrand === String(brand.id)} onClick={() => onBrandChange(String(brand.id))}>{brand.name}</FilterButton>)}
        </FilterSection>
        <FilterSection title="Khoảng giá">
            {PRICE_RANGES.map(range => <FilterButton key={range.id} active={selectedPriceRange === range.id} onClick={() => onPriceRangeChange(range.id)}>{range.label}</FilterButton>)}
        </FilterSection>
    </div>
);

const FilterSection = ({ title, children }: { title: string; children: ReactNode }) => (
    <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">{title}</h4>
        <div className="flex flex-wrap gap-2">{children}</div>
    </div>
);

const FilterButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => (
    <button onClick={onClick} className={`border px-3 py-2 text-xs font-semibold transition-colors ${active ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-950 hover:text-zinc-950'}`}>
        {children}
    </button>
);

const TrustItem = ({ icon: Icon, title, text }: { icon: any; title: string; text: string }) => (
    <div className="border-b border-zinc-200 py-5 md:border-b-0 md:border-r md:px-6 md:last:border-r-0">
        <div className="mb-4 text-[#A68545]"><Icon size={22} /></div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950">{title}</p>
        <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
    </div>
);

export default ProductsPage;
