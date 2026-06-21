import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { verifyOtpApi } from '../api/auth.api';

const VerifyAccountPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const emailFromUrl = searchParams.get('email') || '';
    const [email, setEmail] = useState(emailFromUrl);
    const [otp, setOtp] = useState('');

    const normalizedOtp = useMemo(() => otp.replace(/\D/g, '').slice(0, 6), [otp]);

    const verifyMutation = useMutation({
        mutationFn: verifyOtpApi,
        onSuccess: () => {
            toast.success('Tài khoản của bạn đã được kích hoạt thành công.');
            navigate('/login');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
        },
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (!email.trim()) {
            toast.error('Vui lòng nhập email đã đăng ký.');
            return;
        }

        if (normalizedOtp.length !== 6) {
            toast.error('Mã xác thực phải gồm 6 chữ số.');
            return;
        }

        verifyMutation.mutate({ email: email.trim(), otp: normalizedOtp });
    };

    const handleResend = () => {
        toast.info('Backend hiện chưa cung cấp API gửi lại mã. Vui lòng chờ email hoặc đăng ký lại sau khi mã hết hạn.');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
            <div className="w-full max-w-[420px] rounded-[24px] border border-[#E5E7EB] bg-white p-9 shadow-sm">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <MailCheck size={28} />
                    </div>
                    <h1 className="text-[28px] font-black tracking-tight text-[#0F0F0F]">Xác thực tài khoản</h1>
                    <p className="mt-2 text-sm leading-6 text-[#6B7280]">Nhập mã OTP gồm 6 chữ số đã được gửi tới email đăng ký của bạn.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 ml-1 block text-[13px] font-bold text-[#6B7280]">Email đăng ký</label>
                        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="email@example.com" className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-[15px] outline-none transition-all focus:border-[#111111]" />
                    </div>

                    <div>
                        <label className="mb-1 ml-1 block text-[13px] font-bold text-[#6B7280]">Mã xác thực</label>
                        <input value={normalizedOtp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" maxLength={6} placeholder="Nhập 6 chữ số" className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-center text-2xl font-black tracking-[0.35em] outline-none transition-all focus:border-[#111111]" />
                    </div>

                    <button disabled={verifyMutation.isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#111111] py-3.5 font-semibold text-white transition-all hover:bg-[#222222] active:scale-[0.98] disabled:opacity-50">
                        {verifyMutation.isPending ? 'Đang xác thực...' : <><CheckCircle2 size={18} /> Kích hoạt tài khoản</>}
                    </button>
                </form>

                <button onClick={handleResend} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] py-3 text-sm font-bold text-[#6B7280] hover:bg-[#FAFAFA]">
                    <AlertCircle size={16} /> Gửi lại mã
                </button>

                <p className="mt-8 text-center text-sm text-[#6B7280]">
                    Đã kích hoạt? <Link to="/login" className="font-semibold text-[#111111] hover:underline">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyAccountPage;
