import React, { useState } from 'react';

import { useUpdateCartItemQuantity, useUpdateCartItemVariant, useRemoveFromCart } from '../hooks/use-cart';
import { Trash2, Plus, Minus } from 'lucide-react';
import type { CartItemResponse } from '../types/cart.types';
import { toast } from 'sonner';
import { useProductDetail } from '@/features/product-variant/hooks/use-variant';
interface CartItemProps {
    item: CartItemResponse;
}

export const CartItem = ({ item }: CartItemProps) => {
    const updateQuantityMutation = useUpdateCartItemQuantity();
    const updateVariantMutation = useUpdateCartItemVariant();
    const removeMutation = useRemoveFromCart();

    // Lấy chi tiết sản phẩm để biết các biến thể khác (Size/Màu) có sẵn
    const { data: productDetails, isLoading: isLoadingDetails } = useProductDetail(item?.productId?.toString());

    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(item.quantity.toString());

    if (!item) return null;

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity < 1 || newQuantity > 99) { // Giới hạn số lượng từ 1 đến 99
            toast.warning('Số lượng phải từ 1 đến 99.');
            return;
        }
        updateQuantityMutation.mutate({ // Sử dụng mutation riêng cho số lượng
            itemId: item.id,
            quantity: newQuantity,
        });
    };

    const handleInputBlur = () => {
        setIsEditing(false);
        const val = parseInt(editValue);
        if (!isNaN(val) && val !== item.quantity) {
            handleQuantityChange(val);
        } else {
            setEditValue(item.quantity.toString());
        }
    };

    const handleVariantChange = (newSize: string, newColor: string) => {
        if (!productDetails) return;

        const variant = productDetails.variants.find(
            (v) => v.size === newSize && v.color === newColor
        );

        // Kiểm tra hết hàng khi chọn variant mới
        if (!variant || Number(variant.stock) <= 0) {
            toast.error('Sản phẩm hiện đã hết hàng');
            return;
        }

        if (variant && variant.id !== item.productVariantId) {
            updateVariantMutation.mutate({
                itemId: item.id,
                productVariantId: variant.id,
            });
        }
    };

    // Logic lọc biến thể tương tự như trang chi tiết
    const variants = productDetails?.variants || [];
    const allSizes = Array.from(new Set(variants.map((v) => v.size)));
    const allColors = Array.from(new Set(variants.map((v) => v.color)));

    const availableSizes = (item.color && variants.length > 0)
        ? variants.filter((v) => v.color === item.color).map((v) => v.size)
        : allSizes;

    const availableColors = (item.size && variants.length > 0)
        ? variants.filter((v) => v.size === item.size).map((v) => v.color)
        : allColors;

    return (
        <div className="flex items-center gap-4 border-b border-gray-100 py-4 last:border-0">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                {/* Placeholder ảnh */}
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">IMG</div>
                )}
            </div>

            <div className="flex flex-1 flex-col">
                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.productName}</h4>

                <div className="flex items-center gap-2 mt-1">
                    {!item.productId || isLoadingDetails || !productDetails ? (
                        // Hiển thị dạng chữ nếu đang tải hoặc không có productId để chỉnh sửa
                        <p className="text-xs text-gray-500">
                            {item.size} / {item.color}
                        </p>
                    ) : (
                        <>
                            <select
                                value={item.size}
                                onChange={(e) => handleVariantChange(e.target.value, item.color)}
                                disabled={updateVariantMutation.isPending}
                                className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 cursor-pointer hover:border-gray-400 transition-colors"
                            >
                                {allSizes.map((size) => (
                                    <option key={size} value={size} disabled={!availableSizes.includes(size)}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                            <span className="text-gray-300">/</span>
                            <select
                                value={item.color}
                                onChange={(e) => handleVariantChange(item.size, e.target.value)}
                                disabled={updateVariantMutation.isPending}
                                className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 cursor-pointer hover:border-gray-400 transition-colors"
                            >
                                {allColors.map((color) => (
                                    <option key={color} value={color} disabled={!availableColors.includes(color)}>
                                        {color}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                </div>

                <div className="mt-auto">
                    <p className="text-sm text-blue-600 font-bold">{item.price.toLocaleString()}đ</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    className="rounded p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={item.quantity <= 1 || updateQuantityMutation.isPending} // Vô hiệu hóa khi số lượng <= 1 hoặc đang pending
                >
                    <Minus size={16} />
                </button>
                {isEditing ? (
                    <input
                        type="number"
                        className="w-12 rounded border border-blue-500 px-1 text-center text-sm font-medium focus:outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleInputBlur}
                        onKeyDown={(e) => e.key === 'Enter' && handleInputBlur()}
                        autoFocus
                    />
                ) : (
                    <span
                        className="w-8 text-center text-sm font-medium cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => {
                            setEditValue(item.quantity.toString());
                            setIsEditing(true);
                        }}
                    >
                        {item.quantity}
                    </span>
                )}
                <button
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    className="rounded p-1 hover:bg-gray-100 text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={updateQuantityMutation.isPending} // Vô hiệu hóa khi đang pending
                >
                    <Plus size={16} />
                </button>
            </div>

            <div className="w-24 text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                    {item.subtotal.toLocaleString()}đ {/* Hiển thị subtotal */}
                </p>
            </div>

            <button
                onClick={() => removeMutation.mutate(item.id)}
                className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};