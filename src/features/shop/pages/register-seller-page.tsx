import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateShop } from '../hooks/use-shop';
import { useAuthStore } from '@/stores/auth.store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shopSchema } from '../schemas/shop.schema';
import { Store, ArrowRight, AlertCircle } from 'lucide-react';

const RegisterSellerPage = () => {
    const navigate = useNavigate();
    const createShop = useCreateShop();
    const user = useAuthStore(state => state.user);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(shopSchema),
        defaultValues: {
            shopName: '',
            phone: '',
            address: '',
            email: '',
            logo: '',
        }
    });

    const onSubmit = (data: any) => {
        if (!user) return;
        createShop.mutate({ ...data, ownerId: user.id }, {
            onSuccess: () => {
                navigate('/my-shop');
            },
        });
    };

    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl">
            <div className="text-center mb-10">
                <div className="inline-flex p-4 rounded-2xl bg-blue-50 text-blue-600 mb-4">
                    <Store size={40} />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">Trở thành người bán hàng</h1>
                <p className="text-gray-500 mt-2">Mở rộng kinh doanh của bạn cùng Fashion Commerce ngay hôm nay.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Tên cửa hàng</label>
                        <input
                            type="text"
                            placeholder="Nhập tên shop của bạn"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.shopName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            {...register('shopName')}
                        />
                        {errors.shopName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.shopName.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email liên hệ</label>
                            <input
                                type="email"
                                placeholder="Vd: shop@gmail.com"
                                className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                                {...register('email')}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.email.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại</label>
                            <input
                                type="text"
                                placeholder="09xxxx"
                                className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                                {...register('phone')}
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.phone.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Địa chỉ kinh doanh</label>
                        <input
                            type="text"
                            placeholder="Địa chỉ chi tiết của shop"
                            className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            {...register('address')}
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.address.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Link Logo (Tùy chọn)</label>
                        <input
                            type="text"
                            placeholder="https://..."
                            className={`w-full px-4 py-3 rounded-xl border ${errors.logo ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none transition-all`}
                            {...register('logo')}
                        />
                        {errors.logo && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.logo.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={createShop.isPending}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {createShop.isPending ? 'Đang xử lý...' : 'Xác nhận đăng ký'} <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterSellerPage;