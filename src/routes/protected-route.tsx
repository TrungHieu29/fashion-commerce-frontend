import { Navigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/auth.store';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({
    children,
}: ProtectedRouteProps) => {

    const isAuthenticated =
        useAuthStore(
            (state) => state.isAuthenticated
        );
    const user = useAuthStore((state) => state.user);

    if (!isAuthenticated) {

        return <Navigate to="/login" replace />;
    }

    if (user?.status === 'PENDING') {
        return <Navigate to={`/verify-account?email=${encodeURIComponent(user.email || '')}`} replace />;
    }

    return children;
};
