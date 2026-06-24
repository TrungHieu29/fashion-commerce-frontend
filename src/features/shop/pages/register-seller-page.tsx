import { useState, type ChangeEvent, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowRight, Image as ImageIcon, Store, Trash2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import type { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { getShopStatusMessage } from '@/lib/status-messages';
import { useCreateShop, useMyShop } from '../hooks/use-shop';
import { shopSchema } from '../schemas/shop.schema';

type ShopFormValues = z.infer<typeof shopSchema>;

const RegisterSellerPage = () => {
    const navigate = useNavigate();
    const createShop = useCreateShop();
    const user = useAuthStore((state) => state.user);
    const { data: myShop, isLoading } = useMyShop();
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState('');

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ShopFormValues>({
        resolver: zodResolver(shopSchema),
        defaultValues: {
            shopName: '',
            phone: '',
            address: '',
            email: '',
            logo: '',
        },
    });

    const logoUrl = watch('logo');
    const logoRegister = register('logo');

    const onSubmit = (data: ShopFormValues) => {
        if (!user) return;

        createShop.mutate(
            {
                data: {
                    shopName: data.shopName,
                    phone: data.phone || '',
                    address: data.address,
                    email: data.email || '',
                    logo: data.logo || '',
                    ownerId: user.id,
                },
                logoFile,
            },
            {
                onSuccess: () => {
                    navigate('/my-shop');
                },
            }
        );
    };

    const handleLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh hợp lệ.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Logo không được vượt quá 5MB.');
            return;
        }

        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
        setValue('logo', '', { shouldValidate: false });
    };

    const clearLogoFile = () => {
        setLogoFile(null);
        setLogoPreview('');
    };

    if (isLoading) {
        return <div className="flex min-h-[520px] items-center justify-center text-sm font-bold text-slate-400">Đang kiểm tra trạng thái shop...</div>;
    }

    if (myShop) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-blue-600">
                        {myShop.logo ? <img src={myShop.logo} alt={myShop.shopName} className="h-full w-full object-cover" /> : <Store size={34} />}
                    </div>
                    <h1 className="text-3xl font-black text-slate-950">{myShop.shopName}</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-500">{getShopStatusMessage(myShop.status)}</p>
                    <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm">
                        Trạng thái hiện tại: <span className="font-black text-blue-600">{myShop.status}</span>
                    </div>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link to="/" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 hover:bg-slate-50">
                            Về trang chủ
                        </Link>
                        {myShop.status === 'ACTIVE' && (
                            <Link to="/my-shop" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">
                                Vào kênh bán hàng
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-3xl px-4 py-16">
            <div className="mb-10 text-center">
                <div className="mb-4 inline-flex rounded-2xl bg-blue-50 p-4 text-blue-600">
                    <Store size={40} />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-950">Trở thành người bán hàng</h1>
                <p className="mt-2 text-slate-500">Sau khi gửi đăng ký, shop sẽ ở trạng thái chờ quản trị viên duyệt.</p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-100/70">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FormField label="Tên cửa hàng" error={errors.shopName?.message}>
                        <input type="text" placeholder="Nhập tên shop của bạn" className={`w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${errors.shopName ? 'border-red-500' : 'border-slate-200'}`} {...register('shopName')} />
                    </FormField>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <FormField label="Email liên hệ" error={errors.email?.message}>
                            <input type="email" placeholder="Vd: shop@gmail.com" className={`w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-slate-200'}`} {...register('email')} />
                        </FormField>
                        <FormField label="Số điện thoại" error={errors.phone?.message}>
                            <input type="text" placeholder="09xxxx" className={`w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-slate-200'}`} {...register('phone')} />
                        </FormField>
                    </div>

                    <FormField label="Địa chỉ kinh doanh" error={errors.address?.message}>
                        <input type="text" placeholder="Địa chỉ chi tiết của shop" className={`w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-500' : 'border-slate-200'}`} {...register('address')} />
                    </FormField>

                    <FormField label="Logo shop" error={errors.logo?.message}>
                        <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                                {logoPreview || logoUrl ? (
                                    <>
                                        <img src={logoPreview || logoUrl} alt="Logo shop" className="h-full w-full object-cover" />
                                        {logoPreview && (
                                            <button type="button" onClick={clearLogoFile} className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-red-500 shadow-sm hover:bg-white">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <ImageIcon className="mx-auto mb-2" size={30} />
                                        <p className="text-xs font-bold">Chưa có logo</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-4 py-5 text-center text-blue-700 transition hover:border-blue-400 hover:bg-blue-100">
                                    <UploadCloud size={24} />
                                    <span className="mt-2 text-sm font-black">Chọn ảnh từ máy</span>
                                    <span className="mt-1 text-xs text-blue-500">PNG, JPG, WEBP tối đa 5MB</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />
                                </label>

                                <div>
                                    <p className="mb-2 text-xs font-bold uppercase text-slate-400">Hoặc dán URL logo</p>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        className={`w-full rounded-xl border px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${errors.logo ? 'border-red-500' : 'border-slate-200'}`}
                                        {...logoRegister}
                                        onChange={(event) => {
                                            clearLogoFile();
                                            logoRegister.onChange(event);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </FormField>

                    <button type="submit" disabled={createShop.isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70">
                        {createShop.isPending ? 'Đang xử lý...' : 'Gửi đăng ký chờ duyệt'}
                        <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

const FormField = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
    <div>
        <label className="mb-1 block text-sm font-bold text-slate-700">{label}</label>
        {children}
        {error && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} />
                {error}
            </p>
        )}
    </div>
);

export default RegisterSellerPage;
