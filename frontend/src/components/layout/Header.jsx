/**
 * Header/Navbar Component
 * 
 * Navigation bar with logo, menu items, user info, and logout button
 * - Responsive design with mobile menu
 * - Sticky header
 * - Rounded navbar design
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { path: '/preferences', label: 'Preferences' },
  ];

  return (
    <header className="sticky top-0 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full text-sm">
      <nav className="mt-4 relative max-w-6xl w-full bg-white border border-gray-200 rounded-lg mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap md:flex-nowrap items-center justify-between py-2">
        <div className="flex items-center">
          {/* App Name */}
          <Link
            to="/"
            className="flex-none rounded-md text-lg font-semibold text-gray-800 focus:outline-none focus:opacity-80"
            aria-label="Personalized News"
          >
            Personalized News
          </Link>
        </div>

        <div className="flex items-center gap-1 md:order-4 md:ml-4">
          {/* Desktop Logout Button */}
          <button
            onClick={handleLogout}
            className="hidden md:inline-flex whitespace-nowrap py-2 px-3 justify-center items-center gap-x-2 text-sm font-medium rounded-full border border-transparent bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:outline-none focus:bg-red-700 disabled:opacity-50 disabled:pointer-events-none touch-manipulation"
          >
            Logout
          </button>

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-2 md:gap-3 mt-3 md:mt-0 py-2 md:py-0 md:pl-7">
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
