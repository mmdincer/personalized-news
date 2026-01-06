/**
 * Layout Component
 * 
 * Wrapper component that includes Header for protected routes
 * - Shows Header on all protected pages
 * - Provides consistent layout structure
 */

import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
    </div>
  );
};

export default Layout;

