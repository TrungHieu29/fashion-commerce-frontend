import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MessageCircle, Search, Send, UserRound } from 'lucide-react';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/auth.store';
import { useChatRealtime } from '@/features/chat/hooks/use-chat-realtime';
import { useChatStore } from '@/stores/use.chat.store';
import { useMyShop } from '@/features/shop/hooks/use-shop';

const SellerChatPage = () => {
    const { user, token } = useAuthStore();
    const { data: shop, isLoading: isLoadingShop } = useMyShop();
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
    const clearUnread = useChatStore(s => s.clearUnread);

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const conversationList = Object.values(conversationsMap)
        .filter(conversation => conversation.shopId === shop?.id)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());

    const currentChat = selectedId ? conversationsMap[selectedId] : undefined;
    const totalUnread = conversationList.reduce((sum, conversation) => sum + (conversation.unreadCount || 0), 0);

    const { messages, sendMessage, sendTyping, isPeerTyping, isLastOwnMessageRead } = useChatRealtime({
        conversationId: selectedId,
        currentUserId: user?.id
    });

    useEffect(() => {
        if (token) connectWebSocket(token);
    }, [token, connectWebSocket]);

    useEffect(() => {
        if (!shop?.id || !user?.id) return;

        let ignore = false;

        const fetchConversations = async () => {
            const res = await api.get(`/api/conversations/shops/${shop.id}`, {
                params: { page: 0, size: 50, sort: 'updatedAt,desc' }
            });

            if (ignore) return;

            const data = res.data.content || [];
            setConversations(data);

            await Promise.all(data.map(async (conversation: any) => {
                const messageRes = await api.get(`/api/messages/conversations/${conversation.id}`, {
                    params: { page: 0, size: 30, sort: 'createdAt,desc' }
                });

                if (ignore) return;

                const messagePage = messageRes.data.content || [];
                const orderedMessages = [...messagePage].reverse();
                const latestMessage = messagePage[0];
                const unreadCount = messagePage.filter((message: any) => !message.isRead && message.senderId !== user.id).length;

                setMessages(conversation.id, orderedMessages);
                setConversationUnreadCount(conversation.id, unreadCount);

                if (latestMessage) {
                    updateConversation(conversation.id, latestMessage);
                }
            }));
        };

        fetchConversations().catch((error) => {
            console.error('Failed to load seller chat conversations', error);
        });

        return () => {
            ignore = true;
        };
    }, [shop?.id, user?.id, setConversations, setConversationUnreadCount, setMessages, updateConversation]);

    useEffect(() => {
        if (!stompClient || !isConnected || !user?.id || conversationList.length === 0) return;

        const subscriptions = conversationList.map(conversation => (
            stompClient.subscribe(`/topic/conversations/${conversation.id}`, (msg) => {
                const newMsg = JSON.parse(msg.body);
                const isActive = useChatStore.getState().activeConversationId === conversation.id || selectedId === conversation.id;

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
    }, [stompClient, isConnected, user?.id, selectedId, conversationList.length, addMessage, clearUnread, incrementUnread, updateConversation]);

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }, [messages.length, isPeerTyping]);

    const selectConversation = (conversationId: number) => {
        setSelectedId(conversationId);
        clearUnread(conversationId);

        if (stompClient && isConnected) {
            stompClient.publish({
                destination: '/app/chat.markRead',
                body: JSON.stringify({ conversationId })
            });
        }
    };

    const handleSend = (e: FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        sendMessage(replyText);
        setReplyText('');
    };

    if (isLoadingShop) {
        return <div className="p-8 text-sm text-slate-500">Dang tai thong tin shop...</div>;
    }

    if (!shop?.id) {
        return <div className="p-8 text-sm text-slate-500">Khong tim thay shop cua tai khoan hien tai.</div>;
    }

    return (
        <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <aside className="flex w-[22rem] shrink-0 flex-col border-r border-slate-200 bg-slate-50">
                <div className="border-b border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-black text-slate-950">Tin nhan</h1>
                            <p className="text-xs text-slate-500">{totalUnread > 0 ? `${totalUnread} tin moi` : 'Hop thu cua shop'}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                            <MessageCircle size={19} />
                        </div>
                    </div>
                    <div className="mt-4 flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400">
                        <Search size={16} />
                        <span className="text-sm">Tim khach hang</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {conversationList.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                            <MessageCircle size={30} strokeWidth={1.5} />
                            <p className="mt-2 text-sm font-medium">Chua co khach hang nao nhan tin</p>
                        </div>
                    ) : (
                        conversationList.map((conversation) => {
                            const isSelected = selectedId === conversation.id;

                            return (
                                <button
                                    key={conversation.id}
                                    onClick={() => selectConversation(conversation.id)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${isSelected ? 'bg-slate-950 text-white' : 'hover:bg-white'}`}
                                >
                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full ${isSelected ? 'bg-white/10' : 'bg-white text-slate-500'}`}>
                                        {conversation.userAvatar ? (
                                            <img src={conversation.userAvatar} alt={conversation.userName || 'Customer'} className="h-full w-full object-cover" />
                                        ) : (
                                            <UserRound size={18} />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-sm font-bold">{conversation.userName || 'Khach hang'}</p>
                                            {(conversation.unreadCount || 0) > 0 && (
                                                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                                                    {conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`mt-0.5 truncate text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                            {conversation.isTyping ? 'Dang nhap...' : conversation.lastMessage || 'Mo hoi thoai'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </aside>

            <section className="flex min-w-0 flex-1 flex-col">
                {!selectedId ? (
                    <div className="flex flex-1 flex-col items-center justify-center bg-white text-center text-slate-400">
                        <MessageCircle size={44} strokeWidth={1.5} />
                        <p className="mt-3 text-sm font-semibold">Chon mot hoi thoai de bat dau phan hoi</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-500">
                                    {currentChat?.userAvatar ? (
                                        <img src={currentChat.userAvatar} alt={currentChat.userName || 'Customer'} className="h-full w-full object-cover" />
                                    ) : (
                                        <UserRound size={18} />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-950">{currentChat?.userName || 'Khach hang'}</p>
                                    <p className={`text-xs ${isConnected ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        {isPeerTyping ? 'Dang nhap...' : isConnected ? 'Dang hoat dong' : 'Dang ket noi...'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-6 py-5">
                            {messages.map((message) => {
                                const isMine = message.senderId === user?.id;

                                return (
                                    <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${isMine
                                            ? 'rounded-br-md bg-blue-600 text-white'
                                            : 'rounded-bl-md border border-slate-200 bg-white text-slate-900'
                                            }`}>
                                            {message.content}
                                        </div>
                                    </div>
                                );
                            })}

                            {isPeerTyping && (
                                <div className="flex justify-start">
                                    <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-500 shadow-sm">
                                        Dang nhap...
                                    </div>
                                </div>
                            )}

                            {isLastOwnMessageRead && messages.length > 0 && (
                                <p className="pr-1 text-right text-[11px] font-medium text-slate-400">Da xem</p>
                            )}
                        </div>

                        <form onSubmit={handleSend} className="flex gap-3 border-t border-slate-200 bg-white p-4">
                            <input
                                value={replyText}
                                onChange={e => {
                                    setReplyText(e.target.value);
                                    sendTyping();
                                }}
                                placeholder="Nhap phan hoi..."
                                className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none transition-colors focus:border-blue-500"
                            />
                            <button
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                disabled={!replyText.trim()}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                )}
            </section>
        </div>
    );
};

export default SellerChatPage;
