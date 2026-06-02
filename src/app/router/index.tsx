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
import ShopOrdersPage from '@/features/shop/pages/shop-orders-page';

import ProductsPage from '@/features/product/pages/products-page.tsx';

import ProductDetailPage from '@/features/product-variant/pages/product-detail-page';
import CheckoutPage from '@/features/order/pages/checkout-page';
import OrderSuccessPage from '@/features/order/pages/order-success-page';
import ProfileOrdersPage from '@/features/order/pages/profile-orders-page';
import OrderDetailPage from '@/features/order/pages/order-detail-page';




import MainLayout from '@/layouts/main-layout';
import SellerLayout from '@/layouts/seller-layout';

import AuthLayout from '@/layouts/auth-layout';

import { ProtectedRoute } from '@/routes/protected-route';
import CartPage from '@/features/cart/pages/cart-page';
import ShopShippingPage from '@/features/shop/pages/shop-shipping-page';

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
            {
                path: '/my-shop/orders/confirm',
                element: <ShopOrdersPage mode="confirm" />,
            },
            {
                path: '/my-shop/orders/history',
                element: <ShopOrdersPage mode="history" />,
            },
            {
                path: '/my-shop/shipping',
                element: <ShopShippingPage />,
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
                path: '/checkout',
                element: (
                    <ProtectedRoute>
                        <CheckoutPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: '/order-success/:id',
                element: (
                    <ProtectedRoute>
                        <OrderSuccessPage />
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
                path: '/order/:id',
                element: (
                    <ProtectedRoute>
                        <OrderDetailPage />
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