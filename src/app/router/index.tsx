import { createBrowserRouter } from 'react-router-dom';

import LoginPage from '@/features/auth/pages/login-page';

import ProfilePage from '@/features/user/pages/profile-page';

import ProductsPage from '@/features/product/pages/products-page.tsx';

import ProductDetailPage from '@/features/product-variant/pages/product-detail-page';



import MainLayout from '@/layouts/main-layout';

import AuthLayout from '@/layouts/auth-layout';

import { ProtectedRoute } from '@/routes/protected-route';
import CartPage from '@/features/cart/pages/cart-page';

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
                path: '/',
                element: <ProductsPage />,
            },

            {
                path: '/cart',
                element: (
                    <ProtectedRoute>
                        <CartPage />
                    </ProtectedRoute>
                ),
            },

            {
                path: '/product/:id',
                element: <ProductDetailPage />,
            },

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