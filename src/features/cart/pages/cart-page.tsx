import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Store } from 'lucide-react';
import { useCart } from '../hooks/use-cart';
import { CartItem } from '../components/cart-item';

const CartPage = () => {
    const { data: cart, isLoading, isError } = useCart();
    const navigate = useNavigate();

    if (isLoading) return <div className="flex h-96 items-center justify-center text-gray-500 font-medium">Đang tải giỏ hàng...</div>;

    // Nhóm sản phẩm theo Shop từ dữ liệu Backend mới
    const groupedCartItems = useMemo(() => {
        if (!cart?.cartItems) return [];
        const groups: Record<number, { shopId: number, shopName: string, items: any[] }> = {};

        cart.cartItems.forEach((item) => {
            const sid = item.shopId;
            if (!groups[sid]) {
                groups[sid] = { shopId: sid, shopName: item.shopName, items: [] };
            }
            groups[sid].items.push(item);
        });

        return Object.values(groups);
    }, [cart]);

    if (isError || !cart || !cart.cartItems || cart.cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="rounded-full bg-gray-100 p-6 text-gray-400 mb-6">
                    <ShoppingBag size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
                <p className="text-gray-500 mb-8 text-center max-w-xs">
                    Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy quay lại cửa hàng để chọn sản phẩm ưng ý nhé!
                </p>
                <Link to="/" className="rounded-xl bg-blue-600 px-8 py-3 font-bold text-white transition-all hover:bg-blue-700 active:scale-95">
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-10 flex items-center gap-3">
                Giỏ hàng của bạn <span className="text-blue-600">({cart.cartItems.length})</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Danh sách sản phẩm */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="border-b border-gray-100 pb-4 text-sm font-bold uppercase tracking-wider text-gray-400 hidden md:flex">
                        <div className="flex-1">Sản phẩm</div>
                        <div className="w-32 text-center">Số lượng</div>
                        <div className="w-32 text-right">Tổng cộng</div>
                        <div className="w-10"></div>
                    </div>

                    {groupedCartItems.map((group) => (
                        <div key={group.shopId} className="space-y-4">
                            <div className="flex items-center gap-2 text-blue-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                                <Store size={18} />
                                <span className="font-bold uppercase text-xs tracking-wider">{group.shopName}</span>
                            </div>
                            <div className="space-y-2">
                                {group.items.map((item) => (
                                    <CartItem key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tóm tắt đơn hàng */}
                <div className="lg:col-span-1">
                    <div className="rounded-2xl bg-gray-50 p-6 sticky top-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h3>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính</span>
                                <span className="font-semibold">{cart.totalAmount.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển</span>
                                <span className="text-green-600 font-medium">Miễn phí</span>
                            </div>
                            <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold text-gray-900">
                                <span>Tổng cộng</span>
                                <span className="text-blue-600">{cart.totalAmount.toLocaleString()}đ</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-95"
                        >
                            Tiến hành thanh toán <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;