/**
 * App Component
 * 
 * Main application component with React Router configuration
 * - Sets up all routes (public and protected)
 * - Wraps app with AuthProvider for global auth state
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import PreferencesPage from './pages/PreferencesPage';
import SavedArticlesPage from './pages/SavedArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <HomePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/news"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/preferences"
            element={
              <ProtectedRoute>
                <Layout>
                  <PreferencesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <Layout>
                  <SavedArticlesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/article/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <ArticleDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* 404 Page - Show navbar (Layout handles auth check) */}
          <Route
            path="*"
            element={
              <Layout>
                <NotFoundPage />
              </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
