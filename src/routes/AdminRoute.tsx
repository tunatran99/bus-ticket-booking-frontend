import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, isReady } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Wait for auth to be ready
      if (!isReady) {
        setIsChecking(true);
        return;
      }

      // Check if authenticated
      const hasToken = authService.isAuthenticated();
      if (!hasToken || !isAuthenticated) {
        console.log('[AdminRoute] No token or not authenticated');
        setHasAdminAccess(false);
        setIsChecking(false);
        return;
      }

      // If we have a user object, check the role
      if (user) {
        const role = user.role?.toLowerCase()?.trim();
        console.log('[AdminRoute] User role check:', { role, userEmail: user.email });

        if (role === 'admin') {
          setHasAdminAccess(true);
          setIsChecking(false);
          return;
        } else {
          console.warn('[AdminRoute] User role is not admin:', role);
          setHasAdminAccess(false);
          setIsChecking(false);
          return;
        }
      }

      // If no user object but authenticated, try to fetch it
      try {
        console.log('[AdminRoute] Fetching user data...');
        const currentUser = await authService.currentUser();
        console.log('[AdminRoute] Fetched user:', currentUser);

        const role = currentUser.role?.toLowerCase()?.trim();
        if (role === 'admin') {
          setHasAdminAccess(true);
        } else {
          console.warn('[AdminRoute] Fetched user role is not admin:', role);
          setHasAdminAccess(false);
        }
      } catch (error) {
        console.error('[AdminRoute] Failed to fetch user:', error);
        setHasAdminAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    void checkAdminAccess();
  }, [isReady, isAuthenticated, user]);

  // Show loading while checking
  if (isChecking || !isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !authService.isAuthenticated()) {
    console.log('[AdminRoute] Redirecting to login - not authenticated');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If doesn't have admin access, redirect to home
  if (!hasAdminAccess) {
    console.log('[AdminRoute] Redirecting to home - no admin access');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Grant access
  console.log('[AdminRoute] ✓ Admin access granted');
  return <>{children}</>;
}
