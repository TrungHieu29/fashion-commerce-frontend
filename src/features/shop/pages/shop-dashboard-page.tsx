import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import {
    AlertTriangle,
    BarChart3,
    ChevronRight,
    DollarSign,
    ListOrdered,
    Package2,
    Plus,
    ShoppingCart,
    Users,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useMyShop, useShopDashboard, } from '../hooks/use-shop';

// ==========================================
// ĐỊNH NGHĨA INTERFACES CHO TYPESCRIPT
// ==========================================
interface OrderStatusStat {
    status: string;
    count: number;
}

interface RecentOrder {
    orderShopId: number | string;
    customerName: string | null;
    status: string;
    finalPrice: number;
    createdAt: string | number | Date;
}

interface DashboardData {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    totalCustomers?: number;
    activeProducts: number;
    lowStockProducts: number;
    orderStatusStatistics: OrderStatusStat[];
    recentOrders: RecentOrder[];
}

interface ChartEntry {
    name: string;
    value: number;
    color: string;
}

// ==========================================
// UTILS FUNCTIONS
// ==========================================
const formatCurrency = (value: number) => `${Math.round(value || 0).toLocaleString('vi-VN')}đ`;

const formatDateTime = (value?: string | number | Date) => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';

    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(date);
};

const getOrderStatusStyle = (status: string) => {
    switch (status) {
        case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-200/60';
        case 'CONFIRMED':
        case 'PROCESSING': return 'bg-blue-50 text-blue-600 border-blue-200/60';
        case 'SHIPPED': return 'bg-indigo-50 text-indigo-600 border-indigo-200/60';
        case 'DELIVERED': return 'bg-cyan-50 text-cyan-600 border-cyan-200/60';
        case 'COMPLETED': return 'bg-emerald-50 text-emerald-600 border-emerald-200/60';
        case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-200/60';
        default: return 'bg-slate-50 text-slate-600 border-slate-200/60';
    }
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Chờ xác nhận', color: '#f59e0b' },
    CONFIRMED: { label: 'Đã xác nhận', color: '#3b82f6' },
    PROCESSING: { label: 'Đang xử lý', color: '#6366f1' },
    SHIPPED: { label: 'Đang giao', color: '#4f46e5' },
    DELIVERED: { label: 'Đã giao', color: '#06b6d4' },
    COMPLETED: { label: 'Hoàn thành', color: '#10b981' },
    CANCELLED: { label: 'Đã hủy', color: '#f43f5e' },
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const ShopDashboardPage = () => {
    const { data: shop } = useMyShop();
    const { data, isLoading } = useShopDashboard(shop?.id);
    const dashboard = data as DashboardData | undefined;

    const statusChartData = useMemo<ChartEntry[]>(() => {
        if (!dashboard?.orderStatusStatistics) return [];
        return dashboard.orderStatusStatistics
            .map((item: OrderStatusStat) => ({
                name: STATUS_CONFIG[item.status]?.label || item.status,
                value: item.count,
                color: STATUS_CONFIG[item.status]?.color || '#cbd5e1',
            }))
            .filter((entry: ChartEntry) => entry.value > 0);
    }, [dashboard?.orderStatusStatistics]);

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
                    <p className="text-sm font-medium text-slate-500">Đang đồng bộ dữ liệu hệ thống...</p>
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-slate-50/50">
                <div className="max-w-md text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
                    <h3 className="text-lg font-semibold text-slate-900">Mất kết nối dữ liệu</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-4">Không thể tải thông tin tổng quan của shop lúc này.</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors">
                        Tải lại trang
                    </button>
                </div>
            </div>
        );
    }

    const hasOrderData = dashboard.totalOrders > 0;

    return (
        <div className="min-h-screen bg-[#f8fafc] px-4 py-8 lg:px-8">
            <div className="mx-auto w-full max-w-[1440px] space-y-8">

                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                            <span>Mô hình quản lý</span>
                            <ChevronRight size={12} />
                            <span className="text-slate-600 font-semibold">Dashboard</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">Tổng quan vận hành</h1>
                        <p className="text-sm text-slate-500">Báo cáo hiệu suất kinh doanh cập nhật theo thời gian thực.</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        <Link to="/my-shop/analytics" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900">
                            <BarChart3 size={16} className="text-slate-500" /> Phân tích xu hướng
                        </Link>
                        <Link to="/my-shop/products/add" className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800">
                            <Plus size={16} /> Thêm sản phẩm mới
                        </Link>
                    </div>
                </div>

                {/* KPI Grid Section */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <KpiCard label="Doanh thu tích lũy" value={formatCurrency(dashboard.totalRevenue)} icon={DollarSign} tone="emerald" description="Tổng dòng tiền thành công" />
                    <KpiCard label="Tổng lượng đơn" value={dashboard.totalOrders.toLocaleString('vi-VN')} icon={ShoppingCart} tone="blue" description="Tổng số đơn đã phát sinh" />
                    <KpiCard label="Tiếp nhận chờ xử lý" value={dashboard.pendingOrders.toLocaleString('vi-VN')} icon={ListOrdered} tone="amber" description="Đơn hàng cần duyệt ngay" />
                    <KpiCard label="Khách mua hàng" value={(dashboard.totalCustomers || 0).toLocaleString('vi-VN')} icon={Users} tone="indigo" description="Số lượng khách hàng duy nhất" />
                    <KpiCard label="Sản phẩm hoạt động" value={dashboard.activeProducts.toLocaleString('vi-VN')} icon={Package2} tone="violet" description="Mã hàng đang hiển thị bán" />
                    <KpiCard label="Cảnh báo tồn kho" value={dashboard.lowStockProducts.toLocaleString('vi-VN')} icon={AlertTriangle} tone="rose" description="Sản phẩm chạm mốc sắp hết hàng" />
                </div>

                {/* Bottom Charts & Tables Section */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Trạng thái đơn hàng (Pie Chart) */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Phân loại đơn hàng</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Tỷ lệ phân bổ theo trạng thái</p>
                        </div>

                        <div className="my-6 relative flex items-center justify-center h-[200px]">
                            {hasOrderData ? (
                                <>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusChartData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={3}
                                                stroke="none"
                                            >
                                                {statusChartData.map((_entry: ChartEntry, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={_entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute flex flex-col items-center justify-center text-center">
                                        <span className="text-2xl font-extrabold text-slate-800">{dashboard.totalOrders}</span>
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Đơn vị</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-xs text-slate-400">Không có dữ liệu đơn hàng</div>
                            )}
                        </div>

                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {statusChartData.map((entry: ChartEntry) => {
                                const percentage = dashboard.totalOrders > 0 ? Math.round((entry.value / dashboard.totalOrders) * 100) : 0;
                                return (
                                    <div key={entry.name} className="flex items-center justify-between rounded-xl bg-slate-50/70 px-3 py-2 text-xs border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                                            <span className="font-medium text-slate-600">{entry.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-800">{entry.value} ({percentage}%)</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bảng Đơn Hàng Gần Đây (Chiếm 2/3 không gian màn hình lớn) */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-2 flex flex-col justify-between overflow-hidden">
                        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Giao dịch vừa phát sinh</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Danh sách 5 đơn hàng mới nhất</p>
                            </div>
                            <Link to="/my-shop/orders/confirm" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                Xem tất cả sổ đơn <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        <th className="px-6 py-3.5">Mã số</th>
                                        <th className="px-6 py-3.5">Khách hàng</th>
                                        <th className="px-6 py-3.5">Trạng thái</th>
                                        <th className="px-6 py-3.5 text-right">Thành tiền</th>
                                        <th className="px-6 py-3.5 text-right">Thời gian</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600">
                                    {dashboard.recentOrders?.map((order: RecentOrder) => (
                                        <tr key={order.orderShopId} className="text-xs transition-colors hover:bg-slate-50/50">
                                            <td className="px-6 py-4 font-bold text-slate-900">#{order.orderShopId}</td>
                                            <td className="px-6 py-4 font-medium max-w-[140px] truncate">{order.customerName || 'Khách vãng lai'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[10px] font-bold tracking-wide ${getOrderStatusStyle(order.status)}`}>
                                                    {STATUS_CONFIG[order.status]?.label || order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-slate-900">{formatCurrency(order.finalPrice)}</td>
                                            <td className="px-6 py-4 text-right text-slate-400">{formatDateTime(order.createdAt)}</td>
                                        </tr>
                                    ))}
                                    {(!dashboard.recentOrders || dashboard.recentOrders.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-400">Chưa ghi nhận giao dịch nào gần đây.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// ==========================================
// SUB-COMPONENT: KPI CARD REFACTOR
// ==========================================
const KpiCard = ({ label, value, icon: Icon, tone, description }: { label: string; value: string; icon: any; tone: string; description: string }) => {
    const toneClasses: Record<string, { bg: string; text: string; border: string }> = {
        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'hover:border-emerald-200' },
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'hover:border-blue-200' },
        amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'hover:border-amber-200' },
        indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'hover:border-indigo-200' },
        violet: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'hover:border-violet-200' },
        rose: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'hover:border-rose-200' },
    };

    const currentStyle = toneClasses[tone] || { bg: 'bg-slate-100', text: 'text-slate-600', border: 'hover:border-slate-300' };

    return (
        <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 ${currentStyle.border} hover:shadow-md flex items-center justify-between gap-4`}>
            <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 tracking-wide block">{label}</span>
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 block">{value}</span>
                <span className="text-[11px] text-slate-400 block">{description}</span>
            </div>
            <div className={`rounded-xl ${currentStyle.bg} p-3 ${currentStyle.text} shrink-0`}>
                <Icon size={22} strokeWidth={2.5} />
            </div>
        </div>
    );
};

export default ShopDashboardPage;