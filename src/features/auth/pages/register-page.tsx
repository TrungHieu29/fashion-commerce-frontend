import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerApi } from '../api/auth.api';
import { registerSchema } from '../schemas/auth.schema';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: any) => {
        try {
            await registerApi(data);
            toast.success('Đăng ký thành công. Vui lòng kiểm tra email để nhập mã xác thực.');
            navigate(`/verify-account?email=${encodeURIComponent(data.email)}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Đăng ký thất bại');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
            <div className="w-full max-w-[420px] rounded-[20px] border border-[#E5E7EB] bg-white p-10 shadow-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-[28px] font-bold tracking-tight text-[#0F0F0F]">Tạo tài khoản</h1>
                    <p className="mt-2 text-sm text-[#6B7280]">Sau khi đăng ký, hệ thống sẽ gửi mã OTP tới email của bạn.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FieldError message={errors.fullName?.message as string | undefined}>
                        <input {...register('fullName')} placeholder="Họ và tên" className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-[15px] outline-none transition-all focus:border-[#111111]" />
                    </FieldError>
                    <FieldError message={errors.username?.message as string | undefined}>
                        <input {...register('username')} placeholder="Tên đăng nhập" className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-[15px] outline-none transition-all focus:border-[#111111]" />
                    </FieldError>
                    <FieldError message={errors.email?.message as string | undefined}>
                        <input {...register('email')} type="email" placeholder="Email nhận mã xác thực" className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-[15px] outline-none transition-all focus:border-[#111111]" />
                    </FieldError>
                    <FieldError message={errors.password?.message as string | undefined}>
                        <input {...register('password')} type="password" placeholder="Mật khẩu" className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-[15px] outline-none transition-all focus:border-[#111111]" />
                    </FieldError>
                    <FieldError message={errors.confirmPassword?.message as string | undefined}>
                        <input {...register('confirmPassword')} type="password" placeholder="Xác nhận mật khẩu" className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-[15px] outline-none transition-all focus:border-[#111111]" />
                    </FieldError>

                    <button disabled={isSubmitting} className="mt-2 w-full rounded-xl bg-[#111111] py-3.5 font-semibold text-white transition-all hover:bg-[#222222] active:scale-[0.98] disabled:opacity-50">
                        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-[#6B7280]">
                    Đã có tài khoản? <Link to="/login" className="font-semibold text-[#111111] hover:underline">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

const FieldError = ({ children, message }: { children: React.ReactNode; message?: string }) => (
    <div>
        {children}
        {message && <p className="mt-1 text-xs text-[#EF4444]">{message}</p>}
    </div>
);

export default RegisterPage;
