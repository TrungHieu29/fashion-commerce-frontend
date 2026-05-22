import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import {
    loginSchema,
    type LoginSchemaType,
} from '../schemas/login.schema';

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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>Tên đăng nhập hoặc mật khẩu không đúng</span>
                </div>
            )}
            <div className="space-y-1">
                <label className="text-[13px] font-bold text-[#6B7280] ml-1">Tên đăng nhập</label>
                <input
                    type="text"
                    placeholder="Nhập username"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.username ? 'border-red-500' : 'border-[#E5E7EB]'} focus:border-[#111111] outline-none transition-all text-[15px]`}
                    {...register('username')}
                />
                {errors.username && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.username.message}</p>}
            </div>

            <div className="space-y-1">
                <label className="text-[13px] font-bold text-[#6B7280] ml-1">Mật khẩu</label>
                <input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-[#E5E7EB]'} focus:border-[#111111] outline-none transition-all text-[15px]`}
                    {...register('password')}
                />
                {errors.password && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.password.message}</p>}
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#111111] text-white py-3.5 rounded-xl font-semibold hover:bg-[#222222] transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
            >
                {isPending ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
        </form>
    );
};