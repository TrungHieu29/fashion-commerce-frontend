import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useMyShop } from '@/features/shop/hooks/use-shop';
import { useChatStore } from '@/stores/use.chat.store';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/axios';
import {
    LayoutDashboard,
    ShoppingBag,
    PackagePlus,
    ClipboardList,
    BarChart3,
    Store,
    Settings,
    Bell,
    ChevronDown,
    Home,
    Tag,
    Truck,
    History,
    MessageSquareText // 1. Import thêm icon chuyên dùng cho tin nhắn/chat
} from 'lucide-react';

const SellerLayout = () => {
    const { data: shop } = useMyShop();
    const location = useLocation();
    const { user, token } = useAuthStore();
    const [pendingOrderCount, setPendingOrderCount] = useState(0);
    const stompClient = useChatStore(s => s.stompClient);
    const isConnected = useChatStore(s => s.isConnected);
    const connectWebSocket = useChatStore(s => s.connectWebSocket);
    const conversationsMap = useChatStore(s => s.conversationsMap);
    const setConversations = useChatStore(s => s.setConversations);
    const setMessages = useChatStore(s => s.setMessages);
    const updateConversation = useChatStore(s => s.updateConversation);
    const setConversationUnreadCount = useChatStore(s => s.setConversationUnreadCount);
    const addMessage = useChatStore(s => s.addMessage);
    const incrementUnread = useChatStore(s => s.incrementUnread);
    const totalChatUnread = Object.values(conversationsMap)
        .filter(conversation => !shop?.id || conversation.shopId === shop.id)
        .reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0);
    const totalNotifications = totalChatUnread + pendingOrderCount;
    const shopConversations = Object.values(conversationsMap).filter(conversation => conversation.shopId === shop?.id);

    useEffect(() => {
        if (token) {
            connectWebSocket(token);
        }
    }, [token, connectWebSocket]);

    useEffect(() => {
        if (!shop?.id || !user?.id) return;

        let ignore = false;

        const loadSellerInbox = async () => {
            const res = await api.get(`/api/conversations/shops/${shop.id}`, {
                params: { page: 0, size: 50, sort: 'updatedAt,desc' }
            });

            if (ignore) return;

            const conversations = res.data.content || [];
            setConversations(conversations);

            await Promise.all(conversations.map(async (conversation: any) => {
                const messageRes = await api.get(`/api/messages/conversations/${conversation.id}`, {
                    params: { page: 0, size: 30, sort: 'createdAt,desc' }
                });

                if (ignore) return;

                const messages = messageRes.data.content || [];
                const latestMessage = messages[0];
                const unreadCount = messages.filter((message: any) => !message.isRead && message.senderId !== user.id).length;

                setMessages(conversation.id, [...messages].reverse());
                setConversationUnreadCount(conversation.id, unreadCount);

                if (latestMessage) {
                    updateConversation(conversation.id, latestMessage);
                }
            }));
        };

        loadSellerInbox().catch((error) => {
            console.error('Failed to load seller inbox badge', error);
        });

        return () => {
            ignore = true;
        };
    }, [shop?.id, user?.id, setConversations, setConversationUnreadCount, setMessages, updateConversation]);

    useEffect(() => {
        if (!stompClient || !isConnected || !user?.id || location.pathname === '/my-shop/chat' || shopConversations.length === 0) return;

        const subscriptions = shopConversations.map(conversation => (
            stompClient.subscribe(`/topic/conversations/${conversation.id}`, (msg) => {
                const newMsg = JSON.parse(msg.body);

                addMessage(conversation.id, newMsg);
                updateConversation(conversation.id, newMsg);

                if (newMsg.senderId !== user.id) {
                    incrementUnread(conversation.id);
                }
            })
        ));

        return () => {
            subscriptions.forEach(subscription => subscription.unsubscribe());
        };
    }, [stompClient, isConnected, user?.id, location.pathname, shopConversations.length, addMessage, incrementUnread, updateConversation]);

    useEffect(() => {
        if (!shop?.id) return;

        let ignore = false;
        let intervalId: ReturnType<typeof setInterval> | undefined;

        const loadPendingOrderCount = async () => {
            const res = await api.get(`/api/order-shops/shop/${shop.id}`, {
                params: {
                    page: 0,
                    size: 1,
                    sort: 'id,desc',
                    status: 'PENDING',
                }
            });

            if (!ignore) {
                setPendingOrderCount(res.data.totalElements || 0);
            }
        };

        loadPendingOrderCount().catch((error) => {
            console.error('Failed to load pending order count', error);
        });

        intervalId = setInterval(() => {
            loadPendingOrderCount().catch((error) => {
                console.error('Failed to refresh pending order count', error);
            });
        }, 30000);

        return () => {
            ignore = true;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [shop?.id, location.pathname]);

    const menuGroups = [
        {
            title: 'Phân Tích Kinh Doanh',
            items: [
                {
                    label: 'Tổng quan Dashboard',
                    icon: <LayoutDashboard size={18} />,
                    to: '/my-shop/dashboard',
                    active: location.pathname === '/my-shop/dashboard'
                },
                {
                    label: 'Phân tích doanh thu',
                    icon: <BarChart3 size={18} />,
                    to: '/my-shop/analytics',
                    active: location.pathname === '/my-shop/analytics'
                },
            ]
        },
        {
            title: 'Vận chuyển',
            items: [
                { label: 'Quản lý vận chuyển', icon: <Truck size={18} />, to: '/my-shop/shipping', active: location.pathname === '/my-shop/shipping' },
            ]
        },
        {
            title: 'Quản lý Đơn Hàng',
            items: [
                { label: 'Xác nhận đơn hàng', icon: <ClipboardList size={18} />, to: '/my-shop/orders/confirm', active: location.pathname === '/my-shop/orders/confirm', badge: pendingOrderCount },
                { label: 'Lịch sử đơn hàng', icon: <History size={18} />, to: '/my-shop/orders/history', active: location.pathname === '/my-shop/orders/history' },
            ]
        },
        {
            title: 'Quản lý Sản Phẩm',
            items: [
                { label: 'Tất cả sản phẩm', icon: <ShoppingBag size={18} />, to: '/my-shop/products', active: location.pathname === '/my-shop/products' },
                { label: 'Thêm sản phẩm', icon: <PackagePlus size={18} />, to: '/my-shop/products/add', active: location.pathname === '/my-shop/products/add' },
                { label: 'Quản lý giảm giá', icon: <Tag size={18} />, to: '/my-shop/discounts', active: location.pathname === '/my-shop/discounts' },
            ]
        },
        // ==========================================
        // CẬP NHẬT: Thêm mục Chat vào nhóm Quản lý Shop
        // ==========================================
        {
            title: 'Quản lý Shop',
            items: [
                {
                    label: 'Chat với khách hàng',
                    icon: <MessageSquareText size={18} />,
                    to: '/my-shop/chat', // Khớp chính xác với route trang Chat người bán của bạn
                    active: location.pathname === '/my-shop/chat',
                    badge: totalChatUnread,
                },
                {
                    label: 'Hồ sơ Shop',
                    icon: <Store size={18} />,
                    to: '/my-shop/profile',
                    active: location.pathname === '/my-shop/profile'
                },
            ]
        }
    ];

    return (
        <div className="flex min-h-screen bg-[#F5F5F5] font-inter">
            {/* Sidebar chuyên biệt */}
            <aside className="w-[240px] bg-white border-r border-[#E5E7EB] fixed h-full overflow-y-auto z-50 shadow-sm">
                <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB] bg-white sticky top-0">
                    <Link to="/" className="text-xl font-black tracking-tighter text-[#0F0F0F]">
                        SELLER<span className="text-blue-600">HUB</span>
                    </Link>
                </div>

                <div className="py-4 px-3 space-y-6">
                    {menuGroups.map((group, idx) => (
                        <div key={idx} className="space-y-1">
                            <h3 className="px-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">
                                {group.title}
                            </h3>
                            {group.items.map((item, i) => (
                                <Link
                                    key={i}
                                    to={item.to}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all ${item.active
                                        ? 'bg-[#111111] text-white shadow-md'
                                        : 'text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111111]'
                                        }`}
                                >
                                    <span className={item.active ? 'text-white' : 'text-[#9CA3AF]'}>{item.icon}</span>
                                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                                    {!!item.badge && item.badge > 0 && (
                                        <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${item.active ? 'bg-white text-[#111111]' : 'bg-red-500 text-white'}`}>
                                            {item.badge > 99 ? '99+' : item.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 ml-[240px]">
                {/* Seller Topbar */}
                <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#6B7280]">Cửa hàng:</span>
                        <span className="text-sm font-bold text-[#111111] bg-[#F3F4F6] px-3 py-1 rounded-full border border-[#E5E7EB]">
                            {shop?.shopName || 'Đang tải...'}
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#111111] transition-colors"
                        >
                            <Home size={18} />
                            Quay về trang chủ
                        </Link>
                        <button className="text-[#6B7280] hover:text-[#111111] transition-colors relative">
                            <Bell size={20} strokeWidth={1.5} />
                            {totalNotifications > 0 && (
                                <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white">
                                    {totalNotifications > 99 ? '99+' : totalNotifications}
                                </span>
                            )}
                        </button>
                        <div className="flex items-center gap-2 pl-6 border-l border-[#E5E7EB] cursor-pointer group">
                            <div className="w-8 h-8 bg-[#111111] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {shop?.shopName?.charAt(0) || 'S'}
                            </div>
                            <ChevronDown size={14} className="text-[#9CA3AF] group-hover:text-[#111111]" />
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-[1440px]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SellerLayout;
