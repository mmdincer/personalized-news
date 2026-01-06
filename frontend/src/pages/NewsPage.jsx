/**
 * News Page
 * 
 * Protected route - displays personalized news feed
 */

import NewsFeed from '../components/news/NewsFeed';

const NewsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">News Feed</h1>
      </div>
      <NewsFeed />
    </div>
  );
};

export default NewsPage;

