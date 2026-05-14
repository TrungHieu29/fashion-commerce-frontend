import { Link } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth.store';

export const Navbar = () => {

    const logout =
        useAuthStore((state) => state.logout);

    const isAuthenticated =
        useAuthStore(
            (state) => state.isAuthenticated
        );

    return (

        <nav>

            <Link to="/">
                Home
            </Link>

            {' | '}

            <Link to="/profile">
                Profile
            </Link>

            {' | '}

            {

                isAuthenticated ? (

                    <button onClick={logout}>
                        Logout
                    </button>

                ) : (

                    <Link to="/login">
                        Login
                    </Link>
                )
            }

        </nav>
    );
};