import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useMyShop } from '@/features/shop/hooks/use-shop';
import {
    LayoutDashboard,
    ShoppingBag,
    PackagePlus,
    ClipboardList,
    BarChart3,
    Store,
    Settings,
    Bell,
    ChevronDown,
    Home,
    Tag,
    Truck,
    History
} from 'lucide-react';

const SellerLayout = () => {
    const { data: shop } = useMyShop();
    const location = useLocation();

    const menuGroups = [
        // ==========================================
        // NHÓM BÁO CÁO TÀI CHÍNH TÁCH BIỆT MỚI
        // ==========================================
        {
            title: 'Phân Tích Kinh Doanh',
            items: [
                {
                    label: 'Tổng quan Dashboard',
                    icon: <LayoutDashboard size={18} />,
                    to: '/my-shop/dashboard',
                    active: location.pathname === '/my-shop/dashboard'
                },
                {
                    label: 'Phân tích doanh thu',
                    icon: <BarChart3 size={18} />,
                    to: '/my-shop/analytics', // Đường dẫn dẫn tới trang báo cáo bạn vừa tạo
                    active: location.pathname === '/my-shop/analytics'
                },
            ]
        },
        {
            title: 'Vận chuyển',
            items: [
                { label: 'Quản lý vận chuyển', icon: <Truck size={18} />, to: '/my-shop/shipping', active: location.pathname === '/my-shop/shipping' },
            ]
        },
        {
            title: 'Quản lý Đơn Hàng',
            items: [
                { label: 'Xác nhận đơn hàng', icon: <ClipboardList size={18} />, to: '/my-shop/orders/confirm', active: location.pathname === '/my-shop/orders/confirm' },
                { label: 'Lịch sử đơn hàng', icon: <History size={18} />, to: '/my-shop/orders/history', active: location.pathname === '/my-shop/orders/history' },
            ]
        },
        {
            title: 'Quản lý Sản Phẩm',
            items: [
                { label: 'Tất cả sản phẩm', icon: <ShoppingBag size={18} />, to: '/my-shop/products', active: location.pathname === '/my-shop/products' },
                { label: 'Thêm sản phẩm', icon: <PackagePlus size={18} />, to: '/my-shop/products/add', active: location.pathname === '/my-shop/products/add' },
                { label: 'Quản lý giảm giá', icon: <Tag size={18} />, to: '/my-shop/discounts', active: location.pathname === '/my-shop/discounts' },
            ]
        },
        {
            title: 'Quản lý Shop',
            items: [
                { label: 'Hồ sơ Shop', icon: <Store size={18} />, to: '/my-shop/profile', active: location.pathname === '/my-shop/profile' },
                { label: 'Thiết lập Shop', icon: <Settings size={18} />, to: '#' },
            ]
        }
    ];

    return (
        <div className="flex min-h-screen bg-[#F5F5F5] font-inter">
            {/* Sidebar chuyên biệt */}
            <aside className="w-[240px] bg-white border-r border-[#E5E7EB] fixed h-full overflow-y-auto z-50 shadow-sm">
                <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB] bg-white sticky top-0">
                    <Link to="/" className="text-xl font-black tracking-tighter text-[#0F0F0F]">
                        SELLER<span className="text-blue-600">HUB</span>
                    </Link>
                </div>

                <div className="py-4 px-3 space-y-6">
                    {menuGroups.map((group, idx) => (
                        <div key={idx} className="space-y-1">
                            <h3 className="px-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">
                                {group.title}
                            </h3>
                            {group.items.map((item, i) => (
                                <Link
                                    key={i}
                                    to={item.to}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all ${item.active
                                        ? 'bg-[#111111] text-white shadow-md'
                                        : 'text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111111]'
                                        }`}
                                >
                                    <span className={item.active ? 'text-white' : 'text-[#9CA3AF]'}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 ml-[240px]">
                {/* Seller Topbar */}
                <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#6B7280]">Cửa hàng:</span>
                        <span className="text-sm font-bold text-[#111111] bg-[#F3F4F6] px-3 py-1 rounded-full border border-[#E5E7EB]">
                            {shop?.shopName || 'Đang tải...'}
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#111111] transition-colors"
                        >
                            <Home size={18} />
                            Quay về trang chủ
                        </Link>
                        <button className="text-[#6B7280] hover:text-[#111111] transition-colors relative">
                            <Bell size={20} strokeWidth={1.5} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-2 pl-6 border-l border-[#E5E7EB] cursor-pointer group">
                            <div className="w-8 h-8 bg-[#111111] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {shop?.shopName?.charAt(0) || 'S'}
                            </div>
                            <ChevronDown size={14} className="text-[#9CA3AF] group-hover:text-[#111111]" />
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-[1440px]"> {/* Tăng max-w từ 1200px lên 1440px để đồ thị hiển thị rộng rãi, đẹp hơn */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SellerLayout;