import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user } = useAuthStore();
    const roles = user?.roles || [];
    const isAdmin = roles.some((role) => role === 'ADMIN' || role === 'ROLE_ADMIN');

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};
