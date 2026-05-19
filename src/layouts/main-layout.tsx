import { Outlet } from 'react-router-dom';

import { Navbar } from '@/components/layout/navbar';
import { Toaster } from 'sonner';

const MainLayout = () => {

    return (

        <div>
            {/* Toaster cần được đặt ở đây để hiển thị thông báo trên các trang con */}
            <Toaster position="top-right" richColors />
            <Navbar />

            <main>
                <Outlet />
            </main>

            <footer>
                {/* Footer của bạn */}
                <div className="py-4 text-center text-gray-500 text-sm">
                    © 2023 Fashion Commerce. All rights reserved.
                </div>
            </footer>

        </div>
    );
};

export default MainLayout;