/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app.
 * 
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */

import { Component } from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (in production, this could be sent to an error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error info in state for display
    this.setState({
      error,
      errorInfo,
    });

    // In production, you could log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    // Reset error state and reload the page
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page or return to the home page.
            </p>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left bg-gray-50 p-4 rounded border border-gray-200">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 text-xs text-gray-600">
                  <p className="font-semibold mb-1">Error:</p>
                  <pre className="whitespace-pre-wrap break-words mb-3">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <>
                      <p className="font-semibold mb-1">Component Stack:</p>
                      <pre className="whitespace-pre-wrap break-words text-xs">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Go to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Reload Page
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                to="/"
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Return to home page
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Render children normally if no error
    return this.props.children;
  }
}

export default ErrorBoundary;




