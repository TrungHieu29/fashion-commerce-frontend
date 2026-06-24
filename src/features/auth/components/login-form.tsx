import { Link } from 'react-router-dom';
import { AlertCircle, Lock, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getUserStatusMessage } from '@/lib/status-messages';
import { loginSchema, type LoginSchemaType } from '../schemas/login.schema';
import { useLogin } from '../hooks/use-login';

export const LoginForm = () => {
    const { mutate, isPending, error: serverError } = useLogin();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchemaType>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (data: LoginSchemaType) => {
        mutate(data);
    };

    const errorMessage = getLoginErrorMessage(serverError);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 shrink-0" size={18} />
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-bold text-[#334155]">Tên đăng nhập</label>
                <div className={`flex items-center gap-3 rounded-2xl border bg-white px-4 transition-all focus-within:border-[#111827] focus-within:ring-4 focus-within:ring-[#111827]/5 ${errors.username ? 'border-red-300' : 'border-[#E2E8F0]'}`}>
                    <UserRound size={18} className="text-[#94A3B8]" />
                    <input
                        type="text"
                        placeholder="Nhập tên đăng nhập"
                        className="h-[52px] w-full bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#94A3B8]"
                        {...register('username')}
                    />
                </div>
                {errors.username && <p className="text-xs font-semibold text-red-500">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-bold text-[#334155]">Mật khẩu</label>
                    <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                        Quên mật khẩu?
                    </Link>
                </div>
                <div className={`flex items-center gap-3 rounded-2xl border bg-white px-4 transition-all focus-within:border-[#111827] focus-within:ring-4 focus-within:ring-[#111827]/5 ${errors.password ? 'border-red-300' : 'border-[#E2E8F0]'}`}>
                    <Lock size={18} className="text-[#94A3B8]" />
                    <input
                        type="password"
                        placeholder="Nhập mật khẩu"
                        className="h-[52px] w-full bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#94A3B8]"
                        {...register('password')}
                    />
                </div>
                {errors.password && <p className="text-xs font-semibold text-red-500">{errors.password.message}</p>}
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-2xl bg-[#111827] py-4 text-[15px] font-black text-white shadow-lg shadow-[#111827]/15 transition-all hover:bg-[#0F172A] active:scale-[0.99] disabled:opacity-60"
            >
                {isPending ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
        </form>
    );
};

const getLoginErrorMessage = (error: unknown) => {
    if (!error) return '';

    const responseMessage = (error as any).response?.data?.message || (error as any).response?.data?.error;
    const message = responseMessage || (error as Error).message || '';
    const normalized = String(message).toLowerCase();

    if (normalized.includes('pending')) return getUserStatusMessage('PENDING');
    if (normalized.includes('inactive')) return getUserStatusMessage('INACTIVE');
    if (normalized.includes('banned')) return getUserStatusMessage('BANNED');
    if (normalized.includes('disabled') || normalized.includes('account has been disabled')) return getUserStatusMessage();

    return 'Tên đăng nhập hoặc mật khẩu không đúng.';
};
