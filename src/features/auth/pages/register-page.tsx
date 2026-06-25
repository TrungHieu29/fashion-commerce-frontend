import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, IdCard, Lock, Mail, Phone, Sparkles, UserRound } from 'lucide-react';
import { registerApi } from '../api/auth.api';
import { registerSchema, type RegisterSchemaType } from '../schemas/auth.schema';

const gmailRegex = /^[A-Z0-9._%+-]+@gmail\.com$/i;

const RegisterPage = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<RegisterSchemaType>({
        resolver: zodResolver(registerSchema),
        mode: 'onSubmit',
    });

    const onSubmit = async (data: RegisterSchemaType) => {
        const email = data.email.trim();

        if (!gmailRegex.test(email)) {
            setError('email', { type: 'manual', message: 'Email phải có định dạng ...@gmail.com.' });
            return;
        }

        try {
            await registerApi({
                username: data.username.trim(),
                password: data.password,
                fullName: data.fullName.trim(),
                email,
                phone: data.phone?.trim() || undefined,
                avatar: null,
            });
            navigate(`/verify-account?email=${encodeURIComponent(email)}`);
        } catch (error: any) {
            const message = getRegisterErrorMessage(error);

            if (message.field === 'email') {
                setError('email', { type: 'server', message: message.text });
            } else if (message.field === 'username') {
                setError('username', { type: 'server', message: message.text });
            } else if (message.field === 'phone') {
                setError('phone', { type: 'server', message: message.text });
            } else if (message.field === 'password') {
                setError('password', { type: 'server', message: message.text });
            } else if (message.field === 'fullName') {
                setError('fullName', { type: 'server', message: message.text });
            }

            if (!message.field) {
                setError('email', { type: 'server', message: message.text });
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F7FA] px-4 py-8">
            <div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)] lg:grid-cols-[0.95fr_1.05fr]">
                <section className="relative hidden overflow-hidden bg-[#881337] p-10 text-white lg:block">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(251,191,36,0.34),transparent_28%),radial-gradient(circle_at_78%_20%,rgba(244,114,182,0.42),transparent_30%),linear-gradient(135deg,#881337_0%,#BE123C_48%,#111827_100%)]" />
                    <div className="relative z-10 flex h-full flex-col justify-between">
                        <Link to="/" className="inline-flex w-fit items-center gap-3 text-lg font-black">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#BE123C]">
                                <Sparkles size={22} />
                            </span>
                            Fashion Commerce
                        </Link>

                        <div className="max-w-md">
                            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white/90 backdrop-blur">
                                Tạo tài khoản miễn phí
                            </p>
                            <h1 className="text-5xl font-black leading-[1.05] tracking-tight">
                                Xác thực trước, tạo tài khoản sau.
                            </h1>
                            <p className="mt-5 text-base leading-7 text-white/75">
                                Hệ thống chỉ tạo tài khoản thật sau khi bạn nhập đúng OTP đã gửi tới Gmail.
                            </p>
                        </div>

                        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-sm leading-6 text-white/82 backdrop-blur">
                            Chỉ chấp nhận địa chỉ Gmail. Nếu email hoặc tên đăng nhập đang chờ xác thực, hãy sang màn hình nhập OTP hoặc gửi lại mã.
                        </div>
                    </div>
                </section>

                <section className="flex items-center justify-center px-5 py-10 sm:px-10">
                    <div className="w-full max-w-[470px]">
                        <div className="mb-8">
                            <p className="text-sm font-bold uppercase text-[#E11D48]">Đăng ký</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#111827]">Tạo tài khoản mới</h2>
                            <p className="mt-3 text-sm leading-6 text-[#64748B]">
                                Nhập Gmail hợp lệ để nhận OTP. Tài khoản chỉ được tạo sau khi xác thực thành công.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                            <AuthInput icon={<IdCard size={18} />} label="Họ và tên" placeholder="Nhập họ và tên" error={errors.fullName?.message} {...register('fullName')} />
                            <AuthInput icon={<UserRound size={18} />} label="Tên đăng nhập" placeholder="Từ 4 đến 50 ký tự" error={errors.username?.message} {...register('username')} />
                            <AuthInput icon={<Mail size={18} />} label="Gmail" type="email" placeholder="ten-cua-ban@gmail.com" error={errors.email?.message} {...register('email')} />
                            <AuthInput icon={<Phone size={18} />} label="Số điện thoại" placeholder="09xxxxxxxx" error={errors.phone?.message} {...register('phone')} />
                            <AuthInput icon={<Lock size={18} />} label="Mật khẩu" type="password" placeholder="Tối thiểu 6 ký tự" error={errors.password?.message} {...register('password')} />
                            <AuthInput icon={<Lock size={18} />} label="Xác nhận mật khẩu" type="password" placeholder="Nhập lại mật khẩu" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

                            <button disabled={isSubmitting} className="w-full rounded-2xl bg-[#111827] py-4 text-[15px] font-black text-white shadow-lg shadow-[#111827]/15 transition-all hover:bg-[#0F172A] active:scale-[0.99] disabled:opacity-60">
                                {isSubmitting ? 'Đang gửi OTP...' : 'Tạo tài khoản'}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-[#64748B]">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="font-bold text-[#111827] hover:text-[#E11D48]">
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

type AuthInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    icon: ReactNode;
    label: string;
    error?: string;
};

const AuthInput = ({ icon, label, error, ...props }: AuthInputProps) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-[#334155]">{label}</label>
        <div className={`flex items-center gap-3 rounded-2xl border bg-white px-4 transition-all focus-within:border-[#111827] focus-within:ring-4 focus-within:ring-[#111827]/5 ${error ? 'border-red-300' : 'border-[#E2E8F0]'}`}>
            <span className="text-[#94A3B8]">{icon}</span>
            <input className="h-[52px] w-full bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#94A3B8]" {...props} />
        </div>
        {error && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                <AlertCircle size={13} />
                {error}
            </p>
        )}
    </div>
);

const getRegisterErrorMessage = (error: any): { field?: 'email' | 'username' | 'phone' | 'password' | 'fullName'; text: string } => {
    const rawMessage = error?.response?.data?.message || error?.response?.data?.error || error?.response?.data || error?.message || '';
    const message = String(rawMessage).toLowerCase();

    if (message.includes('username already exists')) {
        return { field: 'username', text: 'Tên đăng nhập đã tồn tại.' };
    }

    if (message.includes('email already exists')) {
        return { field: 'email', text: 'Email đã được sử dụng.' };
    }

    if (message.includes('username') && message.includes('chờ xác thực')) {
        return { field: 'username', text: 'Tài khoản này đang chờ xác thực OTP.' };
    }

    if (message.includes('email') && message.includes('chờ xác thực')) {
        return { field: 'email', text: 'Email này đang chờ xác thực OTP.' };
    }

    if (message.includes('invalid email format')) {
        return { field: 'email', text: 'Email không đúng định dạng.' };
    }

    if (message.includes('username must be between')) {
        return { field: 'username', text: 'Tên đăng nhập phải từ 4 đến 50 ký tự.' };
    }

    if (message.includes('password must be at least')) {
        return { field: 'password', text: 'Mật khẩu phải có ít nhất 6 ký tự.' };
    }

    if (message.includes('full name cannot be blank')) {
        return { field: 'fullName', text: 'Vui lòng nhập họ tên.' };
    }

    if (message.includes('invalid phone number format')) {
        return { field: 'phone', text: 'Số điện thoại không hợp lệ.' };
    }

    return { text: rawMessage || 'Đăng ký thất bại. Vui lòng thử lại.' };
};

export default RegisterPage;
