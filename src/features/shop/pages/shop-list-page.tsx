import React from 'react';
import { useShops } from '../hooks/use-shop';
import { Store, Phone, Mail, MapPin } from 'lucide-react';

const ShopListPage = () => {
    const { data: shops, isLoading, isError } = useShops();

    if (isLoading) return <div className="p-20 text-center">Đang tải danh sách shop...</div>;
    if (isError) return <div className="p-20 text-center text-red-500">Có lỗi xảy ra khi tải danh sách shop.</div>;

    return (
        <div className="container mx-auto px-4 py-10 max-w-5xl">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Danh sách các Shop</h1>

            {shops && shops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shops.map(shop => (
                        <div key={shop.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                            {shop.logo ? (
                                <img src={shop.logo} alt={shop.shopName} className="w-24 h-24 object-contain rounded-full mb-4 border border-gray-100" />
                            ) : (
                                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400 text-xl font-bold">
                                    {shop.shopName.charAt(0)}
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{shop.shopName}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1"><Mail size={14} /> {shop.email || 'N/A'}</p>
                            <p className="text-sm text-gray-600 flex items-center gap-1"><Phone size={14} /> {shop.phone || 'N/A'}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 text-center mt-1"><MapPin size={14} /> {shop.address || 'N/A'}</p>
                            <p className="text-xs text-gray-400 mt-2">Chủ sở hữu: {shop.ownerFullName}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-10">Chưa có shop nào được tạo.</p>
            )}
        </div>
    );
};

export default ShopListPage;