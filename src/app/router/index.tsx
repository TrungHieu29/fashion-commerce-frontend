import { createBrowserRouter } from 'react-router-dom';

import LoginPage from '@/features/auth/pages/login-page';
import RegisterPage from '@/features/auth/pages/register-page';

import ProfilePage from '@/features/user/pages/profile-page';
import MyShopPage from '@/features/shop/pages/my-shop-page';
import ShopListPage from '@/features/shop/pages/shop-list-page';
import RegisterSellerPage from '@/features/shop/pages/register-seller-page';
import ShopProductsPage from '@/features/shop/pages/shop-products-page';
import AddProductPage from '@/features/shop/pages/add-product-page';
import EditProductPage from '@/features/shop/pages/edit-product-page';
import DiscountManagementPage from '@/features/discount/pages/discount-management-page';

import ProductsPage from '@/features/product/pages/products-page.tsx';

import ProductDetailPage from '@/features/product-variant/pages/product-detail-page';



import MainLayout from '@/layouts/main-layout';
import SellerLayout from '@/layouts/seller-layout';

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
            {
                path: '/register',
                element: <RegisterPage />,
            },
        ],
    },

    {
        element: (
            <ProtectedRoute>
                <SellerLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: '/my-shop',
                element: <MyShopPage />,
            },
            {
                path: '/my-shop/products',
                element: <ShopProductsPage />,
            },
            {
                path: '/my-shop/products/add',
                element: <AddProductPage />,
            },
            {
                path: '/my-shop/products/edit/:id',
                element: <EditProductPage />,
            },
            {
                path: '/my-shop/discounts',
                element: <DiscountManagementPage />,
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
            {
                path: '/register-seller',
                element: (
                    <ProtectedRoute>
                        <RegisterSellerPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/shops',
                element: (
                    <ShopListPage />
                ),
            },
        ],
    },
]);