import { createBrowserRouter } from 'react-router-dom';

import LoginPage from '@/features/auth/pages/login-page';

import ProfilePage from '@/pages/profile-page';

import MainLayout from '@/layouts/main-layout';

import AuthLayout from '@/layouts/auth-layout';

import { ProtectedRoute } from '@/routes/protected-route';

export const router = createBrowserRouter([

    {
        element: <AuthLayout />,

        children: [

            {
                path: '/login',
                element: <LoginPage />,
            },
        ],
    },

    {
        element: <MainLayout />,

        children: [

            {
                path: '/profile',

                element: (
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);