import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, PackageCheck } from 'lucide-react';
import {
    useMarkAllNotificationsRead,
    useMarkNotificationRead,
    useNotifications,
    useUnreadNotificationCount,
} from '../hooks/use-notifications';
import type { AppNotification } from '../types/notification.types';

export const NotificationBell = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const { data: unreadCount = 0 } = useUnreadNotificationCount();
    const { data: notifications = [], isLoading } = useNotifications(false);
    const markRead = useMarkNotificationRead();
    const markAllRead = useMarkAllNotificationsRead();

    const visibleNotifications = useMemo(() => notifications.slice(0, 8), [notifications]);

    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [isOpen]);

    const handleNotificationClick = (notification: AppNotification) => {
        if (!notification.isRead) {
            markRead.mutate(notification.id);
        }

        setIsOpen(false);
        navigate(resolveNotificationPath(notification));
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                onClick={() => setIsOpen(open => !open)}
                className="relative flex h-10 w-10 items-center justify-center text-zinc-600 transition-all hover:text-zinc-950"
                aria-label="Thông báo"
            >
                <Bell size={21} strokeWidth={1.6} />
                {unreadCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 z-[75] w-[min(92vw,380px)] border border-zinc-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A68545]">Notification</p>
                            <h3 className="text-base font-semibold text-zinc-950">Thông báo mới</h3>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllRead.mutate()}
                                className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-zinc-950"
                            >
                                <CheckCheck size={15} />
                                Đã đọc
                            </button>
                        )}
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                        {isLoading ? (
                            <div className="p-5 text-sm text-zinc-500">Đang tải thông báo...</div>
                        ) : visibleNotifications.length > 0 ? (
                            visibleNotifications.map(notification => (
                                <button
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className="flex w-full items-start gap-3 border-b border-zinc-100 px-4 py-3 text-left transition hover:bg-[#F8F6F1]"
                                >
                                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-zinc-950 text-white">
                                        <PackageCheck size={17} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-zinc-950">
                                            {notification.title || 'Cập nhật đơn hàng'}
                                        </span>
                                        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-zinc-500">
                                            {notification.message || notification.content || notification.orderStatus || 'Đơn hàng của bạn vừa được cập nhật.'}
                                        </span>
                                        {notification.createdAt && (
                                            <span className="mt-2 block text-[11px] font-semibold text-zinc-400">
                                                {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center text-sm text-zinc-500">Chưa có thông báo mới.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const resolveNotificationPath = (notification: AppNotification) => {
    if (notification.orderId) {
        return `/order/${notification.orderId}`;
    }

    if (notification.redirectUrl?.startsWith('/account/orders')) {
        return '/profile?tab=orders';
    }

    return notification.redirectUrl || '/profile?tab=orders';
};
