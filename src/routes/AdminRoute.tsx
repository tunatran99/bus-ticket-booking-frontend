import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
