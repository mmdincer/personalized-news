/**
 * SortDropdown Component
 * 
 * Dropdown component for sorting news articles
 * - newest: Sort by newest first (default)
 * - oldest: Sort by oldest first
 * - relevance: Sort by relevance (for search results)
 */

import { useState, useRef, useEffect } from 'react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'relevance', label: 'Relevance' },
];

const SortDropdown = ({
  value = 'newest',
  onChange,
  className = '',
  disabled = false,
  showRelevance = true, // Show relevance option (useful for search)
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Filter options based on showRelevance
  const availableOptions = showRelevance
    ? SORT_OPTIONS
    : SORT_OPTIONS.filter((option) => option.value !== 'relevance');

  // Get current option label
  const currentOption = availableOptions.find((option) => option.value === value) || availableOptions[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle option selection
  const handleSelect = (optionValue) => {
    if (optionValue !== value && onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
  };

  // Handle toggle
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full px-3 py-2 h-[38px] whitespace-nowrap
          bg-white border border-gray-300 rounded-lg
          flex items-center justify-between gap-2
          text-sm font-medium text-gray-700
          hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
          transition-all duration-200
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          ${value !== 'newest' ? 'bg-blue-50 border-blue-200' : ''}
        `}
        aria-label="Sort options"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2">
          {/* Sort Icon */}
          <svg
            className="w-4 h-4 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M7 12h10" />
            <path d="M11 18h2" />
          </svg>
          <span>{currentOption.label}</span>
        </div>
        {/* Chevron Icon */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-[100] mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          role="listbox"
        >
          {availableOptions.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-3 py-2.5 text-left text-sm
                  flex items-center gap-2
                  transition-colors duration-150
                  ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                  focus:outline-none focus:bg-gray-50
                  first:rounded-t-lg last:rounded-b-lg
                `}
                role="option"
                aria-selected={isSelected}
              >
                {/* Check Icon (for selected option) */}
                {isSelected ? (
                  <svg
                    className="w-4 h-4 text-blue-600 flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <div className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="flex-1">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;

