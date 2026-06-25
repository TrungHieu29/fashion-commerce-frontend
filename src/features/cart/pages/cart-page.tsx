import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckSquare, ShoppingBag, Store } from 'lucide-react';
import { useCart } from '../hooks/use-cart';
import { CartItem } from '../components/cart-item';

const SELECTED_CART_ITEMS_KEY = 'selected-cart-item-ids';

const CartPage = () => {
    const { data: cart, isLoading, isError } = useCart();
    const navigate = useNavigate();
    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

    const cartItems = cart?.cartItems || [];

    useEffect(() => {
        if (!cartItems.length) return;

        setSelectedItemIds((current) => {
            const validIds = new Set(cartItems.map(item => item.id));
            const next = current.filter(id => validIds.has(id));
            return next.length > 0 ? next : cartItems.map(item => item.id);
        });
    }, [cartItems.length]);

    const groupedCartItems = useMemo(() => {
        const groups: Record<number, { shopId: number; shopName: string; items: typeof cartItems }> = {};

        cartItems.forEach((item) => {
            const shopId = item.shopId;
            if (!groups[shopId]) {
                groups[shopId] = { shopId, shopName: item.shopName, items: [] };
            }
            groups[shopId].items.push(item);
        });

        return Object.values(groups);
    }, [cartItems]);

    const selectedItems = cartItems.filter(item => selectedItemIds.includes(item.id));
    const selectedSubtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const isAllSelected = cartItems.length > 0 && selectedItemIds.length === cartItems.length;

    const toggleItem = (itemId: number) => {
        setSelectedItemIds(current =>
            current.includes(itemId)
                ? current.filter(id => id !== itemId)
                : [...current, itemId]
        );
    };

    const toggleShop = (shopId: number) => {
        const shopItemIds = groupedCartItems.find(group => group.shopId === shopId)?.items.map(item => item.id) || [];
        const allShopSelected = shopItemIds.every(id => selectedItemIds.includes(id));

        setSelectedItemIds(current => {
            if (allShopSelected) {
                return current.filter(id => !shopItemIds.includes(id));
            }
            return Array.from(new Set([...current, ...shopItemIds]));
        });
    };

    const toggleAll = () => {
        setSelectedItemIds(isAllSelected ? [] : cartItems.map(item => item.id));
    };

    const handleCheckout = () => {
        if (selectedItemIds.length === 0) return;

        sessionStorage.setItem(SELECTED_CART_ITEMS_KEY, JSON.stringify(selectedItemIds));
        navigate('/checkout');
    };

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center text-sm font-medium text-slate-500">Đang tải giỏ hàng...</div>;
    }

    if (isError || !cart || cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                <div className="mb-6 rounded-full bg-slate-100 p-6 text-slate-400">
                    <ShoppingBag size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-950">Giỏ hàng trống</h2>
                <p className="mt-2 max-w-sm text-sm text-slate-500">Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy quay lại cửa hàng để chọn sản phẩm ưng ý.</p>
                <Link to="/" className="mt-8 bg-zinc-950 px-8 py-3 font-semibold text-white transition-colors hover:bg-[#A68545]">
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F6F1] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A68545]">Cart</p>
                    <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-950">Giỏ hàng của bạn</h1>
                    <p className="mt-1 text-sm text-zinc-500">{cartItems.length} sản phẩm, đã chọn {selectedItemIds.length} sản phẩm</p>
                </div>
                <button onClick={toggleAll} className="inline-flex h-11 items-center gap-2 border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:border-zinc-950">
                    <CheckSquare size={17} />
                    {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
                <div className="space-y-5">
                    {groupedCartItems.map((group) => {
                        const shopItemIds = group.items.map(item => item.id);
                        const selectedInShop = shopItemIds.filter(id => selectedItemIds.includes(id)).length;
                        const allShopSelected = selectedInShop === shopItemIds.length;

                        return (
                            <section key={group.shopId} className="overflow-hidden border border-zinc-200 bg-white">
                                <div className="flex items-center gap-3 border-b border-zinc-100 bg-[#F8F6F1] px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={allShopSelected}
                                        onChange={() => toggleShop(group.shopId)}
                                        className="h-4 w-4 accent-blue-600"
                                    />
                                    <Store size={18} className="text-[#A68545]" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-black text-slate-950">{group.shopName}</p>
                                        <p className="text-xs text-slate-400">Đã chọn {selectedInShop}/{group.items.length} sản phẩm</p>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {group.items.map((item) => (
                                        <CartItem
                                            key={item.id}
                                            item={item}
                                            selected={selectedItemIds.includes(item.id)}
                                            onSelectChange={() => toggleItem(item.id)}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>

                <aside className="lg:sticky lg:top-24 lg:h-fit">
                    <div className="border border-zinc-200 bg-white p-6">
                        <h3 className="text-lg font-semibold text-zinc-950">Tóm tắt đơn hàng</h3>
                        <div className="mt-5 space-y-4 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Sản phẩm đã chọn</span>
                                <span className="font-bold">{selectedItemIds.length}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Tạm tính</span>
                                <span className="font-bold">{selectedSubtotal.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Phí vận chuyển</span>
                                <span className="font-bold text-emerald-600">Miễn phí</span>
                            </div>
                            <div className="border-t border-slate-200 pt-4">
                                <div className="flex items-end justify-between">
                                    <span className="text-base font-semibold text-zinc-950">Tổng cộng</span>
                                    <span className="text-2xl font-semibold text-zinc-950">{selectedSubtotal.toLocaleString('vi-VN')}đ</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={selectedItemIds.length === 0}
                            className="mt-6 flex h-12 w-full items-center justify-center gap-2 bg-zinc-950 text-base font-semibold text-white transition-colors hover:bg-[#A68545] disabled:cursor-not-allowed disabled:bg-zinc-300"
                        >
                            Tiến hành thanh toán <ArrowRight size={18} />
                        </button>
                    </div>
                </aside>
            </div>
        </div>
        </div>
    );
};

export default CartPage;
