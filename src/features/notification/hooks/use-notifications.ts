import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/use.chat.store';
import {
    getNotifications,
    getUnreadNotificationCount,
    isMissingNotificationEndpointError,
    markAllNotificationsRead,
    markNotificationRead,
} from '../api/notification.api';
import type { AppNotification } from '../types/notification.types';

export const notificationKeys = {
    list: (userId?: number, isRead?: boolean) => ['notifications', userId, isRead] as const,
    unreadCount: (userId?: number) => ['notifications-unread-count', userId] as const,
};

export const useNotifications = (isRead?: boolean) => {
    const user = useAuthStore(state => state.user);

    return useQuery({
        queryKey: notificationKeys.list(user?.id, isRead),
        queryFn: () => getNotifications(user!.id, isRead),
        enabled: !!user?.id,
        staleTime: 1000 * 30,
        retry: false,
    });
};

export const useUnreadNotificationCount = () => {
    const user = useAuthStore(state => state.user);

    return useQuery({
        queryKey: notificationKeys.unreadCount(user?.id),
        queryFn: () => getUnreadNotificationCount(user!.id),
        enabled: !!user?.id,
        refetchInterval: 60000,
        retry: false,
    });
};

export const useMarkNotificationRead = () => {
    const user = useAuthStore(state => state.user);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markNotificationRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.list(user?.id, false) });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(user?.id) });
        },
        onError: (error) => {
            if (isMissingNotificationEndpointError(error)) return;
        },
    });
};

export const useMarkAllNotificationsRead = () => {
    const user = useAuthStore(state => state.user);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => markAllNotificationsRead(user!.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.list(user?.id, false) });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(user?.id) });
        },
        onError: (error) => {
            if (isMissingNotificationEndpointError(error)) return;
        },
    });
};

export const useNotificationRealtime = () => {
    const user = useAuthStore(state => state.user);
    const stompClient = useChatStore(state => state.stompClient);
    const isConnected = useChatStore(state => state.isConnected);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user?.id || !stompClient || !isConnected) return;

        const subscription = stompClient.subscribe('/user/queue/notifications', (message) => {
            const incoming = JSON.parse(message.body) as AppNotification;

            queryClient.setQueryData<AppNotification[]>(
                notificationKeys.list(user.id, false),
                (current = []) => {
                    if (current.some(item => item.id === incoming.id)) return current;
                    return [incoming, ...current];
                }
            );

            queryClient.setQueryData<number>(
                notificationKeys.unreadCount(user.id),
                (current = 0) => current + 1
            );
        });

        return () => subscription.unsubscribe();
    }, [user?.id, stompClient, isConnected, queryClient]);
};
