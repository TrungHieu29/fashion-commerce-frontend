import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useUserProfile, useAddresses, useUpdateProfile, useSetDefaultAddress, useDeleteAddress, useAddAddress, useChangePassword } from '../hooks/use-user';
import { User, MapPin, Phone, Mail, Calendar, Plus, Trash2, X, AlertCircle, Package, History, ShieldCheck, KeyRound, Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, addressSchema } from '../schemas/profile.schema';
import ProfileOrdersPage from '@/features/order/pages/profile-orders-page';
import { changePasswordSchema, type ChangePasswordSchemaType } from '@/features/auth/schemas/password.schema';

const GENDER_LABELS: Record<string, string> = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác',
};

const ProfilePage = () => {
    const { data: profile, isLoading: profileLoading } = useUserProfile();
    const { data: addresses, isLoading: addressLoading } = useAddresses();
    const updateProfile = useUpdateProfile();
    const setDefault = useSetDefaultAddress();
    const deleteAddr = useDeleteAddress();

    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as 'info' | 'address' | 'orders' | 'history' | 'security')
        || (location.pathname.startsWith('/account/orders') ? 'orders' : 'info');

    const setActiveTab = (tab: string) => {
        setSearchParams({ tab });
    };

    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    if (profileLoading || addressLoading) return <div className="bg-[#F8F6F1] p-20 text-center text-zinc-500">Đang tải...</div>;

    return (
        <div className="min-h-screen bg-[#F8F6F1] px-4 py-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row">
                {/* Sidebar */}
                <div className="w-full space-y-2 md:w-1/4">
                    <div className="mb-6 border border-zinc-200 bg-white p-6 text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center bg-zinc-950 text-3xl font-semibold text-white">
                            {profile?.fullName ? profile.fullName.charAt(0) : 'U'}
                        </div>
                        <h2 className="font-semibold text-zinc-950">{profile?.fullName}</h2>
                        <p className="text-sm text-zinc-500">@{profile?.username}</p>
                    </div>

                    <button
                        onClick={() => setActiveTab('info')}
                        className={`flex w-full items-center gap-3 border px-4 py-3 text-sm font-semibold transition-all ${activeTab === 'info' ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-transparent text-zinc-600 hover:border-zinc-300 hover:bg-white'}`}
                    >
                        <User size={18} /> Thông tin cá nhân
                    </button>
                    <button
                        onClick={() => setActiveTab('address')}
                        className={`flex w-full items-center gap-3 border px-4 py-3 text-sm font-semibold transition-all ${activeTab === 'address' ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-transparent text-zinc-600 hover:border-zinc-300 hover:bg-white'}`}
                    >
                        <MapPin size={18} /> Địa chỉ giao hàng
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex w-full items-center gap-3 border px-4 py-3 text-sm font-semibold transition-all ${activeTab === 'orders' ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-transparent text-zinc-600 hover:border-zinc-300 hover:bg-white'}`}
                    >
                        <Package size={18} /> Đơn hàng
                    </button>
                    <Link
                        to="/wishlist"
                        className="flex w-full items-center gap-3 border border-transparent px-4 py-3 text-sm font-semibold text-zinc-600 transition-all hover:border-zinc-300 hover:bg-white"
                    >
                        <Heart size={18} /> Sản phẩm yêu thích
                    </Link>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex w-full items-center gap-3 border px-4 py-3 text-sm font-semibold transition-all ${activeTab === 'history' ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-transparent text-zinc-600 hover:border-zinc-300 hover:bg-white'}`}
                    >
                        <History size={18} /> Lịch sử đơn hàng
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex w-full items-center gap-3 border px-4 py-3 text-sm font-semibold transition-all ${activeTab === 'security' ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-transparent text-zinc-600 hover:border-zinc-300 hover:bg-white'}`}
                    >
                        <ShieldCheck size={18} /> Bảo mật
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 border border-zinc-200 bg-white p-6 sm:p-8">
                    {activeTab === 'info' ? (
                        <div>
                            <h3 className="mb-6 text-xl font-semibold text-zinc-950">Thông tin cá nhân</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InfoField label="Họ và tên" value={profile?.fullName} icon={<User size={16} />} />
                                <InfoField label="Email" value={profile?.email} icon={<Mail size={16} />} />
                                <InfoField label="Số điện thoại" value={profile?.phone || 'Chưa cập nhật'} icon={<Phone size={16} />} />
                                <InfoField label="Giới tính" value={profile?.gender ? GENDER_LABELS[profile.gender] || profile.gender : 'Chưa cập nhật'} icon={<User size={16} />} />
                                <InfoField label="Ngày sinh" value={profile?.dateOfBirth || 'Chưa cập nhật'} icon={<Calendar size={16} />} />
                            </div>
                            <button
                                onClick={() => setIsEditProfileOpen(true)}
                                className="mt-8 border border-zinc-950 bg-zinc-950 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#A68545] hover:border-[#A68545]"
                            >
                                Chỉnh sửa thông tin
                            </button>
                        </div>
                    ) : activeTab === 'address' ? (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-zinc-950">Địa chỉ của tôi</h3>
                                <button
                                    onClick={() => setIsAddAddressOpen(true)}
                                    className="flex items-center gap-2 text-sm font-semibold text-[#A68545] hover:text-zinc-950"
                                >
                                    <Plus size={18} /> Thêm địa chỉ mới
                                </button>
                            </div>

                            <div className="space-y-4">
                                {addresses?.map(addr => (
                                    <div key={addr.id} className={`p-5 rounded-xl border-2 transition-all ${addr.isDefault ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{addr.receiverName}</span>
                                                    {addr.isDefault && (
                                                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase font-bold">Mặc định</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">{addr.phone}</p>
                                                <p className="text-sm text-gray-500">{addr.addressLine}, {addr.district}, {addr.city}</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {!addr.isDefault && (
                                                    <button onClick={() => setDefault.mutate(addr.id)} className="text-xs font-bold text-blue-600 hover:underline">Thiết lập mặc định</button>
                                                )}
                                                <button onClick={() => deleteAddr.mutate(addr.id)} className="text-gray-400 hover:text-red-500 self-end">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {addresses?.length === 0 && <p className="text-center text-gray-500 py-10">Bạn chưa có địa chỉ nào.</p>}
                            </div>
                        </div>
                    ) : activeTab === 'orders' ? (
                        <ProfileOrdersPage mode="ACTIVE" isNested />
                    ) : activeTab === 'history' ? (
                        <ProfileOrdersPage mode="HISTORY" isNested />
                    ) : (
                        <div>
                            <h3 className="text-xl font-bold mb-6">Bảo mật tài khoản</h3>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                                        <KeyRound size={24} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-black text-slate-950">Đổi mật khẩu</h4>
                                        <p className="mt-1 text-sm leading-6 text-slate-500">Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật bảo mật.</p>
                                        <button
                                            onClick={() => setIsChangePasswordOpen(true)}
                                            className="mt-4 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-600"
                                        >
                                            Đổi mật khẩu
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isEditProfileOpen && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setIsEditProfileOpen(false)}
                />
            )}
            {isAddAddressOpen && (
                <AddAddressModal
                    onClose={() => setIsAddAddressOpen(false)}
                />
            )}
            {isChangePasswordOpen && (
                <ChangePasswordModal onClose={() => setIsChangePasswordOpen(false)} />
            )}
        </div>
    );
};

// --- Component Modal Chỉnh sửa hồ sơ ---
const EditProfileModal = ({ profile, onClose }: { profile: any, onClose: () => void }) => {
    const updateProfile = useUpdateProfile();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: profile?.fullName || '',
            phone: profile?.phone || '',
            gender: profile?.gender || 'MALE', // Đảm bảo giá trị mặc định cũng là chữ hoa
            dateOfBirth: profile?.dateOfBirth || '',
        }
    });

    const onSubmit = (data: any) => {
        updateProfile.mutate(data, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="font-bold text-xl">Chỉnh sửa hồ sơ</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Họ và tên</label>
                        <input
                            type="text"
                            className={`w-full px-4 py-2 rounded-xl border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            {...register('fullName')}
                        />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.fullName.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại</label>
                        <input
                            type="text"
                            className={`w-full px-4 py-2 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            {...register('phone')}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle size={12} /> {errors.phone.message}
                            </p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Giới tính</label>
                            <select
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                {...register('gender')}
                            >
                                <option value="MALE">Nam</option>
                                <option value="FEMALE">Nữ</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Ngày sinh</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                {...register('dateOfBirth')}
                            />
                        </div>
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
                            disabled={updateProfile.isPending}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {updateProfile.isPending ? 'Đang lưu...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Component Modal Thêm địa chỉ mới ---
const AddAddressModal = ({ onClose }: { onClose: () => void }) => {
    const addAddress = useAddAddress();
    const userId = useAuthStore(state => state.user?.id);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(addressSchema),
        defaultValues: {
            receiverName: '',
            phone: '',
            addressLine: '',
            district: '',
            city: '',
            isDefault: false,
        }
    });

    const onSubmit = (data: any) => {
        if (!userId) return;
        addAddress.mutate({ ...data, userId }, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="font-bold text-xl">Thêm địa chỉ mới</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tên người nhận</label>
                            <input
                                type="text"
                                placeholder="Vd: Nguyễn Văn A"
                                className={`w-full px-4 py-2 rounded-xl border ${errors.receiverName ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                                {...register('receiverName')}
                            />
                            {errors.receiverName && <p className="text-red-500 text-[10px] mt-1">{errors.receiverName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại</label>
                            <input
                                type="text"
                                placeholder="09xxx..."
                                className={`w-full px-4 py-2 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                                {...register('phone')}
                            />
                            {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Địa chỉ cụ thể</label>
                        <input
                            type="text"
                            placeholder="Số nhà, tên đường..."
                            className={`w-full px-4 py-2 rounded-xl border ${errors.addressLine ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            {...register('addressLine')}
                        />
                        {errors.addressLine && <p className="text-red-500 text-[10px] mt-1">{errors.addressLine.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Quận/Huyện</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-2 rounded-xl border ${errors.district ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                                {...register('district')}
                            />
                            {errors.district && <p className="text-red-500 text-[10px] mt-1">{errors.district.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tỉnh/Thành phố</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-2 rounded-xl border ${errors.city ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
                                {...register('city')}
                            />
                            {errors.city && <p className="text-red-500 text-[10px] mt-1">{errors.city.message}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            id="isDefault"
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                            {...register('isDefault')}
                        />
                        <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">Đặt làm địa chỉ mặc định</label>
                    </div>
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={addAddress.isPending}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {addAddress.isPending ? 'Đang thêm...' : 'Lưu địa chỉ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ChangePasswordModal = ({ onClose }: { onClose: () => void }) => {
    const changePassword = useChangePassword();
    const { register, handleSubmit, setError, formState: { errors } } = useForm<ChangePasswordSchemaType>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (data: ChangePasswordSchemaType) => {
        changePassword.mutate(data, {
            onSuccess: () => onClose(),
            onError: (error: any) => {
                const message = String(error.response?.data?.message || error.response?.data || error.message || '').toLowerCase();
                if (message.includes('mật khẩu hiện tại')) {
                    setError('currentPassword', { type: 'server', message: 'Mật khẩu hiện tại không đúng' });
                } else if (message.includes('xác nhận mật khẩu')) {
                    setError('confirmPassword', { type: 'server', message: 'Xác nhận mật khẩu không khớp' });
                } else if (message.includes('validation')) {
                    setError('newPassword', { type: 'server', message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
                }
            },
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="font-bold text-xl">Đổi mật khẩu</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <PasswordField label="Mật khẩu hiện tại" error={errors.currentPassword?.message} inputProps={register('currentPassword')} />
                    <PasswordField label="Mật khẩu mới" error={errors.newPassword?.message} inputProps={register('newPassword')} />
                    <PasswordField label="Xác nhận mật khẩu" error={errors.confirmPassword?.message} inputProps={register('confirmPassword')} />
                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">
                            Hủy
                        </button>
                        <button type="submit" disabled={changePassword.isPending} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                            {changePassword.isPending ? 'Đang đổi...' : 'Đổi mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PasswordField = ({ label, error, inputProps }: { label: string; error?: string; inputProps: any }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
        <input
            type="password"
            className={`w-full px-4 py-2 rounded-xl border ${error ? 'border-red-500' : 'border-gray-200'} focus:ring-2 focus:ring-blue-500 outline-none`}
            {...inputProps}
        />
        {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
    </div>
);

const InfoField = ({ label, value, icon }: { label: string, value?: string, icon: React.ReactNode }) => (
    <div className="space-y-1">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-gray-400">{icon}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
    </div>
);

export default ProfilePage;
