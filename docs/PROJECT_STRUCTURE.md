# Project Structure Guide

Bu dosya projenin klasör yapısı, architectural pattern'leri ve naming convention'larını içerir.

---

## 📁 Complete Project Structure

```
personalized-news/
├── backend/
│   ├── config/
│   │   ├── database.js          # Supabase client singleton
│   │   └── logger.js            # Winston logger configuration
│   ├── constants/               # Constants and enums (SOLID: Single Responsibility)
│   │   ├── categories.js        # ALLOWED_CATEGORIES array and validation
│   │   └── countries.js         # SUPPORTED_COUNTRIES array, country/language mapping
│   ├── locales/                 # i18n configuration for backend (optional)
│   │   └── i18n.config.js       # i18n setup (if needed for error messages)
│   ├── controllers/
│   │   ├── authController.js    # POST /auth/register, /auth/login
│   │   ├── newsController.js    # GET /news, /news/:category
│   │   └── preferencesController.js  # GET/PUT /user/preferences
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   ├── errorHandler.js      # Global error handling middleware
│   │   ├── validation.js        # express-validator middleware
│   │   └── rateLimiter.js       # express-rate-limit configuration
│   ├── services/
│   │   ├── authService.js       # JWT token generation, password hashing
│   │   ├── newsService.js       # NewsAPI.org integration, caching
│   │   ├── userService.js       # User CRUD operations (Supabase)
│   │   └── preferencesService.js # User preferences CRUD (Supabase)
│   ├── utils/
│   │   ├── errors.js            # Custom error classes (AppError, AuthError, etc.)
│   │   └── validators.js        # Custom validation functions
│   ├── routes/
│   │   ├── index.js             # Route aggregator (mounts all routes)
│   │   ├── auth.js              # Auth routes
│   │   ├── news.js              # News routes
│   │   └── preferences.js       # Preferences routes
│   ├── database/
│   │   └── migrations/          # SQL migration files
│   │       ├── 001_create_users_table.sql
│   │       └── 002_create_user_preferences_table.sql
│   ├── tests/                   # Test files (optional - Branch 12)
│   │   ├── unit/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── integration/
│   │   │   └── api/
│   │   └── setup.js
│   ├── logs/                    # Winston log files (gitignored)
│   │   ├── error.log
│   │   └── combined.log
│   ├── .env                     # Environment variables (gitignored)
│   ├── .env.example             # Environment variables template
│   ├── .gitignore               # Git ignore rules
│   ├── .eslintrc.json           # ESLint configuration
│   ├── .prettierrc              # Prettier configuration
│   ├── package.json             # Dependencies and scripts
│   ├── package-lock.json
│   └── server.js                # Entry point (Express server)
│
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # Authentication components
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   ├── news/            # News-related components
│   │   │   │   ├── NewsCard.jsx
│   │   │   │   ├── NewsFeed.jsx
│   │   │   │   └── CategorySelector.jsx
│   │   │   ├── preferences/     # User preferences components
│   │   │   │   └── CountrySelector.jsx  # Country/Language selector (5 countries)
│   │   │   ├── common/          # Reusable UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── ErrorBoundary.jsx
│   │   │   │   └── Loading.jsx
│   │   │   └── layout/          # Layout components
│   │   │       ├── Header.jsx
│   │   │       ├── Navigation.jsx
│   │   │       └── Footer.jsx
│   │   ├── i18n/                # Internationalization configuration
│   │   │   ├── config.js        # i18next configuration (5 languages)
│   │   │   └── index.js         # i18n initialization
│   │   ├── locales/             # Translation files
│   │   │   ├── tr/              # Turkish translations
│   │   │   │   └── translation.json
│   │   │   ├── en/              # English translations
│   │   │   │   └── translation.json
│   │   │   ├── de/              # German translations
│   │   │   │   └── translation.json
│   │   │   ├── fr/              # French translations
│   │   │   │   └── translation.json
│   │   │   └── es/              # Spanish translations
│   │   │       └── translation.json
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx  # Authentication state management (user, token, login, logout)
│   │   │   └── PreferencesContext.jsx  # User preferences state (categories, country, updatePreferences)
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAuth.js       # Authentication hook
│   │   │   ├── useNews.js       # News fetching hook
│   │   │   └── usePreferences.js # Preferences management hook
│   │   ├── config/              # Frontend configuration
│   │   │   └── api.js           # Axios instance with interceptors
│   │   ├── services/
│   │   │   ├── authService.js   # Auth API calls
│   │   │   ├── newsService.js   # News API calls
│   │   │   └── preferencesService.js  # Preferences API calls
│   │   ├── utils/
│   │   │   ├── errorHandler.js  # Error parsing and display
│   │   │   └── constants.js     # Frontend constants (categories, countries)
│   │   ├── pages/               # Page components (route-level)
│   │   │   ├── Home.jsx         # News feed page
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Register.jsx     # Registration page
│   │   │   └── Preferences.jsx  # User preferences page
│   │   ├── App.jsx              # Root component with routes
│   │   ├── main.jsx             # Entry point (ReactDOM.render)
│   │   └── index.css            # Global styles and Tailwind imports
│   ├── .env                     # Environment variables (gitignored)
│   ├── .env.example             # Environment variables template
│   ├── .gitignore               # Git ignore rules
│   ├── .eslintrc.json           # ESLint configuration
│   ├── .prettierrc              # Prettier configuration
│   ├── package.json             # Dependencies and scripts
│   ├── package-lock.json
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── postcss.config.js        # PostCSS configuration
│   └── index.html               # HTML entry point
│
├── docs/                        # Project documentation
│   ├── API_SPECIFICATIONS.md
│   ├── CLAUDE.md
│   ├── DEVELOPMENT_PLAN.md
│   ├── ERROR_CODES.md
│   ├── MIGRATION_GUIDE.md
│   ├── PROJECT_STRUCTURE.md    # This file
│   ├── SECURITY_GUIDELINES.md
│   ├── TASKS.md
│   └── TECHNOLOGY_STACK.md
│
├── .gitignore                   # Root gitignore
└── README.md                    # Project README (Branch 11)
```

---

## 🎯 SOLID Principles Compliance

Bu proje yapısı SOLID prensiplerine uygun olarak tasarlanmıştır:

### Single Responsibility Principle (SRP)

**Backend:**
- ✅ **Controllers**: Sadece HTTP request/response handling
- ✅ **Services**: Sadece business logic
- ✅ **Middleware**: Sadece cross-cutting concerns (auth, validation)
- ✅ **Utils**: Sadece pure helper functions
- ✅ **Config**: Sadece configuration management
- ✅ **Constants**: Sadece constants ve enums (business logic yok)

**Frontend:**
- ✅ **Components**: Sadece UI rendering ve user interaction
- ✅ **Services**: Sadece API calls
- ✅ **Hooks**: Sadece state management logic
- ✅ **Contexts**: Sadece global state management
- ✅ **Utils**: Sadece helper functions

### Open/Closed Principle (OCP)

- ✅ **Services**: Genişlemeye açık (yeni metodlar eklenebilir), değişikliğe kapalı
- ✅ **Components**: Props ile genişletilebilir, base component değiştirilmez
- ✅ **Middleware**: Yeni middleware eklenebilir, mevcutlar değiştirilmez

### Liskov Substitution Principle (LSP)

- ✅ **Error Classes**: AppError base class'ından türeyen error'lar birbirinin yerine kullanılabilir
- ✅ **Service Interfaces**: Aynı interface'i implement eden service'ler birbirinin yerine kullanılabilir

### Interface Segregation Principle (ISP)

- ✅ **Services**: Küçük, odaklı service'ler (authService, newsService, preferencesService)
- ✅ **Hooks**: Spesifik hook'lar (useAuth, useNews, usePreferences)
- ✅ **Components**: Küçük, compose edilebilir component'ler

### Dependency Inversion Principle (DIP)

- ✅ **Controllers**: Service'lere bağımlı (abstraction'a bağımlı)
- ✅ **Services**: Config'den singleton'ları alır (abstraction'a bağımlı)
- ✅ **Components**: Context'ler ve hooks kullanır (abstraction'a bağımlı)
- ✅ **Dependency Injection**: Controllers ve services DI pattern kullanır

---

## 🏗️ Architectural Patterns

### Backend Architecture

#### 1. **Layered Architecture (MVC-like)**

```
Request Flow:
Client → Routes → Middleware → Controllers → Services → Database
                                                      ↓
Response ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

**Layer Responsibilities**:

**Routes** (`routes/`):
- Define HTTP endpoints
- Mount controllers
- Apply route-specific middleware
- No business logic

**Middleware** (`middleware/`):
- Cross-cutting concerns (auth, validation, logging)
- Request preprocessing
- Error handling
- Rate limiting

**Controllers** (`controllers/`):
- Handle HTTP requests/responses
- Call service layer (dependency injection)
- Return appropriate status codes
- NO business logic (SOLID: SRP)
- Thin layer - delegates to services (SOLID: SRP)
- Error handling via next() middleware

**Services** (`services/`):
- Business logic implementation
- Data transformation
- External API calls (NewsAPI.org, Supabase)
- Reusable across controllers
- NO HTTP concerns (SOLID: SRP)
- NO direct database access (use Supabase client from config)
- Dependency injection ready (SOLID: DIP)

**Utils** (`utils/`):
- Pure helper functions
- Reusable utilities
- No side effects
- Custom error classes (AppError, AuthError, etc.)
- Validation utilities
- Stateless functions (SOLID: SRP)

**Config** (`config/`):
- Configuration management
- Singleton instances (database, logger)
- Environment-specific settings
- NO business logic (SOLID: SRP)

**Constants** (`constants/`):
- Application constants and enums
- Category definitions (ALLOWED_CATEGORIES)
- Country/language mappings (SUPPORTED_COUNTRIES)
- Validation helper functions
- NO business logic (SOLID: SRP)
- Separation from config (SOLID: SRP - constants vs configuration)

#### 2. **Dependency Injection Pattern**

```javascript
// ✅ CORRECT: Controllers receive services as dependencies
const createAuthController = (authService, userService) => ({
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
});

// Usage in routes
const authController = createAuthController(authService, userService);
router.post('/register', authController.register);
```

#### 3. **Error Handling Strategy**

```javascript
// Custom Error Classes (utils/errors.js)
class AppError extends Error {
  constructor(code, message, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

class AuthError extends AppError {
  constructor(code, message) {
    super(code, message, 401);
  }
}

// Global Error Handler (middleware/errorHandler.js)
const errorHandler = (err, req, res, next) => {
  logger.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code || 'SYS_INTERNAL_ERROR',
      message: err.message,
      timestamp: err.timestamp || new Date().toISOString()
    }
  });
};
```

#### 4. **Service Layer Pattern**

```javascript
// services/newsService.js
class NewsService {
  constructor(httpClient, cache) {
    this.httpClient = httpClient;
    this.cache = cache;
  }

  async fetchByCategory(category, page = 1, limit = 20) {
    // Business logic here
    const cacheKey = `news:${category}:${page}:${limit}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Fetch from API
    const response = await this.httpClient.get('/top-headlines', {
      params: { category, page, pageSize: limit }
    });

    // Transform and cache
    const normalized = this.normalizeResponse(response.data);
    this.cache.set(cacheKey, normalized, 900); // 15 minutes

    return normalized;
  }

  normalizeResponse(data) {
    // Data transformation logic
  }
}

// Export singleton instance
export const newsService = new NewsService(newsApiClient, cache);
```

---

### Frontend Architecture

#### 1. **Component-Based Architecture**

```
Component Hierarchy:
App (Router)
├── Layout
│   ├── Header
│   ├── Navigation
│   └── Footer
├── Pages (Route Components)
│   ├── Home (NewsFeed)
│   ├── Login (LoginForm)
│   ├── Register (RegisterForm)
│   └── Preferences (CategorySelector)
└── ErrorBoundary
```

**Component Categories**:

**Pages** (`pages/`):
- Route-level components
- Compose smaller components
- Connect to contexts/hooks
- Handle page-level state

**Feature Components** (`components/auth/`, `components/news/`):
- Domain-specific components
- Business logic integration via hooks/services (SOLID: SRP)
- Connect to contexts/services (SOLID: DIP - depend on abstractions)
- Single responsibility per component (SOLID: SRP)

**Common Components** (`components/common/`):
- Reusable UI elements
- No business logic (SOLID: SRP)
- Props-based configuration
- Styled with Tailwind
- Composable and reusable (SOLID: OCP - Open for extension)

**Layout Components** (`components/layout/`):
- App structure components
- Navigation, header, footer
- Consistent across pages

#### 2. **State Management Strategy**

```javascript
// Context API for Global State
// contexts/AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Verify token and load user
      authService.verifyToken(token)
        .then(setUser)
        .catch(() => setToken(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**State Management Rules**:
- **Local State**: Component-specific (useState)
- **Shared State**: Context API (auth, preferences) - SOLID: Single source of truth
- **Server State**: Custom hooks with caching (useNews) - SOLID: Separation of concerns
- **Form State**: react-hook-form - SOLID: SRP (form logic separate from component)
- **No Prop Drilling**: Use Context API for deeply nested state (SOLID: DIP)

#### 3. **Service Layer Pattern**

```javascript
// config/api.js - Axios instance with interceptors
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Request interceptor (add auth token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// services/authService.js - API call wrapper
import api from '../config/api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data.data;
  },

  async register(email, password) {
    const response = await api.post('/auth/register', { email, password });
    return response.data.data;
  },

  async verifyToken(token) {
    const response = await api.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }
};
```

#### 4. **Custom Hooks Pattern**

```javascript
// hooks/useNews.js
import { useState, useEffect } from 'react';
import { newsService } from '../services/newsService';
import { toast } from 'react-hot-toast';

export const useNews = (category, page = 1) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const data = await newsService.getByCategory(category, page);
        setNews(data.articles);
      } catch (err) {
        setError(err);
        toast.error(err.message || 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [category, page]);

  return { news, loading, error };
};
```

---

## 📝 Naming Conventions

### Backend

#### File Names
- **Controllers**: `{entity}Controller.js` (e.g., `authController.js`)
- **Services**: `{entity}Service.js` (e.g., `newsService.js`)
- **Routes**: `{entity}.js` (e.g., `auth.js`, `news.js`)
- **Middleware**: `{purpose}.js` (e.g., `auth.js`, `validation.js`)
- **Utils**: `{purpose}.js` (e.g., `errors.js`, `validators.js`)
- **Config**: `{purpose}.js` (e.g., `database.js`, `logger.js`)
- **Constants**: `{domain}.js` (e.g., `categories.js`, `countries.js`)

#### Function Names
- **Controllers**: HTTP verb + entity (e.g., `getNews`, `createUser`)
- **Services**: Business operation (e.g., `fetchNewsByCategory`, `hashPassword`)
- **Middleware**: descriptive name (e.g., `authenticateToken`, `validateInput`)
- **Utils**: descriptive verb (e.g., `validateEmail`, `formatDate`)

#### Variable Names
- **Constants**: UPPER_SNAKE_CASE (e.g., `ALLOWED_CATEGORIES`, `JWT_SECRET`)
- **Variables**: camelCase (e.g., `newsArticles`, `userPreferences`)
- **Boolean**: is/has/can prefix (e.g., `isAuthenticated`, `hasPermission`)

#### Route Naming
```javascript
// RESTful conventions
GET    /api/news              // Get all news
GET    /api/news/:category    // Get news by category
POST   /api/auth/register     // Register user
POST   /api/auth/login        // Login user
GET    /api/user/preferences  // Get user preferences
PUT    /api/user/preferences  // Update user preferences
```

### Frontend

#### File Names
- **Components**: PascalCase with `.jsx` extension (e.g., `NewsCard.jsx`, `LoginForm.jsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.js`, `useNews.js`)
- **Services**: camelCase with `Service` suffix (e.g., `authService.js`)
- **Config**: camelCase (e.g., `api.js`)
- **Utils**: camelCase (e.g., `errorHandler.js`, `constants.js`)
- **Pages**: PascalCase (e.g., `Home.jsx`, `Login.jsx`)

#### Component Names
- **Functional Components**: PascalCase (e.g., `NewsCard`, `CategorySelector`)
- **Custom Hooks**: camelCase with `use` prefix (e.g., `useAuth`, `usePreferences`)

#### Props Naming
- **Event Handlers**: `on` prefix (e.g., `onClick`, `onSubmit`, `onCategoryChange`)
- **Boolean Props**: `is/has/can` prefix (e.g., `isLoading`, `hasError`, `canEdit`)
- **Data Props**: descriptive noun (e.g., `article`, `categories`, `user`)

---

## 🎯 Code Organization Principles

### 1. **Feature-Based Organization (Frontend)**

Group related files by feature/domain:

```
components/
├── auth/           # All auth-related components
│   ├── LoginForm.jsx
│   └── RegisterForm.jsx
├── news/           # All news-related components
│   ├── NewsCard.jsx
│   ├── NewsFeed.jsx
│   └── CategorySelector.jsx
└── common/         # Shared components
    ├── Button.jsx
    └── Input.jsx
```

**Rationale**: Easy to find related files, better for scaling

### 2. **Layer-Based Organization (Backend)**

Group files by architectural layer:

```
backend/
├── routes/         # All route definitions
├── controllers/    # All controllers
├── services/       # All services
└── middleware/     # All middleware
```

**Rationale**: Clear separation of concerns, follows MVC pattern

### 3. **Single Responsibility Principle**

Each file should have ONE clear purpose:

```javascript
// ✅ GOOD: One responsibility per file
// services/authService.js - Only authentication logic
export const generateToken = (user) => { /* ... */ };
export const verifyToken = (token) => { /* ... */ };

// services/userService.js - Only user CRUD
export const createUser = (userData) => { /* ... */ };
export const getUserById = (id) => { /* ... */ };

// ❌ BAD: Multiple responsibilities in one file
// services/authAndUserService.js - Too many responsibilities
export const generateToken = () => { /* ... */ };
export const createUser = () => { /* ... */ };
export const fetchNews = () => { /* ... */ };  // Wrong domain!
```

### 4. **Import Organization**

```javascript
// Standard library imports first
import { useState, useEffect } from 'react';

// External library imports
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Internal imports (absolute paths)
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';

// Relative imports (same feature)
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

// Styles last
import './styles.css';
```

---

## 🔧 Configuration Files

### Backend `.env.example`
```bash
# Server
NODE_ENV=development
PORT=3000

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# NewsAPI
NEWSAPI_KEY=your_newsapi_key

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env.example`
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
```

### ESLint Configuration (`.eslintrc.json`)
```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "prettier"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error"
  }
}
```

### Prettier Configuration (`.prettierrc`)
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## 📦 Package.json Scripts

### Backend Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

### Frontend Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext .js,.jsx",
    "format": "prettier --write \"src/**/*.{js,jsx,css}\""
  }
}
```

---

## ✅ Structure Checklist

Before starting development, ensure:

- [ ] Folder structure matches this guide
- [ ] `.env.example` files created (both backend and frontend)
- [ ] `.gitignore` configured (node_modules, .env, logs, dist, build)
- [ ] ESLint and Prettier configured
- [ ] Package.json scripts defined
- [ ] Migration files in correct location (`backend/database/migrations/`)
- [ ] All architectural patterns understood
- [ ] Naming conventions clear to all developers

---

## 🚨 Anti-Patterns to Avoid

### ❌ DON'T:
1. **Mix business logic in controllers**
   ```javascript
   // ❌ BAD
   const newsController = async (req, res) => {
     const response = await axios.get('https://newsapi.org/...');
     const normalized = response.data.articles.map(...);
     res.json(normalized);
   };
   ```

2. **Put services in components directly**
   ```javascript
   // ❌ BAD
   function NewsCard() {
     const [news, setNews] = useState([]);
     useEffect(() => {
       axios.get('/api/news').then(r => setNews(r.data));
     }, []);
   }
   ```

3. **Create God objects with multiple responsibilities**
   ```javascript
   // ❌ BAD
   class EverythingService {
     authenticateUser() {}
     fetchNews() {}
     updatePreferences() {}
     sendEmail() {}
   }
   ```

4. **Nest components too deeply**
   ```
   ❌ BAD:
   components/
   └── features/
       └── news/
           └── components/
               └── cards/
                   └── NewsCard.jsx  (Too nested!)
   ```

### ✅ DO:
1. **Keep services focused and separated** (SOLID: SRP)
2. **Use custom hooks for data fetching** (SOLID: SRP)
3. **Follow Single Responsibility Principle** (SOLID: SRP)
4. **Keep folder structure flat and organized**
5. **Use dependency injection** (SOLID: DIP)
6. **Depend on abstractions, not concretions** (SOLID: DIP)
7. **Keep components small and focused** (SOLID: SRP)
8. **Use Context API for shared state** (SOLID: DIP)

---

## 📋 Development Plan Compliance Checklist

Bu yapı DEVELOPMENT_PLAN.md ile uyumlu mu?

- [x] Backend klasör yapısı: config/, controllers/, middleware/, routes/, services/, database/ ✅
- [x] Frontend klasör yapısı: components/, services/, utils/, contexts/ ✅
- [x] Database migrations: `backend/database/migrations/` ✅
- [x] Constants: `backend/constants/` (categories.js, countries.js) ✅
- [x] Frontend config: `frontend/src/config/api.js` ✅
- [x] i18n yapısı: `frontend/src/i18n/` ve `frontend/src/locales/` ✅
- [x] 5 dil desteği: tr, en, de, fr, es ✅
- [x] Country selector component: `components/preferences/CountrySelector.jsx` ✅
- [x] PreferencesContext: `contexts/PreferencesContext.jsx` ✅
- [x] Error handling: `utils/errors.js` (backend), `utils/errorHandler.js` (frontend) ✅
- [x] Service layer separation: Services business logic, controllers HTTP handling ✅

**Not:** Backend'de `models/` klasörü yok çünkü Supabase kullanıyoruz. Database schema migration dosyalarında tanımlı ve Supabase client üzerinden erişiliyor. Bu yaklaşım SOLID prensiplerine uygundur (DIP - abstraction'a bağımlılık).

---

**This structure follows SOLID principles, Clean Code principles, and industry best practices for scalable Node.js + React applications.**
