/**
 * 404 Not Found Page
 * 
 * Displays when user navigates to a non-existent route
 * Note: This page is wrapped in Layout component, so Header is already included
 */

import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Main Content */}
      <div className="text-center">
        <h1 className="block text-7xl font-bold text-gray-800 sm:text-9xl">404</h1>
        <p className="mt-3 text-gray-600">Oops, something went wrong.</p>
        <p className="text-gray-600">Sorry, we couldn't find your page.</p>
        <div className="mt-5 flex flex-col justify-center items-center gap-2 sm:flex-row sm:gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            <svg
              className="shrink-0 w-4 h-4"
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
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
