/**
 * Home Page
 * 
 * Protected route - main landing page after login
 * Shows personalized news feed based on user preferences
 */

import { useAuth } from '../contexts/AuthContext';
import NewsFeed from '../components/news/NewsFeed';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name || 'User'}!
        </h1>
        <p className="text-lg text-gray-600">
          Your personalized news feed
        </p>
      </div>

      {/* News Feed - No category filter on home page */}
      <NewsFeed showCategoryFilter={false} />
    </div>
  );
};

export default HomePage;

