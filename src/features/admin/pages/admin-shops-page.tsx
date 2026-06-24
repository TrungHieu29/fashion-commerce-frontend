import { useMemo, useState } from 'react';
import { Building2, Mail, MapPin, Phone, Search, Trash2 } from 'lucide-react';
import { AdminEmptyState, AdminPageHeader, AdminStatusBadge } from '../components/admin-ui';
import { useAdminShops, useDeleteAdminShop, useUpdateAdminShopStatus } from '../hooks/use-admin';

const SHOP_STATUS_OPTIONS = ['PENDING', 'ACTIVE', 'INACTIVE', 'BANNED', 'REJECTED'];

const AdminShopsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: shops = [], isLoading } = useAdminShops();
    const deleteShop = useDeleteAdminShop();
    const updateShopStatus = useUpdateAdminShopStatus();

    const filteredShops = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return shops;
        return shops.filter((shop) =>
            [shop.shopName, shop.ownerFullName, shop.email, shop.phone, shop.address, shop.status]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(keyword))
        );
    }, [shops, searchTerm]);

    return (
        <div>
            <AdminPageHeader title="Quản lý cửa hàng" description="Theo dõi toàn bộ shop, chủ sở hữu và thông tin liên hệ." />
            <div className="mb-4 flex max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                <Search size={18} className="text-slate-400" />
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm shop, chủ shop, địa chỉ..." className="h-12 flex-1 bg-transparent text-sm outline-none" />
            </div>

            {isLoading ? <div className="h-96 animate-pulse rounded-2xl bg-white" /> : filteredShops.length ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredShops.map((shop) => (
                        <article key={shop.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-slate-500">
                                    {shop.logo ? <img src={shop.logo} alt={shop.shopName} className="h-full w-full object-cover" /> : <Building2 size={24} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="truncate text-lg font-black text-slate-950">{shop.shopName}</h3>
                                            <p className="mt-1 text-xs font-semibold text-slate-400">Chủ shop: {shop.ownerFullName || 'Chưa rõ'}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <AdminStatusBadge tone={shop.status === 'ACTIVE' ? 'green' : shop.status === 'BANNED' || shop.status === 'REJECTED' ? 'red' : shop.status === 'PENDING' ? 'amber' : 'slate'}>{shop.status || 'UNKNOWN'}</AdminStatusBadge>
                                            <select
                                                value={shop.status || 'ACTIVE'}
                                                onChange={(event) => updateShopStatus.mutate({ shop, status: event.target.value })}
                                                disabled={updateShopStatus.isPending}
                                                className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 outline-none focus:border-blue-500"
                                            >
                                                {SHOP_STATUS_OPTIONS.map((status) => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2 text-sm text-slate-500">
                                        <p className="flex items-center gap-2"><Mail size={14} /> {shop.email || 'Chưa cập nhật'}</p>
                                        <p className="flex items-center gap-2"><Phone size={14} /> {shop.phone || 'Chưa cập nhật'}</p>
                                        <p className="line-clamp-1 flex items-center gap-2"><MapPin size={14} /> {shop.address || 'Chưa cập nhật'}</p>
                                    </div>
                                    <button onClick={() => deleteShop.mutate(shop.id)} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-xs font-black text-red-600 hover:bg-red-50">
                                        <Trash2 size={15} /> Xóa shop
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ) : <AdminEmptyState text="Không tìm thấy shop phù hợp." />}
        </div>
    );
};

export default AdminShopsPage;
