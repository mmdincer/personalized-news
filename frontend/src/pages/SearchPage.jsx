/**
 * SearchPage Component
 * 
 * Search page with:
 * - SearchBar component
 * - Search results display
 * - Pagination
 * - Loading and error states
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import NewsCard from '../components/news/NewsCard';
import NewsCardSkeleton from '../components/news/NewsCardSkeleton';
import { searchNews } from '../services/newsService';
import { getSavedArticles } from '../services/savedArticlesService';
import { extractErrorMessage } from '../utils/errorHandler';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedArticlesMap, setSavedArticlesMap] = useState(new Map());
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const limit = 20;
  const queryFromUrl = searchParams.get('q') || '';

  // Load saved articles once on mount (if authenticated)
  useEffect(() => {
    const loadSavedArticles = async () => {
      if (!isAuthenticated) {
        setSavedArticlesMap(new Map());
        return;
      }

      try {
        const response = await getSavedArticles();
        if (response.success && response.data) {
          const map = new Map();
          response.data.forEach((savedArticle) => {
            map.set(savedArticle.article_url, savedArticle);
          });
          setSavedArticlesMap(map);
        }
      } catch (err) {
        // Silently fail - saved articles are optional
        console.error('Failed to load saved articles:', err);
      }
    };

    loadSavedArticles();
  }, [isAuthenticated]);

  // Fetch search results
  const fetchSearchResults = async (searchQuery, pageNum = 1) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setArticles([]);
      setTotalResults(0);
      setHasMore(false);
      setError(null);
      setIsInitialLoad(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await searchNews({
        q: searchQuery.trim(),
        page: pageNum,
        limit,
      });

      if (response.success && response.data) {
        const newArticles = response.data.articles || [];
        const total = response.data.totalResults || 0;

        if (pageNum === 1) {
          setArticles(newArticles);
        } else {
          setArticles((prev) => [...prev, ...newArticles]);
        }

        setTotalResults(total);
        const currentArticles = pageNum === 1 ? newArticles : [...articles, ...newArticles];
        setHasMore(currentArticles.length < total && newArticles.length === limit);
        setPage(pageNum);
      } else {
        throw new Error(response.error?.message || 'Failed to search news');
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
      setArticles([]);
      setTotalResults(0);
      setHasMore(false);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  // Handle search from SearchBar
  const handleSearch = (query) => {
    // Update URL query parameter
    if (query && query.trim().length >= 2) {
      setSearchParams({ q: query.trim() });
      setPage(1);
      fetchSearchResults(query.trim(), 1);
    } else {
      setSearchParams({});
      setArticles([]);
      setTotalResults(0);
      setHasMore(false);
      setError(null);
    }
  };

  // Load search results from URL on mount or when URL changes
  useEffect(() => {
    if (queryFromUrl) {
      fetchSearchResults(queryFromUrl, 1);
    } else {
      setIsInitialLoad(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryFromUrl]);

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && hasMore && queryFromUrl) {
      const nextPage = page + 1;
      fetchSearchResults(queryFromUrl, nextPage);
    }
  };

  // Refresh saved articles after save/unsave
  const refreshSavedArticles = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await getSavedArticles();
      if (response.success && response.data) {
        const map = new Map();
        response.data.forEach((savedArticle) => {
          map.set(savedArticle.article_url, savedArticle);
        });
        setSavedArticlesMap(map);
      }
    } catch (err) {
      // Silently fail
      console.error('Failed to refresh saved articles:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Search News</h1>
        <p className="text-gray-600">
          Search for news articles from The Guardian
        </p>
      </div>

      {/* SearchBar */}
      <div className="mb-8">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search news articles..."
          debounceMs={300}
          minLength={2}
          defaultValue={queryFromUrl}
        />
      </div>

      {/* Loading State (Initial) */}
      {isInitialLoad && queryFromUrl && (
        <div className="grid lg:grid-cols-2 lg:gap-y-16 gap-10">
          {[...Array(4)].map((_, index) => (
            <NewsCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && !isInitialLoad && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
          <button
            onClick={() => queryFromUrl && fetchSearchResults(queryFromUrl, 1)}
            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !isInitialLoad && !queryFromUrl && (
        <div className="text-center py-16">
          <svg
            className="w-24 h-24 mx-auto text-gray-400 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Start searching</h2>
          <p className="text-gray-500">
            Enter a search query above to find news articles
          </p>
        </div>
      )}

      {/* No Results State */}
      {!loading && !error && !isInitialLoad && queryFromUrl && articles.length === 0 && (
        <div className="text-center py-16">
          <svg
            className="w-24 h-24 mx-auto text-gray-400 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No results found</h2>
          <p className="text-gray-500 mb-6">
            We couldn't find any articles matching "{queryFromUrl}"
          </p>
          <button
            onClick={() => {
              setSearchParams({});
              setArticles([]);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Search Results */}
      {!isInitialLoad && articles.length > 0 && (
        <>
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Found <span className="font-semibold text-gray-900">{totalResults}</span> result
              {totalResults !== 1 ? 's' : ''} for "{queryFromUrl}"
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid lg:grid-cols-2 lg:gap-y-16 gap-10 mb-8">
            {articles.map((article) => (
              <div key={article.id || article.url} className="relative group">
                <NewsCard
                  article={article}
                  savedArticlesMap={savedArticlesMap}
                  onSaveToggle={refreshSavedArticles}
                />
              </div>
            ))}
          </div>

          {/* Loading More Indicator */}
          {loading && articles.length > 0 && (
            <div className="grid lg:grid-cols-2 lg:gap-y-16 gap-10 mb-8">
              {[...Array(2)].map((_, index) => (
                <NewsCardSkeleton key={`loading-skeleton-${index}`} />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && !loading && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Load More
                <svg
                  className="ml-2 w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          )}

          {/* End of Results */}
          {!hasMore && articles.length > 0 && (
            <div className="text-center mt-8 text-gray-500">
              <p>You've reached the end of the results</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;

