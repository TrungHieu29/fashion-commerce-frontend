import React from 'react';
import { Link } from 'react-router-dom';
import type { ProductResponse } from '../types/product.types';

interface ProductCardProps {
    product: ProductResponse;
}

export const ProductCard = ({ product }: ProductCardProps) => {
    return (
        <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
            {/* Placeholder cho ảnh sản phẩm */}
            <div className="mb-4 flex aspect-square w-full items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                <span className="text-xs uppercase tracking-widest font-medium">No Image</span>
            </div>

            <Link to={`/product/${product.id}`}>
                <h3 className="mb-1 text-lg font-bold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer">
                    {product.productName}
                </h3>
            </Link>

            <p className="mb-4 flex-grow text-sm text-gray-500 line-clamp-2">{product.productDetail}</p>

            <div className="mt-auto">
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">{product.price.toLocaleString()}đ</span>
                    <span className="flex items-center gap-1 text-sm font-medium text-amber-500">{product.rating} ⭐</span>
                </div>
                <Link to={`/product/${product.id}`}>
                    <button className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98]">
                        Xem chi tiết
                    </button>
                </Link>
            </div>
        </div>
    );
};