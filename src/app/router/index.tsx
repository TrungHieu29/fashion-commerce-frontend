import { createBrowserRouter, Navigate } from 'react-router-dom'; // Thêm Navigate vào đây

import LoginPage from '@/features/auth/pages/login-page';
import RegisterPage from '@/features/auth/pages/register-page';
import VerifyAccountPage from '@/features/auth/pages/verify-account-page';

import ProfilePage from '@/features/user/pages/profile-page';
import MyShopPage from '@/features/shop/pages/my-shop-page';
import ShopListPage from '@/features/shop/pages/shop-list-page';
import ShopDetailPage from '@/features/shop/pages/shop-detail-page';
import RegisterSellerPage from '@/features/shop/pages/register-seller-page';
import ShopProductsPage from '@/features/shop/pages/shop-products-page';
import AddProductPage from '@/features/shop/pages/add-product-page';
import EditProductPage from '@/features/shop/pages/edit-product-page';
import DiscountManagementPage from '@/features/discount/pages/discount-management-page';
import ShopOrdersPage from '@/features/shop/pages/shop-orders-page';
import ShopDashboardPage from '@/features/shop/pages/shop-dashboard-page';
import ShopAnalyticsPage from '@/features/shop/pages/shop-analytics-page';

import ProductsPage from '@/features/product/pages/products-page.tsx';

import ProductDetailPage from '@/features/product-variant/pages/product-detail-page';
import CheckoutPage from '@/features/order/pages/checkout-page';
import OrderSuccessPage from '@/features/order/pages/order-success-page';
import ProfileOrdersPage from '@/features/order/pages/profile-orders-page';
import OrderDetailPage from '@/features/order/pages/order-detail-page';

import MainLayout from '@/layouts/main-layout';
import SellerLayout from '@/layouts/seller-layout';
import AdminLayout from '@/layouts/admin-layout';

import AuthLayout from '@/layouts/auth-layout';

import { ProtectedRoute } from '@/routes/protected-route';
import { AdminRoute } from '@/routes/admin-route';
import CartPage from '@/features/cart/pages/cart-page';
import ShopShippingPage from '@/features/shop/pages/shop-shipping-page';
import SellerChatPage from '@/features/chat/pages/seller-chat-page';
import AdminDashboardPage from '@/features/admin/pages/admin-dashboard-page';
import AdminUsersPage from '@/features/admin/pages/admin-users-page';
import AdminShopsPage from '@/features/admin/pages/admin-shops-page';
import AdminProductsPage from '@/features/admin/pages/admin-products-page';
import AdminCatalogPage from '@/features/admin/pages/admin-catalog-page';
import AdminOrdersPage from '@/features/admin/pages/admin-orders-page';
import AdminReviewsPage from '@/features/admin/pages/admin-reviews-page';

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
            {
                path: '/verify-account',
                element: <VerifyAccountPage />,
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
            // 1. Đưa thằng chuyển hướng lên đầu tiên làm nhiệm vụ "đón lỏng" khi vừa vào /my-shop
            {
                path: '/my-shop',
                element: <Navigate to="/my-shop/dashboard" replace />,
            },
            // 2. Các đường dẫn tuyệt đối khác viết tường minh rõ ràng
            {
                path: '/my-shop/dashboard',
                element: <ShopDashboardPage />,
            },
            {
                path: '/my-shop/analytics',
                element: <ShopAnalyticsPage />,
            },
            {
                path: '/my-shop/chat',
                element: <SellerChatPage />,
            },
            {
                path: '/my-shop/profile', // Khớp chuẩn 100% với to: '/my-shop/profile' ở Sidebar
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
        element: (
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        ),
        children: [
            {
                path: '/admin',
                element: <Navigate to="/admin/dashboard" replace />,
            },
            {
                path: '/admin/dashboard',
                element: <AdminDashboardPage />,
            },
            {
                path: '/admin/users',
                element: <AdminUsersPage />,
            },
            {
                path: '/admin/shops',
                element: <AdminShopsPage />,
            },
            {
                path: '/admin/products',
                element: <AdminProductsPage />,
            },
            {
                path: '/admin/catalog',
                element: <AdminCatalogPage />,
            },
            {
                path: '/admin/orders',
                element: <AdminOrdersPage />,
            },
            {
                path: '/admin/reviews',
                element: <AdminReviewsPage />,
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
            {
                path: '/shops/:id',
                element: (
                    <ShopDetailPage />
                ),
            },
        ],
    },
]);
