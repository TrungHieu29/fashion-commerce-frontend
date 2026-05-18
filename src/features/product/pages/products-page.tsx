import React, { useState } from 'react';
import { useProducts } from '../hooks/use-products';
import { ProductCard } from '../components/product-card';

const ProductsPage = () => {
    const [page, setPage] = useState(0);

    const {
        data: productPage,
        isLoading,
        isError,
        error,
    } = useProducts({ page, size: 8 });

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (isError) {
        console.log(error);
        return (
            <div className="py-20 text-center text-red-500">
                <p className="text-lg font-semibold">Đã có lỗi xảy ra!</p>
                <p className="text-sm">Vui lòng kiểm tra lại kết nối đến máy chủ.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-10 text-center text-3xl font-extrabold text-gray-900">
                Danh sách sản phẩm
            </h1>

            {productPage?.content && productPage.content.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {productPage.content.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <p className="py-20 text-center text-gray-500">Không có sản phẩm nào để hiển thị.</p>
            )}

            {/* Điều khiển phân trang */}
            <div className="mt-12 flex items-center justify-center gap-6">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(old => Math.max(0, old - 1))}
                    className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                    Trang trước
                </button>
                <span className="text-sm font-semibold text-gray-900">
                    Trang {page + 1} / {productPage?.totalPages || 1}
                </span>
                <button
                    disabled={page >= (productPage?.totalPages || 1) - 1}
                    onClick={() => setPage(old => old + 1)}
                    className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                    Trang sau
                </button>
            </div>
        </div>
    );
};

export default ProductsPage;