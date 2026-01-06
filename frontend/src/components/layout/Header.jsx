/**
 * Header/Navbar Component
 * 
 * Navigation bar with logo, menu items, user info, and logout button
 * - Responsive design with mobile menu
 * - Sticky header
 * - Rounded navbar design
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/news', label: 'News' },
    { path: '/saved', label: 'Saved' },
  ];

  return (
    <header className="sticky top-0 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full text-sm">
      <nav className="mt-4 relative max-w-6xl w-full bg-white border border-gray-200 rounded-lg mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap md:flex-nowrap items-center justify-between py-2">
        <div className="flex items-center md:flex-none">
          {/* App Name */}
          <Link
            to="/"
            className="flex-none rounded-md text-lg font-semibold text-gray-800 focus:outline-none focus:opacity-80"
            aria-label="Personalized News"
          >
            Personalized News
          </Link>
        </div>

        <div className="flex items-center gap-2 md:order-4 md:flex-none">
          {/* Desktop Profile Dropdown */}
          <div className="hidden md:block relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className={`
                flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                ${
                  isProfileDropdownOpen || isActive('/profile') || isActive('/preferences')
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
              aria-expanded={isProfileDropdownOpen}
              aria-haspopup="true"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{user?.name || 'Profile'}</span>
              <svg
                className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'transform rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                <Link
                  to="/profile"
                  onClick={() => setIsProfileDropdownOpen(false)}
                  className={`
                    block px-4 py-2 text-sm transition-colors
                    ${
                      isActive('/profile')
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  Profile
                </Link>
                <Link
                  to="/profile"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    // Scroll to preferences section
                    setTimeout(() => {
                      const preferencesSection = document.getElementById('preferences-section');
                      if (preferencesSection) {
                        preferencesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 100);
                  }}
                  className={`
                    block px-4 py-2 text-sm transition-colors
                    ${
                      isActive('/preferences')
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  Preferences
                </Link>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Profile Button */}
          <Link
            to="/profile"
            className="md:hidden flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="hidden sm:inline">Profile</span>
          </Link>

          {/* Mobile Toggle Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex justify-center items-center w-11 h-11 min-w-[44px] min-h-[44px] border border-gray-200 text-gray-500 rounded-full hover:bg-gray-200 active:bg-gray-300 focus:outline-none focus:bg-gray-200 touch-manipulation"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="shrink-0 w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              ) : (
                <svg
                  className="shrink-0 w-3.5 h-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <line x1="3" x2="21" y1="12" y2="12" />
                  <line x1="3" x2="21" y1="18" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`${
            isMobileMenuOpen ? 'block' : 'hidden'
          } md:block overflow-hidden transition-all duration-300 basis-full grow md:block`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-3 mt-3 md:mt-0 py-2 md:py-0">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-0.5 md:py-3 px-4 md:px-1 border-l-2 md:border-l-0 md:border-b-2 ${
                  isActive(link.path)
                    ? 'border-gray-800 font-medium text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                } focus:outline-none`}
                aria-current={isActive(link.path) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Profile Link */}
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`
                md:hidden py-0.5 px-4 border-l-2 ${
                  isActive('/profile') || isActive('/preferences')
                    ? 'border-gray-800 font-medium text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                } focus:outline-none
              `}
            >
              Profile
            </Link>
            
            {/* Mobile Logout Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="md:hidden w-full text-center py-2 px-4 border-l-2 border-transparent text-red-600 hover:text-red-700 hover:border-red-600 font-medium focus:outline-none touch-manipulation"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
