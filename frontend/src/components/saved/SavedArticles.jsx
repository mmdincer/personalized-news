/**
 * SavedArticles Component
 * 
 * Displays saved articles in a grid layout
 * - Lists all saved articles for the authenticated user
 * - Delete button for each article
 * - Loading skeleton
 * - Empty/error state handling
 * - Uses NewsCard component for consistent display
 */

import { useState, useEffect } from 'react';
import { getSavedArticles, deleteSavedArticle } from '../../services/savedArticlesService';
import { extractErrorMessage } from '../../utils/errorHandler';
import NewsCard from '../news/NewsCard';
import NewsCardSkeleton from '../news/NewsCardSkeleton';
import toast from 'react-hot-toast';

const SavedArticles = () => {
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedArticlesMap, setSavedArticlesMap] = useState(new Map());

  /**
   * Load saved articles from API
   */
  const loadSavedArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSavedArticles();

      if (response.success && response.data) {
        // Create a Map with article_url as key for fast lookup
        const map = new Map();
        response.data.forEach((savedArticle) => {
          map.set(savedArticle.article_url, savedArticle);
        });
        setSavedArticlesMap(map);

        // Transform saved articles to NewsCard-compatible format
        const transformedArticles = response.data.map((savedArticle) => ({
          id: savedArticle.id,
          url: savedArticle.article_url,
          title: savedArticle.article_title,
          imageUrl: savedArticle.article_image_url,
          urlToImage: savedArticle.article_image_url,
          publishedAt: savedArticle.saved_at,
          source: {
            name: 'Saved Article',
          },
          description: null,
        }));

        setSavedArticles(transformedArticles);
      } else {
        throw new Error('Failed to load saved articles');
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh saved articles after save/delete operation
   * Called when NewsCard's save button is toggled
   */
  const refreshSavedArticles = async () => {
    try {
      const response = await getSavedArticles(true); // Force refresh

      if (response.success && response.data) {
        // Update Map
        const map = new Map();
        response.data.forEach((savedArticle) => {
          map.set(savedArticle.article_url, savedArticle);
        });
        setSavedArticlesMap(map);

        // Update articles list
        const transformedArticles = response.data.map((savedArticle) => ({
          id: savedArticle.id,
          url: savedArticle.article_url,
          title: savedArticle.article_title,
          imageUrl: savedArticle.article_image_url,
          urlToImage: savedArticle.article_image_url,
          publishedAt: savedArticle.saved_at,
          source: {
            name: 'Saved Article',
          },
          description: null,
        }));

        setSavedArticles(transformedArticles);
      }
    } catch (err) {
      // Silently fail - NewsCard will handle its own errors
      console.error('Failed to refresh saved articles:', err);
    }
  };

  // Load saved articles on mount
  useEffect(() => {
    loadSavedArticles();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Saved Articles</h1>
        <p className="text-gray-600">
          {savedArticles.length > 0
            ? `${savedArticles.length} saved article${savedArticles.length !== 1 ? 's' : ''}`
            : 'Articles you save will appear here'}
        </p>
      </div>

      {/* Error State */}
      {error && !loading && (
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
            onClick={loadSavedArticles}
            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid lg:grid-cols-2 lg:gap-y-16 gap-10">
          {[...Array(4)].map((_, index) => (
            <NewsCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && savedArticles.length === 0 && (
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
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No saved articles</h2>
          <p className="text-gray-500 mb-6">
            Start saving articles to read them later. Click the save button on any article.
          </p>
        </div>
      )}

      {/* Saved Articles Grid */}
      {!loading && !error && savedArticles.length > 0 && (
        <div className="grid lg:grid-cols-2 lg:gap-y-16 gap-10">
          {savedArticles.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              savedArticlesMap={savedArticlesMap}
              onSaveToggle={refreshSavedArticles}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedArticles;

