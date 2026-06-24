import { Link, Navigate } from 'react-router-dom';
import { AlertTriangle, Store } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useMyShop } from '@/features/shop/hooks/use-shop';
import { getShopStatusMessage, getUserStatusMessage } from '@/lib/status-messages';

export const SellerRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user } = useAuthStore();
    const { data: shop, isLoading } = useMyShop();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.status && user.status !== 'ACTIVE') {
        return <Navigate to="/login" replace state={{ authMessage: getUserStatusMessage(user.status) }} />;
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
            </div>
        );
    }

    if (!shop) {
        return <Navigate to="/register-seller" replace />;
    }

    if (shop.status === 'ACTIVE') {
        return children;
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    {shop.status === 'REJECTED' || shop.status === 'BANNED' ? <AlertTriangle size={32} /> : <Store size={32} />}
                </div>
                <h1 className="text-2xl font-black text-slate-950">Không thể vào kênh bán hàng</h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">{getShopStatusMessage(shop.status)}</p>
                <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left text-sm">
                    <p className="font-black text-slate-950">{shop.shopName}</p>
                    <p className="mt-1 text-slate-500">Trạng thái hiện tại: <span className="font-black text-amber-600">{shop.status}</span></p>
                </div>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link to="/" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-50">
                        Về trang chủ
                    </Link>
                    {shop.status === 'REJECTED' && (
                        <Link to="/register-seller" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">
                            Xem lại đăng ký
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};
