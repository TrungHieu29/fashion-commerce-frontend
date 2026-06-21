import { useEffect } from 'react';
import { MessageCircle, Search, Store } from 'lucide-react';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/use.chat.store';
import { FloatingChatBox } from '@/features/chat/components/floating-chat-box';

export const ChatLauncher = () => {
    const { user, token, isAuthenticated } = useAuthStore();
    const stompClient = useChatStore(s => s.stompClient);
    const isConnected = useChatStore(s => s.isConnected);
    const isOpenPopup = useChatStore(s => s.isOpenPopup);
    const isOpenConversationList = useChatStore(s => s.isOpenConversationList);
    const activeConversationId = useChatStore(s => s.activeConversationId);
    const activeChatName = useChatStore(s => s.activeChatName);
    const conversationsMap = useChatStore(s => s.conversationsMap);
    const setConversations = useChatStore(s => s.setConversations);
    const setMessages = useChatStore(s => s.setMessages);
    const updateConversation = useChatStore(s => s.updateConversation);
    const setConversationUnreadCount = useChatStore(s => s.setConversationUnreadCount);
    const addMessage = useChatStore(s => s.addMessage);
    const incrementUnread = useChatStore(s => s.incrementUnread);
    const clearUnread = useChatStore(s => s.clearUnread);
    const openChatPopup = useChatStore(s => s.openChatPopup);
    const closeChatPopup = useChatStore(s => s.closeChatPopup);
    const toggleConversationList = useChatStore(s => s.toggleConversationList);

    const conversationList = Object.values(conversationsMap)
        .filter(conversation => conversation.shopId)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());

    const totalUnread = conversationList.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0);

    useEffect(() => {
        if (!isAuthenticated || !user?.id || !token) return;

        let ignore = false;

        const loadConversations = async () => {
            const res = await api.get(`/api/conversations/users/${user.id}`, {
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
                const orderedMessages = [...messages].reverse();
                const latestMessage = messages[0];
                const unreadCount = messages.filter((message: any) => !message.isRead && message.senderId !== user.id).length;

                setMessages(conversation.id, orderedMessages);
                setConversationUnreadCount(conversation.id, unreadCount);

                if (latestMessage) {
                    updateConversation(conversation.id, latestMessage);
                }
            }));
        };

        loadConversations().catch((error) => {
            console.error('Failed to load chat conversations', error);
        });

        return () => {
            ignore = true;
        };
    }, [isAuthenticated, user?.id, token, setConversations, setConversationUnreadCount, setMessages, updateConversation]);

    useEffect(() => {
        if (!stompClient || !isConnected || !user?.id || conversationList.length === 0) return;

        const subscriptions = conversationList.map((conversation) => (
            stompClient.subscribe(`/topic/conversations/${conversation.id}`, (msg) => {
                const newMsg = JSON.parse(msg.body);
                const state = useChatStore.getState();
                const isActive = state.isOpenPopup && state.activeConversationId === conversation.id;

                addMessage(conversation.id, newMsg);
                updateConversation(conversation.id, newMsg);

                if (newMsg.senderId !== user.id) {
                    if (isActive) {
                        clearUnread(conversation.id);
                        stompClient.publish({
                            destination: '/app/chat.markRead',
                            body: JSON.stringify({ conversationId: conversation.id })
                        });
                    } else {
                        incrementUnread(conversation.id);
                    }
                }
            })
        ));

        return () => {
            subscriptions.forEach(subscription => subscription.unsubscribe());
        };
    }, [stompClient, isConnected, user?.id, conversationList.length, addMessage, clearUnread, incrementUnread, updateConversation]);

    if (!isAuthenticated || !user || !token) return null;

    return (
        <>
            {isOpenConversationList && (
                <div className="fixed bottom-24 right-5 z-50 flex h-[520px] w-[360px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="border-b border-slate-100 bg-slate-950 px-4 py-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-bold">Tin nhan</p>
                                <p className="mt-0.5 text-xs text-slate-300">{totalUnread > 0 ? `${totalUnread} tin moi` : 'Tat ca hoi thoai'}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                                <MessageCircle size={19} />
                            </div>
                        </div>
                        <div className="mt-4 flex h-10 items-center gap-2 rounded-xl bg-white/10 px-3 text-slate-300">
                            <Search size={16} />
                            <span className="text-sm">Tim shop da chat</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-50 p-2">
                        {conversationList.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                                <MessageCircle size={30} strokeWidth={1.5} />
                                <p className="mt-2 text-sm font-medium">Chua co hoi thoai nao</p>
                            </div>
                        ) : (
                            conversationList.map((conversation) => {
                                const name = conversation.shopName || conversation.userName || 'Shop';

                                return (
                                    <button
                                        key={conversation.id}
                                        onClick={() => openChatPopup(conversation.id, name)}
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white"
                                    >
                                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-white">
                                            {conversation.shopLogo ? (
                                                <img src={conversation.shopLogo} alt={name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Store size={18} />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="truncate text-sm font-bold text-slate-900">{name}</p>
                                                {(conversation.unreadCount || 0) > 0 && (
                                                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                                                        {conversation.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 truncate text-xs text-slate-500">
                                                {conversation.isTyping ? 'Dang nhap...' : conversation.lastMessage || 'Mo hoi thoai'}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {isOpenPopup && activeConversationId && (
                <FloatingChatBox
                    conversationId={activeConversationId}
                    shopName={activeChatName}
                    currentUserId={user.id}
                    onClose={closeChatPopup}
                />
            )}

            <button
                onClick={toggleConversationList}
                className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-2xl transition-transform hover:scale-105 active:scale-95"
                aria-label="Mo tin nhan"
            >
                <MessageCircle size={24} />
                {totalUnread > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-xs font-bold text-white">
                        {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                )}
            </button>
        </>
    );
};
