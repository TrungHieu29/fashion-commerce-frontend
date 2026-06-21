import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowDownAZ,
    BadgePercent,
    ChevronLeft,
    ChevronRight,
    Filter,
    Flame,
    PackageSearch,
    Search,
    ShieldCheck,
    SlidersHorizontal,
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
        title: 'Ưu đãi thời trang mới mỗi ngày',
        description: 'Khám phá các sản phẩm nổi bật, giá tốt và gian hàng đang bán chạy.',
    },
    {
        image: image2,
        title: 'Flash Sale dành cho bạn',
        description: 'Săn sản phẩm đang giảm giá mạnh theo từng danh mục yêu thích.',
    },
    {
        image: image3,
        title: 'Mua sắm theo phong cách riêng',
        description: 'Lọc nhanh theo thương hiệu, danh mục và khoảng giá phù hợp.',
    },
];

const ProductsPage = () => {
    const [page, setPage] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedBrand, setSelectedBrand] = useState('all');
    const [selectedPriceRange, setSelectedPriceRange] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [activeBanner, setActiveBanner] = useState(0);
    const [flashVisible, setFlashVisible] = useState(PAGE_STEP);
    const [hotVisible, setHotVisible] = useState(PAGE_STEP);
    const [allVisible, setAllVisible] = useState(PAGE_STEP);

    const { data: productPage, isLoading, isError } = useProducts({ page, size: 48, sort: 'id,desc' });

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
        }, 4500);

        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        setFlashVisible(PAGE_STEP);
        setHotVisible(PAGE_STEP);
        setAllVisible(PAGE_STEP);
    }, [searchTerm, selectedCategory, selectedBrand, selectedPriceRange, sortBy, page]);

    const allProducts = productPage?.content || [];

    const filteredProducts = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const priceRange = PRICE_RANGES.find(item => item.id === selectedPriceRange) || PRICE_RANGES[0];

        const filtered = allProducts.filter((product: ProductResponse) => {
            const price = product.finalPrice ?? 0;
            const matchesSearch = normalizedSearch
                ? [product.productName, product.productDetail, product.shopName, product.brandName, product.categoryName]
                    .filter(Boolean)
                    .some(value => String(value).toLowerCase().includes(normalizedSearch))
                : true;

            return matchesSearch
                && (selectedCategory === 'all' || String(product.categoryId) === selectedCategory)
                && (selectedBrand === 'all' || String(product.brandId) === selectedBrand)
                && price >= priceRange.min
                && price <= priceRange.max;
        });

        return sortProducts(filtered, sortBy);
    }, [allProducts, searchTerm, selectedCategory, selectedBrand, selectedPriceRange, sortBy]);

    const flashSaleProducts = useMemo(() => {
        return [...filteredProducts]
            .filter((product: ProductResponse) => (product.discountAmount || 0) > 0)
            .sort((a: ProductResponse, b: ProductResponse) => (b.discountAmount || 0) - (a.discountAmount || 0));
    }, [filteredProducts]);

    const hotProducts = useMemo(() => {
        return [...filteredProducts]
            .filter((product: ProductResponse) => (product.rating || 0) >= 4)
            .sort((a: ProductResponse, b: ProductResponse) => (b.rating || 0) - (a.rating || 0));
    }, [filteredProducts]);

    const activeFilterCount = [selectedCategory, selectedBrand, selectedPriceRange].filter(value => value !== 'all').length + (searchTerm.trim() ? 1 : 0);

    const selectCategory = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setPage(0);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedBrand('all');
        setSelectedPriceRange('all');
        setSortBy('newest');
        setPage(0);
    };

    const nextBanner = () => setActiveBanner(current => (current + 1) % BANNERS.length);
    const prevBanner = () => setActiveBanner(current => (current - 1 + BANNERS.length) % BANNERS.length);

    if (isError) {
        return (
            <div className="mx-auto flex min-h-[520px] max-w-lg flex-col items-center justify-center px-6 text-center">
                <PackageSearch className="text-red-500" size={42} />
                <h1 className="mt-4 text-xl font-black text-slate-950">Không tải được sản phẩm</h1>
                <p className="mt-2 text-sm text-slate-500">Vui lòng kiểm tra backend hoặc thử tải lại trang.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-50">
            <section className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8">
                    <BannerSlider activeIndex={activeBanner} onPrev={prevBanner} onNext={nextBanner} onSelect={setActiveBanner} />
                </div>
            </section>

            <main className="mx-auto max-w-[1280px] space-y-8 px-4 py-8 lg:px-8">
                <CategoryBar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelect={selectCategory}
                />

                <section className="space-y-8">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                                    <Search className="text-slate-400" size={18} />
                                    <input
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder="Tìm áo khoác, váy, sneaker..."
                                        className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => setShowFilters(true)}
                                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                        <SlidersHorizontal size={17} />
                                        Bộ lọc {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
                                    </button>
                                    <span className="hidden items-center gap-2 text-xs font-bold uppercase text-slate-400 sm:inline-flex">
                                        <ArrowDownAZ size={15} /> Sắp xếp
                                    </span>
                                    <select
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value)}
                                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
                                    >
                                        {SORT_OPTIONS.map(option => (
                                            <option key={option.id} value={option.id}>{option.label}</option>
                                        ))}
                                    </select>
                                    {activeFilterCount > 0 && (
                                        <button onClick={resetFilters} className="inline-flex h-11 items-center gap-1 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-500 hover:bg-slate-50">
                                            <X size={15} /> Xóa lọc
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <ProductSection
                            title="Flash Sale"
                            subtitle="Sản phẩm đang giảm giá, ưu tiên mức giảm cao nhất"
                            icon={Flame}
                            products={flashSaleProducts}
                            visibleCount={flashVisible}
                            onShowMore={() => setFlashVisible(count => count + PAGE_STEP)}
                            tone="flash"
                            isLoading={isLoading}
                        />

                        <ProductSection
                            title="Sản phẩm hot"
                            subtitle="Sản phẩm từ 4 sao trở lên, sắp xếp theo đánh giá cao nhất"
                            icon={Star}
                            products={hotProducts}
                            visibleCount={hotVisible}
                            onShowMore={() => setHotVisible(count => count + PAGE_STEP)}
                            tone="default"
                            isLoading={isLoading}
                        />

                        <ProductSection
                            title="Tất cả sản phẩm"
                            subtitle={`Đang lọc được ${filteredProducts.length} sản phẩm trong trang hiện tại`}
                            icon={PackageSearch}
                            products={filteredProducts}
                            visibleCount={allVisible}
                            onShowMore={() => setAllVisible(count => count + PAGE_STEP)}
                            tone="default"
                            isLoading={isLoading}
                        />

                        <div className="flex items-center justify-center gap-4 pt-2">
                            <button disabled={page === 0} onClick={() => setPage(old => Math.max(0, old - 1))} className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-40">Trang trước</button>
                            <span className="text-sm font-bold text-slate-600">Trang {page + 1} / {productPage?.totalPages || 1}</span>
                            <button disabled={page >= (productPage?.totalPages || 1) - 1} onClick={() => setPage(old => old + 1)} className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-40">Trang sau</button>
                        </div>
                </section>
            </main>

            <section className="border-t border-slate-200 bg-white">
                <div className="mx-auto grid max-w-[1280px] gap-4 px-4 py-6 sm:grid-cols-3 lg:px-8">
                    <TrustItem icon={Truck} title="Giao hàng linh hoạt" text="Theo dõi đơn và vận chuyển theo từng shop." />
                    <TrustItem icon={ShieldCheck} title="Shop xác thực" text="Thông tin shop, đánh giá và sản phẩm rõ ràng." />
                    <TrustItem icon={BadgePercent} title="Ưu đãi theo shop" text="Áp dụng voucher và giá giảm khi thanh toán." />
                </div>
            </section>

            {showFilters && (
                <div className="fixed inset-0 z-[60] bg-slate-950/40 p-4">
                    <div className="ml-auto flex h-full max-w-sm flex-col rounded-2xl bg-white p-4 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-950">Bộ lọc</h3>
                            <button onClick={() => setShowFilters(false)} className="rounded-xl p-2 hover:bg-slate-100"><X size={18} /></button>
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

const BannerSlider = ({ activeIndex, onPrev, onNext, onSelect }: { activeIndex: number; onPrev: () => void; onNext: () => void; onSelect: (index: number) => void }) => {
    const banner = BANNERS[activeIndex];

    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm">
            <div className="relative h-[220px] sm:h-[300px] lg:h-[380px]">
                <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent" />
                <div className="absolute left-5 top-1/2 max-w-xl -translate-y-1/2 text-white sm:left-8">
                    <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">Bộ sưu tập nổi bật</p>
                    <h1 className="text-3xl font-black leading-tight sm:text-5xl">{banner.title}</h1>
                    <p className="mt-3 max-w-md text-sm leading-6 text-slate-200">{banner.description}</p>
                </div>
            </div>

            <button onClick={onPrev} className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow hover:bg-white">
                <ChevronLeft size={20} />
            </button>
            <button onClick={onNext} className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow hover:bg-white">
                <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {BANNERS.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(index)}
                        className={`h-2.5 rounded-full transition-all ${activeIndex === index ? 'w-8 bg-white' : 'w-2.5 bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    );
};

const CategoryBar = ({ categories, selectedCategory, onSelect }: { categories: Category[]; selectedCategory: string; onSelect: (categoryId: string) => void }) => (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-950">Danh mục</h2>
            <p className="text-xs font-semibold text-slate-400">Cuộn ngang để xem thêm</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
            <CategoryButton active={selectedCategory === 'all'} onClick={() => onSelect('all')}>Tất cả</CategoryButton>
            {categories.map(category => (
                <CategoryButton key={category.id} active={selectedCategory === String(category.id)} onClick={() => onSelect(String(category.id))}>
                    {category.name}
                </CategoryButton>
            ))}
        </div>
    </section>
);

const CategoryButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => (
    <button
        onClick={onClick}
        className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${active
            ? 'border-slate-950 bg-slate-950 text-white'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
            }`}
    >
        {children}
    </button>
);

const ProductSection = ({
    title,
    subtitle,
    icon: Icon,
    products,
    visibleCount,
    onShowMore,
    tone,
    isLoading,
}: {
    title: string;
    subtitle: string;
    icon: any;
    products: ProductResponse[];
    visibleCount: number;
    onShowMore: () => void;
    tone: 'flash' | 'default';
    isLoading: boolean;
}) => {
    const visibleProducts = products.slice(0, visibleCount);
    const hasMore = visibleCount < products.length;

    return (
        <section className={`rounded-2xl border p-4 shadow-sm ${tone === 'flash' ? 'border-red-100 bg-gradient-to-br from-red-50 via-orange-50 to-white' : 'border-slate-200 bg-white'}`}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${tone === 'flash' ? 'bg-red-600' : 'bg-slate-950'}`}>
                        <Icon size={21} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-950">{title}</h2>
                        <p className="text-sm text-slate-500">{subtitle}</p>
                    </div>
                </div>
                <span className="text-xs font-bold text-slate-400">{products.length} sản phẩm phù hợp</span>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: PAGE_STEP }).map((_, index) => <div key={index} className="h-[390px] animate-pulse rounded-2xl bg-white" />)}
                </div>
            ) : visibleProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {visibleProducts.map(product => <ProductCard key={product.id} product={product} />)}
                    </div>
                    {hasMore && (
                        <div className="mt-5 flex justify-center">
                            <button onClick={onShowMore} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                                Xem thêm 8 sản phẩm
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 py-10 text-center text-sm text-slate-400">Chưa có sản phẩm phù hợp.</div>
            )}
        </section>
    );
};

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
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Filter size={17} className="text-slate-500" />
                <h3 className="font-black text-slate-950">Bộ lọc</h3>
            </div>
            <button onClick={onReset} className="text-xs font-bold text-blue-600">Đặt lại</button>
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
        <h4 className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">{title}</h4>
        <div className="flex flex-wrap gap-2">{children}</div>
    </div>
);

const FilterButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) => (
    <button onClick={onClick} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${active ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}>
        {children}
    </button>
);

const TrustItem = ({ icon: Icon, title, text }: { icon: any; title: string; text: string }) => (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
        <div className="rounded-xl bg-blue-50 p-2 text-blue-600"><Icon size={20} /></div>
        <div>
            <p className="text-sm font-black text-slate-950">{title}</p>
            <p className="mt-1 text-sm text-slate-500">{text}</p>
        </div>
    </div>
);

export default ProductsPage;
