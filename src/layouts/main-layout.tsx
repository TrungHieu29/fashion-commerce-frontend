import { Outlet } from 'react-router-dom';

import { Navbar } from '@/components/layout/navbar';

const MainLayout = () => {

    return (

        <div>

            <Navbar />

            <main>
                <Outlet />
            </main>

            <footer>
                Footer
            </footer>

        </div>
    );
};

export default MainLayout;