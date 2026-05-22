import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, PackagePlus, AlertCircle, Save } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createProduct } from '@/features/product/api/product.api';
import { useMyShop } from '../hooks/use-shop';
import { api } from '@/lib/axios';

const AddProductPage = () => {
    const navigate = useNavigate();
    const { data: shop } = useMyShop();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            productName: '',
            productDetail: '',
            price: 0,
            categoryId: '',
            brandId: '',
            variants: [{ size: 'M', color: 'Black', stock: 10 }]
        }
    });

    // Lấy danh sách danh mục và thương hiệu
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

    const { fields, append, remove } = useFieldArray({
        control,
        name: "variants"
    });

    const onSubmit = async (data: any) => {
        if (!shop) return;
        setIsSubmitting(true);
        try {
            // 1. Tạo sản phẩm chính
            const productPayload = {
                productName: data.productName,
                productDetail: data.productDetail,
                price: data.price,
                shopId: shop.id,
                categoryId: parseInt(data.categoryId),
                brandId: parseInt(data.brandId),
                status: 'ACTIVE'
            };
            const newProduct = await createProduct(productPayload);

            // 2. Tạo các biến thể cho sản phẩm đó
            const variantPromises = data.variants.map((v: any) =>
                api.post('/api/product-variants', {
                    productId: newProduct.id,
                    size: v.size,
                    color: v.color,
                    stock: parseInt(v.stock)
                })
            );
            await Promise.all(variantPromises);

            toast.success('Thêm sản phẩm và biến thể thành công!');
            navigate('/my-shop/products');
        } catch (error: any) {
            toast.error('Lỗi khi thêm sản phẩm: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-[#111111] text-white rounded-2xl">
                    <PackagePlus size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0F0F0F] tracking-tight">Thêm sản phẩm mới</h1>
                    <p className="text-[#6B7280] text-sm">Điền thông tin và thiết lập các biến thể cho sản phẩm</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Thông tin cơ bản */}
                <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-5">
                    <h3 className="font-bold text-lg border-b pb-4 mb-4">Thông tin cơ bản</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-[13px] font-bold text-[#6B7280] mb-2 uppercase">Tên sản phẩm</label>
                            <input
                                {...register('productName', { required: 'Tên sản phẩm là bắt buộc' })}
                                className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:border-[#111111] outline-none"
                                placeholder="Vd: Áo Hoodie Streetwear v2"
                            />
                        </div>

                        <div>
                            <label className="block text-[13px] font-bold text-[#6B7280] mb-2 uppercase">Giá bán (VNĐ)</label>
                            <input
                                type="number"
                                {...register('price', { required: true, min: 0 })}
                                className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:border-[#111111] outline-none font-mono"
                                placeholder="0"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[13px] font-bold text-[#6B7280] mb-2 uppercase">Danh mục</label>
                                <select
                                    {...register('categoryId', { required: true })}
                                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#111111]"
                                >
                                    <option value="">Chọn danh mục</option>
                                    {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[13px] font-bold text-[#6B7280] mb-2 uppercase">Thương hiệu</label>
                                <select
                                    {...register('brandId', { required: true })}
                                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl outline-none focus:border-[#111111]"
                                >
                                    <option value="">Chọn thương hiệu</option>
                                    {brands?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[13px] font-bold text-[#6B7280] mb-2 uppercase">Mô tả chi tiết</label>
                            <textarea
                                {...register('productDetail')}
                                rows={4}
                                className="w-full px-4 py-3 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl focus:border-[#111111] outline-none resize-none"
                                placeholder="Chất liệu, form dáng, hướng dẫn bảo quản..."
                            />
                        </div>
                    </div>
                </div>

                {/* Quản lý biến thể */}
                <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-5">
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h3 className="font-bold text-lg">Phân loại hàng (Variants)</h3>
                        <button
                            type="button"
                            onClick={() => append({ size: '', color: '', stock: 0 })}
                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                        >
                            <Plus size={16} /> Thêm phân loại
                        </button>
                    </div>

                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-end gap-4 p-4 bg-[#FAFAFA] rounded-xl border border-[#E5E7EB]/50 group">
                                <div className="flex-1 grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#9CA3AF] mb-1 uppercase">Kích cỡ</label>
                                        <input
                                            {...register(`variants.${index}.size` as const)}
                                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#111111]"
                                            placeholder="S, M, L..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#9CA3AF] mb-1 uppercase">Màu sắc</label>
                                        <input
                                            {...register(`variants.${index}.color` as const)}
                                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#111111]"
                                            placeholder="Đen, Trắng..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-[#9CA3AF] mb-1 uppercase">Số lượng kho</label>
                                        <input
                                            type="number"
                                            {...register(`variants.${index}.stock` as const)}
                                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#111111]"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <p className="text-center text-[#9CA3AF] text-sm italic py-4">Chưa có phân loại nào được thêm.</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/my-shop/products')}
                        className="flex-1 py-4 border border-[#E5E7EB] rounded-2xl font-bold text-[#6B7280] hover:bg-white transition-all"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] py-4 bg-[#111111] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10 disabled:opacity-50"
                    >
                        <Save size={20} />
                        {isSubmitting ? 'Đang xử lý...' : 'Lưu & Đăng bán sản phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProductPage;