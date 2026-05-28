import React, { useState } from 'react';
import { useMyShop } from '@/features/shop/hooks/use-shop';
import { useShopDiscounts, useDeleteDiscount, useCreateDiscount } from '../hooks/use-discount';
import { Tag, Plus, Trash2, Calendar, Ticket, AlertCircle, X, Loader2, Info } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { DiscountResponse } from '../types/discount.types';

const DiscountManagementPage = () => {
    const { data: shop, isLoading: isLoadingShop } = useMyShop();
    const { data: discounts, isLoading: isLoadingDiscounts } = useShopDiscounts(shop?.id);
    const deleteMutation = useDeleteDiscount(shop?.id || 0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
            deleteMutation.mutate(id);
        }
    };

    // Hàm format ngày tháng native để không cần thư viện bên thứ 3
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (isLoadingShop || isLoadingDiscounts) return <div className="p-20 text-center text-gray-400">Đang tải danh sách khuyến mãi...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0F0F0F] tracking-tight flex items-center gap-2">
                        <Tag size={24} /> Chương trình giảm giá
                    </h1>
                    <p className="text-[#6B7280] text-sm mt-1">Quản lý các mã khuyến mãi và ưu đãi cho khách hàng</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#111111] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-black/10"
                >
                    <Plus size={18} /> Tạo mã mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {discounts && discounts.length > 0 ? (
                    discounts.map((discount: DiscountResponse) => (
                        <div key={discount.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Ticket size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${discount.status === 'ACTIVE'
                                    ? 'bg-green-50 text-green-600 border-green-100'
                                    : 'bg-gray-50 text-gray-400 border-gray-100'
                                    }`}>
                                    {discount.status}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-[#111111]">
                                    Giảm {discount.discountType === 'FIXED'
                                        ? (discount.discountValue ?? 0).toLocaleString()
                                        : (discount.discountValue ?? 0)}{discount.discountType === 'PERCENT' ? '%' : 'đ'}
                                </h3>
                                <p className="text-[#6B7280] text-[13px] font-medium">
                                    Đơn tối thiểu: {(discount.minOrderValue ?? 0).toLocaleString()}đ
                                </p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-[#F3F4F6] space-y-3">
                                <div className="flex items-center gap-2 text-[#6B7280] text-[12px]">
                                    <Calendar size={14} />
                                    <span>{formatDate(discount.startDate)} - {formatDate(discount.endDate)}</span>
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDelete(discount.id)}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Decorative element for "Voucher look" */}
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FAFAFA] border border-[#E5E7EB] rounded-full"></div>
                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FAFAFA] border border-[#E5E7EB] rounded-full"></div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-[#E5E7EB] flex flex-col items-center justify-center text-[#9CA3AF]">
                        <AlertCircle size={40} strokeWidth={1} className="mb-4" />
                        <p className="text-sm font-medium italic">Shop của bạn chưa có chương trình khuyến mãi nào.</p>
                    </div>
                )}
            </div>

            {isModalOpen && shop && (
                <CreateDiscountModal shopId={shop.id} onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    );
};

// Zod schema cho validation form tạo discount
const discountSchema = z.object({
    shopId: z.number(),
    discountTarget: z.enum(['SHOP', 'PRODUCT', 'ORDER']),
    discountType: z.enum(['PERCENT', 'FIXED']),
    discountValue: z.number().min(1, 'Giá trị giảm phải lớn hơn 0'),
    code: z.string().optional(),
    startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
    endDate: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    minOrderValue: z.number().min(0, 'Giá trị đơn tối thiểu không thể âm'),
    productIds: z.string().optional(), // Nhận vào string rồi transform sang array
}).refine((data) => {
    if (data.discountTarget === 'ORDER' && !data.code) {
        return false; // Mã voucher là bắt buộc cho loại ORDER
    }
    return true;
}, {
    message: 'Mã voucher là bắt buộc cho loại "Voucher Đơn hàng"',
    path: ['code'],
}).refine((data) => {
    if (data.discountTarget === 'PRODUCT' && (!data.productIds || data.productIds.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: 'Vui lòng nhập danh sách ID sản phẩm áp dụng',
    path: ['productIds'],
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate'],
});

const CreateDiscountModal = ({ shopId, onClose }: { shopId: number, onClose: () => void }) => {
    const createMutation = useCreateDiscount();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<z.infer<typeof discountSchema>>({
        resolver: zodResolver(discountSchema),
        defaultValues: {
            shopId: shopId,
            discountTarget: 'SHOP',
            discountType: 'PERCENT',
            discountValue: 0,
            code: '',
            minOrderValue: 0,
            startDate: new Date().toISOString().split('T')[0], // Mặc định ngày hiện tại
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mặc định 7 ngày sau
            status: 'ACTIVE'
        }
    });

    const onSubmit = (data: z.infer<typeof discountSchema>) => {
        // Chuyển đổi định dạng ngày cho khớp với API (ISO String)
        const payload = {
            ...data,
            discountValue: Number(data.discountValue),
            minOrderValue: Number(data.minOrderValue),
            startDate: new Date(data.startDate).toISOString(),
            endDate: new Date(data.endDate).toISOString(),
            // Convert string "1,2,3" thành [1, 2, 3]
            productIds: data.productIds
                ? data.productIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
                : []
        };

        createMutation.mutate(payload, {
            onSuccess: () => onClose()
        });
    };

    const discountTarget = watch('discountTarget');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-[#F3F4F6]">
                    <h3 className="font-black text-xl text-[#111111]">Tạo chương trình giảm giá</h3>
                    <button onClick={onClose} className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1">
                            <label className="block text-[11px] font-black text-[#9CA3AF] uppercase tracking-wider mb-2">Mục tiêu giảm giá</label>
                            <select {...register('discountTarget')} className={`w-full px-4 py-3 bg-[#FAFAFA] border rounded-xl outline-none focus:border-[#111111] ${errors.discountTarget ? 'border-red-500' : 'border-[#E5E7EB]'}`}>
                                <option value="SHOP">Toàn Shop</option>
                                <option value="PRODUCT">Theo Sản phẩm</option>
                                <option value="ORDER">Voucher Đơn hàng</option>
                            </select>
                            {errors.discountTarget && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><Info size={12} /> {errors.discountTarget.message}</p>}
                        </div>
                        {discountTarget === 'ORDER' && (
                            <div className="col-span-1">
                                <label className="block text-[11px] font-black text-[#9CA3AF] uppercase tracking-wider mb-2">Mã Voucher</label>
                                <input {...register('code')} className={`w-full px-4 py-3 bg-[#FAFAFA] border rounded-xl outline-none focus:border-[#111111] ${errors.code ? 'border-red-500' : 'border-[#E5E7EB]'}`} placeholder="Vd: SUMMER50" />
                                {errors.code && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><Info size={12} /> {errors.code.message}</p>}
                            </div>
                        )}

                        <div className="col-span-1">
                            <label className="block text-[11px] font-black text-[#9CA3AF] uppercase tracking-wider mb-2">Loại giảm giá</label>
                            <select {...register('discountType')} className={`w-full px-4 py-3 bg-[#FAFAFA] border rounded-xl outline-none focus:border-[#111111] ${errors.discountType ? 'border-red-500' : 'border-[#E5E7EB]'}`}>
                                <option value="PERCENT">Phần trăm (%)</option>
                                <option value="FIXED">Số tiền cố định (đ)</option>
                            </select>
                            {errors.discountType && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><Info size={12} /> {errors.discountType.message}</p>}
                        </div>
                        <div className="col-span-1">
                            <label className="block text-[11px] font-black text-[#9CA3AF] uppercase tracking-wider mb-2">Giá trị giảm</label>
                            <input type="number" {...register('discountValue', { valueAsNumber: true })} className={`w-full px-4 py-3 bg-[#FAFAFA] border rounded-xl outline-none focus:border-[#111111] ${errors.discountValue ? 'border-red-500' : 'border-[#E5E7EB]'}`} placeholder="0" />
                            {errors.discountValue && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><Info size={12} /> {errors.discountValue.message}</p>}
                        </div>
                    </div>

                    {discountTarget === 'ORDER' && (
                        <div>
                            <label className="block text-[11px] font-black text-[#9CA3AF] uppercase tracking-wider mb-2">Giá trị đơn hàng tối thiểu (đ)</label>
                            <input type="number" {...register('minOrderValue', { valueAsNumber: true })} className={`w-full px-4 py-3 bg-[#FAFAFA] border rounded-xl outline-none focus:border-[#111111] ${errors.minOrderValue ? 'border-red-500' : 'border-[#E5E7EB]'}`} placeholder="Vd: 500,000" />
                            {errors.minOrderValue && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><Info size={12} /> {errors.minOrderValue.message}</p>}
                        </div>
                    )}

                    {discountTarget === 'PRODUCT' && (
                        <div>
                            <label className="block text-[11px] font-black text-[#9CA3AF] uppercase tracking-wider mb-2">Danh sách ID sản phẩm (cách nhau bởi dấu phẩy)</label>
                            <input {...register('productIds')} className={`w-full px-4 py-3 bg-[#FAFAFA] border rounded-xl outline-none focus:border-[#111111] ${errors.productIds ? 'border-red-500' : 'border-[#E5E7EB]'}`} placeholder="Vd: 1, 15, 22" />
                            {errors.productIds && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><Info size={12} /> {errors.productIds.message}</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-black text-[#9CA3AF] uppercase tracking-wider mb-2">Ngày bắt đầu</label>
                            <input type="date" {...register('startDate')} className={`w-full px-4 py-3 bg-[#FAFAFA] border rounded-xl outline-none focus:border-[#111111] ${errors.startDate ? 'border-red-500' : 'border-[#E5E7EB]'}`} />
                            {errors.startDate && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><Info size={12} /> {errors.startDate.message}</p>}
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-[#9CA3AF] uppercase tracking-wider mb-2">Ngày kết thúc</label>
                            <input type="date" {...register('endDate')} className={`w-full px-4 py-3 bg-[#FAFAFA] border rounded-xl outline-none focus:border-[#111111] ${errors.endDate ? 'border-red-500' : 'border-[#E5E7EB]'}`} />
                            {errors.endDate && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><Info size={12} /> {errors.endDate.message}</p>}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-4 border border-[#E5E7EB] rounded-2xl font-bold text-[#6B7280] hover:bg-[#F9FAFB] transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-[2] px-4 py-4 bg-[#111111] text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-50"
                        >
                            {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            Lưu chương trình
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DiscountManagementPage;