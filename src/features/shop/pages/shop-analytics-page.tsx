import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    ChevronRight,
    DollarSign,
    TrendingUp,
    Wallet,
    Calendar,
    ShoppingBag,
    Percent,
    Download
} from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { useMyShop, useShopAnalytics } from '../hooks/use-shop';
import { exportToExcel } from '@/utils/export';

// ==========================================
// INTERFACES CHUẨN THƯƠNG MẠI ĐIỆN TỬ
// ==========================================
interface TimelineDataDto {
    label: string; // Có thể là Giờ (00:00, 01:00) hoặc Ngày (12/04, 13/04) tùy bộ lọc
    revenue: number;
    orderCount: number;
}

interface ShopAnalyticsResponseDto {
    totalRevenue: number;
    averageOrderValue: number;
    growthRate: number;
    totalOrders: number;
    conversionRate: number; // Tỷ lệ chuyển đổi %
    timelineRevenue: TimelineDataDto[];
}

const formatCurrency = (value: number) => `${Math.round(value || 0).toLocaleString('vi-VN')}đ`;

const ShopAnalyticsPage = () => {
    // 1. Bộ lọc thời gian chuẩn vận hành Shop
    const [timePeriod, setTimePeriod] = useState<'today' | '7days' | '30days'>('today');

    // 2. Lấy thông tin shop hiện tại
    const { data: shop, isLoading: isShopLoading } = useMyShop();

    // 3. Gọi API thực tế - ÉP BUỘC chỉ chạy khi đã có shop.id và truyền kèm timePeriod lên Backend
    const { data, isLoading: isAnalyticsLoading, isError, refetch } = useShopAnalytics(
        shop?.id,
        timePeriod
    );

    const analytics = data as ShopAnalyticsResponseDto | undefined;

    const chartData = useMemo(() => {
        return analytics?.timelineRevenue || [];
    }, [analytics?.timelineRevenue]);

    // Hàm xử lý xuất dữ liệu ra file Excel (.xlsx) qua Utils
    const handleExport = () => {
        if (!analytics || !analytics.timelineRevenue || analytics.timelineRevenue.length === 0) {
            return;
        }

        // 1. Định dạng lại mảng dữ liệu thô để đưa vào Excel cho người dùng dễ đọc
        const excelData = analytics.timelineRevenue.map((item) => ({
            time: item.label,
            revenue: item.revenue,
            orders: item.orderCount
        }));

        // 2. Gọi hàm export từ utils
        exportToExcel({
            data: excelData,
            fileName: `Bao_Cao_Doanh_Thu_Shop_${timePeriod}`,
            sheetName: 'Doanh Thu',
            headers: ['Mốc Thời Gian', 'Doanh Thu (VNĐ)', 'Số Lượng Đơn Hàng']
        });
    };

    // Trạng thái Loading kết hợp cả Shop và Analytics
    if (isShopLoading || isAnalyticsLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
                    <p className="text-sm font-medium text-slate-500">Đang tính toán dòng tiền và hiệu suất chuyển đổi...</p>
                </div>
            </div>
        );
    }

    // Xử lý khi lỗi hoặc không tìm thấy thông tin cấu hình dữ liệu
    if (isError || !shop) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-slate-50/50">
                <div className="max-w-md text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-rose-600">Lỗi kết nối dữ liệu</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-4">Không thể đồng bộ báo cáo tài chính từ Backend. Vui lòng thử lại.</p>
                    <button onClick={() => refetch()} className="mr-2 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors">
                        Thử lại
                    </button>
                    <Link to="/my-shop/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors">
                        <ArrowLeft size={16} /> Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] px-4 py-8 lg:px-8">
            <div className="mx-auto w-full max-w-[1440px] space-y-8">

                {/* HEADER & TABS ĐIỀU HƯỚNG THỜI GIAN */}
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                            <Link to="/my-shop/dashboard" className="hover:text-slate-600 transition-colors">Kênh Người Bán</Link>
                            <ChevronRight size={12} />
                            <span className="text-slate-600 font-semibold">Phân tích doanh thu</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 lg:text-3xl uppercase">Báo cáo hiệu suất kinh doanh</h1>
                    </div>

                    {/* CỤM ĐIỀU KHIỂN: TAB THỜI GIAN & NÚT XUẤT FILE EXCEL */}
                    <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
                        {/* Bộ bấm chuyển đổi Tab thời gian kiểu Shopee */}
                        <div className="flex items-center p-1 bg-slate-200/70 rounded-xl w-fit">
                            <button
                                onClick={() => setTimePeriod('today')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timePeriod === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                Hôm nay
                            </button>
                            <button
                                onClick={() => setTimePeriod('7days')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timePeriod === '7days' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                7 ngày qua
                            </button>
                            <button
                                onClick={() => setTimePeriod('30days')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timePeriod === '30days' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                30 ngày qua
                            </button>
                        </div>

                        {/* NÚT XUẤT EXCEL THỰC TẾ */}
                        <button
                            onClick={handleExport}
                            disabled={!chartData.length}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-xs font-bold rounded-xl shadow-sm transition-all h-[36px]"
                        >
                            <Download size={14} />
                            Xuất Excel
                        </button>
                    </div>
                </div>

                {/* GRID 4 CHỈ SỐ DOANH THU & CHUYỂN ĐỔI CHUẨN SÀN LỚN */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    {/* Doanh thu thuần */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-32">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh thu thuần</span>
                            <div className="rounded-lg bg-slate-900 p-2 text-white"><DollarSign size={16} /></div>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-900 block">
                                {formatCurrency(analytics?.totalRevenue || 0)}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-0.5">
                                <TrendingUp size={12} />
                                <span>+{analytics?.growthRate || 0}% so với kỳ trước</span>
                            </div>
                        </div>
                    </div>

                    {/* Tổng số đơn hàng thành công */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-32">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đơn hàng thành công</span>
                            <div className="rounded-lg bg-emerald-50 text-emerald-600 p-2 border border-emerald-100"><ShoppingBag size={16} /></div>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-900 block">
                                {(analytics?.totalOrders || 0).toLocaleString('vi-VN')} đơn
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-1">Đơn đã thanh toán / hoàn thành</span>
                        </div>
                    </div>

                    {/* Giá trị trung bình đơn hàng (AOV) */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-32">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giá trị đơn TB (AOV)</span>
                            <div className="rounded-lg bg-indigo-50 text-indigo-600 p-2 border border-indigo-100"><Wallet size={16} /></div>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-900 block">
                                {formatCurrency(analytics?.averageOrderValue || 0)}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-1">Sức mua trung bình trên 1 khách</span>
                        </div>
                    </div>

                    {/* Tỷ lệ chuyển đổi giỏ hàng */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-32">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ chuyển đổi</span>
                            <div className="rounded-lg bg-amber-50 text-amber-600 p-2 border border-amber-100"><Percent size={16} /></div>
                        </div>
                        <div>
                            <span className="text-2xl font-black text-slate-900 block">
                                {analytics?.conversionRate || 0}%
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-1">Lượt click biến thành đơn hàng thực tế</span>
                        </div>
                    </div>
                </div>

                {/* ĐỒ THỊ TRỰC QUAN HÓA THEO CHU KỲ TIME PERIOD */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Biểu đồ diện tích: Dòng tiền doanh thu */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Xu hướng dòng tiền</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Biểu diễn chi tiết biến động doanh thu theo mốc thời gian đã chọn</p>
                            </div>
                            <div className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                                <span>Doanh thu ({timePeriod === 'today' ? 'Giờ' : 'Ngày'})</span>
                            </div>
                        </div>

                        <div className="h-[320px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v}`} />
                                        <Tooltip
                                            formatter={(value: any) => [formatCurrency(Number(value)), 'Doanh thu']}
                                            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-slate-400">Không có dữ liệu phát sinh dòng tiền</div>
                            )}
                        </div>
                    </div>

                    {/* Biểu đồ cột: Sản lượng đơn hàng chốt thành công */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Tần suất chốt đơn</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Phân bổ khối lượng đơn hàng thành công</p>
                        </div>

                        <div className="h-[220px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            formatter={(value: any) => [`${value} đơn`, 'Sản lượng']}
                                            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                                        />
                                        <Bar dataKey="orderCount" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-xs text-slate-400">Không có đơn hàng phát sinh</div>
                            )}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                            <Calendar className="text-blue-500 shrink-0 mt-0.5" size={16} />
                            <div className="text-xs text-slate-500 leading-normal">
                                <span className="font-bold text-slate-700 block">Chu kỳ thanh quyết toán</span>
                                Tiền từ đơn hàng thành công sẽ tự động đối soát chuyển về Ví Seller Center vào Thứ 2 tuần kế tiếp.
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ShopAnalyticsPage;