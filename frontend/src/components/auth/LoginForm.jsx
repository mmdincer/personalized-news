/**
 * LoginForm Component
 * 
 * Handles user login with email and password
 * - Form validation using react-hook-form
 * - Error display from backend
 * - Loading states
 * - Success redirect
 */

import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { extractErrorMessage } from '../../utils/errorHandler';
import toast from 'react-hot-toast';
import { useState } from 'react';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await login({ email: data.email, password: data.password });
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = authLoading || isSubmitting;
  const hasEmailError = errors.email;
  const hasPasswordError = errors.password;

  return (
    <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="p-4 sm:p-7">
        <div className="text-center">
          <h1 className="block text-2xl font-bold text-gray-800">Sign in</h1>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account yet?
            <Link
              to="/register"
              className="text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium ml-1"
            >
              Sign up here
            </Link>
          </p>
        </div>

        <div className="mt-5">
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm mb-2">
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email format',
                      },
                    })}
                    className={`py-2.5 sm:py-3 px-4 block w-full border rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none ${
                      hasEmailError
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200'
                    }`}
                    required
                    aria-describedby="email-error"
                    disabled={isLoading}
                    placeholder="Enter your email"
                  />
                  {hasEmailError && (
                    <div className="absolute inset-y-0 right-0 pointer-events-none pr-3 flex items-center">
                      <svg
                        className="h-5 w-5 text-red-500"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                      >
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                      </svg>
                    </div>
                  )}
                </div>
                {hasEmailError && (
                  <p className="text-xs text-red-600 mt-2" id="email-error">
                    {errors.email.message || 'Please include a valid email address'}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <label htmlFor="password" className="block text-sm mb-2">
                    Password
                  </label>
                  <button
                    type="button"
                    className="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium"
                    onClick={() => toast.error('Forgot password feature coming soon')}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    className={`py-2.5 sm:py-3 px-4 block w-full border rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none ${
                      hasPasswordError
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200'
                    }`}
                    required
                    aria-describedby="password-error"
                    disabled={isLoading}
                    placeholder="Enter your password"
                  />
                  {hasPasswordError && (
                    <div className="absolute inset-y-0 right-0 pointer-events-none pr-3 flex items-center">
                      <svg
                        className="h-5 w-5 text-red-500"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                      >
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                      </svg>
                    </div>
                  )}
                </div>
                {hasPasswordError && (
                  <p className="text-xs text-red-600 mt-2" id="password-error">
                    {errors.password.message || 'Password is required'}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <div className="flex">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="shrink-0 mt-0.5 border-gray-200 rounded-sm text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="remember-me" className="text-sm">
                    Remember me
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
