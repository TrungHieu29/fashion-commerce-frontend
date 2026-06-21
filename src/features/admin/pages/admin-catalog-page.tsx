import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
    useAdminBrands,
    useAdminCategories,
    useCreateAdminBrand,
    useCreateAdminCategory,
    useDeleteAdminBrand,
    useDeleteAdminCategory,
    useUpdateAdminBrand,
    useUpdateAdminCategory,
} from '../hooks/use-admin';
import { AdminEmptyState, AdminPageHeader } from '../components/admin-ui';

const AdminCatalogPage = () => {
    const { data: categories = [], isLoading: isLoadingCategories } = useAdminCategories();
    const { data: brands = [], isLoading: isLoadingBrands } = useAdminBrands();
    const createCategory = useCreateAdminCategory();
    const updateCategory = useUpdateAdminCategory();
    const deleteCategory = useDeleteAdminCategory();
    const createBrand = useCreateAdminBrand();
    const updateBrand = useUpdateAdminBrand();
    const deleteBrand = useDeleteAdminBrand();

    const [categoryName, setCategoryName] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [brandName, setBrandName] = useState('');
    const [brandDescription, setBrandDescription] = useState('');
    const [editingBrandId, setEditingBrandId] = useState<number | null>(null);

    const submitCategory = (event: FormEvent) => {
        event.preventDefault();
        const name = categoryName.trim();
        if (!name) return;

        if (editingCategoryId) {
            updateCategory.mutate({ id: editingCategoryId, name }, { onSuccess: resetCategoryForm });
            return;
        }

        createCategory.mutate({ name }, { onSuccess: resetCategoryForm });
    };

    const submitBrand = (event: FormEvent) => {
        event.preventDefault();
        const name = brandName.trim();
        if (!name) return;

        if (editingBrandId) {
            updateBrand.mutate({ id: editingBrandId, name, description: brandDescription }, { onSuccess: resetBrandForm });
            return;
        }

        createBrand.mutate({ name, description: brandDescription }, { onSuccess: resetBrandForm });
    };

    const resetCategoryForm = () => {
        setCategoryName('');
        setEditingCategoryId(null);
    };

    const resetBrandForm = () => {
        setBrandName('');
        setBrandDescription('');
        setEditingBrandId(null);
    };

    return (
        <div>
            <AdminPageHeader title="Danh mục và thương hiệu" description="Quản lý dữ liệu phân loại dùng cho sản phẩm trên toàn hệ thống." />
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-black text-slate-950">Danh mục</h2>
                    <form onSubmit={submitCategory} className="mt-4 flex gap-2">
                        <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Tên danh mục" className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" />
                        <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white">
                            {editingCategoryId ? <Pencil size={15} /> : <Plus size={15} />} {editingCategoryId ? 'Lưu' : 'Thêm'}
                        </button>
                    </form>
                    <div className="mt-5 space-y-2">
                        {isLoadingCategories ? <div className="h-48 animate-pulse rounded-xl bg-slate-100" /> : categories.length ? categories.map((category) => (
                            <div key={category.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                                <span className="font-bold text-slate-700">{category.name}</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => { setEditingCategoryId(category.id); setCategoryName(category.name); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"><Pencil size={15} /></button>
                                    <button onClick={() => deleteCategory.mutate(category.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                                </div>
                            </div>
                        )) : <AdminEmptyState text="Chưa có danh mục." />}
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-black text-slate-950">Thương hiệu</h2>
                    <form onSubmit={submitBrand} className="mt-4 space-y-2">
                        <input value={brandName} onChange={(event) => setBrandName(event.target.value)} placeholder="Tên thương hiệu" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" />
                        <div className="flex gap-2">
                            <input value={brandDescription} onChange={(event) => setBrandDescription(event.target.value)} placeholder="Mô tả ngắn" className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" />
                            <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white">
                                {editingBrandId ? <Pencil size={15} /> : <Plus size={15} />} {editingBrandId ? 'Lưu' : 'Thêm'}
                            </button>
                        </div>
                    </form>
                    <div className="mt-5 space-y-2">
                        {isLoadingBrands ? <div className="h-48 animate-pulse rounded-xl bg-slate-100" /> : brands.length ? brands.map((brand) => (
                            <div key={brand.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                                <div>
                                    <p className="font-bold text-slate-700">{brand.name}</p>
                                    <p className="text-xs text-slate-400">{brand.description || 'Chưa có mô tả'}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => { setEditingBrandId(brand.id); setBrandName(brand.name); setBrandDescription(brand.description || ''); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"><Pencil size={15} /></button>
                                    <button onClick={() => deleteBrand.mutate(brand.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
                                </div>
                            </div>
                        )) : <AdminEmptyState text="Chưa có thương hiệu." />}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminCatalogPage;
