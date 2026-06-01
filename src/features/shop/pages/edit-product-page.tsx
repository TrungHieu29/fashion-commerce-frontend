import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Trash2, Save, ArrowLeft, Loader2, Plus, Package, UploadCloud } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateProduct } from '@/features/product/api/product.api';
import { useMyShop } from '../hooks/use-shop';
import { api } from '@/lib/axios';
import type { ProductVariantResponse } from '@/features/product-variant/types/variant.types';
import type { ProductImageResponse } from '@/features/product-variant/types/variant.types';

interface FormProductVariant extends Partial<Omit<ProductVariantResponse, 'productId' | 'priceAdjustment' | 'sku'>> {
    size: string;
    color: string;
    stock: number;
}

interface ProductFormValues {
    productName: string;
    productDetail: string;
    price: number;
    categoryId: string;
    brandId: string;
    variants: FormProductVariant[];
}

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: shop } = useMyShop();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newColorImages, setNewColorImages] = useState<Record<string, File>>({});

    // Sử dụng helper function hoặc hook thay vì api.get trực tiếp để thống nhất coding style
    const { data: product, isLoading: isLoadingProduct } = useQuery({
        queryKey: ['product', id],
        queryFn: () => api.get(`/api/products/${id}`, { params: { sort: 'id,desc' } }).then(res => res.data),
        enabled: !!id
    });

    const { data: currentImages, refetch: refetchImages } = useQuery<ProductImageResponse[]>({
        queryKey: ['product-images', id],
        queryFn: () => api.get(`/api/product-images/product/${id}`).then(res => res.data),
        enabled: !!id
    });

    const { data: variants, isLoading: isLoadingVariants } = useQuery({
        queryKey: ['product-variants', id],
        queryFn: async () => {
            const res = await api.get(`/api/product-variants/product/${id}`, { params: { sort: 'id,desc' } });
            return res.data;
        },
        enabled: !!id
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/api/categories');
            return res.data;
        }
    });

    const { data: brands } = useQuery({
        queryKey: ['brands'],
        queryFn: async () => {
            const res = await api.get('/api/product-brands');
            return res.data;
        }
    });

    const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm<ProductFormValues>({
        defaultValues: {
            productName: '',
            productDetail: '',
            price: 0,
            categoryId: '',
            brandId: '',
            variants: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "variants"
    });

    const watchedVariants = useWatch({ control, name: 'variants' });
    const uniqueColors = useMemo(() => {
        const colorMap = new Map<string, string>(); // lowercase -> original

        // Check variants hiện tại trong form
        (watchedVariants || []).forEach(v => {
            const trimmed = v.color?.trim();
            if (trimmed) {
                const lower = trimmed.toLowerCase();
                if (!colorMap.has(lower)) colorMap.set(lower, trimmed);
            }
        });

        // Check ảnh đã tồn tại để không làm mất ô hiển thị
        (currentImages || []).forEach(img => {
            const trimmed = img.color?.trim();
            if (trimmed) {
                const lower = trimmed.toLowerCase();
                if (!colorMap.has(lower)) colorMap.set(lower, trimmed);
            }
        });

        const result = Array.from(colorMap.values());
        return result.length > 0 ? result : [''];
    }, [watchedVariants, currentImages]);

    useEffect(() => {
        if (product && variants) {
            reset({
                productName: product.productName,
                productDetail: product.productDetail,
                price: product.originalPrice, // Sử dụng originalPrice để điền vào form
                categoryId: product.categoryId.toString(),
                brandId: product.brandId.toString(),
                variants: (variants || []).map((v: ProductVariantResponse) => ({
                    id: v.id,
                    size: v.size,
                    color: v.color,
                    stock: v.stock
                }))
            });
        }
    }, [product, variants, reset]);

    const onSubmit = async (data: ProductFormValues) => {
        if (!shop || !id) return;
        setIsSubmitting(true);
        try {
            await updateProduct(Number(id), {
                ...data,
                shopId: shop.id, // Đảm bảo shopId được gửi
                originalPrice: Number(data.price), // Gửi originalPrice từ form
                categoryId: Number(data.categoryId), // Chuyển đổi sang số
                brandId: Number(data.brandId),   // Chuyển đổi sang số
                status: product.status || 'ACTIVE'
            });

            // Xử lý dữ liệu variant cực kỳ an toàn để tránh lỗi filter/includes
            const currentVariantsList = Array.isArray(variants) ? variants : (variants?.content || []);

            // Lấy danh sách ID từ form (đã được định nghĩa kiểu qua ProductFormValues)
            const submittedVariantIds: number[] = (data.variants || []) // data.variants đã là FormProductVariant[]
                .map(v => v.id ? Number(v.id) : null) // v.id là number | undefined
                .filter((id): id is number => id !== null);

            const originalVariantIds: number[] = currentVariantsList // currentVariantsList là ProductVariantResponse[]
                .map((v: ProductVariantResponse) => Number(v.id))
                .filter((id: number) => !isNaN(id));

            const deletePromises = originalVariantIds
                .filter(oid => !submittedVariantIds.includes(oid))
                .map(oid => api.delete(`/api/product-variants/${oid}`));

            const upsertPromises = data.variants.map((v: FormProductVariant) => {
                const payload = { productId: Number(id), size: v.size, color: v.color, stock: Number(v.stock) };
                return v.id ? api.put(`/api/product-variants/${v.id}`, payload) : api.post('/api/product-variants', payload);
            });

            // Xử lý upload ảnh mới và xóa ảnh cũ nếu ghi đè
            const imageUploadPromises = Object.entries(newColorImages).map(async ([color, file]) => {
                // Tìm xem màu này đã có ảnh chưa
                const existingImg = currentImages?.find(img => img.color === color);
                if (existingImg) {
                    // Xóa ảnh cũ trước khi upload mới
                    await api.delete(`/api/product-images/${existingImg.id}`);
                }

                const formData = new FormData();
                formData.append('file', file);
                formData.append('productId', id!);
                formData.append('color', color);
                return api.post('/api/product-images/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            });

            await Promise.all([...deletePromises, ...upsertPromises, ...imageUploadPromises]);
            toast.success('Cập nhật thành công!');
            queryClient.invalidateQueries({ queryKey: ['shop-products'] });
            navigate('/my-shop/products');
        } catch (error: any) {
            toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!window.confirm('Xóa ảnh này?')) return;
        try {
            await api.delete(`/api/product-images/${imageId}`);
            toast.success('Đã xóa ảnh');
            refetchImages();
        } catch (error) {
            toast.error('Không thể xóa ảnh');
        }
    };

    if (isLoadingProduct || isLoadingVariants) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <button onClick={() => navigate('/my-shop/products')} className="flex items-center gap-2 text-[#6B7280] hover:text-[#111111] font-bold text-sm transition-colors">
                <ArrowLeft size={16} /> Quay lại danh sách
            </button>

            <div className="flex items-center gap-3">
                <div className="p-3 bg-[#111111] text-white rounded-2xl"><Package size={24} /></div>
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0F0F0F] tracking-tight">Chỉnh sửa sản phẩm</h1>
                    <p className="text-[#6B7280] text-sm">Cập nhật thông tin và quản lý kho hàng</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-6">
                    <h3 className="font-bold text-lg border-b pb-4">Thông tin cơ bản</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-[13px] font-bold text-[#6B7280] mb-2 uppercase tracking-wide">Tên sản phẩm</label>
                            <input {...register('productName', { required: true })} className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#111111]" />
                        </div>
                        <div>
                            <label className="block text-[13px] font-bold text-[#6B7280] mb-2 uppercase tracking-wide">Giá bán (VNĐ)</label>
                            <input type="number" {...register('price', { required: true, valueAsNumber: true })} className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl outline-none font-mono" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[13px] font-bold text-[#6B7280] mb-2 uppercase tracking-wide">Danh mục</label>
                                <select {...register('categoryId', { required: true })} className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl outline-none">
                                    {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#6B7280] mb-2 uppercase tracking-wide">Thương hiệu</label>
                                <select {...register('brandId', { required: true })} className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl outline-none">
                                    {brands?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h3 className="font-bold text-lg">Phân loại hàng & Tồn kho</h3>
                        <button type="button" onClick={() => append({ size: '', color: '', stock: 0 })} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <Plus size={16} /> Thêm phân loại
                        </button>
                    </div>
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-end gap-4 p-4 bg-[#FAFAFA] rounded-xl border border-[#E5E7EB]/50 group">
                                <div className="flex-1 grid grid-cols-3 gap-4">
                                    <input {...register(`variants.${index}.size` as const)} placeholder="Size" className="w-full px-3 py-2 border rounded-lg outline-none focus:border-[#111111]" />
                                    <input {...register(`variants.${index}.color` as const)} placeholder="Màu sắc" className="w-full px-3 py-2 border rounded-lg outline-none focus:border-[#111111]" />
                                    <input type="number" {...register(`variants.${index}.stock` as const)} placeholder="Kho" className="w-full px-3 py-2 border rounded-lg outline-none focus:border-[#111111]" />
                                </div>
                                <button type="button" onClick={() => remove(index)} className="p-2.5 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quản lý Hình ảnh - Đưa xuống dưới */}
                <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-6">
                    <h3 className="font-bold text-lg border-b pb-4">Hình ảnh sản phẩm</h3>
                    <p className="text-xs text-[#9CA3AF] italic -mt-2">
                        * Các ô upload ảnh sẽ tự động hiển thị dựa trên màu sắc bạn đã nhập trong phần Phân loại hàng.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {uniqueColors.map(color => {
                            const existingImage = currentImages?.find(img => img.color?.toLowerCase() === color.toLowerCase());
                            const newFile = newColorImages[color];

                            return (
                                <div key={color} className="space-y-2">
                                    <label className="block text-[11px] font-black text-[#9CA3AF] uppercase">{color || 'Ảnh chính'}</label>
                                    <div className="relative aspect-square border-2 border-dashed border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center hover:border-[#111111] transition-all overflow-hidden group">
                                        {newFile || existingImage ? (
                                            <>
                                                <img
                                                    src={newFile ? URL.createObjectURL(newFile) : existingImage?.imageUrl}
                                                    className="w-full h-full object-cover"
                                                    alt=""
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => existingImage ? handleDeleteImage(existingImage.id) : setNewColorImages(prev => {
                                                        const next = { ...prev };
                                                        delete next[color];
                                                        return next;
                                                    })}
                                                    className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center">
                                                <UploadCloud size={24} className="text-[#9CA3AF]" />
                                                <span className="text-[10px] font-bold text-[#9CA3AF] mt-2 tracking-tighter">TẢI ẢNH LÊN</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setNewColorImages(prev => ({ ...prev, [color]: e.target.files![0] }))} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-[#111111] text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {isSubmitting ? 'Đang cập nhật...' : 'Lưu thay đổi sản phẩm'}
                </button>
            </form>
        </div>
    );
};

export default EditProductPage;