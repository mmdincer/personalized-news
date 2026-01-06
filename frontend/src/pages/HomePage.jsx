/**
 * Home Page
 * 
 * Protected route - main landing page after login
 */

import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome, {user?.name || 'User'}!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your personalized news feed is ready.
        </p>
        <p className="text-gray-500">
          Use the navigation menu above to browse news or manage your preferences.
        </p>
      </div>
    </div>
  );
};

export default HomePage;

