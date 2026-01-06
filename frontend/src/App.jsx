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
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import NewsPage from './pages/NewsPage';
import PreferencesPage from './pages/PreferencesPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
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

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
