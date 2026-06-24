import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, ShieldCheck, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { LoginForm } from '../components/login-form';

const LoginPage = () => {
    const location = useLocation();
    const message =
        sessionStorage.getItem('auth-message') ||
        (location.state as { authMessage?: string } | null)?.authMessage ||
        '';

    useEffect(() => {
        const storedMessage = sessionStorage.getItem('auth-message');
        if (storedMessage) {
            sessionStorage.removeItem('auth-message');
        }

        const message = storedMessage || (location.state as { authMessage?: string } | null)?.authMessage;
        if (message) {
            toast.error(message);
        }
    }, [location.state]);

    return (
        <div className="min-h-screen bg-[#F5F7FA] px-4 py-8">
            <div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)] lg:grid-cols-[1.05fr_0.95fr]">
                <section className="relative hidden min-h-[640px] overflow-hidden bg-[#111827] p-10 text-white lg:block">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.35),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.32),transparent_26%),linear-gradient(135deg,#111827_0%,#1F2937_52%,#0F172A_100%)]" />
                    <div className="relative z-10 flex h-full flex-col justify-between">
                        <Link to="/" className="inline-flex w-fit items-center gap-3 text-lg font-black">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#111827]">
                                <ShoppingBag size={22} />
                            </span>
                            Fashion Commerce
                        </Link>

                        <div className="max-w-md">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
                                <ShieldCheck size={16} />
                                Mua sắm an toàn, quản lý đơn hàng nhanh
                            </div>
                            <h1 className="text-5xl font-black leading-[1.05] tracking-tight">
                                Chào mừng bạn quay lại.
                            </h1>
                            <p className="mt-5 text-base leading-7 text-white/72">
                                Đăng nhập để tiếp tục mua sắm, theo dõi đơn hàng và trò chuyện với shop yêu thích của bạn.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-sm">
                            {['Flash sale mỗi ngày', 'Shop chính hãng', 'Thanh toán linh hoạt'].map((item) => (
                                <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-4 font-semibold text-white/86 backdrop-blur">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center px-5 py-10 sm:px-10">
                    <div className="w-full max-w-[430px]">
                        <div className="mb-8 lg:hidden">
                            <Link to="/" className="inline-flex items-center gap-2 text-lg font-black text-[#111827]">
                                <ShoppingBag size={24} />
                                Fashion Commerce
                            </Link>
                        </div>

                        <div className="mb-8">
                            <p className="text-sm font-bold uppercase text-[#EC4899]">Đăng nhập</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#111827]">Tiếp tục mua sắm</h2>
                            <p className="mt-3 text-sm leading-6 text-[#64748B]">
                                Nhập tài khoản của bạn để truy cập giỏ hàng, đơn mua và kênh người bán.
                            </p>
                        </div>

                        {message && (
                            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                                <AlertCircle className="mt-0.5 shrink-0" size={18} />
                                <span>{message}</span>
                            </div>
                        )}

                        <LoginForm />

                        <p className="mt-8 text-center text-sm text-[#64748B]">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="font-bold text-[#111827] hover:text-[#EC4899]">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LoginPage;
