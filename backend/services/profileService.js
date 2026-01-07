/**
 * Profile Service
 * 
 * Handles user profile operations:
 * - Password updates
 * - Profile information retrieval
 */

const supabase = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { validatePassword } = require('../utils/passwordValidator');

/**
 * Update user password
 * @param {string} userId - User ID (UUID)
 * @param {string} currentPassword - Current password (plain text)
 * @param {string} newPassword - New password (plain text)
 * @returns {Promise<void>}
 * @throws {Error} If password update fails
 */
const updatePassword = async (userId, currentPassword, newPassword) => {
  // Validate inputs
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }

  if (!currentPassword || typeof currentPassword !== 'string') {
    throw new Error('Current password is required');
  }

  if (!newPassword || typeof newPassword !== 'string') {
    throw new Error('New password is required');
  }

  // Validate new password strength
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    const errorMessage = passwordValidation.errors.join(', ');
    const error = new Error(errorMessage);
    error.code = 'VAL_WEAK_PASSWORD';
    error.statusCode = 400;
    throw error;
  }

  // Check if new password is different from current password
  if (currentPassword === newPassword) {
    const error = new Error('New password must be different from current password');
    error.code = 'VAL_SAME_PASSWORD';
    error.statusCode = 400;
    throw error;
  }

  // Get user's current password hash
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single();

  if (fetchError) {
    throw new Error('User not found');
  }

  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
  if (!isCurrentPasswordValid) {
    const error = new Error('Current password is incorrect');
    error.code = 'AUTH_INVALID_PASSWORD';
    error.statusCode = 401;
    throw error;
  }

  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);

  // Update password in database
  const { error: updateError } = await supabase
    .from('users')
    .update({ password_hash: newPasswordHash })
    .eq('id', userId);

  if (updateError) {
    throw new Error(`Failed to update password: ${updateError.message}`);
  }
};

/**
 * Get user profile information
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<Object>} User profile data (without password_hash)
 * @throws {Error} If profile retrieval fails
 */
const getProfile = async (userId) => {
  // Validate inputs
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }

  // Get user profile
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      const err = new Error('User not found');
      err.code = 'USER_NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }
    throw new Error(`Failed to retrieve profile: ${error.message}`);
  }

  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};

module.exports = {
  updatePassword,
  getProfile,
};



