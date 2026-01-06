/**
 * NewsCardSkeleton Component
 * 
 * Loading skeleton for NewsCard component
 * Shows placeholder while news is loading
 */

const NewsCardSkeleton = () => {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-gray-200"></div>

      {/* Content Skeleton */}
      <div className="p-4">
        {/* Source and Date Skeleton */}
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </div>

        {/* Title Skeleton */}
        <div className="space-y-2 mb-2">
          <div className="h-5 w-full bg-gray-200 rounded"></div>
          <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
        </div>

        {/* Description Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full bg-gray-200 rounded"></div>
          <div className="h-3 w-full bg-gray-200 rounded"></div>
          <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
        </div>

        {/* Link Skeleton */}
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
    </article>
  );
};

export default NewsCardSkeleton;

