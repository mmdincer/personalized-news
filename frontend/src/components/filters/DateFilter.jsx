/**
 * DateFilter Component
 * 
 * Date range picker component for filtering news by date
 * - From date selection
 * - To date selection
 * - Date validation
 * - Clear button
 * - Error handling
 */

import { useState, useEffect } from 'react';

const DateFilter = ({
  fromDate = null,
  toDate = null,
  onChange,
  className = '',
  disabled = false,
}) => {
  const [localFromDate, setLocalFromDate] = useState(fromDate || '');
  const [localToDate, setLocalToDate] = useState(toDate || '');
  const [error, setError] = useState(null);

  // Update local state when props change
  useEffect(() => {
    setLocalFromDate(fromDate || '');
  }, [fromDate]);

  useEffect(() => {
    setLocalToDate(toDate || '');
  }, [toDate]);

  // Validate date format (YYYY-MM-DD)
  const validateDate = (dateString) => {
    if (!dateString) return true; // Empty is valid (optional field)

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // Validate date range
  const validateDateRange = (from, to) => {
    if (!from && !to) {
      return true; // Both empty is valid
    }

    if (!from || !to) {
      return true; // One empty is valid (optional)
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    return fromDate <= toDate;
  };

  // Handle from date change
  const handleFromDateChange = (e) => {
    const value = e.target.value;
    setLocalFromDate(value);

    if (value && !validateDate(value)) {
      setError('Invalid from date format. Use YYYY-MM-DD');
      return;
    }

    if (value && localToDate && !validateDateRange(value, localToDate)) {
      setError('From date must be before or equal to to date');
      return;
    }

    setError(null);
    if (onChange) {
      onChange({
        fromDate: value || null,
        toDate: localToDate || null,
      });
    }
  };

  // Handle to date change
  const handleToDateChange = (e) => {
    const value = e.target.value;
    setLocalToDate(value);

    if (value && !validateDate(value)) {
      setError('Invalid to date format. Use YYYY-MM-DD');
      return;
    }

    if (value && localFromDate && !validateDateRange(localFromDate, value)) {
      setError('To date must be after or equal to from date');
      return;
    }

    setError(null);
    if (onChange) {
      onChange({
        fromDate: localFromDate || null,
        toDate: value || null,
      });
    }
  };

  // Handle clear button
  const handleClear = () => {
    setLocalFromDate('');
    setLocalToDate('');
    setError(null);
    if (onChange) {
      onChange({
        fromDate: null,
        toDate: null,
      });
    }
  };

  // Get today's date in YYYY-MM-DD format (max date for date picker)
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const hasFilters = localFromDate || localToDate;

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white rounded-lg border border-gray-300 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900">Filter by Date</h3>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              disabled={disabled}
            >
              Clear
            </button>
          )}
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* From Date */}
          <div>
            <label
              htmlFor="from-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              From Date
            </label>
            <div className="relative">
              <input
                id="from-date"
                type="date"
                value={localFromDate}
                onChange={handleFromDateChange}
                max={localToDate || getTodayDate()}
                disabled={disabled}
                className={`
                  w-full px-4 py-2 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                  text-gray-900
                  transition-all duration-200
                  ${error && error.includes('from') ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
                `}
                aria-label="From date"
                aria-describedby={error && error.includes('from') ? 'date-error' : undefined}
              />
            </div>
          </div>

          {/* To Date */}
          <div>
            <label
              htmlFor="to-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              To Date
            </label>
            <div className="relative">
              <input
                id="to-date"
                type="date"
                value={localToDate}
                onChange={handleToDateChange}
                min={localFromDate || undefined}
                max={getTodayDate()}
                disabled={disabled}
                className={`
                  w-full px-4 py-2 border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                  text-gray-900
                  transition-all duration-200
                  ${error && error.includes('to') ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
                `}
                aria-label="To date"
                aria-describedby={error && error.includes('to') ? 'date-error' : undefined}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            id="date-error"
            className="mt-3 text-sm text-red-600 flex items-center gap-2"
            role="alert"
          >
            <svg
              className="h-4 w-4 flex-shrink-0"
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
        {!error && hasFilters && (
          <div className="mt-3 text-xs text-gray-500">
            {localFromDate && localToDate
              ? `Showing articles from ${localFromDate} to ${localToDate}`
              : localFromDate
              ? `Showing articles from ${localFromDate} onwards`
              : `Showing articles up to ${localToDate}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateFilter;

