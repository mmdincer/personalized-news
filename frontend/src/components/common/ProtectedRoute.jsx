/**
 * Protected Route Component
 * 
 * Wrapper component that protects routes requiring authentication
 * Redirects to login if user is not authenticated
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {React.ReactNode} Protected content or redirect to login
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;




