import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/layout/navbar';
import { ChatLauncher } from '@/features/chat/components/chat-launcher';
import { useAuthStore } from '@/stores/auth.store';
import { useChatStore } from '@/stores/use.chat.store';

const MainLayout = () => {
    const token = useAuthStore(state => state.token);
    const connectWebSocket = useChatStore(s => s.connectWebSocket);
    const disconnectWebSocket = useChatStore(s => s.disconnectWebSocket);

    useEffect(() => {
        if (token) {
            connectWebSocket(token);
        }

        return () => {
            disconnectWebSocket();
        };
    }, [token, connectWebSocket, disconnectWebSocket]);

    return (
        <div className="relative min-h-screen">
            <Toaster position="top-right" richColors />
            <Navbar />

            <main>
                <Outlet />
            </main>

            <footer>
                <div className="py-4 text-center text-sm text-gray-500">
                    (c) 2026 Fashion Commerce. All rights reserved.
                </div>
            </footer>

            <ChatLauncher />
        </div>
    );
};

export default MainLayout;
