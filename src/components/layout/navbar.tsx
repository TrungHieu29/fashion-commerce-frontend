import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Menu, ShoppingBag, ShoppingCart, UserRound, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useMyShop } from '@/features/shop/hooks/use-shop';
import { useCart } from '@/features/cart/hooks/use-cart';
import { useWishlist } from '@/features/wishlist/hooks/use-wishlist';
import { NotificationBell } from '@/features/notification/components/notification-bell';

export const Navbar = () => {
    const logout = useAuthStore((state) => state.logout);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.roles?.some((role) => role === 'ADMIN' || role === 'ROLE_ADMIN') || false;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [cartPulse, setCartPulse] = useState(false);
    const [wishlistPulse, setWishlistPulse] = useState(false);

    const { data: cart } = useCart();
    const itemCount = cart?.cartItems?.length || 0;
    const { data: wishlist = [] } = useWishlist();
    const wishlistCount = wishlist.length;
    const { data: myShop, isLoading: isLoadingMyShop } = useMyShop();

    const handleLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        setIsMenuOpen(false);
    };

    useEffect(() => {
        const handleCartUpdated = () => {
            setCartPulse(true);
            window.setTimeout(() => setCartPulse(false), 900);
        };
        const handleWishlistUpdated = () => {
            setWishlistPulse(true);
            window.setTimeout(() => setWishlistPulse(false), 900);
        };

        window.addEventListener('cart-updated', handleCartUpdated);
        window.addEventListener('wishlist-updated', handleWishlistUpdated);
        return () => {
            window.removeEventListener('cart-updated', handleCartUpdated);
            window.removeEventListener('wishlist-updated', handleWishlistUpdated);
        };
    }, []);

    return (
        <>
            <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/88 backdrop-blur-xl">
                <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
                    <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-[0.18em] text-zinc-950">
                        <ShoppingBag size={21} strokeWidth={1.7} />
                        Voguish
                    </Link>

                    <div className="hidden items-center gap-9 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500 lg:flex">
                        <Link to="/" className="transition-colors hover:text-zinc-950">Home</Link>
                        <Link to="/shops" className="transition-colors hover:text-zinc-950">Shop</Link>
                        {isAuthenticated && isAdmin && (
                            <Link to="/admin" className="text-[#A68545] transition-colors hover:text-zinc-950">Admin</Link>
                        )}
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">
                        {isAuthenticated && (
                            <div className="hidden items-center lg:flex">
                                {isLoadingMyShop ? (
                                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">Đang kiểm tra</span>
                                ) : myShop ? (
                                    <ShopEntry status={myShop.status} />
                                ) : (
                                    <Link to="/register-seller" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-950 hover:text-[#A68545]">Bán hàng</Link>
                                )}
                            </div>
                        )}

                        {isAuthenticated && <NotificationBell />}

                        {isAuthenticated && (
                            <Link to="/wishlist" className="flex h-10 w-10 items-center justify-center text-zinc-600 transition-all hover:text-zinc-950" aria-label="Sản phẩm yêu thích">
                                <span className={`relative flex h-10 w-10 items-center justify-center ${wishlistPulse ? 'animate-bounce text-[#A68545]' : wishlistCount > 0 ? 'text-zinc-950' : ''}`}>
                                    <Heart size={21} strokeWidth={1.6} fill={wishlistCount > 0 ? 'currentColor' : 'none'} />
                                    {wishlistCount > 0 && (
                                        <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-zinc-950 px-1 text-[10px] font-bold text-white">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </span>
                            </Link>
                        )}

                        <Link to="/cart" className={`relative flex h-10 w-10 items-center justify-center text-zinc-600 transition-all hover:text-zinc-950 ${cartPulse ? 'animate-bounce text-[#A68545]' : ''}`} aria-label="Giỏ hàng">
                            <ShoppingCart size={21} strokeWidth={1.6} />
                            {isAuthenticated && itemCount > 0 && (
                                <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-zinc-950 px-1 text-[10px] font-bold text-white">
                                    {itemCount}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            <div className="hidden items-center gap-3 sm:flex">
                                <Link to="/profile" className="flex h-10 w-10 items-center justify-center border border-zinc-200 text-zinc-950 transition hover:border-zinc-950" aria-label="Tài khoản">
                                    <UserRound size={18} />
                                </Link>
                                <button onClick={() => setShowLogoutConfirm(true)} className="h-10 border border-zinc-950 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-950 transition hover:bg-zinc-950 hover:text-white">
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <div className="hidden items-center gap-3 sm:flex">
                                <Link to="/register" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 transition-colors hover:text-zinc-950">
                                    Đăng ký
                                </Link>
                                <Link to="/login" className="h-10 bg-zinc-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#A68545]">
                                    Đăng nhập
                                </Link>
                            </div>
                        )}

                        <button onClick={() => setIsMenuOpen(true)} className="flex h-10 w-10 items-center justify-center border border-zinc-200 text-zinc-950 lg:hidden" aria-label="Mở menu">
                            <Menu size={21} />
                        </button>
                    </div>
                </div>
            </nav>

            {isMenuOpen && (
                <div className="fixed inset-0 z-[70] bg-zinc-950/45 backdrop-blur-sm lg:hidden">
                    <div className="ml-auto flex h-full w-full max-w-sm flex-col bg-white p-5 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-lg font-semibold tracking-[0.18em] text-zinc-950">
                                <ShoppingBag size={21} />
                                Voguish
                            </Link>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-zinc-100" aria-label="Đóng menu">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-10 flex flex-col gap-5 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-600">
                            <MobileLink to="/" onClick={() => setIsMenuOpen(false)}>Home</MobileLink>
                            <MobileLink to="/shops" onClick={() => setIsMenuOpen(false)}>Shop</MobileLink>
                            {isAuthenticated && <MobileLink to="/wishlist" onClick={() => setIsMenuOpen(false)}>Wishlist</MobileLink>}
                            {isAuthenticated && isAdmin && <MobileLink to="/admin" onClick={() => setIsMenuOpen(false)}>Admin</MobileLink>}
                            {isAuthenticated && (myShop?.status === 'ACTIVE' ? (
                                <MobileLink to="/my-shop" onClick={() => setIsMenuOpen(false)}>Kênh người bán</MobileLink>
                            ) : (
                                <MobileLink to="/register-seller" onClick={() => setIsMenuOpen(false)}>Bán hàng</MobileLink>
                            ))}
                        </div>

                        <div className="mt-auto grid gap-3">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex h-12 items-center justify-center border border-zinc-300 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950">
                                        Tài khoản
                                    </Link>
                                    <button onClick={() => setShowLogoutConfirm(true)} className="h-12 bg-zinc-950 text-sm font-semibold uppercase tracking-[0.16em] text-white">
                                        Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex h-12 items-center justify-center bg-zinc-950 text-sm font-semibold uppercase tracking-[0.16em] text-white">
                                        Đăng nhập
                                    </Link>
                                    <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex h-12 items-center justify-center border border-zinc-300 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-950">
                                        Đăng ký
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-white p-6 shadow-2xl">
                        <h2 className="text-xl font-semibold text-zinc-950">Đăng xuất tài khoản?</h2>
                        <p className="mt-3 text-sm leading-6 text-zinc-500">Bạn có chắc muốn đăng xuất khỏi tài khoản hiện tại không?</p>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button onClick={() => setShowLogoutConfirm(false)} className="h-11 border border-zinc-300 text-sm font-semibold text-zinc-700 transition hover:border-zinc-950">
                                Hủy
                            </button>
                            <button onClick={handleLogout} className="h-11 bg-zinc-950 text-sm font-semibold text-white transition hover:bg-[#A68545]">
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const MobileLink = ({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) => (
    <Link to={to} onClick={onClick} className="border-b border-zinc-100 pb-4 transition hover:text-zinc-950">
        {children}
    </Link>
);

const ShopEntry = ({ status }: { status?: string }) => {
    if (status === 'ACTIVE') {
        return <Link to="/my-shop" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A68545] hover:text-zinc-950">Kênh người bán</Link>;
    }

    if (status === 'PENDING') {
        return <span className="bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">Shop chờ duyệt</span>;
    }

    if (status === 'REJECTED') {
        return <Link to="/my-shop" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600 hover:underline">Shop bị từ chối</Link>;
    }

    if (status === 'INACTIVE') {
        return <Link to="/my-shop" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 hover:underline">Shop tạm ngưng</Link>;
    }

    if (status === 'BANNED') {
        return <Link to="/my-shop" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600 hover:underline">Shop bị khóa</Link>;
    }

    return <Link to="/register-seller" className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-950 hover:text-[#A68545]">Bán hàng</Link>;
};
