import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../schemas/auth.schema';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = async (data: any) => {
        try {
            await api.post('/api/auth/register', data);
            toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Đăng ký thất bại');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
            <div className="w-full max-w-[400px] bg-white p-10 rounded-[20px] shadow-sm border border-[#E5E7EB]">
                <div className="text-center mb-8">
                    <h1 className="text-[28px] font-bold text-[#0F0F0F] tracking-tight">Tạo tài khoản</h1>
                    <p className="text-[#6B7280] text-sm mt-2">Bắt đầu hành trình thời trang của bạn</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <input
                            {...register('fullName')}
                            placeholder="Họ và tên"
                            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:border-[#111111] outline-none transition-all text-[15px]"
                        />
                        {errors.fullName && <p className="text-[#EF4444] text-xs mt-1">{errors.fullName.message as string}</p>}
                    </div>
                    <div>
                        <input
                            {...register('username')}
                            placeholder="Tên đăng nhập"
                            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:border-[#111111] outline-none transition-all text-[15px]"
                        />
                        {errors.username && <p className="text-[#EF4444] text-xs mt-1">{errors.username.message as string}</p>}
                    </div>
                    <div>
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="Email"
                            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:border-[#111111] outline-none transition-all text-[15px]"
                        />
                        {errors.email && <p className="text-[#EF4444] text-xs mt-1">{errors.email.message as string}</p>}
                    </div>
                    <div>
                        <input
                            {...register('password')}
                            type="password"
                            placeholder="Mật khẩu"
                            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:border-[#111111] outline-none transition-all text-[15px]"
                        />
                        {errors.password && <p className="text-[#EF4444] text-xs mt-1">{errors.password.message as string}</p>}
                    </div>
                    <div>
                        <input
                            {...register('confirmPassword')}
                            type="password"
                            placeholder="Xác nhận mật khẩu"
                            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] focus:border-[#111111] outline-none transition-all text-[15px]"
                        />
                        {errors.confirmPassword && <p className="text-[#EF4444] text-xs mt-1">{errors.confirmPassword.message as string}</p>}
                    </div>

                    <button
                        disabled={isSubmitting}
                        className="w-full bg-[#111111] text-white py-3.5 rounded-xl font-semibold hover:bg-[#222222] transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>

                <p className="text-center text-sm text-[#6B7280] mt-8">
                    Đã có tài khoản? <Link to="/login" className="text-[#111111] font-semibold hover:underline">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;