/**
 * NewsCardSkeleton Component
 * 
 * Loading skeleton for NewsCard component
 * Shows placeholder while news is loading
 * Matches NewsCard layout exactly
 */

const NewsCardSkeleton = () => {
  return (
    <div className="group block rounded-xl overflow-hidden relative animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        {/* Image Skeleton */}
        <div className="shrink-0 relative rounded-xl overflow-hidden w-full sm:w-56 h-44 bg-gray-200"></div>

        {/* Content Skeleton */}
        <div className="grow">
          {/* Source and Date Skeleton */}
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
          </div>

          {/* Title Skeleton */}
          <div className="space-y-2 mb-2">
            <div className="h-6 w-full bg-gray-200 rounded"></div>
            <div className="h-6 w-4/5 bg-gray-200 rounded"></div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2 mt-3">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
          </div>

          {/* Read More Link Skeleton */}
          <div className="mt-4 flex items-center gap-1">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCardSkeleton;

