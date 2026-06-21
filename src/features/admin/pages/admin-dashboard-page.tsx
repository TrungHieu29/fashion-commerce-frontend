import { Building2, ClipboardList, DollarSign, PackageSearch, Star, Tags, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminPageHeader, AdminStatCard, AdminStatusBadge, AdminTableShell } from '../components/admin-ui';
import { useAdminOverview } from '../hooks/use-admin';

const formatCurrency = (value: number) => `${Math.round(value || 0).toLocaleString('vi-VN')}đ`;

const AdminDashboardPage = () => {
    const { data, isLoading } = useAdminOverview();

    if (isLoading) {
        return <div className="h-[60vh] animate-pulse rounded-3xl bg-white" />;
    }

    const recentOrders = [...(data?.orders || [])].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 8);
    const topProducts = [...(data?.products || [])].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);

    return (
        <div>
            <AdminPageHeader title="Tổng quan quản trị" description="Theo dõi nhanh người dùng, shop, sản phẩm, đơn hàng và dữ liệu vận hành của hệ thống." />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <AdminStatCard label="Người dùng" value={(data?.users.length || 0).toLocaleString('vi-VN')} icon={UsersRound} tone="bg-blue-50 text-blue-600" />
                <AdminStatCard label="Shop đang có" value={(data?.shops.length || 0).toLocaleString('vi-VN')} icon={Building2} tone="bg-emerald-50 text-emerald-600" />
                <AdminStatCard label="Sản phẩm" value={(data?.totalProducts || 0).toLocaleString('vi-VN')} icon={PackageSearch} tone="bg-indigo-50 text-indigo-600" />
                <AdminStatCard label="Doanh thu ghi nhận" value={formatCurrency(data?.revenue || 0)} icon={DollarSign} tone="bg-amber-50 text-amber-600" />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-black text-slate-950">Tài nguyên hệ thống</h2>
                        <Tags size={18} className="text-slate-400" />
                    </div>
                    <div className="space-y-3">
                        <MetricRow label="Danh mục" value={data?.categories.length || 0} />
                        <MetricRow label="Thương hiệu" value={data?.brands.length || 0} />
                        <MetricRow label="Đánh giá" value={data?.reviews.length || 0} />
                        <MetricRow label="Đơn chờ xác nhận" value={data?.pendingOrders || 0} />
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-black text-slate-950">Sản phẩm nổi bật</h2>
                        <Link to="/admin/products" className="text-xs font-black text-blue-600">Quản lý sản phẩm</Link>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {topProducts.map((product) => (
                            <div key={product.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <p className="line-clamp-1 text-sm font-black text-slate-950">{product.productName}</p>
                                <p className="mt-1 text-xs text-slate-500">{product.shopName || 'Chưa có shop'} · {product.categoryName || 'Chưa phân loại'}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-sm font-black text-blue-600">{formatCurrency(product.finalPrice || 0)}</span>
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600"><Star size={13} /> {product.rating || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-base font-black text-slate-950">Đơn shop gần đây</h2>
                    <Link to="/admin/orders" className="inline-flex items-center gap-2 text-xs font-black text-blue-600"><ClipboardList size={14} /> Xem tất cả</Link>
                </div>
                <AdminTableShell>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-black uppercase text-slate-400">
                            <tr>
                                <th className="px-5 py-3">Mã đơn shop</th>
                                <th className="px-5 py-3">Shop</th>
                                <th className="px-5 py-3">Trạng thái</th>
                                <th className="px-5 py-3 text-right">Giá trị</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-5 py-4 font-black text-slate-950">#{order.id}</td>
                                    <td className="px-5 py-4 text-slate-600">{order.shopName}</td>
                                    <td className="px-5 py-4"><AdminStatusBadge>{order.status}</AdminStatusBadge></td>
                                    <td className="px-5 py-4 text-right font-black text-blue-600">{formatCurrency(order.finalPrice || 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </AdminTableShell>
            </section>
        </div>
    );
};

const MetricRow = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
        <span className="text-sm font-bold text-slate-500">{label}</span>
        <span className="text-lg font-black text-slate-950">{value.toLocaleString('vi-VN')}</span>
    </div>
);

export default AdminDashboardPage;
