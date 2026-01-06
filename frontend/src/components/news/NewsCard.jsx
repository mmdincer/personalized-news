/**
 * NewsCard Component
 * 
 * Displays a single news article card
 * - Article title, description, image
 * - Source and published date
 * - Link to full article
 * - Save button (if authenticated)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  saveArticle,
  deleteSavedArticleByUrl,
  isArticleSaved,
} from '../../services/savedArticlesService';
import { extractErrorMessage } from '../../utils/errorHandler';
import toast from 'react-hot-toast';

const NewsCard = ({ article }) => {
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [savedArticleId, setSavedArticleId] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if article is saved on mount and when article changes
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!isAuthenticated || !article?.url) {
        setIsSaved(false);
        setSavedArticleId(null);
        return;
      }

      try {
        setIsChecking(true);
        const savedArticle = await isArticleSaved(article.url);
        setIsSaved(!!savedArticle);
        setSavedArticleId(savedArticle?.id || null);
      } catch (error) {
        // Silently fail - don't show error for check
        setIsSaved(false);
        setSavedArticleId(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkSavedStatus();
  }, [isAuthenticated, article?.url]);

  // Handle save/unsave toggle
  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to save articles');
      return;
    }

    if (!article?.url || !article?.title) {
      toast.error('Article URL and title are required');
      return;
    }

    try {
      setIsSaving(true);

      if (isSaved) {
        // Unsave article
        await deleteSavedArticleByUrl(article.url);
        setIsSaved(false);
        setSavedArticleId(null);
        toast.success('Article removed from saved');
      } else {
        // Save article
        const response = await saveArticle({
          article_url: article.url,
          article_title: article.title,
          article_image_url: article.imageUrl || article.urlToImage,
        });

        if (response.success && response.data) {
          setIsSaved(true);
          setSavedArticleId(response.data.id);
          toast.success('Article saved');
        }
      }
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      
      // Don't show error for duplicate (already saved)
      if (errorMessage.includes('already saved')) {
        setIsSaved(true);
        // Try to get the saved article ID
        try {
          const savedArticle = await isArticleSaved(article.url);
          setSavedArticleId(savedArticle?.id || null);
        } catch {
          // Ignore
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!article) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  // Generate article detail URL from article ID or URL
  const getArticleDetailUrl = () => {
    if (article.id) {
      return `/article/${encodeURIComponent(article.id)}`;
    }
    if (article.url) {
      return `/article/${encodeURIComponent(article.url)}`;
    }
    return '#';
  };

  return (
    <div className="relative">
      {/* Save Button - Only show if authenticated */}
      {isAuthenticated && (
        <button
          onClick={handleSaveToggle}
          disabled={isSaving || isChecking}
          className={`
            absolute top-4 right-4 z-10 p-2 rounded-full shadow-md transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              isSaved
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-gray-100'
            }
          `}
          aria-label={isSaved ? 'Remove from saved' : 'Save article'}
          title={isSaved ? 'Remove from saved' : 'Save article'}
        >
          {isSaving || isChecking ? (
            <svg
              className="w-5 h-5 animate-spin"
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
          ) : isSaved ? (
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5 2a2 2 0 0 0-2 2v16l7-3 7 3V4a2 2 0 0 0-2-2H5z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          )}
        </button>
      )}

      <Link
        to={getArticleDetailUrl()}
        className="group block rounded-xl overflow-hidden focus:outline-none"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          {/* Article Image */}
          <div className="shrink-0 relative rounded-xl overflow-hidden w-full sm:w-56 h-44 bg-gray-200">
            <img
              src={article.imageUrl || article.urlToImage || '/placeholder-news.jpg'}
              alt={article.title || 'News article'}
              className="group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out size-full absolute top-0 start-0 object-cover rounded-xl"
              onError={(e) => {
                // Fallback to a simple placeholder if image fails to load
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23e5e7eb" width="800" height="600"/%3E%3Ctext fill="%239ca3af" font-family="system-ui" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENews%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>

        {/* Article Content */}
        <div className="grow">
          {/* Source and Date */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-medium">{article.source?.name || 'Unknown Source'}</span>
            {article.publishedAt && (
              <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-800 group-hover:text-gray-600 mb-2 line-clamp-2">
            {article.title || 'No title available'}
          </h3>

          {/* Description */}
          {article.description && (
            <p 
              className="mt-3 text-gray-600 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: article.description }}
            />
          )}

          {/* Read More Link */}
          <p className="mt-4 inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 group-hover:underline group-focus:underline font-medium">
            Read more
            <svg
              className="shrink-0 size-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </p>
        </div>
      </div>
    </Link>
    </div>
  );
};

export default NewsCard;

