import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, MailCheck, RotateCcw } from 'lucide-react';
import { resendOtpApi, verifyOtpApi } from '../api/auth.api';

const OTP_LENGTH = 6;
const gmailRegex = /^[A-Z0-9._%+-]+@gmail\.com$/i;

const VerifyAccountPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const emailFromUrl = searchParams.get('email') || '';
    const [email, setEmail] = useState(emailFromUrl);
    const [otpDigits, setOtpDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''));
    const [emailError, setEmailError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    const normalizedOtp = useMemo(() => otpDigits.join(''), [otpDigits]);

    useEffect(() => {
        if (resendCooldown <= 0) return;

        const timer = window.setTimeout(() => {
            setResendCooldown((current) => Math.max(0, current - 1));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [resendCooldown]);

    const verifyMutation = useMutation({
        mutationFn: verifyOtpApi,
        onSuccess: () => {
            navigate('/login', {
                state: { authMessage: 'Tài khoản đã được kích hoạt. Bạn có thể đăng nhập ngay.' },
            });
        },
        onError: (error: any) => {
            const mappedError = getVerifyErrorMessage(error);
            if (mappedError.field === 'email') {
                setEmailError(mappedError.text);
                setOtpError('');
            } else {
                setOtpError(mappedError.text);
            }
        },
    });

    const resendMutation = useMutation({
        mutationFn: resendOtpApi,
        onSuccess: () => {
            setResendCooldown(60);
        },
        onError: (error: any) => {
            const mappedError = getResendErrorMessage(error);
            setEmailError(mappedError);
        },
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        setEmailError('');
        setOtpError('');

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setEmailError('Vui lòng nhập Gmail đã đăng ký.');
            return;
        }

        if (!gmailRegex.test(trimmedEmail)) {
            setEmailError('Email phải có định dạng ...@gmail.com.');
            return;
        }

        if (normalizedOtp.length !== OTP_LENGTH) {
            setOtpError('Vui lòng nhập đủ 6 số xác thực.');
            return;
        }

        verifyMutation.mutate({ email: trimmedEmail, otp: normalizedOtp });
    };

    const handleDigitChange = (index: number, value: string) => {
        const nextDigit = value.replace(/\D/g, '').slice(-1);
        const nextDigits = [...otpDigits];
        nextDigits[index] = nextDigit;
        setOtpDigits(nextDigits);
        setOtpError('');

        if (nextDigit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (event.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        const pastedDigits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pastedDigits) return;

        const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pastedDigits[index] || '');
        setOtpDigits(nextDigits);
        setOtpError('');
        inputRefs.current[Math.min(pastedDigits.length, OTP_LENGTH) - 1]?.focus();
    };

    const handleResend = () => {
        const trimmedEmail = email.trim();
        setEmailError('');

        if (!trimmedEmail) {
            setEmailError('Vui lòng nhập Gmail đã đăng ký.');
            return;
        }

        if (!gmailRegex.test(trimmedEmail)) {
            setEmailError('Email phải có định dạng ...@gmail.com.');
            return;
        }

        resendMutation.mutate({ email: trimmedEmail });
    };

    return (
        <div className="min-h-screen bg-[#F8F6F1] px-4 py-8">
            <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-5xl items-center justify-center overflow-hidden border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(24,24,27,0.10)]">
                <div className="w-full max-w-[520px] px-5 py-10 sm:px-10">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center bg-zinc-950 text-white">
                            <MailCheck size={32} />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#A68545]">Xác thực email</p>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#111827]">Nhập mã xác nhận</h1>
                        <p className="mt-3 text-sm leading-6 text-[#64748B]">
                            Mã gồm 6 số đã được gửi tới Gmail đăng ký của bạn.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#334155]">Gmail đăng ký</label>
                            <input
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setEmailError('');
                                }}
                                type="email"
                                placeholder="ten-cua-ban@gmail.com"
                                className={`h-[52px] w-full rounded-2xl border bg-white px-4 text-[15px] text-[#111827] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#111827] focus:ring-4 focus:ring-[#111827]/5 ${emailError ? 'border-red-300' : 'border-[#E2E8F0]'}`}
                            />
                            {emailError && <FieldError message={emailError} />}
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-[#334155]">Mã xác nhận</label>
                            <div className="flex justify-center gap-2 sm:gap-3">
                                {otpDigits.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(element) => {
                                            inputRefs.current[index] = element;
                                        }}
                                        value={digit}
                                        onChange={(event) => handleDigitChange(index, event.target.value)}
                                        onKeyDown={(event) => handleKeyDown(index, event)}
                                        onPaste={handlePaste}
                                        inputMode="numeric"
                                        maxLength={1}
                                        aria-label={`Số thứ ${index + 1}`}
                                        className={`h-14 w-11 border-0 border-b-2 bg-transparent text-center text-3xl font-black text-[#111827] outline-none transition-all sm:h-16 sm:w-[52px] ${otpError ? 'border-red-400' : 'border-[#CBD5E1] focus:border-[#A68545]'}`}
                                    />
                                ))}
                            </div>
                            {otpError && <FieldError message={otpError} center />}
                        </div>

                        <button disabled={verifyMutation.isPending} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111827] py-4 text-[15px] font-black text-white shadow-lg shadow-[#111827]/15 transition-all hover:bg-[#0F172A] active:scale-[0.99] disabled:opacity-60">
                            {verifyMutation.isPending ? (
                                'Đang xác thực...'
                            ) : (
                                <>
                                    <CheckCircle2 size={18} />
                                    Kích hoạt tài khoản
                                </>
                            )}
                        </button>
                    </form>

                    <button
                        onClick={handleResend}
                        disabled={resendMutation.isPending || resendCooldown > 0}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] py-3.5 text-sm font-bold text-[#475569] transition hover:border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RotateCcw size={16} />
                        {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : resendMutation.isPending ? 'Đang gửi lại...' : 'Gửi lại mã'}
                    </button>

                    <p className="mt-8 text-center text-sm text-[#64748B]">
                        Đã kích hoạt?{' '}
                        <Link to="/login" className="font-bold text-[#111827] hover:text-[#A68545]">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const FieldError = ({ message, center = false }: { message: string; center?: boolean }) => (
    <p className={`flex items-center gap-1.5 text-xs font-semibold text-red-500 ${center ? 'justify-center' : ''}`}>
        <AlertCircle size={13} />
        {message}
    </p>
);

const getVerifyErrorMessage = (error: any): { field: 'email' | 'otp'; text: string } => {
    const status = error?.response?.status;
    const rawMessage = error?.response?.data?.message || error?.response?.data?.error || error?.response?.data || error?.message || '';
    const message = String(rawMessage).toLowerCase();

    if (status === 404 || message.includes('không tìm thấy yêu cầu đăng ký')) {
        return { field: 'email', text: 'Yêu cầu đăng ký không tồn tại hoặc đã hết hạn.' };
    }

    if (message.includes('đã hết hạn')) {
        return { field: 'otp', text: 'Mã OTP đã hết hạn, vui lòng gửi lại mã mới.' };
    }

    if (status === 400 || message.includes('không hợp lệ')) {
        return { field: 'otp', text: 'Mã OTP không chính xác.' };
    }

    return { field: 'otp', text: rawMessage || 'Không thể xác thực tài khoản. Vui lòng thử lại.' };
};

const getResendErrorMessage = (error: any) => {
    const status = error?.response?.status;
    const rawMessage = error?.response?.data?.message || error?.response?.data?.error || error?.response?.data || error?.message || '';
    const message = String(rawMessage).toLowerCase();

    if (status === 404 || message.includes('không tìm thấy yêu cầu đăng ký')) {
        return 'Email này không có yêu cầu đăng ký đang chờ xác thực.';
    }

    if (message.includes('60 giây') || message.includes('60')) {
        return 'Vui lòng chờ 60 giây trước khi gửi lại mã OTP.';
    }

    return rawMessage || 'Không thể gửi lại mã OTP. Vui lòng thử lại.';
};

export default VerifyAccountPage;
