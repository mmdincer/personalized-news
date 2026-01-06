/**
 * NewsFeed Component
 * 
 * Displays news articles in a grid layout
 * - Category filtering (optional)
 * - Loading skeleton
 * - Empty/error state handling
 * - Responsive grid layout
 * 
 * @param {boolean} showCategoryFilter - Whether to show category filter buttons (default: true)
 */

import { useState, useEffect, useCallback } from 'react';
import { getNews, getNewsByCategory } from '../../services/newsService';
import { getPreferences } from '../../services/preferencesService';
import { getSavedArticles } from '../../services/savedArticlesService';
import { extractErrorMessage } from '../../utils/errorHandler';
import { getAllCategoriesWithNames, getCategoryDisplayName } from '../../constants/categories';
import { useAuth } from '../../contexts/AuthContext';
import DateFilter from '../filters/DateFilter';
import SortDropdown from '../filters/SortDropdown';
import NewsCard from './NewsCard';
import NewsCardSkeleton from './NewsCardSkeleton';
import toast from 'react-hot-toast';

const NewsFeed = ({ showCategoryFilter = true }) => {
  const { isAuthenticated } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedArticlesMap, setSavedArticlesMap] = useState(new Map());
  const categories = getAllCategoriesWithNames();
  // Default to first category if filter is enabled, null otherwise (for preferences)
  const [selectedCategory, setSelectedCategory] = useState(
    showCategoryFilter && categories.length > 0 ? categories[0].code : null
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [userPreferences, setUserPreferences] = useState([]);
  const [dateFilters, setDateFilters] = useState({
    fromDate: null,
    toDate: null,
  });
  const [sort, setSort] = useState('newest');

  const limit = 20;

  // Update selectedCategory when showCategoryFilter changes
  useEffect(() => {
    if (showCategoryFilter && categories.length > 0) {
      // If filter is enabled and no category selected, select first category
      if (!selectedCategory) {
        setSelectedCategory(categories[0].code);
      }
    } else {
      // If filter is disabled, clear selection (will use preferences)
      setSelectedCategory(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCategoryFilter]);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await getPreferences();
        if (response.success && response.data) {
          setUserPreferences(response.data.categories || []);
        }
      } catch (err) {
        // Silently fail - preferences are optional for display
        console.error('Failed to load preferences:', err);
      }
    };
    loadPreferences();
  }, []);

  // Load saved articles once on mount (if authenticated)
  // This creates a Map for fast lookup in NewsCard components
  useEffect(() => {
    const loadSavedArticles = async () => {
      if (!isAuthenticated) {
        setSavedArticlesMap(new Map());
        return;
      }

      try {
        const response = await getSavedArticles();
        if (response.success && response.data) {
          // Create a Map with article_url as key for O(1) lookup
          const map = new Map();
          response.data.forEach((savedArticle) => {
            map.set(savedArticle.article_url, savedArticle);
          });
          setSavedArticlesMap(map);
        }
      } catch (err) {
        // Silently fail - saved articles check is optional
        console.error('Failed to load saved articles:', err);
        setSavedArticlesMap(new Map());
      }
    };

    loadSavedArticles();
  }, [isAuthenticated]);

  // Fetch news based on selected category
  // If showCategoryFilter is false, always use preferences (category = null)
  const fetchNews = useCallback(async (category = null, pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare filter parameters
      const filterParams = {
        page: pageNum,
        limit,
        sort,
      };

      // Add date filters if provided
      if (dateFilters.fromDate) {
        filterParams.from = dateFilters.fromDate;
      }
      if (dateFilters.toDate) {
        filterParams.to = dateFilters.toDate;
      }

      let response;
      // If category filter is disabled, always fetch personalized news
      if (!showCategoryFilter) {
        response = await getNews(filterParams);
      } else {
        // Category filter is enabled - always fetch by category (category is required)
        if (!category) {
          throw new Error('Category is required when filter is enabled');
        }
        response = await getNewsByCategory({ category, ...filterParams });
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
  }, [limit, showCategoryFilter, dateFilters, sort]);

  // Initial load and when category, date filters, or sort changes
  useEffect(() => {
    setPage(1);
    setArticles([]);
    // If category filter is disabled, always use null (preferences)
    const categoryToUse = showCategoryFilter ? selectedCategory : null;
    fetchNews(categoryToUse, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, showCategoryFilter, dateFilters, sort]);

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Handle load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    const categoryToUse = showCategoryFilter ? selectedCategory : null;
    fetchNews(categoryToUse, nextPage);
  };

  // Handle date filter change
  const handleDateFilterChange = ({ fromDate, toDate }) => {
    setDateFilters({
      fromDate,
      toDate,
    });
  };

  // Handle sort change
  const handleSortChange = (newSort) => {
    setSort(newSort);
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="space-y-4">
        {/* Category Filter - Only show if enabled */}
        {showCategoryFilter && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filter by Category</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.code}
                  onClick={() => handleCategoryChange(category.code)}
                  className={`px-4 py-3 sm:py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] sm:min-h-0 touch-manipulation ${
                    selectedCategory === category.code
                      ? 'bg-blue-600 text-white active:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date Filter and Sort */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Date Filter */}
          <DateFilter
            fromDate={dateFilters.fromDate}
            toDate={dateFilters.toDate}
            onChange={handleDateFilterChange}
            disabled={loading}
          />

          {/* Sort Dropdown */}
          <div className="flex items-end">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <SortDropdown
                value={sort}
                onChange={handleSortChange}
                showRelevance={false}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Info - Show when filter is disabled */}
      {!showCategoryFilter && userPreferences.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            <span className="font-medium">Showing news from your preferences:</span>{' '}
            {userPreferences.map((cat) => getCategoryDisplayName(cat)).join(', ')}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && articles.length === 0 && (
        <div className="grid lg:grid-cols-2 lg:gap-y-16 gap-10">
          {[...Array(4)].map((_, index) => (
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
            onClick={() => {
              const categoryToUse = showCategoryFilter ? selectedCategory : null;
              fetchNews(categoryToUse, 1);
            }}
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
          <div className="grid lg:grid-cols-2 lg:gap-y-16 gap-10">
            {articles.map((article, index) => (
              <NewsCard
                key={article.url || index}
                article={article}
                savedArticlesMap={savedArticlesMap}
              />
            ))}
            {/* Loading more skeletons */}
            {loading && articles.length > 0 && (
              <>
                {[...Array(2)].map((_, index) => (
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
                disabled={loading}
                className="px-6 py-3 min-h-[48px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium touch-manipulation"
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

