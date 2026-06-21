import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useChatRealtime } from '@/features/chat/hooks/use-chat-realtime';
import { useChatStore } from '@/stores/use.chat.store';

export const FloatingChatBox = ({
    conversationId,
    shopName,
    currentUserId,
    onClose,
}: any) => {

    const isConnected = useChatStore(s => s.isConnected);
    const { messages, sendMessage, sendTyping, isPeerTyping, isLastOwnMessageRead } = useChatRealtime({ conversationId, currentUserId });

    const [text, setText] = useState('');
    const scrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }, [messages.length, isPeerTyping]);

    const handleSend = () => {
        if (!text.trim() || !conversationId) return;

        sendMessage(text);

        setText('');
    };

    if (!conversationId) return null;

    return (
        <div className="fixed bottom-24 right-5 z-50 flex h-[520px] w-[360px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-950 px-4 py-3 text-white">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <MessageCircle size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{shopName}</p>
                        <p className={`text-[11px] ${isConnected ? 'text-emerald-300' : 'text-slate-400'}`}>
                            {isConnected ? 'Dang hoat dong' : 'Dang ket noi...'}
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-white/10">
                    <X size={16} />
                </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
                {messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                        <MessageCircle size={28} strokeWidth={1.5} />
                        <p className="mt-2 text-sm font-medium">Bat dau tro chuyen voi shop</p>
                    </div>
                )}

                {messages.map((m) => {
                    const isMine = m.senderId === currentUserId;

                    return (
                        <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${isMine
                                ? 'rounded-br-md bg-blue-600 text-white'
                                : 'rounded-bl-md border border-slate-200 bg-white text-slate-900'
                                }`}>
                                {m.content}
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

            <div className="flex gap-2 border-t border-slate-100 bg-white p-3">
                <input
                    value={text}
                    onChange={e => {
                        setText(e.target.value);
                        sendTyping();
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Nhap tin nhan..."
                    className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none transition-colors focus:border-blue-500"
                />
                <button onClick={handleSend} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300" disabled={!text.trim()}>
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};
