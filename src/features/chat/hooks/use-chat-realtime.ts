import { useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/use.chat.store';
import { api } from '@/lib/axios';

const EMPTY_MESSAGES: any[] = [];

export const useChatRealtime = ({
    conversationId,
    currentUserId,
}: {
    conversationId: number | null;
    currentUserId?: number;
}) => {

    const stompClient = useChatStore(s => s.stompClient);
    const isConnected = useChatStore(s => s.isConnected);
    const messagesMap = useChatStore(s => s.messagesMap);
    const addMessage = useChatStore(s => s.addMessage);
    const setMessages = useChatStore(s => s.setMessages);
    const clearUnread = useChatStore(s => s.clearUnread);
    const setTyping = useChatStore(s => s.setTyping);
    const markMessagesRead = useChatStore(s => s.markMessagesRead);
    const updateConversation = useChatStore(s => s.updateConversation);
    const isPeerTyping = useChatStore(s => conversationId ? !!s.conversationsMap[conversationId]?.isTyping : false);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastTypingSentRef = useRef(0);

    const messages = conversationId
        ? messagesMap[conversationId] || EMPTY_MESSAGES
        : EMPTY_MESSAGES;

    useEffect(() => {
        if (!conversationId) return;

        let ignore = false;

        api.get(`/api/messages/conversations/${conversationId}`, {
            params: {
                page: 0,
                size: 100,
                sort: 'createdAt,desc'
            }
        })
            .then(res => {
                if (ignore) return;

                const data = Array.isArray(res.data) ? res.data : res.data.content || [];
                setMessages(conversationId, [...data].reverse());
                clearUnread(conversationId);
            })
            .catch((error) => {
                console.error('Failed to load chat messages', error);
            });

        return () => {
            ignore = true;
        };
    }, [conversationId, setMessages, clearUnread]);

    useEffect(() => {
        if (!stompClient || !isConnected || !conversationId) return;

        const messageSub = stompClient.subscribe(
            `/topic/conversations/${conversationId}`,
            (msg) => {
                const newMsg = JSON.parse(msg.body);

                addMessage(conversationId, newMsg);
                updateConversation(conversationId, newMsg);

                if (newMsg.senderId !== currentUserId) {
                    clearUnread(conversationId);
                    stompClient.publish({
                        destination: '/app/chat.markRead',
                        body: JSON.stringify({ conversationId })
                    });
                }
            }
        );

        const typingSub = stompClient.subscribe(
            `/topic/conversations/${conversationId}/typing`,
            (msg) => {
                const data = JSON.parse(msg.body);

                if (data.senderId === currentUserId) return;

                setTyping(conversationId, true);

                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                typingTimeoutRef.current = setTimeout(() => {
                    setTyping(conversationId, false);
                }, 1800);
            }
        );

        const readSub = stompClient.subscribe(
            `/topic/conversations/${conversationId}/read`,
            (msg) => {
                const data = JSON.parse(msg.body);

                if (data.readerId) {
                    markMessagesRead(conversationId, data.readerId);
                }
            }
        );

        stompClient.publish({
            destination: '/app/chat.markRead',
            body: JSON.stringify({ conversationId })
        });

        return () => {
            messageSub.unsubscribe();
            typingSub.unsubscribe();
            readSub.unsubscribe();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [stompClient, isConnected, conversationId, currentUserId, addMessage, clearUnread, markMessagesRead, setTyping, updateConversation]);

    const sendMessage = (text: string) => {
        if (!conversationId || !text.trim()) return;

        const body = {
            conversationId,
            ...(currentUserId ? { senderId: currentUserId } : {}),
            content: text.trim()
        };

        if (!stompClient || !isConnected) {
            console.error('Cannot send chat message: WebSocket is not connected');
            return;
        }

        stompClient.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(body)
        });
    };

    const sendTyping = () => {
        if (!stompClient || !isConnected || !conversationId) return;

        const now = Date.now();
        if (now - lastTypingSentRef.current < 900) return;

        lastTypingSentRef.current = now;
        stompClient.publish({
            destination: '/app/chat.typing',
            body: JSON.stringify({ conversationId })
        });
    };

    const lastOwnMessage = [...messages].reverse().find(message => message.senderId === currentUserId);

    return {
        messages,
        sendMessage,
        sendTyping,
        isPeerTyping,
        isLastOwnMessageRead: !!lastOwnMessage?.isRead,
    };
};
