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
    <a
      href={article.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl overflow-hidden focus:outline-none"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        {/* Article Image */}
        {(article.imageUrl || article.urlToImage) ? (
          <div className="shrink-0 relative rounded-xl overflow-hidden w-full sm:w-56 h-44 bg-gray-200">
            <img
              src={article.imageUrl || article.urlToImage}
              alt={article.title || 'News article'}
              className="group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out size-full absolute top-0 start-0 object-cover rounded-xl"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="shrink-0 relative rounded-xl overflow-hidden w-full sm:w-56 h-44 bg-gray-200"></div>
        )}

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
            <p className="mt-3 text-gray-600 line-clamp-2">
              {article.description}
            </p>
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
    </a>
  );
};

export default NewsCard;

