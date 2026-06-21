import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { AdminEmptyState, AdminPageHeader, AdminStatusBadge, AdminTableShell } from '../components/admin-ui';
import { useAdminOrderShops } from '../hooks/use-admin';

const formatCurrency = (value: number) => `${Math.round(value || 0).toLocaleString('vi-VN')}đ`;

const AdminOrdersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: orders = [], isLoading } = useAdminOrderShops();

    const filteredOrders = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        return [...orders]
            .sort((a, b) => (b.id || 0) - (a.id || 0))
            .filter((order) => !keyword || [order.id, order.orderId, order.shopName, order.status].some((value) => String(value).toLowerCase().includes(keyword)));
    }, [orders, searchTerm]);

    return (
        <div>
            <AdminPageHeader title="Quản lý đơn hàng" description="Tổng hợp các đơn shop từ toàn bộ gian hàng trong hệ thống." />
            <div className="mb-4 flex max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                <Search size={18} className="text-slate-400" />
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm mã đơn, shop, trạng thái..." className="h-12 flex-1 bg-transparent text-sm outline-none" />
            </div>

            {isLoading ? <div className="h-96 animate-pulse rounded-2xl bg-white" /> : filteredOrders.length ? (
                <AdminTableShell>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-black uppercase text-slate-400">
                            <tr>
                                <th className="px-5 py-3">Mã đơn shop</th>
                                <th className="px-5 py-3">Mã đơn tổng</th>
                                <th className="px-5 py-3">Shop</th>
                                <th className="px-5 py-3">Trạng thái</th>
                                <th className="px-5 py-3">Số sản phẩm</th>
                                <th className="px-5 py-3 text-right">Thanh toán</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-5 py-4 font-black text-slate-950">#{order.id}</td>
                                    <td className="px-5 py-4 text-slate-500">#{order.orderId}</td>
                                    <td className="px-5 py-4 text-slate-700">{order.shopName}</td>
                                    <td className="px-5 py-4"><AdminStatusBadge tone={order.status === 'COMPLETED' ? 'green' : order.status === 'CANCELLED' ? 'red' : 'amber'}>{order.status}</AdminStatusBadge></td>
                                    <td className="px-5 py-4 text-slate-600">{order.orderItems?.length || 0}</td>
                                    <td className="px-5 py-4 text-right font-black text-blue-600">{formatCurrency(order.finalPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </AdminTableShell>
            ) : <AdminEmptyState text="Chưa có đơn hàng phù hợp." />}
        </div>
    );
};

export default AdminOrdersPage;
