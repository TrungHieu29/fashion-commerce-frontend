import React, { useState } from 'react';
import { useMyShop, useUpdateShop, useCreateShop } from '../hooks/use-shop';
import { Edit, Store, X, Phone, Mail, MapPin, Calendar, User, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shopSchema } from '../schemas/shop.schema';
import type { ShopResponse } from '../types/shop.types';
import { useAuthStore } from '@/stores/auth.store';
import { useNavigate } from 'react-router-dom';

const MyShopPage = () => {
    const { data: myShop, isLoading, isError } = useMyShop();
    const navigate = useNavigate();

    const [isCreateShopModalOpen, setIsCreateShopModalOpen] = useState(false);
    const [isEditShopModalOpen, setIsEditShopModalOpen] = useState(false);

    if (isLoading) return <div className="p-20 text-center">Đang tải thông tin shop...</div>;
    if (isError) return <div className="p-20 text-center text-red-500">Có lỗi xảy ra khi tải thông tin shop của bạn.</div>;

    return (
        <div className="space-y-8">
            {!myShop ? (
                // Phần hiển thị khi chưa có shop đã được xử lý ở trang RegisterSeller, 
                // nhưng vẫn giữ placeholder đơn giản ở đây
                <div className="bg-white p-12 rounded-3xl border border-dashed border-[#E5E7EB] text-center">
                    <p>Hệ thống không tìm thấy thông tin Shop của bạn.</p>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-sm font-medium text-gray-400">Kênh người bán</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-sm font-bold text-gray-900">Hồ sơ Shop</span>
                    </div>

                    <div className="bg-white p-10 rounded-2xl border border-[#E5E7EB] shadow-sm">
                        <div className="flex justify-between items-center mb-8 pb-6 border-b border-[#F3F4F6]">
                            <div>
                                <h2 className="text-[24px] font-black text-[#0F0F0F] tracking-tight uppercase">Thông tin tài khoản Shop</h2>
                                <p className="text-[#6B7280] text-sm mt-1">Thông tin hiển thị công khai của bạn</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditShopModalOpen(true)}
                                    className="flex items-center gap-2 bg-[#F5F5F5] text-[#111111] px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#E5E7EB] transition-all"
                                >
                                    <Edit size={16} /> Chỉnh sửa hồ sơ
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <InfoField label="Tên cửa hàng" value={myShop.shopName} icon={<Store size={16} />} />
                            <InfoField label="Email liên hệ" value={myShop.email || 'Chưa cập nhật'} icon={<Mail size={16} />} />
                            <InfoField label="Hotline" value={myShop.phone || 'Chưa cập nhật'} icon={<Phone size={16} />} />
                            <InfoField label="Địa chỉ" value={myShop.address || 'Chưa cập nhật'} icon={<MapPin size={16} />} />
                            <InfoField label="Ngày gia nhập" value={new Date(myShop.createdAt).toLocaleDateString()} icon={<Calendar size={16} />} />
                            <InfoField label="Chủ sở hữu" value={myShop.ownerFullName} icon={<User size={16} />} />
                        </div>

                        {myShop.logo && (
                            <div className="mt-8 pt-8 border-t border-[#F3F4F6]">
                                <label className="block text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">Logo thương hiệu</label>
                                <div className="w-24 h-24 rounded-2xl border border-[#E5E7EB] p-2 bg-[#F9FAFB]">
                                    <img src={myShop.logo} alt="" className="w-full h-full object-contain" />
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modals giữ nguyên logic cũ nhưng cập nhật style */}
            {isEditShopModalOpen && myShop && (
                <EditShopModal shop={myShop} onClose={() => setIsEditShopModalOpen(false)} />
            )}
        </div>
    );
};

const InfoField = ({ label, value, icon }: { label: string, value?: string, icon: React.ReactNode }) => (
    <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]/50">
            <span className="text-[#9CA3AF]">{icon}</span>
            <span className="text-[14px] font-medium text-[#111111]">{value}</span>
        </div>
    </div>
);

// --- Component Modal Tạo Shop mới ---
const CreateShopModal = ({ ownerId, onClose }: { ownerId: number, onClose: () => void }) => {
    const createShop = useCreateShop();
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
        createShop.mutate({ ...data, ownerId }, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="font-bold text-xl">Tạo Shop mới</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Tên Shop</label>
                        <input
                            type="text"
                            placeholder="Vd: Shop của Hiếu"
                            className={`w-full px-4 py-2 rounded-xl border ${errors.shopName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            {...register('shopName')}
                        />
                        {errors.shopName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.shopName.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="shop@example.com"
                            className={`w-full px-4 py-2 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            {...register('email')}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại</label>
                        <input
                            type="text"
                            placeholder="09xxx..."
                            className={`w-full px-4 py-2 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            {...register('phone')}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.phone.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Địa chỉ</label>
                        <input
                            type="text"
                            placeholder="Vd: 123 Đường ABC, Quận XYZ, TP.HCM"
                            className={`w-full px-4 py-2 rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            {...register('address')}
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.address.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">URL Logo (tùy chọn)</label>
                        <input
                            type="text"
                            placeholder="https://example.com/logo.jpg"
                            className={`w-full px-4 py-2 rounded-xl border ${errors.logo ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            {...register('logo')}
                        />
                        {errors.logo && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.logo.message}</p>}
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={createShop.isPending}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {createShop.isPending ? 'Đang tạo...' : 'Tạo Shop'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Component Modal Chỉnh sửa Shop ---
const EditShopModal = ({ shop, onClose }: { shop: ShopResponse, onClose: () => void }) => {
    const updateShop = useUpdateShop();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(shopSchema),
        defaultValues: {
            shopName: shop.shopName || '',
            phone: shop.phone || '',
            address: shop.address || '',
            email: shop.email || '',
            logo: shop.logo || '',
        }
    });

    const onSubmit = (data: any) => {
        updateShop.mutate({ id: shop.id, data }, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="font-bold text-xl">Chỉnh sửa Shop</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Tên Shop</label>
                        <input
                            type="text"
                            className={`w-full px-4 py-2 rounded-xl border ${errors.shopName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            {...register('shopName')}
                        />
                        {errors.shopName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.shopName.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className={`w-full px-4 py-2 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            {...register('email')}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại</label>
                        <input
                            type="text"
                            className={`w-full px-4 py-2 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            {...register('phone')}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.phone.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Địa chỉ</label>
                        <input
                            type="text"
                            className={`w-full px-4 py-2 rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            {...register('address')}
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.address.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">URL Logo (tùy chọn)</label>
                        <input
                            type="text"
                            className={`w-full px-4 py-2 rounded-xl border ${errors.logo ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            {...register('logo')}
                        />
                        {errors.logo && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.logo.message}</p>}
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={updateShop.isPending}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {updateShop.isPending ? 'Đang lưu...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MyShopPage;