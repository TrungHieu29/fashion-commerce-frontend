import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Search, Store, UserRound } from 'lucide-react';
import { useShops } from '../hooks/use-shop';

const ShopListPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: shops = [], isLoading, isError } = useShops();

    const filteredShops = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return shops;

        return shops.filter(shop =>
            [shop.shopName, shop.email, shop.phone, shop.address, shop.ownerFullName]
                .filter(Boolean)
                .some(value => String(value).toLowerCase().includes(keyword))
        );
    }, [shops, searchTerm]);

    if (isLoading) return <div className="p-20 text-center text-sm text-slate-500">Đang tải danh sách shop...</div>;
    if (isError) return <div className="p-20 text-center text-sm text-red-500">Không thể tải danh sách shop.</div>;

    return (
        <div className="min-h-screen bg-[#F8F6F1]">
            <section className="border-b border-zinc-200 bg-white">
                <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-zinc-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                            <Store size={14} /> Shop
                        </div>
                        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">Khám phá các shop đang bán</h1>
                        <p className="mt-3 text-sm leading-6 text-zinc-500">Tìm shop theo tên, địa chỉ, email hoặc chủ sở hữu. Chọn shop để xem thông tin và sản phẩm đang bán.</p>
                    </div>

                    <div className="mt-6 flex max-w-2xl items-center gap-3 border border-zinc-300 bg-[#F8F6F1] px-4">
                        <Search className="text-zinc-400" size={18} />
                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Tìm tên shop..."
                            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
                        />
                    </div>
                </div>
            </section>

            <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10">
                {filteredShops.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filteredShops.map(shop => (
                            <Link key={shop.id} to={`/shops/${shop.id}`} className="group border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-zinc-100 text-zinc-500">
                                        {shop.logo ? (
                                            <img src={shop.logo} alt={shop.shopName} className="h-full w-full object-cover" />
                                        ) : (
                                            <Store size={24} />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-lg font-semibold text-zinc-950 group-hover:text-[#A68545]">{shop.shopName}</h3>
                                                <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-zinc-400">
                                                    <UserRound size={13} /> {shop.ownerFullName || 'Chủ shop'}
                                                </p>
                                            </div>
                                            <span className="bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-600">{shop.status || 'Đang hoạt động'}</span>
                                        </div>
                                        <div className="mt-4 space-y-2 text-sm text-slate-500">
                                            <p className="flex items-center gap-2"><Mail size={14} /> {shop.email || 'N/A'}</p>
                                            <p className="flex items-center gap-2"><Phone size={14} /> {shop.phone || 'N/A'}</p>
                                            <p className="line-clamp-1 flex items-center gap-2"><MapPin size={14} /> {shop.address || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center text-sm text-slate-400">
                        Không tìm thấy shop phù hợp.
                    </div>
                )}
            </main>
        </div>
    );
};

export default ShopListPage;
