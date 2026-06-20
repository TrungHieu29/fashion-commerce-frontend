import React, { useState, useMemo } from 'react';
import { useMyShop } from '@/features/shop/hooks/use-shop';
import { useShopDiscounts, useDeleteDiscount, useCreateDiscount } from '../hooks/use-discount'; // Giả định useUpdateDiscount chưa có
import { Tag, Plus, Trash2, Calendar, Ticket, AlertCircle, X, Loader2, Info, Edit3, Search, CheckCircle2 } from 'lucide-react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { DiscountResponse } from '../types/discount.types';
import { api } from '@/lib/axios';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const DiscountManagementPage = () => {
    const { data: shop, isLoading: isLoadingShop } = useMyShop();
    const { data: discounts, isLoading: isLoadingDiscounts } = useShopDiscounts(shop?.id);
    const deleteMutation = useDeleteDiscount(shop?.id || 0);
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<DiscountResponse | null>(null);

    const handleDelete = (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleEdit = (discount: DiscountResponse) => {
        setEditingDiscount(discount);
        setIsModalOpen(true);
    };

    // Hàm format ngày tháng native để không cần thư viện bên thứ 3
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Helper để xác định trạng thái hiển thị
    const getDisplayStatus = (discount: DiscountResponse) => {
        const isExpired = new Date(discount.endDate) < new Date();
        if (isExpired) return { label: 'HẾT HẠN', class: 'bg-red-50 text-red-600 border-red-100' };
        if (discount.status === 'ACTIVE') return { label: 'ĐANG CHẠY', class: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
        return { label: 'TẠM DỪNG', class: 'bg-amber-50 text-amber-600 border-amber-100' };
    };

    const getTargetLabel = (target: string) => {
        switch (target) {
            case 'SHOP': return 'Toàn Shop';
            case 'PRODUCT': return 'Sản phẩm';
            case 'ORDER': return 'Đơn hàng';
            default: return target;
        }
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
                        <div key={discount.id} className={`bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${new Date(discount.endDate) < new Date() ? 'bg-gray-50/50 grayscale-[0.5]' : ''}`}>
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                        <Ticket size={24} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getDisplayStatus(discount).class}`}>
                                            {getDisplayStatus(discount).label}
                                        </span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                            {getTargetLabel((discount as any).discountTarget || 'SHOP')}
                                        </span>
                                        <p className="text-[10px] text-red-500 italic font-medium -mt-1">
                                            {!(discount as any).discountTarget && "* Backend thiếu field discountTarget"}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {discount.code && (
                                        <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 w-fit px-2 py-1 rounded-lg border border-blue-100">
                                            CODE: {discount.code}
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-black text-[#111111] tracking-tight">
                                        Giảm {discount.discountType === 'FIXED'
                                            ? (discount.discountValue ?? 0).toLocaleString()
                                            : (discount.discountValue ?? 0)}{discount.discountType === 'PERCENT' ? '%' : 'đ'}
                                    </h3>
                                    <p className="text-[#6B7280] text-[13px] font-bold">
                                        Đơn tối thiểu: {(discount.minOrderValue ?? 0).toLocaleString()}đ
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-dashed border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[#9CA3AF] text-[11px] font-bold">
                                        <Calendar size={14} />
                                        <span>{formatDate(discount.startDate)} - {formatDate(discount.endDate)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(discount)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(discount.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
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
                <CreateDiscountModal
                    shopId={shop.id}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingDiscount(null);
                    }}
                    initialData={editingDiscount}
                />
            )}
        </div>
    );
};

// Zod schema cho validation form tạo discount
const discountSchema = z.object({
    shopId: z.number(),
    discountTarget: z.string().min(1, 'Vui lòng chọn mục tiêu'), // SHOP, PRODUCT, ORDER
    discountType: z.string().min(1, 'Vui lòng chọn loại giảm giá'), // PERCENT, FIXED
    discountValue: z.number().min(1, 'Giá trị giảm phải lớn hơn 0'),
    code: z.string().optional(),
    startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
    endDate: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
    status: z.string().min(1, 'Trạng thái là bắt buộc'),
    minOrderValue: z.number().min(0, 'Giá trị đơn tối thiểu không thể âm'),
    productIds: z.string().optional().or(z.literal('')),
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

/**
 * Component chọn sản phẩm áp dụng mã giảm giá
 */
const ProductSelectorModal = ({ shopId, selectedIds, onSelect, onClose }: { shopId: number, selectedIds: number[], onSelect: (ids: number[]) => void, onClose: () => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelected, setTempSelected] = useState<number[]>(selectedIds);

    // Lấy danh sách sản phẩm của shop
    const { data: productsData, isLoading } = useQuery({
        queryKey: ['shop-products-for-discount', shopId],
        queryFn: () => api.get(`/api/products/shop/${shopId}`).then(res => res.data),
    });

    const products = productsData?.content || [];
    const filteredProducts = products.filter((p: any) =>
        p.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleProduct = (id: number) => {
        setTempSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-6 border-b flex justify-between items-center">
                    <h4 className="font-black text-lg uppercase tracking-tight">Chọn sản phẩm ({tempSelected.length})</h4>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                </div>

                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm tên sản phẩm..."
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-600 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoading ? (
                        <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-gray-300" /></div>
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((p: any) => (
                            <div
                                key={p.id}
                                onClick={() => toggleProduct(p.id)}
                                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${tempSelected.includes(p.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${tempSelected.includes(p.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                    {tempSelected.includes(p.id) && <CheckCircle2 size={14} className="text-white" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{p.productName}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{p.categoryName} • {p.brandName}</p>
                                </div>
                                <p className="text-xs font-black text-gray-900">{p.finalPrice.toLocaleString()}đ</p>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center text-gray-400 text-sm italic">Không tìm thấy sản phẩm nào</div>
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50/50 rounded-b-3xl flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 text-sm"
                    >Hủy</button>
                    <button
                        onClick={() => { onSelect(tempSelected); onClose(); }}
                        className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                    >Xác nhận chọn</button>
                </div>
            </div>
        </div>
    );
};

const CreateDiscountModal = ({ shopId, onClose, initialData }: { shopId: number, onClose: () => void, initialData?: DiscountResponse | null }) => {
    const createMutation = useCreateDiscount();
    const queryClient = useQueryClient();
    const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<z.infer<typeof discountSchema>>({
        resolver: zodResolver(discountSchema),
        defaultValues: initialData
            ? {
                shopId: initialData.shopId ? Number(initialData.shopId) : shopId,
                discountType: initialData.discountType || 'PERCENT',
                discountValue: Number(initialData.discountValue) || 0,
                minOrderValue: Number(initialData.minOrderValue) || 0,
                status: initialData.status || 'ACTIVE',
                startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
                endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
                discountTarget: (initialData as any).discountTarget || 'SHOP',
                code: (initialData as any).code || '',
                productIds: (initialData as any).productIds ? (initialData as any).productIds.join(',') : '',
            }
            : {
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

    const productIdsStr = watch('productIds') || '';
    const selectedProductIds = useMemo(() =>
        productIdsStr.split(',').map(id => parseInt(id.trim())).filter(v => !isNaN(v)),
        [productIdsStr]);

    const onSubmit = async (data: z.infer<typeof discountSchema>) => {
        // Đảm bảo payload gửi lên khớp 100% với DiscountRequestDto trong API.md
        const payload = {
            shopId: Number(data.shopId),
            discountTarget: data.discountTarget,
            discountType: data.discountType,
            discountValue: Number(data.discountValue),
            code: data.code && data.code.trim() !== '' ? data.code.trim() : undefined,
            minOrderValue: Number(data.minOrderValue),
            status: data.status,
            // Backend Java yêu cầu định dạng LocalDateTime (YYYY-MM-DDTHH:mm:ss)
            startDate: `${data.startDate}T00:00:00`,
            endDate: `${data.endDate}T23:59:59`,
            productIds: data.productIds && data.productIds.trim() !== ''
                ? data.productIds.split(',').map(id => parseInt(id.trim())).filter(v => !isNaN(v))
                : []
        };

        if (initialData) {
            try {
                await api.put(`/api/discounts/${initialData.id}`, payload as any);
                toast.success('Cập nhật mã giảm giá thành công');
                queryClient.invalidateQueries({ queryKey: ['shop-discounts', shopId] });
                onClose();
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Lỗi cập nhật');
            }
        } else {
            // Ép kiểu any vì payload đã được transform sang mảng số cho Backend, 
            // khác với kiểu string trong Zod schema mà mutation hook có thể đang sử dụng.
            createMutation.mutate(payload as any, {
                onSuccess: () => onClose()
            });
        }
    };

    const discountTarget = watch('discountTarget');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-[#F3F4F6]">
                    <h3 className="font-black text-xl text-[#111111]">
                        {initialData ? 'Chỉnh sửa mã giảm giá' : 'Tạo chương trình giảm giá'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-[#F3F4F6] rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[11px] font-black text-[#9CA3AF] uppercase tracking-wider mb-2">Mục tiêu giảm giá</label>
                            <select
                                {...register('discountTarget')}
                                disabled={!!initialData} // Disable nếu đang ở chế độ chỉnh sửa
                                className={`w-full px-4 py-3 bg-[#FAFAFA] border rounded-xl outline-none focus:border-[#111111] ${errors.discountTarget ? 'border-red-500' : 'border-[#E5E7EB]'}`}
                            >
                                <option value="SHOP">Toàn Shop</option>
                                <option value="PRODUCT">Theo Sản phẩm</option>
                                <option value="ORDER">Voucher Đơn hàng</option>
                            </select>
                            {errors.discountTarget && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><Info size={12} /> {errors.discountTarget.message}</p>}
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-[11px] font-black text-[#9CA3AF] uppercase tracking-wider mb-2">Trạng thái vận hành</label>
                            <select {...register('status')} className={`w-full px-4 py-3 bg-[#FAFAFA] border rounded-xl outline-none focus:border-[#111111] ${errors.status ? 'border-red-500' : 'border-[#E5E7EB]'}`}>
                                <option value="ACTIVE">Kích hoạt (Đang chạy)</option>
                                <option value="INACTIVE">Tạm dừng (Bảo trì)</option>
                            </select>
                            {errors.status && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><Info size={12} /> {errors.status.message}</p>}
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
                            <label className="block text-[11px] font-black text-[#9CA3AF] uppercase tracking-wider mb-2">Sản phẩm áp dụng</label>
                            <div
                                onClick={() => setIsProductSelectorOpen(true)}
                                className={`w-full px-4 py-3 bg-[#FAFAFA] border rounded-xl cursor-pointer flex items-center justify-between hover:border-gray-400 transition-all ${errors.productIds ? 'border-red-500' : 'border-[#E5E7EB]'}`}
                            >
                                <span className="text-sm font-bold text-gray-700">
                                    {selectedProductIds.length > 0
                                        ? `Đã chọn ${selectedProductIds.length} sản phẩm`
                                        : 'Chưa chọn sản phẩm nào'}
                                </span>
                                <div className="flex items-center gap-1 text-blue-600 text-xs font-black uppercase">
                                    {selectedProductIds.length > 0 ? 'Thay đổi' : 'Chọn ngay'}
                                    <Plus size={14} />
                                </div>
                            </div>
                            <input type="hidden" {...register('productIds')} />
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

            {isProductSelectorOpen && (
                <ProductSelectorModal
                    shopId={shopId}
                    selectedIds={selectedProductIds}
                    onSelect={(ids) => setValue('productIds', ids.join(','))}
                    onClose={() => setIsProductSelectorOpen(false)}
                />
            )}
        </div>
    );
};

export default DiscountManagementPage;