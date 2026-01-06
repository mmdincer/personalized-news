/**
 * NewsFeed Component
 * 
 * Displays news articles in a grid layout
 * - Category filtering
 * - Loading skeleton
 * - Empty/error state handling
 * - Responsive grid layout
 */

import { useState, useEffect, useCallback } from 'react';
import { getNews, getNewsByCategory } from '../../services/newsService';
import { extractErrorMessage } from '../../utils/errorHandler';
import { getAllCategoriesWithNames, getCategoryDisplayName } from '../../constants/categories';
import NewsCard from './NewsCard';
import NewsCardSkeleton from './NewsCardSkeleton';
import toast from 'react-hot-toast';

const NewsFeed = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const categories = getAllCategoriesWithNames();
  const limit = 20;

  // Fetch news based on selected category
  const fetchNews = useCallback(async (category = null, pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (category) {
        response = await getNewsByCategory({ category, page: pageNum, limit });
      } else {
        response = await getNews({ page: pageNum, limit });
      }

      if (response.success && response.data) {
        const newArticles = response.data.articles || [];
        if (pageNum === 1) {
          setArticles(newArticles);
        } else {
          setArticles((prev) => [...prev, ...newArticles]);
        }
        setHasMore(newArticles.length === limit);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch news');
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load and when category changes
  useEffect(() => {
    setPage(1);
    setArticles([]);
    fetchNews(selectedCategory, 1);
  }, [selectedCategory, fetchNews]);

  // Handle category change
  const handleCategoryChange = (category) => {
    const newCategory = category === selectedCategory ? null : category;
    setSelectedCategory(newCategory);
  };

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(selectedCategory, nextPage);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.code}
              onClick={() => handleCategoryChange(category.code)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && articles.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <NewsCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && articles.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to load news</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => fetchNews(selectedCategory, 1)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && articles.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No news found</h3>
          <p className="text-gray-600">
            {selectedCategory
              ? `No news found for ${getCategoryDisplayName(selectedCategory)} category.`
              : 'No news available at the moment.'}
          </p>
        </div>
      )}

      {/* News Grid */}
      {articles.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <NewsCard key={article.url || index} article={article} />
            ))}
            {/* Loading more skeletons */}
            {loading && articles.length > 0 && (
              <>
                {[...Array(3)].map((_, index) => (
                  <NewsCardSkeleton key={`skeleton-${index}`} />
                ))}
              </>
            )}
          </div>

          {/* Load More Button */}
          {hasMore && !loading && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsFeed;

