import { Link } from 'react-router-dom';
import { LoginForm } from '../components/login-form';

const LoginPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
            <div className="w-full max-w-[400px] bg-white p-10 rounded-[20px] shadow-sm border border-[#E5E7EB]">
                <div className="text-center mb-8">
                    <h1 className="text-[28px] font-bold text-[#0F0F0F] tracking-tight">Chào mừng trở lại</h1>
                    <p className="text-[#6B7280] text-sm mt-2">Đăng nhập để tiếp tục trải nghiệm mua sắm</p>
                </div>

                <LoginForm />

                <p className="text-center text-sm text-[#6B7280] mt-8">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-[#111111] font-semibold hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;