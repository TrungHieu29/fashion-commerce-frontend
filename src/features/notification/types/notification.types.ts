export interface AppNotification {
    id: number;
    userId?: number;
    title?: string;
    message?: string;
    content?: string;
    isRead: boolean;
    orderId?: number;
    orderShopId?: number;
    orderStatus?: string;
    redirectUrl?: string;
    createdAt?: string;
}
