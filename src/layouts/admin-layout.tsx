import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    BarChart3,
    Boxes,
    Building2,
    ChevronLeft,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    MessageSquareWarning,
    PackageSearch,
    ShieldCheck,
    Tags,
    UsersRound,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

const adminNavItems = [
    { label: 'Tổng quan', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Người dùng', to: '/admin/users', icon: UsersRound },
    { label: 'Cửa hàng', to: '/admin/shops', icon: Building2 },
    { label: 'Sản phẩm', to: '/admin/products', icon: PackageSearch },
    { label: 'Danh mục', to: '/admin/catalog', icon: Tags },
    { label: 'Đơn hàng', to: '/admin/orders', icon: ClipboardList },
    { label: 'Đánh giá', to: '/admin/reviews', icon: MessageSquareWarning },
];

const AdminLayout = () => {
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 border-r border-slate-200 bg-slate-950 text-white lg:block">
                <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                        <ShieldCheck size={22} />
                    </div>
                    <div>
                        <Link to="/admin/dashboard" className="text-lg font-black tracking-tight">FASHION Admin</Link>
                        <p className="text-xs font-semibold text-slate-400">Bảng điều khiển hệ thống</p>
                    </div>
                </div>

                <nav className="space-y-1 px-4 py-5">
                    {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                                        isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                    }`
                                }
                            >
                                <Icon size={18} />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            <div className="lg:pl-72">
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 sm:flex">
                            <ChevronLeft size={16} /> Về trang khách
                        </Link>
                        <div className="lg:hidden">
                            <span className="text-lg font-black text-slate-950">Admin</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-black text-slate-950">{user?.username || 'Quản trị viên'}</p>
                            <p className="text-xs text-slate-400">Quyền quản trị</p>
                        </div>
                        <button onClick={handleLogout} className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">
                            <LogOut size={16} /> Đăng xuất
                        </button>
                    </div>
                </header>

                <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
                    <div className="flex gap-2 overflow-x-auto">
                        {adminNavItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `shrink-0 rounded-xl px-3 py-2 text-sm font-bold ${isActive ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                </div>

                <main className="mx-auto max-w-[1440px] px-4 py-8 lg:px-8">
                    <Outlet />
                </main>
            </div>

            <div className="pointer-events-none fixed bottom-6 right-6 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-500 shadow-sm xl:flex">
                <BarChart3 size={15} className="mr-2 text-blue-600" /> Dữ liệu được đồng bộ từ API backend
            </div>
        </div>
    );
};

export default AdminLayout;
