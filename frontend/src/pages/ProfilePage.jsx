/**
 * Profile Page
 * 
 * Protected route - allows users to manage their profile:
 * - View profile information (name, email, created_at)
 * - Update password
 * - Manage preferences (categories)
 */

import { useState, useEffect } from 'react';
import { getProfile } from '../services/profileService';
import { getPreferences, updatePreferences } from '../services/preferencesService';
import { extractErrorMessage } from '../utils/errorHandler';
import PasswordUpdateForm from '../components/profile/PasswordUpdateForm';
import CategorySelector from '../components/preferences/CategorySelector';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [originalCategories, setOriginalCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Load profile and preferences on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load profile and preferences in parallel
        const [profileResponse, preferencesResponse] = await Promise.all([
          getProfile(),
          getPreferences(),
        ]);

        if (profileResponse.success && profileResponse.data) {
          setProfile(profileResponse.data);
        } else {
          throw new Error(profileResponse.error?.message || 'Failed to load profile');
        }

        if (preferencesResponse.success && preferencesResponse.data) {
          const categories = preferencesResponse.data.categories || [];
          setSelectedCategories(categories);
          setOriginalCategories(categories);
        } else {
          throw new Error(preferencesResponse.error?.message || 'Failed to load preferences');
        }
      } catch (err) {
        const errorMessage = extractErrorMessage(err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle category selection change
  const handleCategoryChange = (newCategories) => {
    setSelectedCategories(newCategories);
  };

  // Handle save preferences
  const handleSavePreferences = async () => {
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // Check if preferences have changed
  const hasChanges =
    JSON.stringify([...selectedCategories].sort()) !==
    JSON.stringify([...originalCategories].sort());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
          >
            Reload page
          </button>
        </div>
      )}

      {/* Profile Content */}
      {!loading && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Profile Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Name
                </label>
                <p className="text-gray-900">{profile.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{profile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Member Since
                </label>
                <p className="text-gray-900">{formatDate(profile.createdAt)}</p>
              </div>
            </div>

            {/* Change Password Button */}
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Change Password
            </button>
          </div>

          {/* Right Side - Preferences */}
          <div className="lg:col-span-2">

            {/* Preferences Section */}
            <div id="preferences-section" className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">News Preferences</h2>

              <div className="mb-6">
                <CategorySelector
                  selectedCategories={selectedCategories}
                  onChange={handleCategoryChange}
                  disabled={saving}
                />
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm">
                  {hasChanges && (
                    <span className="text-orange-600 font-medium">
                      You have unsaved changes
                    </span>
                  )}
                  {!hasChanges && selectedCategories.length > 0 && (
                    <span className="text-green-600">
                      All changes saved
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSavePreferences}
                  disabled={saving || !hasChanges || selectedCategories.length === 0}
                  className={`
                    px-6 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      saving || !hasChanges || selectedCategories.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }
                  `}
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
      >
        <PasswordUpdateForm
          onSuccess={() => setIsPasswordModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ProfilePage;

