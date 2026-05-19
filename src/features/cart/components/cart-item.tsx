import React from 'react';

import { useUpdateCartItemQuantity, useRemoveFromCart } from '../hooks/use-cart';
import { Trash2, Plus, Minus } from 'lucide-react';
import type { CartItemResponse } from '../types/cart.types';
import { toast } from 'sonner';
interface CartItemProps {
    item: CartItemResponse;
}

export const CartItem = ({ item }: CartItemProps) => {
    const updateQuantityMutation = useUpdateCartItemQuantity();
    const removeMutation = useRemoveFromCart();

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
                <p className="text-sm text-gray-500">{item.color} / {item.size}</p>
                <div className="mt-auto">
                    <p className="text-sm text-blue-600 font-bold">{item.price.toLocaleString()}đ</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
                    disabled={item.quantity <= 1}
                >
                    <Minus size={16} />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    className="rounded p-1 hover:bg-gray-100 text-blue-600"
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