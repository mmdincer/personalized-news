/**
 * Password Update Form Component
 * 
 * Form for updating user password:
 * - Current password input
 * - New password input
 * - Confirm password input
 * - Validation
 * - Error handling
 */

import { useState } from 'react';
import { updatePassword } from '../../services/profileService';
import { extractErrorMessage } from '../../utils/errorHandler';
import toast from 'react-hot-toast';

const PasswordUpdateForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (formData.newPassword.length > 100) {
      newErrors.newPassword = 'Password must be at most 100 characters';
    } else if (!/(?=.*[a-z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter';
    } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[0-9])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    } else if (!/(?=.*[!@#$%^&*])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one special character (!@#$%^&*)';
    } else if (/\s/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must not contain spaces';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      const response = await updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.success) {
        toast.success('Password updated successfully!');
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setErrors({});
      } else {
        throw new Error(response.error?.message || 'Failed to update password');
      }
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      toast.error(errorMessage);
      
      // Set specific error based on error code
      if (errorMessage.includes('Current password') || errorMessage.includes('incorrect')) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else if (errorMessage.includes('weak') || errorMessage.includes('Password must')) {
        setErrors({ newPassword: errorMessage });
      } else {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        
        {/* Current Password */}
        <div className="mb-4">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            disabled={saving}
            className={`
              w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.currentPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
              disabled:bg-gray-100 disabled:cursor-not-allowed
            `}
            aria-invalid={errors.currentPassword ? 'true' : 'false'}
            aria-describedby={errors.currentPassword ? 'currentPassword-error' : undefined}
          />
          {errors.currentPassword && (
            <p id="currentPassword-error" className="mt-1 text-sm text-red-600">
              {errors.currentPassword}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            disabled={saving}
            className={`
              w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.newPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
              disabled:bg-gray-100 disabled:cursor-not-allowed
            `}
            aria-invalid={errors.newPassword ? 'true' : 'false'}
            aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
          />
          {errors.newPassword && (
            <p id="newPassword-error" className="mt-1 text-sm text-red-600">
              {errors.newPassword}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Password must be 8-100 characters, contain uppercase, lowercase, number, and special character (!@#$%^&*)
          </p>
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={saving}
            className={`
              w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
              ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
              disabled:bg-gray-100 disabled:cursor-not-allowed
            `}
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className={`
            w-full px-6 py-2 rounded-lg text-sm font-medium transition-colors
            ${
              saving
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
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
              Updating...
            </span>
          ) : (
            'Update Password'
          )}
        </button>
      </div>
    </form>
  );
};

export default PasswordUpdateForm;

