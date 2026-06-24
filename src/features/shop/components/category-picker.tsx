import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';

type CategoryOption = {
    id: number;
    name?: string;
    categoryName?: string;
};

type CategoryPickerProps = {
    categories?: CategoryOption[];
    value: string[];
    onChange: (nextValue: string[]) => void;
};

export const CategoryPicker = ({ categories = [], value, onChange }: CategoryPickerProps) => {
    const [draftCategoryId, setDraftCategoryId] = useState('');
    const selectedIds = Array.isArray(value) ? value.map(String) : [];

    const availableCategories = useMemo(
        () => categories.filter((category) => !selectedIds.includes(String(category.id))),
        [categories, selectedIds]
    );

    const selectedCategories = useMemo(
        () => selectedIds
            .map((id) => categories.find((category) => String(category.id) === id))
            .filter((category): category is CategoryOption => Boolean(category)),
        [categories, selectedIds]
    );

    const addCategory = () => {
        if (!draftCategoryId || selectedIds.includes(draftCategoryId)) return;
        onChange([...selectedIds, draftCategoryId]);
        setDraftCategoryId('');
    };

    const removeCategory = (categoryId: number) => {
        onChange(selectedIds.filter((id) => id !== String(categoryId)));
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <select
                    value={draftCategoryId}
                    onChange={(event) => setDraftCategoryId(event.target.value)}
                    className="h-12 min-w-0 flex-1 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] px-4 text-sm font-semibold text-slate-700 outline-none transition-all focus:border-[#111111]"
                >
                    <option value="">Chọn danh mục</option>
                    {availableCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name || category.categoryName}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={addCategory}
                    disabled={!draftCategoryId}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-200"
                    title="Thêm danh mục"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="min-h-11 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-2">
                {selectedCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((category) => (
                            <span key={category.id} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200">
                                {category.name || category.categoryName}
                                <button
                                    type="button"
                                    onClick={() => removeCategory(category.id)}
                                    className="rounded-full p-0.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                    title="Xóa danh mục"
                                >
                                    <X size={13} />
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="px-2 py-1 text-xs font-semibold text-slate-400">Chưa chọn danh mục nào.</p>
                )}
            </div>
        </div>
    );
};
