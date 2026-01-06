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

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNews, getNewsByCategory, searchNews } from '../../services/newsService';
import { getPreferences } from '../../services/preferencesService';
import { getSavedArticles } from '../../services/savedArticlesService';
import { extractErrorMessage } from '../../utils/errorHandler';
import { getAllCategoriesWithNames, getCategoryDisplayName } from '../../constants/categories';
import { useAuth } from '../../contexts/AuthContext';
import DateFilter from '../filters/DateFilter';
import SortDropdown from '../filters/SortDropdown';
import SearchBar from '../search/SearchBar';
import NewsCard from './NewsCard';
import NewsCardSkeleton from './NewsCardSkeleton';
import toast from 'react-hot-toast';

const NewsFeed = ({ showCategoryFilter = true }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

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
      // If search query exists, use search instead of category/preferences
      if (searchQuery && searchQuery.trim().length >= 2) {
        response = await searchNews({
          q: searchQuery.trim(),
          ...filterParams,
        });
      } else if (!showCategoryFilter) {
        // If category filter is disabled, always fetch personalized news
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
        const total = response.data.totalResults || 0;
        
        if (pageNum === 1) {
          setArticles(newArticles);
          // Check if there are more pages
          setHasMore(newArticles.length === limit && newArticles.length < total);
        } else {
          setArticles((prev) => {
            const updatedArticles = [...prev, ...newArticles];
            // Check if there are more pages
            setHasMore(newArticles.length === limit && updatedArticles.length < total);
            return updatedArticles;
          });
        }
      } else {
        throw new Error(response.error?.message || 'Failed to fetch news');
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      // Only show toast for initial load, not for load more
      if (pageNum === 1) {
        toast.error(errorMessage);
      }
      if (pageNum === 1) {
        setArticles([]);
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [limit, showCategoryFilter, dateFilters, sort, searchQuery]);

  // Initial load and when category, date filters, sort, or search query changes
  useEffect(() => {
    setPage(1);
    setArticles([]);
    // If category filter is disabled, always use null (preferences)
    const categoryToUse = showCategoryFilter ? selectedCategory : null;
    fetchNews(categoryToUse, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, showCategoryFilter, dateFilters, sort, searchQuery]);

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!loading && !isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      setIsLoadingMore(true);
      const categoryToUse = showCategoryFilter ? selectedCategory : null;
      fetchNews(categoryToUse, nextPage).finally(() => {
        setIsLoadingMore(false);
      });
    }
  }, [loading, isLoadingMore, hasMore, page, showCategoryFilter, selectedCategory, fetchNews]);

  // Set up Intersection Observer for infinite scroll
  useEffect(() => {
    // Don't set up observer if no more pages or loading
    if (!hasMore || loading || isLoadingMore) {
      // Clean up existing observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    // Create Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          // User has scrolled to the bottom, load more
          handleLoadMore();
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin: '200px', // Start loading 200px before reaching the bottom
        threshold: 0.1, // Trigger when 10% of sentinel is visible
      }
    );

    observerRef.current = observer;

    // Observe the sentinel element
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [hasMore, loading, isLoadingMore, handleLoadMore]);

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

  // Handle search
  const handleSearch = (query) => {
    // Update search query state (debounce is handled in SearchBar)
    setSearchQuery(query || '');
  };

  // Check if any filters are active
  const hasActiveFilters = dateFilters.fromDate || dateFilters.toDate || sort !== 'newest' || (searchQuery && searchQuery.trim().length >= 2);

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible">
        {/* Filters Header */}
        <div className="px-4 py-2.5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded">
                <svg
                  className="w-4 h-4 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M7 12h10" />
                  <path d="M11 18h2" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
              </div>
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setDateFilters({ fromDate: null, toDate: null });
                  setSort('newest');
                  setSearchQuery('');
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filters Content */}
        <div className="p-4">
          {/* Single Row Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Bar */}
            <div className="md:col-span-1">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search news..."
                debounceMs={300}
                minLength={2}
                disabled={loading}
                defaultValue={searchQuery}
              />
            </div>

            {/* Date Filter - Compact */}
            <div className="md:col-span-2 flex items-center">
              <DateFilter
                fromDate={dateFilters.fromDate}
                toDate={dateFilters.toDate}
                onChange={handleDateFilterChange}
                disabled={loading}
                className="border-0 shadow-none p-0 compact w-full"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-1 relative z-10">
              <SortDropdown
                value={sort}
                onChange={handleSortChange}
                showRelevance={false}
                disabled={loading}
              />
            </div>
          </div>

          {/* Category Filter - Only show if enabled */}
          {showCategoryFilter && (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <svg
                  className="w-3.5 h-3.5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
                <label className="text-xs font-semibold text-gray-700">Category</label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <button
                    key={category.code}
                    onClick={() => handleCategoryChange(category.code)}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                      min-h-[36px] sm:min-h-0 touch-manipulation
                      flex items-center gap-1.5
                      ${
                        selectedCategory === category.code
                          ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                      }
                    `}
                  >
                    {selectedCategory === category.code && (
                      <svg
                        className="w-3 h-3"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500">Active:</span>
                {dateFilters.fromDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    From {dateFilters.fromDate}
                    <button
                      onClick={() => handleDateFilterChange({ fromDate: null, toDate: dateFilters.toDate })}
                      className="hover:text-blue-900"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {dateFilters.toDate && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    To {dateFilters.toDate}
                    <button
                      onClick={() => handleDateFilterChange({ fromDate: dateFilters.fromDate, toDate: null })}
                      className="hover:text-blue-900"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {sort !== 'newest' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    Sort: {sort === 'oldest' ? 'Oldest' : 'Relevance'}
                    <button
                      onClick={() => handleSortChange('newest')}
                      className="hover:text-blue-900"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
                {searchQuery && searchQuery.trim().length >= 2 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    Search: {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:text-blue-900"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
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
            {(loading || isLoadingMore) && articles.length > 0 && (
              <>
                {[...Array(2)].map((_, index) => (
                  <NewsCardSkeleton key={`skeleton-${index}`} />
                ))}
              </>
            )}
          </div>

          {/* Infinite Scroll Sentinel */}
          {hasMore && !loading && (
            <div
              ref={sentinelRef}
              className="h-20 flex items-center justify-center"
              aria-hidden="true"
            >
              {/* Loading indicator for infinite scroll */}
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-gray-500">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-sm">Loading more articles...</span>
                </div>
              )}
            </div>
          )}

          {/* Optional Load More Button (can be removed if infinite scroll is preferred) */}
          {hasMore && !loading && !isLoadingMore && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading || isLoadingMore}
                className="px-6 py-3 min-h-[48px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium touch-manipulation"
              >
                Load More
              </button>
            </div>
          )}

          {/* End of Results */}
          {!hasMore && articles.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>You've reached the end of the results</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsFeed;

