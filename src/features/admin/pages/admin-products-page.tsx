import { useMemo, useState } from 'react';
import { Search, Star, Trash2 } from 'lucide-react';
import { AdminEmptyState, AdminPageHeader, AdminStatusBadge, AdminTableShell } from '../components/admin-ui';
import { useAdminProducts, useDeleteAdminProduct } from '../hooks/use-admin';
import { getProductCategoryLabel } from '@/features/product/types/product.types';

const formatCurrency = (value?: number) => `${Math.round(value || 0).toLocaleString('vi-VN')}đ`;

const AdminProductsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data, isLoading } = useAdminProducts();
    const deleteProduct = useDeleteAdminProduct();
    const products = data?.content || [];

    const filteredProducts = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        if (!keyword) return products;
        return products.filter((product) =>
            [product.productName, product.shopName, getProductCategoryLabel(product), product.brandName, product.status]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(keyword))
        );
    }, [products, searchTerm]);

    return (
        <div>
            <AdminPageHeader title="Quản lý sản phẩm" description="Kiểm tra toàn bộ sản phẩm đang được các shop đăng bán." />
            <div className="mb-4 flex max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
                <Search size={18} className="text-slate-400" />
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm sản phẩm, shop, danh mục..." className="h-12 flex-1 bg-transparent text-sm outline-none" />
            </div>

            {isLoading ? <div className="h-96 animate-pulse rounded-2xl bg-white" /> : filteredProducts.length ? (
                <AdminTableShell>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-black uppercase text-slate-400">
                            <tr>
                                <th className="px-5 py-3">Sản phẩm</th>
                                <th className="px-5 py-3">Shop</th>
                                <th className="px-5 py-3">Phân loại</th>
                                <th className="px-5 py-3">Giá</th>
                                <th className="px-5 py-3">Đánh giá</th>
                                <th className="px-5 py-3">Trạng thái</th>
                                <th className="px-5 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-5 py-4">
                                        <p className="line-clamp-1 font-black text-slate-950">{product.productName}</p>
                                        <p className="line-clamp-1 text-xs text-slate-400">{product.productDetail || 'Chưa có mô tả'}</p>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">{product.shopName || 'Chưa rõ'}</td>
                                    <td className="px-5 py-4 text-slate-600">
                                        <p>{getProductCategoryLabel(product) || 'Chưa phân loại'}</p>
                                        <p className="text-xs text-slate-400">{product.brandName || 'Chưa có thương hiệu'}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="font-black text-blue-600">{formatCurrency(product.finalPrice)}</p>
                                        {!!product.discountAmount && <p className="text-xs text-red-500">Giảm {formatCurrency(product.discountAmount)}</p>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-flex items-center gap-1 font-bold text-amber-600"><Star size={14} /> {product.rating || 0}</span>
                                    </td>
                                    <td className="px-5 py-4"><AdminStatusBadge tone={product.status === 'ACTIVE' ? 'green' : 'slate'}>{product.status || 'UNKNOWN'}</AdminStatusBadge></td>
                                    <td className="px-5 py-4 text-right">
                                        <button onClick={() => deleteProduct.mutate(product.id)} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                                            <Trash2 size={17} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </AdminTableShell>
            ) : <AdminEmptyState text="Không tìm thấy sản phẩm phù hợp." />}
        </div>
    );
};

export default AdminProductsPage;
