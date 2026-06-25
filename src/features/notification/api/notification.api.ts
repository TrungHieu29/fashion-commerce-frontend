import { api } from '@/lib/axios';
import type { AppNotification } from '../types/notification.types';

export const getNotifications = async (userId: number, isRead?: boolean): Promise<AppNotification[]> => {
    try {
        const response = await api.get(`/api/notifications/user/${userId}`, {
            params: typeof isRead === 'boolean' ? { isRead } : undefined,
        });
        return Array.isArray(response.data) ? response.data : response.data?.content || [];
    } catch (error) {
        if (isMissingNotificationEndpointError(error)) return [];
        throw error;
    }
};

export const getUnreadNotificationCount = async (userId: number): Promise<number> => {
    try {
        const response = await api.get(`/api/notifications/user/${userId}/unread-count`);
        return Number(response.data || 0);
    } catch (error) {
        if (isMissingNotificationEndpointError(error)) return 0;
        throw error;
    }
};

export const markNotificationRead = async (notificationId: number): Promise<void> => {
    await api.put(`/api/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = async (userId: number): Promise<void> => {
    await api.put(`/api/notifications/user/${userId}/read-all`);
};

export const isMissingNotificationEndpointError = (error: unknown) => {
    const message = String((error as any)?.response?.data?.message || (error as any)?.message || '').toLowerCase();
    return message.includes('no static resource') && message.includes('notifications');
};
