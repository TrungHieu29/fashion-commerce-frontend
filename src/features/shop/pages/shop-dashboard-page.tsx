import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    AlertTriangle,
    BarChart3,
    ChevronRight,
    DollarSign,
    ListOrdered,
    Package2,
    Plus,
    ShoppingCart,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '@/lib/axios';
import { useMyShop } from '../hooks/use-shop';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Chờ xác nhận', color: '#f59e0b' },
    CONFIRMED: { label: 'Đã xác nhận', color: '#3b82f6' },
    PROCESSING: { label: 'Đang xử lý', color: '#6366f1' },
    SHIPPED: { label: 'Đang giao', color: '#4f46e5' },
    DELIVERED: { label: 'Đã giao', color: '#06b6d4' },
    COMPLETED: { label: 'Hoàn thành', color: '#10b981' },
    CANCELLED: { label: 'Đã hủy', color: '#f43f5e' },
    RETURN_REQUESTED: { label: 'Yêu cầu trả hàng', color: '#f97316' },
    RETURNED: { label: 'Đã hoàn trả', color: '#64748b' },
};

const formatCurrency = (value: number) => `${Math.round(value || 0).toLocaleString('vi-VN')}đ`;

const ShopDashboardPage = () => {
    const { data: shop } = useMyShop();

    const { data: orderPage, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['shop-dashboard-orders-fallback', shop?.id],
        queryFn: async () => {
            const response = await api.get(`/api/order-shops/shop/${shop!.id}`, {
                params: { page: 0, size: 100, sort: 'id,desc' }
            });
            return response.data;
        },
        enabled: !!shop?.id,
        retry: false,
        refetchInterval: 30000,
    });

    const { data: productPage, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['shop-dashboard-products-fallback', shop?.id],
        queryFn: async () => {
            const response = await api.get(`/api/products/shop/${shop!.id}`, {
                params: { page: 0, size: 100, sort: 'id,desc' }
            });
            return response.data;
        },
        enabled: !!shop?.id,
        retry: false,
        refetchInterval: 30000,
    });

    const orders = orderPage?.content || [];
    const products = productPage?.content || [];

    const dashboard = useMemo(() => {
        const statusMap = new Map<string, number>();
        const successfulStatuses = new Set(['COMPLETED', 'DELIVERED']);
        const totalRevenue = orders
            .filter((order: any) => successfulStatuses.has(order.status))
            .reduce((sum: number, order: any) => sum + (order.finalPrice || 0), 0);
        const pendingOrders = orders.filter((order: any) => order.status === 'PENDING').length;
        const lowStockProducts = products.filter((product: any) => product.status === 'LOW_STOCK').length;

        orders.forEach((order: any) => {
            statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1);
        });

        return {
            totalRevenue,
            totalOrders: orderPage?.totalElements || orders.length,
            pendingOrders,
            activeProducts: productPage?.totalElements || products.length,
            lowStockProducts,
            recentOrders: orders.slice(0, 5),
            orderStatusStatistics: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
        };
    }, [orders, orderPage?.totalElements, products, productPage?.totalElements]);

    const chartData = dashboard.orderStatusStatistics
        .map((item) => ({
            name: STATUS_CONFIG[item.status]?.label || item.status,
            value: item.count,
            color: STATUS_CONFIG[item.status]?.color || '#cbd5e1',
        }))
        .filter(item => item.value > 0);

    if (isLoadingOrders || isLoadingProducts) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] px-4 py-8 lg:px-8">
            <div className="mx-auto w-full max-w-[1440px] space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                            <span>Kênh người bán</span>
                            <ChevronRight size={12} />
                            <span className="text-slate-700">Tổng quan</span>
                        </div>
                        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Tổng quan vận hành</h1>
                        <p className="text-sm text-slate-500">Dữ liệu được tổng hợp từ đơn hàng và sản phẩm của shop.</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <Link to="/my-shop/analytics" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                            <BarChart3 size={16} /> Phân tích
                        </Link>
                        <Link to="/my-shop/products/add" className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white shadow-sm hover:bg-slate-800">
                            <Plus size={16} /> Thêm sản phẩm
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard label="Doanh thu tạm tính" value={formatCurrency(dashboard.totalRevenue)} icon={DollarSign} tone="emerald" />
                    <KpiCard label="Tổng đơn hàng" value={dashboard.totalOrders.toLocaleString('vi-VN')} icon={ShoppingCart} tone="blue" />
                    <KpiCard label="Chờ xác nhận" value={dashboard.pendingOrders.toLocaleString('vi-VN')} icon={ListOrdered} tone="amber" />
                    <KpiCard label="Sản phẩm đang bán" value={dashboard.activeProducts.toLocaleString('vi-VN')} icon={Package2} tone="indigo" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-base font-black text-slate-950">Trạng thái đơn hàng</h3>
                        <div className="relative my-6 flex h-[220px] min-h-[220px] min-w-0 items-center justify-center">
                            {chartData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={86} paddingAngle={3} stroke="none">
                                                {chartData.map((entry) => (
                                                    <Cell key={entry.name} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute text-center">
                                        <p className="text-2xl font-black text-slate-900">{dashboard.totalOrders}</p>
                                        <p className="text-[10px] font-bold uppercase text-slate-400">Đơn</p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-slate-400">Chưa có đơn hàng</div>
                            )}
                        </div>
                        <div className="space-y-2">
                            {chartData.map((entry) => (
                                <div key={entry.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                                    <span className="flex items-center gap-2 font-semibold text-slate-600">
                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                        {entry.name}
                                    </span>
                                    <span className="font-black text-slate-900">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-slate-100 p-5">
                            <div>
                                <h3 className="text-base font-black text-slate-950">Đơn hàng gần đây</h3>
                                <p className="text-xs text-slate-400">5 đơn mới nhất của shop</p>
                            </div>
                            <Link to="/my-shop/orders/confirm" className="text-xs font-black text-blue-600">Xem tất cả</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[11px] font-black uppercase text-slate-400">
                                    <tr>
                                        <th className="px-5 py-3">Mã đơn</th>
                                        <th className="px-5 py-3">Đơn shop</th>
                                        <th className="px-5 py-3">Trạng thái</th>
                                        <th className="px-5 py-3 text-right">Giá trị</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {dashboard.recentOrders.length > 0 ? dashboard.recentOrders.map((order: any) => (
                                        <tr key={order.id}>
                                            <td className="px-5 py-4 font-black text-slate-900">#{order.orderId}</td>
                                            <td className="px-5 py-4 text-slate-500">#{order.id}</td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">{STATUS_CONFIG[order.status]?.label || order.status}</span>
                                            </td>
                                            <td className="px-5 py-4 text-right font-black text-blue-600">{formatCurrency(order.finalPrice)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-16 text-center text-sm text-slate-400">Chưa có đơn hàng nào.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {dashboard.lowStockProducts > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                        <AlertTriangle size={18} />
                        Có {dashboard.lowStockProducts} sản phẩm cần kiểm tra tồn kho.
                    </div>
                )}
            </div>
        </div>
    );
};

const KpiCard = ({ label, value, icon: Icon, tone }: { label: string; value: string; icon: any; tone: 'emerald' | 'blue' | 'amber' | 'indigo' }) => {
    const tones = {
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        amber: 'bg-amber-50 text-amber-600',
        indigo: 'bg-indigo-50 text-indigo-600',
    };

    return (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
            </div>
            <div className={`rounded-xl p-3 ${tones[tone]}`}>
                <Icon size={22} />
            </div>
        </div>
    );
};

export default ShopDashboardPage;
