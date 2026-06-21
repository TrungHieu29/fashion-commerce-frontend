export interface MessageResponseDto {
    id: number;
    conversationId: number;
    senderId: number;
    senderName: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}
export interface MessageRequestDto {
    conversationId: number;
    senderId: number;
    content: string;
}
