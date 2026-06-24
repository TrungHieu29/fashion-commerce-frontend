import { create } from 'zustand';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface ChatMessage {
    id: number;
    conversationId: number;
    senderId: number;
    senderName: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

interface ChatConversation {
    id: number;
    userId?: number;
    userName?: string;
    userAvatar?: string;
    shopId?: number;
    shopName?: string;
    shopLogo?: string;
    createdAt?: string;
    lastMessage?: string;
    updatedAt?: string;
    unreadCount?: number;
    isTyping?: boolean;
}

interface ChatState {
    stompClient: Client | null;
    isConnected: boolean;

    isOpenPopup: boolean;
    isOpenConversationList: boolean;
    activeConversationId: number | null;
    activeChatName: string;

    messagesMap: Record<number, ChatMessage[]>;
    conversationsMap: Record<number, ChatConversation>;

    connectWebSocket: (token: string) => void;
    disconnectWebSocket: () => void;

    openChatPopup: (conversationId: number, chatName: string) => void;
    closeChatPopup: () => void;
    toggleConversationList: () => void;
    closeConversationList: () => void;

    addMessage: (conversationId: number, message: ChatMessage) => void;
    setMessages: (conversationId: number, messages: ChatMessage[]) => void;
    setConversations: (conversations: ChatConversation[]) => void;
    setConversationUnreadCount: (conversationId: number, count: number) => void;
    incrementUnread: (conversationId: number) => void;
    clearUnread: (conversationId: number) => void;
    setTyping: (conversationId: number, isTyping: boolean) => void;
    markMessagesRead: (conversationId: number, readerId: number) => void;
    updateConversation: (conversationId: number, message: ChatMessage) => void;
}

const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, '');
const WS_URL = `${API_URL}/ws`;

export const useChatStore = create<ChatState>((set, get) => ({
    stompClient: null,
    isConnected: false,

    isOpenPopup: false,
    isOpenConversationList: false,
    activeConversationId: null,
    activeChatName: '',

    messagesMap: {},
    conversationsMap: {},

    connectWebSocket: (token: string) => {
        if (get().stompClient) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 3000,
        });

        client.onConnect = () => {
            set({ isConnected: true });
        };

        client.onDisconnect = () => {
            set({ isConnected: false });
        };

        client.onStompError = () => {
            set({ isConnected: false });
        };

        client.onWebSocketClose = () => {
            set({ isConnected: false });
        };

        client.activate();
        set({ stompClient: client });
    },

    disconnectWebSocket: () => {
        get().stompClient?.deactivate();

        set({
            stompClient: null,
            isConnected: false,
            isOpenPopup: false,
            isOpenConversationList: false,
            activeConversationId: null,
            activeChatName: '',
            messagesMap: {},
            conversationsMap: {},
        });
    },

    setConversations: (conversations) => {
        const map = get().conversationsMap;
        const next = { ...map };

        conversations.forEach((conversation) => {
            const current = next[conversation.id];
            next[conversation.id] = {
                ...current,
                ...conversation,
                lastMessage: current?.lastMessage ?? conversation.lastMessage,
                updatedAt: current?.updatedAt ?? conversation.updatedAt,
                unreadCount: current?.unreadCount ?? conversation.unreadCount ?? 0,
                isTyping: current?.isTyping ?? false,
            };
        });

        set({ conversationsMap: next });
    },

    setMessages: (conversationId, messages) => {
        const map = get().messagesMap;
        const byId = new Map<number, ChatMessage>();

        [...(map[conversationId] || []), ...messages].forEach((message) => {
            byId.set(message.id, message);
        });

        set({
            messagesMap: {
                ...map,
                [conversationId]: Array.from(byId.values()).sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                )
            }
        });
    },

    addMessage: (conversationId, message) => {
        const map = get().messagesMap;
        const list = map[conversationId] || [];

        if (list.some(m => m.id === message.id)) return;

        set({
            messagesMap: {
                ...map,
                [conversationId]: [...list, message]
            }
        });
    },

    updateConversation: (conversationId, message) => {
        const map = get().conversationsMap;

        const current = map[conversationId] || {
            id: conversationId,
        };

        set({
            conversationsMap: {
                ...map,
                [conversationId]: {
                    ...current,
                    lastMessage: message.content,
                    updatedAt: message.createdAt
                }
            }
        });
    },

    openChatPopup: (conversationId, chatName) => {
        set({
            isOpenPopup: true,
            isOpenConversationList: false,
            activeConversationId: conversationId,
            activeChatName: chatName,
            conversationsMap: {
                ...get().conversationsMap,
                [conversationId]: {
                    ...(get().conversationsMap[conversationId] || { id: conversationId }),
                    unreadCount: 0,
                }
            }
        });
    },

    closeChatPopup: () => {
        set({
            isOpenPopup: false,
            activeConversationId: null,
            activeChatName: ''
        });
    },

    toggleConversationList: () => {
        set(state => ({
            isOpenConversationList: !state.isOpenConversationList,
            isOpenPopup: state.isOpenConversationList ? state.isOpenPopup : false,
        }));
    },

    closeConversationList: () => {
        set({ isOpenConversationList: false });
    },

    setConversationUnreadCount: (conversationId, count) => {
        const map = get().conversationsMap;
        const current = map[conversationId] || { id: conversationId };

        set({
            conversationsMap: {
                ...map,
                [conversationId]: {
                    ...current,
                    unreadCount: Math.max(0, count),
                }
            }
        });
    },

    incrementUnread: (conversationId) => {
        const map = get().conversationsMap;
        const current = map[conversationId] || { id: conversationId };

        set({
            conversationsMap: {
                ...map,
                [conversationId]: {
                    ...current,
                    unreadCount: (current.unreadCount || 0) + 1,
                }
            }
        });
    },

    clearUnread: (conversationId) => {
        get().setConversationUnreadCount(conversationId, 0);
    },

    setTyping: (conversationId, isTyping) => {
        const map = get().conversationsMap;
        const current = map[conversationId] || { id: conversationId };

        set({
            conversationsMap: {
                ...map,
                [conversationId]: {
                    ...current,
                    isTyping,
                }
            }
        });
    },

    markMessagesRead: (conversationId, readerId) => {
        const map = get().messagesMap;
        const list = map[conversationId] || [];

        set({
            messagesMap: {
                ...map,
                [conversationId]: list.map(message =>
                    message.senderId !== readerId ? { ...message, isRead: true } : message
                )
            }
        });
    },
}));
