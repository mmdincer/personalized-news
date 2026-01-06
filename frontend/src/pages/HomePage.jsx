/**
 * Home Page
 * 
 * Protected route - main landing page after login
 */

import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {user?.name || 'User'}!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your personalized news feed is ready.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/news"
              className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
            >
              View News
            </Link>
            <Link
              to="/preferences"
              className="bg-gray-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-gray-700 transition-colors"
            >
              Manage Preferences
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

