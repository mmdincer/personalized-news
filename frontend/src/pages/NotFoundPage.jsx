/**
 * 404 Not Found Page
 * 
 * Displays when user navigates to a non-existent route
 */

import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

