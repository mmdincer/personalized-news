/**
 * CategorySelector Component
 * 
 * Allows users to select news categories for their preferences
 * - Checkbox/button UI with visual feedback
 * - Shows selected categories
 * - Responsive design
 */

import { getAllCategoriesWithNames, getCategoryDisplayName } from '../../constants/categories';

const CategorySelector = ({ selectedCategories = [], onChange, disabled = false }) => {
  const categories = getAllCategoriesWithNames();

  const handleCategoryToggle = (categoryCode) => {
    if (disabled) return;

    const isSelected = selectedCategories.includes(categoryCode);
    let newSelection;

    if (isSelected) {
      // Remove category
      newSelection = selectedCategories.filter((cat) => cat !== categoryCode);
    } else {
      // Add category
      newSelection = [...selectedCategories, categoryCode];
    }

    onChange(newSelection);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.code);
          return (
            <button
              key={category.code}
              type="button"
              onClick={() => handleCategoryToggle(category.code)}
              disabled={disabled}
              className={`
                px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200
                min-h-[44px] sm:min-h-0
                ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 active:bg-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer touch-manipulation'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
            >
              <div className="flex items-center gap-2">
                {/* Checkbox Icon */}
                <div
                  className={`
                    w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                    ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300'
                    }
                  `}
                >
                  {isSelected && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span>{category.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection Count */}
      {selectedCategories.length > 0 && (
        <div className="text-sm text-gray-400 text-center">
          {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} selected
        </div>
      )}
    </div>
  );
};

export default CategorySelector;

