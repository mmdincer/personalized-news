/**
 * ArticleDetailPage Component
 * 
 * Displays full article content with title, image, and body text
 * - Fetches article by ID or URL from backend
 * - Displays full article content (bodyText)
 * - Shows article metadata (source, date)
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getArticleById } from '../services/newsService';
import { extractErrorMessage } from '../utils/errorHandler';

const ArticleDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Extract article ID from URL path
        // Route is /article/*, so we need to extract everything after /article/
        const pathMatch = location.pathname.match(/^\/article\/(.+)$/);
        if (!pathMatch || !pathMatch[1]) {
          setError('Article ID is missing');
          setLoading(false);
          return;
        }
        
        // Decode article ID (may contain slashes)
        const articleId = decodeURIComponent(pathMatch[1]);
        
        const article = await getArticleById(articleId);
        
        if (!article) {
          throw new Error('Article data not found in response');
        }
        
        if (!article.title && !article.id) {
          throw new Error('Article data is invalid');
        }
        
        setArticle(article);
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [location.pathname]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">Unable to load article data.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg
          className="w-5 h-5 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        Back
      </button>

      {/* Article Header */}
      <div className="mb-8">
        {/* Source and Date */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="font-medium">{article.source?.name || 'Unknown Source'}</span>
          {article.publishedAt && (
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
          {article.title || 'No title available'}
        </h1>

        {/* Image */}
        {article.imageUrl && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={article.imageUrl}
              alt={article.title || 'Article image'}
              className="w-full h-auto object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none">
        {article.content ? (
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {article.content.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              )
            ))}
          </div>
        ) : (
          <div className="text-gray-600">
            <p className="mb-4">{article.description || 'No content available.'}</p>
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Read full article on The Guardian
                <svg
                  className="w-4 h-4 ml-2"
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
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {article.url && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              View original article on The Guardian
              <svg
                className="w-4 h-4 ml-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to News
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;

