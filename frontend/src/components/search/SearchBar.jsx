/**
 * SearchBar Component
 * 
 * Search input component with debounce, loading state, and error handling
 * - Debounced input (300ms delay)
 * - Loading indicator
 * - Error display
 * - Clear button
 * - Search icon
 */

import { useState, useEffect, useRef } from 'react';
import { extractErrorMessage } from '../../utils/errorHandler';

const SearchBar = ({ 
  onSearch, 
  placeholder = 'Search news...',
  debounceMs = 300,
  minLength = 2,
  className = '',
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimerRef = useRef(null);
  const inputRef = useRef(null);

  // Clear debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced search
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Reset error when query changes
    setError(null);

    // If query is empty, call onSearch with empty string
    if (query.trim().length === 0) {
      if (onSearch) {
        onSearch('');
      }
      setIsLoading(false);
      return;
    }

    // If query is too short, don't search yet
    if (query.trim().length < minLength) {
      setIsLoading(false);
      if (onSearch) {
        onSearch('');
      }
      return;
    }

    // Set loading state
    setIsLoading(true);

    // Debounce the search
    debounceTimerRef.current = setTimeout(() => {
      if (onSearch) {
        try {
          onSearch(query.trim());
          setError(null);
        } catch (err) {
          const errorMessage = extractErrorMessage(err);
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }, debounceMs);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, debounceMs, minLength, onSearch]);

  // Handle input change
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
  };

  // Handle clear button click
  const handleClear = () => {
    setQuery('');
    setError(null);
    setIsLoading(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle form submit (prevent default)
  const handleSubmit = (e) => {
    e.preventDefault();
    // Search is already triggered by debounce, but we can trigger it immediately if needed
    if (query.trim().length >= minLength && onSearch) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      setIsLoading(true);
      try {
        onSearch(query.trim());
        setError(null);
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Input */}
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full pl-12 pr-12 py-3 
              border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              text-gray-900 placeholder-gray-400
              transition-all duration-200
              ${error ? 'border-red-300 focus:ring-red-500' : ''}
            `}
            aria-label="Search news"
            aria-describedby={error ? 'search-error' : undefined}
          />

          {/* Loading Indicator / Clear Button */}
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
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
            ) : query.length > 0 ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            id="search-error"
            className="mt-2 text-sm text-red-600 flex items-center gap-2"
            role="alert"
          >
            <svg
              className="h-4 w-4"
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
            <span>{error}</span>
          </div>
        )}

        {/* Helper Text */}
        {query.length > 0 && query.length < minLength && !error && (
          <div className="mt-2 text-sm text-gray-500">
            Type at least {minLength} characters to search
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;

