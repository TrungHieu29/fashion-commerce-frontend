import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProductDetail } from '@/features/product-variant/hooks/use-variant';
import { useRemoveFromCart, useUpdateCartItemQuantity, useUpdateCartItemVariant } from '../hooks/use-cart';
import type { CartItemResponse } from '../types/cart.types';

interface CartItemProps {
    item: CartItemResponse;
    selected: boolean;
    onSelectChange: () => void;
}

export const CartItem = ({ item, selected, onSelectChange }: CartItemProps) => {
    const updateQuantityMutation = useUpdateCartItemQuantity();
    const updateVariantMutation = useUpdateCartItemVariant();
    const removeMutation = useRemoveFromCart();
    const { data: productDetails, isLoading: isLoadingDetails } = useProductDetail(item.productId ? String(item.productId) : undefined);

    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(item.quantity.toString());

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity < 1 || newQuantity > 99) {
            toast.warning('Số lượng phải từ 1 đến 99.');
            return;
        }

        updateQuantityMutation.mutate({
            itemId: item.id,
            quantity: newQuantity,
        });
    };

    const handleInputBlur = () => {
        setIsEditing(false);
        const value = Number(editValue);

        if (!Number.isNaN(value) && value !== item.quantity) {
            handleQuantityChange(value);
            return;
        }

        setEditValue(item.quantity.toString());
    };

    const handleVariantChange = (newSize: string, newColor: string) => {
        if (!productDetails) return;

        const variant = productDetails.variants.find((v) => v.size === newSize && v.color === newColor);

        if (!variant || Number(variant.stock) <= 0) {
            toast.error('Sản phẩm hiện đã hết hàng');
            return;
        }

        if (variant.id !== item.productVariantId) {
            updateVariantMutation.mutate({
                itemId: item.id,
                productVariantId: variant.id,
            });
        }
    };

    const variants = productDetails?.variants || [];
    const allSizes = Array.from(new Set(variants.map((v) => v.size)));
    const allColors = Array.from(new Set(variants.map((v) => v.color)));
    const availableSizes = item.color && variants.length > 0 ? variants.filter((v) => v.color === item.color).map((v) => v.size) : allSizes;
    const availableColors = item.size && variants.length > 0 ? variants.filter((v) => v.size === item.size).map((v) => v.color) : allColors;
    const subtotal = item.price * item.quantity;

    return (
        <div className="flex items-center gap-4 px-4 py-4">
            <input
                type="checkbox"
                checked={selected}
                onChange={onSelectChange}
                className="h-4 w-4 shrink-0 accent-blue-600"
            />

            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-300">Ảnh</div>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <h4 className="line-clamp-1 text-sm font-black text-slate-950">{item.productName}</h4>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    {isLoadingDetails || !productDetails?.variants ? (
                        <p className="text-xs font-semibold text-slate-500">{item.size} / {item.color}</p>
                    ) : (
                        <>
                            <select
                                value={item.size}
                                onChange={(e) => handleVariantChange(e.target.value, item.color)}
                                disabled={updateVariantMutation.isPending}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold outline-none focus:border-blue-500"
                            >
                                {allSizes.map((size) => (
                                    <option key={size} value={size} disabled={!availableSizes.includes(size)}>{size}</option>
                                ))}
                            </select>
                            <select
                                value={item.color}
                                onChange={(e) => handleVariantChange(item.size, e.target.value)}
                                disabled={updateVariantMutation.isPending}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold outline-none focus:border-blue-500"
                            >
                                {allColors.map((color) => (
                                    <option key={color} value={color} disabled={!availableColors.includes(color)}>{color}</option>
                                ))}
                            </select>
                        </>
                    )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <p className="text-sm font-black text-blue-600">{item.price.toLocaleString('vi-VN')}đ</p>
                    {item.originalPrice && item.originalPrice > item.price && (
                        <p className="text-xs font-semibold text-slate-400 line-through">{item.originalPrice.toLocaleString('vi-VN')}đ</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1">
                <button
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    className="rounded-lg p-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                >
                    <Minus size={15} />
                </button>
                {isEditing ? (
                    <input
                        type="number"
                        className="w-12 text-center text-sm font-bold outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleInputBlur}
                        onKeyDown={(e) => e.key === 'Enter' && handleInputBlur()}
                        autoFocus
                    />
                ) : (
                    <button
                        className="w-8 text-center text-sm font-bold text-slate-700"
                        onClick={() => {
                            setEditValue(item.quantity.toString());
                            setIsEditing(true);
                        }}
                    >
                        {item.quantity}
                    </button>
                )}
                <button
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    className="rounded-lg p-1 text-blue-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={updateQuantityMutation.isPending}
                >
                    <Plus size={15} />
                </button>
            </div>

            <div className="hidden w-28 text-right md:block">
                <p className="text-sm font-black text-slate-950">{subtotal.toLocaleString('vi-VN')}đ</p>
            </div>

            <button
                onClick={() => removeMutation.mutate(item.id)}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};
