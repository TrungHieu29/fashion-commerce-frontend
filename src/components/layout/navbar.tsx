import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

import { useAuthStore } from '@/stores/auth.store';
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

    return (
        <nav className="flex items-center justify-center gap-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
            <Link to="/" className="font-bold hover:text-blue-600">
                Home
            </Link>

            {' | '}

            <Link to="/cart" className="relative flex items-center gap-1 hover:text-blue-600">
                <ShoppingCart size={20} />
                <span>Giỏ hàng</span>
                {isAuthenticated && itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {itemCount}
                    </span>
                )}
            </Link>

            {' | '}
            <Link to="/profile" className="hover:text-blue-600">
                Profile
            </Link>

            {' | '}

            {

                isAuthenticated ? (
                    <button
                        onClick={logout}
                        className="text-red-500 hover:font-bold transition-all"
                    >
                        Logout
                    </button>
                ) : (
                    <Link to="/login" className="hover:text-blue-600">
                        Login
                    </Link>
                )
            }
        </nav>
    );
};