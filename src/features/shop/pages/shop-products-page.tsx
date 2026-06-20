import React, { useMemo, useState } from 'react';
import { useMyShop } from '../hooks/use-shop';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductsByShop, deleteProduct } from '@/features/product/api/product.api';
import { Edit3, Trash2, Package, Search, Filter, Star, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import type { ProductResponse } from '@/features/product/types/product.types';

const ShopProductsPage = () => {
    const { data: shop } = useMyShop();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [page, setPage] = useState(0);
    const pageSize = 10;

    // State cho tìm kiếm và bộ lọc
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [brandFilter, setBrandFilter] = useState<string>('all');

    // Lấy categories và brands để hiển thị trong bộ lọc
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.get('/api/categories').then(res => res.data)
    });
    const { data: brands } = useQuery({
        queryKey: ['brands'],
        queryFn: () => api.get('/api/product-brands').then(res => res.data)
    });

    const { data: productPage, isLoading, isFetching } = useQuery({
        queryKey: ['shop-products', shop?.id, page, searchTerm, ratingFilter, categoryFilter, brandFilter],
        queryFn: async () => {
            // Lưu ý: Nếu backend chưa hỗ trợ param, chúng ta sẽ lọc client-side ở useMemo bên dưới
            const data = await getProductsByShop(shop!.id, page, pageSize, 'id,desc');
            return data;
        },
        enabled: !!shop?.id,
        placeholderData: (previousData) => previousData, // Giữ dữ liệu cũ khi typing để tránh nhảy focus
    });

    // Xử lý lọc và tìm kiếm client-side (do endpoint GET /api/products/shop/{id} trong API.md chưa mô tả params filter)
    const processedProducts = useMemo(() => {
        const content = Array.isArray(productPage) ? productPage : productPage?.content;
        if (!content) return [];

        return content.filter((p: any) => {
            const matchSearch = p.productName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchRating = ratingFilter === 'all' ? true : Math.floor(p.rating || 0) >= parseInt(ratingFilter);
            const matchCategory = categoryFilter === 'all' ? true : p.categoryId?.toString() === categoryFilter;
            const matchBrand = brandFilter === 'all' ? true : p.brandId?.toString() === brandFilter;

            return matchSearch && matchRating && matchCategory && matchBrand;
        });
    }, [productPage, searchTerm, ratingFilter, categoryFilter, brandFilter]);

    // Mutation xóa sản phẩm
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteProduct(id),
        onSuccess: () => {
            toast.success('Đã xóa sản phẩm thành công');
            queryClient.invalidateQueries({ queryKey: ['shop-products'] });
        },
        onError: (error: any) => {
            toast.error('Không thể xóa sản phẩm: ' + (error.response?.data?.message || error.message));
        }
    });

    const handleDelete = (id: number, name: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"? Hành động này không thể hoàn tác.`)) {
            deleteMutation.mutate(id);
        }
    };

    // Chỉ hiển thị loading screen khi tải lần đầu và chưa có dữ liệu
    if (isLoading && !productPage) return (
        <div className="h-96 flex flex-col items-center justify-center text-[#9CA3AF] gap-4">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm font-medium animate-pulse uppercase tracking-widest">Đang tải kho hàng...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0F0F0F] tracking-tight">Tất cả sản phẩm</h1>
                    <p className="text-[#6B7280] text-sm mt-1">Xem và quản lý kho hàng của bạn</p>
                </div>
            </div>

            {/* Filters Bar chuyên nghiệp */}
            <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] flex flex-wrap gap-4 shadow-sm">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên sản phẩm, mã SKU..."
                        className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm focus:border-[#111111] outline-none transition-all"
                    />
                    {isFetching && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="animate-spin text-blue-600" size={16} />
                        </div>
                    )}
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm font-medium outline-none focus:border-blue-500"
                >
                    <option value="all">Tất cả danh mục</option>
                    {categories?.map((c: any) => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
                </select>
                <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm font-medium outline-none focus:border-blue-500"
                >
                    <option value="all">Tất cả thương hiệu</option>
                    {brands?.map((b: any) => <option key={b.id} value={b.id.toString()}>{b.name}</option>)}
                </select>
                <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm font-medium outline-none focus:border-blue-500"
                >
                    <option value="all">Mọi đánh giá</option>
                    <option value="5">5 sao</option>
                    <option value="4">4 sao trở lên</option>
                    <option value="3">3 sao trở lên</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB]">
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Sản phẩm</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Phân loại</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Kho hàng (Size/Color/Stock)</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Giá (Gốc / Hiện tại)</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">Trạng thái</th>
                            <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                        {processedProducts.length > 0 ? (
                            processedProducts.map((product: ProductResponse) => (
                                <tr key={product.id} className="hover:bg-[#F9FAFB]/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 bg-[#F3F4F6] rounded-xl flex items-center justify-center overflow-hidden border border-[#E5E7EB]">
                                                {product.imageUrl ? (
                                                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package size={24} className="text-[#9CA3AF]" strokeWidth={1.5} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#111111] text-sm group-hover:text-blue-600 transition-colors">{product.productName}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[11px] text-[#9CA3AF]">#{product.id}</span>
                                                    <span className="text-[11px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded font-bold uppercase">{product.brandName}</span>
                                                    <span className="flex items-center gap-0.5 text-[11px] text-orange-400 font-bold ml-1">
                                                        <Star size={10} fill="currentColor" /> {product.rating || '0.0'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[#6B7280] text-[13px]">{product.categoryName}</td>
                                    <td className="px-6 py-4">
                                        <VariantCell productId={product.id} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] text-gray-400 line-through">{product.originalPrice?.toLocaleString()}đ</span>
                                            <span className="font-black text-[#111111] text-[14px]">
                                                {product.finalPrice?.toLocaleString()}đ
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-[11px] font-extrabold rounded-full border ${product.status === 'ACTIVE'
                                            ? 'bg-green-50 text-green-600 border-green-100'
                                            : 'bg-gray-50 text-gray-400 border-gray-100'
                                            }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => navigate(`/my-shop/products/edit/${product.id}`)}
                                                className="p-2 text-[#6B7280] hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id, product.productName)}
                                                className="p-2 text-[#6B7280] hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-[#6B7280] italic text-sm">
                                    Hệ thống chưa tìm thấy sản phẩm nào trong cửa hàng của bạn.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {productPage && !Array.isArray(productPage) && productPage.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 py-6 border-t border-[#E5E7EB] bg-[#FAFAFA]">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(old => Math.max(0, old - 1))}
                            className="px-4 py-2 text-sm font-bold text-[#6B7280] bg-white border border-[#E5E7EB] rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
                        >
                            Trang trước
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#111111]">Trang {page + 1}</span>
                            <span className="text-sm text-[#9CA3AF]">/</span>
                            <span className="text-sm text-[#9CA3AF]">{productPage.totalPages}</span>
                        </div>
                        <button
                            disabled={page >= productPage.totalPages - 1}
                            onClick={() => setPage(old => old + 1)}
                            className="px-4 py-2 text-sm font-bold text-[#6B7280] bg-white border border-[#E5E7EB] rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all"
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Component hiển thị nhanh tồn kho của các variant
const VariantCell = ({ productId }: { productId: number }) => {
    const { data: variants, isLoading } = useQuery({
        queryKey: ['product-variants-cell', productId],
        queryFn: async () => {
            const response = await api.get(`/api/product-variants/product/${productId}`);
            return response.data;
        }
    });

    if (isLoading) return <span className="text-[11px] text-gray-300 italic">Đang tải kho...</span>;

    if (!variants || variants.length === 0) return <span className="text-[11px] text-red-400">Chưa có phân loại</span>;

    return (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
            {variants.map((v: any) => (
                <span
                    key={v.id}
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${v.stock > 0 ? 'bg-white border-gray-200 text-gray-600' : 'bg-red-50 border-red-100 text-red-500 font-bold'}`}
                    title={`Kho: ${v.stock}`}
                >
                    {v.size}/{v.color}: <span className="font-bold">{v.stock}</span>
                </span>
            ))}
        </div>
    );
};

export default ShopProductsPage;