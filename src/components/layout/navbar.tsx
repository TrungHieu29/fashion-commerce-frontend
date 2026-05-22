import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

import { useAuthStore } from '@/stores/auth.store';
import { useMyShop } from '@/features/shop/hooks/use-shop';
import { useCart } from '@/features/cart/hooks/use-cart';

export const Navbar = () => {

    const logout =
        useAuthStore((state) => state.logout);

    const isAuthenticated =
        useAuthStore(
            (state) => state.isAuthenticated
        );

    // Lấy dữ liệu giỏ hàng để hiển thị số lượng
    const { data: cart } = useCart(); // Sử dụng useCart để lấy dữ liệu giỏ hàng
    const itemCount = cart?.cartItems?.length || 0; // Đảm bảo lấy từ cartItems

    // Lấy thông tin shop của người dùng
    const { data: myShop, isLoading: isLoadingMyShop } = useMyShop();

    return (
        <nav className="h-[72px] flex items-center bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] sticky top-0 z-50 px-6 md:px-12">
            <div className="container mx-auto flex items-center justify-between max-w-[1280px]">
                <Link to="/" className="text-[20px] font-extrabold tracking-tight text-[#0F0F0F]">
                    FASHION<span className="text-blue-600">.</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#6B7280]">
                    <Link to="/" className="hover:text-[#111111] transition-colors">Home</Link>
                    <Link to="/shops" className="hover:text-[#111111] transition-colors">Stores</Link>
                </div>

                <div className="flex items-center gap-6">
                    {isAuthenticated && (
                        <div className="hidden md:flex items-center">
                            {isLoadingMyShop ? (
                                <span className="text-[14px] text-gray-300">Checking...</span>
                            ) : myShop ? (
                                <Link to="/my-shop" className="text-[14px] text-blue-600 font-bold hover:opacity-80">Kênh người bán</Link>
                            ) : (
                                <Link to="/register-seller" className="text-[14px] font-bold text-[#111111] hover:text-blue-600">Be a Seller</Link>
                            )}
                        </div>
                    )}

                    <Link to="/cart" className="relative text-[#6B7280] hover:text-[#111111] transition-all">
                        <ShoppingCart size={22} strokeWidth={1.5} />
                        {isAuthenticated && itemCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#111111] text-[10px] font-bold text-white border-2 border-white">
                                {itemCount}
                            </span>
                        )}
                    </Link>

                    {isAuthenticated ? (
                        <div className="flex items-center gap-4 border-l border-[#E5E7EB] pl-6">
                            <Link to="/profile" className="w-9 h-9 bg-[#F5F5F5] rounded-full flex items-center justify-center text-[14px] font-bold text-[#111111] hover:bg-[#E5E7EB] transition-all">
                                P
                            </Link>
                            <button
                                onClick={logout}
                                className="text-[14px] font-bold text-[#EF4444] hover:opacity-70"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/register" className="text-[14px] font-medium text-[#6B7280] hover:text-[#111111] transition-colors">
                                Register
                            </Link>
                            <Link
                                to="/login"
                                className="bg-[#111111] text-white px-6 py-2.5 rounded-xl text-[14px] font-bold hover:bg-[#222222] transition-all active:scale-95"
                            >
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};