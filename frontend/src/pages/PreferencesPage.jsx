/**
 * Preferences Page
 * 
 * Protected route - allows users to manage their news preferences
 * - Load user preferences
 * - Update categories
 * - Save preferences
 */

import { useState, useEffect } from 'react';
import { getPreferences, updatePreferences } from '../services/preferencesService';
import { extractErrorMessage } from '../utils/errorHandler';
import CategorySelector from '../components/preferences/CategorySelector';
import toast from 'react-hot-toast';

const PreferencesPage = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [originalCategories, setOriginalCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPreferences();

        if (response.success && response.data) {
          const categories = response.data.categories || [];
          setSelectedCategories(categories);
          setOriginalCategories(categories);
        } else {
          throw new Error(response.error?.message || 'Failed to load preferences');
        }
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Handle category selection change
  const handleCategoryChange = (newCategories) => {
    setSelectedCategories(newCategories);
  };

  // Handle save preferences
  const handleSave = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await updatePreferences({
        categories: selectedCategories,
      });

      if (response.success && response.data) {
        setOriginalCategories(selectedCategories);
        toast.success('Preferences saved successfully!');
      } else {
        throw new Error(response.error?.message || 'Failed to save preferences');
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Check if preferences have changed
  const hasChanges =
    JSON.stringify([...selectedCategories].sort()) !==
    JSON.stringify([...originalCategories].sort());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Preferences</h1>
        <p className="text-gray-600">
          Select your preferred news categories to personalize your news feed.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your preferences...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
            >
              Reload page
            </button>
          </div>
        )}

        {/* Preferences Form */}
        {!loading && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select News Categories
              </h2>
              <CategorySelector
                selectedCategories={selectedCategories}
                onChange={handleCategoryChange}
                disabled={saving}
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {hasChanges && (
                  <span className="text-orange-600 font-medium">You have unsaved changes</span>
                )}
                {!hasChanges && selectedCategories.length > 0 && (
                  <span className="text-green-600">All changes saved</span>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges || selectedCategories.length === 0}
                className={`
                  px-6 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    saving || !hasChanges || selectedCategories.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Preferences'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PreferencesPage;
