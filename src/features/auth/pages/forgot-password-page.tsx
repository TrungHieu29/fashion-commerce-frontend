import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AlertCircle, CheckCircle2, KeyRound, Mail, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { forgotPasswordApi, resendResetOtpApi, resetPasswordApi } from '../api/auth.api';
import { forgotPasswordSchema, resetPasswordSchema, type ForgotPasswordSchemaType, type ResetPasswordSchemaType } from '../schemas/password.schema';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'email' | 'reset'>('email');
    const [email, setEmail] = useState('');
    const [cooldown, setCooldown] = useState(0);

    const emailForm = useForm<ForgotPasswordSchemaType>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const resetForm = useForm<ResetPasswordSchemaType>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: '',
            otp: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = window.setTimeout(() => setCooldown((current) => Math.max(0, current - 1)), 1000);
        return () => window.clearTimeout(timer);
    }, [cooldown]);

    const forgotMutation = useMutation({
        mutationFn: forgotPasswordApi,
        onSuccess: (_, variables) => {
            setEmail(variables.email);
            resetForm.setValue('email', variables.email);
            setStep('reset');
            setCooldown(60);
            toast.success('OTP đã được gửi.');
        },
        onError: (error: any) => {
            const message = getForgotPasswordError(error);
            emailForm.setError('email', { type: 'server', message });
            toast.error(message);
        },
    });

    const resendMutation = useMutation({
        mutationFn: resendResetOtpApi,
        onSuccess: () => {
            setCooldown(60);
            toast.success('OTP mới đã được gửi.');
        },
        onError: (error: any) => {
            toast.error(getResendResetOtpError(error));
        },
    });

    const resetMutation = useMutation({
        mutationFn: resetPasswordApi,
        onSuccess: () => {
            toast.success('Đặt lại mật khẩu thành công.');
            navigate('/login', {
                state: { authMessage: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.' },
            });
        },
        onError: (error: any) => {
            const mapped = getResetPasswordError(error);
            resetForm.setError(mapped.field, { type: 'server', message: mapped.message });
            toast.error(mapped.message);
        },
    });

    const submitEmail = (data: ForgotPasswordSchemaType) => {
        forgotMutation.mutate({ email: data.email.trim() });
    };

    const submitReset = (data: ResetPasswordSchemaType) => {
        resetMutation.mutate({
            ...data,
            email: data.email.trim(),
            otp: data.otp.trim(),
        });
    };

    const resendOtp = () => {
        if (!email || cooldown > 0) return;
        resendMutation.mutate({ email });
    };

    return (
        <div className="min-h-screen bg-[#F5F7FA] px-4 py-8">
            <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-5xl items-center justify-center overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
                <div className="w-full max-w-[500px] px-5 py-10 sm:px-10">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EFF6FF] text-[#2563EB]">
                            <KeyRound size={32} />
                        </div>
                        <p className="text-sm font-bold uppercase text-[#2563EB]">Quên mật khẩu</p>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#111827]">
                            {step === 'email' ? 'Nhận mã OTP' : 'Đặt lại mật khẩu'}
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-[#64748B]">
                            {step === 'email' ? 'Nhập email tài khoản để nhận OTP đặt lại mật khẩu.' : `OTP đã được gửi tới ${email}.`}
                        </p>
                    </div>

                    {step === 'email' ? (
                        <form onSubmit={emailForm.handleSubmit(submitEmail)} className="space-y-5" noValidate>
                            <Field label="Email" error={emailForm.formState.errors.email?.message}>
                                <Mail size={18} className="text-[#94A3B8]" />
                                <input type="email" placeholder="abc@gmail.com" className="h-[52px] w-full bg-transparent text-[15px] outline-none" {...emailForm.register('email')} />
                            </Field>
                            <button disabled={forgotMutation.isPending} className="w-full rounded-2xl bg-[#111827] py-4 text-[15px] font-black text-white disabled:opacity-60">
                                {forgotMutation.isPending ? 'Đang gửi OTP...' : 'Gửi OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={resetForm.handleSubmit(submitReset)} className="space-y-5" noValidate>
                            <Field label="OTP" error={resetForm.formState.errors.otp?.message}>
                                <KeyRound size={18} className="text-[#94A3B8]" />
                                <input inputMode="numeric" maxLength={6} placeholder="123456" className="h-[52px] w-full bg-transparent text-[15px] tracking-[0.35em] outline-none" {...resetForm.register('otp')} />
                            </Field>
                            <Field label="Mật khẩu mới" error={resetForm.formState.errors.newPassword?.message}>
                                <KeyRound size={18} className="text-[#94A3B8]" />
                                <input type="password" placeholder="Tối thiểu 6 ký tự" className="h-[52px] w-full bg-transparent text-[15px] outline-none" {...resetForm.register('newPassword')} />
                            </Field>
                            <Field label="Xác nhận mật khẩu" error={resetForm.formState.errors.confirmPassword?.message}>
                                <CheckCircle2 size={18} className="text-[#94A3B8]" />
                                <input type="password" placeholder="Nhập lại mật khẩu mới" className="h-[52px] w-full bg-transparent text-[15px] outline-none" {...resetForm.register('confirmPassword')} />
                            </Field>
                            <button disabled={resetMutation.isPending} className="w-full rounded-2xl bg-[#111827] py-4 text-[15px] font-black text-white disabled:opacity-60">
                                {resetMutation.isPending ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                            </button>
                            <button type="button" onClick={resendOtp} disabled={resendMutation.isPending || cooldown > 0} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] py-3.5 text-sm font-bold text-[#475569] disabled:opacity-60">
                                <RotateCcw size={16} />
                                {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : resendMutation.isPending ? 'Đang gửi lại...' : 'Gửi lại OTP'}
                            </button>
                        </form>
                    )}

                    <p className="mt-8 text-center text-sm text-[#64748B]">
                        Nhớ mật khẩu?{' '}
                        <Link to="/login" className="font-bold text-[#111827] hover:text-[#2563EB]">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-[#334155]">{label}</label>
        <div className={`flex items-center gap-3 rounded-2xl border bg-white px-4 transition-all focus-within:border-[#111827] focus-within:ring-4 focus-within:ring-[#111827]/5 ${error ? 'border-red-300' : 'border-[#E2E8F0]'}`}>
            {children}
        </div>
        {error && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                <AlertCircle size={13} />
                {error}
            </p>
        )}
    </div>
);

const getForgotPasswordError = (error: any) => {
    const message = String(error?.response?.data?.message || error?.response?.data || error?.message || '').toLowerCase();
    if (message.includes('email không tồn tại')) return 'Email không tồn tại.';
    return 'Không thể gửi OTP. Vui lòng thử lại.';
};

const getResendResetOtpError = (error: any) => {
    const message = String(error?.response?.data?.message || error?.response?.data || error?.message || '').toLowerCase();
    if (message.includes('60')) return 'Vui lòng đợi 60 giây trước khi gửi lại OTP.';
    return 'Không thể gửi lại OTP. Vui lòng thử lại.';
};

const getResetPasswordError = (error: any): { field: keyof ResetPasswordSchemaType; message: string } => {
    const message = String(error?.response?.data?.message || error?.response?.data || error?.message || '').toLowerCase();
    if (message.includes('otp đã bị khóa')) return { field: 'otp', message: 'OTP đã bị khóa.' };
    if (message.includes('otp đã hết hạn')) return { field: 'otp', message: 'OTP đã hết hạn.' };
    if (message.includes('otp không chính xác')) return { field: 'otp', message: 'OTP không chính xác.' };
    if (message.includes('xác nhận mật khẩu không khớp')) return { field: 'confirmPassword', message: 'Xác nhận mật khẩu không khớp.' };
    return { field: 'otp', message: 'Không thể đặt lại mật khẩu. Vui lòng thử lại.' };
};

export default ForgotPasswordPage;
