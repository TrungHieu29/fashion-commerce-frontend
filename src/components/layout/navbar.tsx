import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useMyShop } from '@/features/shop/hooks/use-shop';
import { useCart } from '@/features/cart/hooks/use-cart';

export const Navbar = () => {
    const logout = useAuthStore((state) => state.logout);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.roles?.some((role) => role === 'ADMIN' || role === 'ROLE_ADMIN') || false;

    const { data: cart } = useCart();
    const itemCount = cart?.cartItems?.length || 0;
    const { data: myShop, isLoading: isLoadingMyShop } = useMyShop();

    return (
        <nav className="sticky top-0 z-50 flex h-[72px] items-center border-b border-[#E5E7EB] bg-white/80 px-6 backdrop-blur-md md:px-12">
            <div className="container mx-auto flex max-w-[1280px] items-center justify-between">
                <Link to="/" className="text-[20px] font-extrabold tracking-tight text-[#0F0F0F]">
                    FASHION<span className="text-blue-600">.</span>
                </Link>

                <div className="hidden items-center gap-8 text-[15px] font-medium text-[#6B7280] md:flex">
                    <Link to="/" className="transition-colors hover:text-[#111111]">Trang chủ</Link>
                    <Link to="/shops" className="transition-colors hover:text-[#111111]">Cửa hàng</Link>
                    {isAuthenticated && isAdmin && (
                        <Link to="/admin" className="font-bold text-blue-600 transition-colors hover:text-blue-700">Quản trị</Link>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    {isAuthenticated && (
                        <div className="hidden items-center md:flex">
                            {isLoadingMyShop ? (
                                <span className="text-[14px] text-gray-300">Đang kiểm tra...</span>
                            ) : myShop ? (
                                <ShopEntry status={myShop.status} />
                            ) : (
                                <Link to="/register-seller" className="text-[14px] font-bold text-[#111111] hover:text-blue-600">Bán hàng</Link>
                            )}
                        </div>
                    )}

                    <Link to="/cart" className="relative text-[#6B7280] transition-all hover:text-[#111111]">
                        <ShoppingCart size={22} strokeWidth={1.5} />
                        {isAuthenticated && itemCount > 0 && (
                            <span className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#111111] text-[10px] font-bold text-white">
                                {itemCount}
                            </span>
                        )}
                    </Link>

                    {isAuthenticated ? (
                        <div className="flex items-center gap-4 border-l border-[#E5E7EB] pl-6">
                            <Link to="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F5] text-[14px] font-bold text-[#111111] transition-all hover:bg-[#E5E7EB]">
                                P
                            </Link>
                            <button onClick={logout} className="text-[14px] font-bold text-[#EF4444] hover:opacity-70">
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/register" className="text-[14px] font-medium text-[#6B7280] transition-colors hover:text-[#111111]">
                                Đăng ký
                            </Link>
                            <Link to="/login" className="rounded-xl bg-[#111111] px-6 py-2.5 text-[14px] font-bold text-white transition-all hover:bg-[#222222] active:scale-95">
                                Đăng nhập
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

const ShopEntry = ({ status }: { status?: string }) => {
    if (status === 'ACTIVE') {
        return <Link to="/my-shop" className="text-[14px] font-bold text-blue-600 hover:opacity-80">Kênh người bán</Link>;
    }

    if (status === 'PENDING') {
        return <span className="rounded-full bg-amber-50 px-3 py-1 text-[12px] font-black text-amber-700">Shop chờ duyệt</span>;
    }

    if (status === 'REJECTED') {
        return <Link to="/my-shop" className="text-[12px] font-black text-red-600 hover:underline">Đăng ký shop bị từ chối</Link>;
    }

    if (status === 'INACTIVE') {
        return <Link to="/my-shop" className="text-[12px] font-black text-slate-500 hover:underline">Shop tạm ngưng</Link>;
    }

    if (status === 'BANNED') {
        return <Link to="/my-shop" className="text-[12px] font-black text-red-600 hover:underline">Shop bị khóa</Link>;
    }

    return <Link to="/register-seller" className="text-[14px] font-bold text-[#111111] hover:text-blue-600">Bán hàng</Link>;
};
