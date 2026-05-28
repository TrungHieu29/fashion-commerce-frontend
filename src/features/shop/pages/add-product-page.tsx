import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Plus, Trash2, PackagePlus, AlertCircle, Save, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createProduct } from '@/features/product/api/product.api';
import { useMyShop } from '../hooks/use-shop';
import { api } from '@/lib/axios';

const AddProductPage = () => {
    const navigate = useNavigate();
    const { data: shop } = useMyShop();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [colorImages, setColorImages] = useState<Record<string, File>>({});

    const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            productName: '',
            productDetail: '',
            price: 0,
            categoryId: '',
            brandId: '',
            variants: [{ size: '', color: '', stock: 0 }]
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

    // Lấy danh sách các màu duy nhất từ variants để hiển thị phần upload ảnh
    const watchedVariants = useWatch({ control, name: 'variants' });
    const uniqueColors = useMemo(() => {
        const colorMap = new Map<string, string>(); // lowercase -> original

        (watchedVariants || []).forEach(v => {
            const trimmed = v.color?.trim();
            if (trimmed) {
                const lower = trimmed.toLowerCase();
                // Chỉ lấy label của lần xuất hiện đầu tiên để tránh trùng lặp do hoa/thường
                if (!colorMap.has(lower)) {
                    colorMap.set(lower, trimmed);
                }
            }
        });

        const result = Array.from(colorMap.values());
        return result.length > 0 ? result : [''];
    }, [watchedVariants]);

    const handleFileChange = (color: string, file: File) => {
        setColorImages(prev => ({ ...prev, [color]: file }));
    };

    const onSubmit = async (data: any) => {
        if (!shop) return;
        if (uniqueColors.length > 0 && uniqueColors.every(c => c !== '') && uniqueColors.some(color => !colorImages[color])) {
            toast.error('Vui lòng upload ảnh cho tất cả các màu sắc đã chọn');
            return;
        }

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

            // 3. Upload ảnh theo từng màu (Cloudinary qua backend)
            const imagePromises = uniqueColors.map(color => {
                const formData = new FormData();
                formData.append('file', colorImages[color]);
                formData.append('productId', newProduct.id.toString());
                formData.append('color', color);
                return api.post('/api/product-images/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            });
            await Promise.all(imagePromises);

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
                                type="number" // Đảm bảo input là kiểu số
                                {...register('price', { required: true, min: 0, valueAsNumber: true })} // Thêm valueAsNumber để đảm bảo giá trị là số
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

                {/* Quản lý Hình ảnh - Đưa xuống dưới Phân loại hàng */}
                <div className="bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-5">
                    <h3 className="font-bold text-lg border-b pb-4 mb-2">Hình ảnh sản phẩm</h3>
                    <p className="text-xs text-[#9CA3AF] italic -mt-2 mb-4">
                        * Hệ thống tự động tạo ô upload ảnh dựa trên các màu sắc bạn đã nhập ở phần Phân loại hàng.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {uniqueColors.map(color => (
                            <div key={color} className="space-y-2">
                                <label className="block text-[11px] font-black text-[#9CA3AF] uppercase">{color || 'Ảnh chính (Mặc định)'}</label>
                                <div className="relative aspect-square border-2 border-dashed border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center hover:border-[#111111] transition-all overflow-hidden group">
                                    {colorImages[color] ? (
                                        <>
                                            <img
                                                src={URL.createObjectURL(colorImages[color])}
                                                className="w-full h-full object-cover"
                                                alt={color}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImages = { ...colorImages };
                                                    delete newImages[color];
                                                    setColorImages(newImages);
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center">
                                            <UploadCloud size={24} className="text-[#9CA3AF]" />
                                            <span className="text-[10px] font-bold text-[#9CA3AF] mt-2">CHỌN ẢNH</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileChange(color, e.target.files[0])} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        ))}
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