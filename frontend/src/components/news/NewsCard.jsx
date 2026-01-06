/**
 * NewsCard Component
 * 
 * Displays a single news article card
 * - Article title, description, image
 * - Source and published date
 * - Link to full article
 */

const NewsCard = ({ article }) => {
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

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col">
      {/* Article Image */}
      {article.urlToImage && (
        <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
          <img
            src={article.urlToImage}
            alt={article.title || 'News article'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Article Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Source and Date */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span className="font-medium">{article.source?.name || 'Unknown Source'}</span>
          {article.publishedAt && (
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {article.title || 'No title available'}
        </h3>

        {/* Description */}
        {article.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
            {article.description}
          </p>
        )}

        {/* Read More Link */}
        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mt-auto"
          >
            Read more
            <svg
              className="ml-1 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
};

export default NewsCard;

