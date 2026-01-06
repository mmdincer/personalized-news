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
      <div className={`${className.includes('border-0') ? '' : 'bg-white rounded-lg border border-gray-300'} ${className.includes('p-0') ? '' : 'p-4'}`}>
        {/* Header */}
        {!className.includes('border-0') && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <svg
              className="w-3.5 h-3.5 text-gray-500"
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
            <label className="text-xs font-semibold text-gray-700">Date Range</label>
            {hasFilters && (
              <button
                type="button"
                onClick={handleClear}
                className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                disabled={disabled}
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Date Inputs */}
        {className.includes('compact') ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
            {/* From Date */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <label
                htmlFor="from-date"
                className="text-xs font-medium text-gray-600 whitespace-nowrap flex-shrink-0"
              >
                From:
              </label>
              <div className="relative flex-1 min-w-0 w-full">
                <input
                  id="from-date"
                  type="date"
                  value={localFromDate}
                  onChange={handleFromDateChange}
                  max={localToDate || getTodayDate()}
                  disabled={disabled}
                  className={`
                    w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm h-[38px]
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    text-gray-900 placeholder-gray-400
                    transition-all duration-200
                    ${error && error.includes('from') ? 'border-red-300 focus:ring-red-500' : ''}
                    ${localFromDate ? 'bg-blue-50 border-blue-200' : ''}
                  `}
                  style={{ minWidth: '100%', width: '100%' }}
                  aria-label="From date"
                  aria-describedby={error && error.includes('from') ? 'date-error' : undefined}
                />
              </div>
            </div>

            {/* To Date */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <label
                htmlFor="to-date"
                className="text-xs font-medium text-gray-600 whitespace-nowrap flex-shrink-0"
              >
                To:
              </label>
              <div className="relative flex-1 min-w-0 w-full">
                <input
                  id="to-date"
                  type="date"
                  value={localToDate}
                  onChange={handleToDateChange}
                  min={localFromDate || undefined}
                  max={getTodayDate()}
                  disabled={disabled}
                  className={`
                    w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm h-[38px]
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    text-gray-900 placeholder-gray-400
                    transition-all duration-200
                    ${error && error.includes('to') ? 'border-red-300 focus:ring-red-500' : ''}
                    ${localToDate ? 'bg-blue-50 border-blue-200' : ''}
                  `}
                  style={{ minWidth: '100%', width: '100%' }}
                  aria-label="To date"
                  aria-describedby={error && error.includes('to') ? 'date-error' : undefined}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* From Date */}
            <div>
              <label
                htmlFor="from-date"
                className="block text-xs font-medium text-gray-600 mb-1.5"
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
                    w-full px-3 py-2 border rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    text-gray-900 placeholder-gray-400
                    transition-all duration-200
                    ${error && error.includes('from') ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
                    ${localFromDate ? 'bg-blue-50 border-blue-200' : ''}
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
                className="block text-xs font-medium text-gray-600 mb-1.5"
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
                    w-full px-3 py-2 border rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    text-gray-900 placeholder-gray-400
                    transition-all duration-200
                    ${error && error.includes('to') ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
                    ${localToDate ? 'bg-blue-50 border-blue-200' : ''}
                  `}
                  aria-label="To date"
                  aria-describedby={error && error.includes('to') ? 'date-error' : undefined}
                />
              </div>
            </div>
          </div>
        )}

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

        {/* Helper Text - Only show if not in compact mode */}
        {!className.includes('border-0') && !error && hasFilters && (
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {localFromDate && localToDate
              ? `${localFromDate} to ${localToDate}`
              : localFromDate
              ? `From ${localFromDate}`
              : `Up to ${localToDate}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default DateFilter;

