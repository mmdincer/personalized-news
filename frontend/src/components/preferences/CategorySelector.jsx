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
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
            >
              <div className="flex items-center gap-2">
                {/* Checkbox Icon */}
                <div
                  className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                    ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300'
                    }
                  `}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
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

      {/* Selection Info */}
      {selectedCategories.length > 0 && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">{selectedCategories.length}</span> categor
          {selectedCategories.length === 1 ? 'y' : 'ies'} selected
        </div>
      )}
      {selectedCategories.length === 0 && (
        <div className="text-sm text-gray-500 italic">
          No categories selected. Select at least one category to personalize your news feed.
        </div>
      )}
    </div>
  );
};

export default CategorySelector;

