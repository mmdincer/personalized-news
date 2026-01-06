# Error Codes Catalog

Bu dosya projedeki tüm error code'ları ve açıklamalarını içerir.

## Standardized Error Response Format

Tüm API error response'ları aşağıdaki formatta döndürülmelidir:

```javascript
{
  success: false,
  error: {
    code: "ERROR_CODE",           // e.g., "AUTH_INVALID_CREDENTIALS"
    message: "User-friendly message",
    details: {},                   // Optional: additional context
    timestamp: "ISO 8601 timestamp"
  }
}
```

## Error Code Categories

### Authentication Errors (AUTH_*)

- `AUTH_INVALID_CREDENTIALS` - Wrong email or password
- `AUTH_EMAIL_EXISTS` - Email already registered
- `AUTH_INVALID_EMAIL` - Invalid email format
- `AUTH_WEAK_PASSWORD` - Password doesn't meet requirements
- `AUTH_TOKEN_EXPIRED` - JWT token has expired
- `AUTH_TOKEN_INVALID` - JWT token is invalid
- `AUTH_UNAUTHORIZED` - No token provided
- `AUTH_FORBIDDEN` - Insufficient permissions (admin access required)

### User Preference Errors (PREF_*)

- `PREF_INVALID_CATEGORY` - One or more invalid categories
- `PREF_UPDATE_FAILED` - Failed to update preferences
- `PREF_NOT_FOUND` - User preferences not found

### News API Errors (NEWS_*)

- `NEWS_API_INVALID_KEY` - Invalid The Guardian API key
- `NEWS_API_RATE_LIMIT` - Rate limit exceeded (500/day or 1/second for free tier)
- `NEWS_API_SERVER_ERROR` - The Guardian API server error
- `NEWS_API_TIMEOUT` - Request timeout after 10s
- `NEWS_NETWORK_ERROR` - Network connection error
- `NEWS_RATE_LIMIT_EXCEEDED` - Internal rate limit exceeded (500/day or 1/second)
- `NEWS_INVALID_CATEGORY` - Invalid news category
- `NEWS_FETCH_FAILED` - Failed to fetch news

### System Errors (SYS_*)

- `SYS_INTERNAL_ERROR` - Internal server error
- `SYS_DATABASE_ERROR` - Database connection or query error
- `SYS_VALIDATION_ERROR` - General validation error
- `SYS_NETWORK_ERROR` - Network connection error
- `SYS_TIMEOUT_ERROR` - Request timeout

### Validation Errors (VAL_*)

- `VAL_MISSING_FIELD` - Required field is missing
- `VAL_INVALID_FORMAT` - Invalid data format
- `VAL_OUT_OF_RANGE` - Value out of allowed range

## Error Messages (English)

Frontend'de kullanıcıya gösterilecek error mesajları (English-only):

```javascript
const ERROR_MESSAGES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: "Invalid email or password",
  AUTH_EMAIL_EXISTS: "This email is already registered",
  AUTH_INVALID_EMAIL: "Invalid email format",
  AUTH_WEAK_PASSWORD: "Password does not meet requirements",
  AUTH_TOKEN_EXPIRED: "Session expired. Please login again",
  AUTH_TOKEN_INVALID: "Invalid session. Please login again",
  AUTH_UNAUTHORIZED: "You need to login for this operation",
  AUTH_FORBIDDEN: "You don't have permission for this operation",
  
  // User Preferences
  PREF_INVALID_CATEGORY: "Invalid category selected",
  PREF_UPDATE_FAILED: "Failed to update preferences",
  PREF_NOT_FOUND: "User preferences not found",
  
  // News API
  NEWS_API_INVALID_KEY: "News service configuration error",
  NEWS_API_RATE_LIMIT: "Too many requests. Please try again later",
  NEWS_API_SERVER_ERROR: "News service is currently unavailable",
  NEWS_API_TIMEOUT: "News service did not respond (10 second timeout)",
  NEWS_NETWORK_ERROR: "Unable to connect to news service",
  NEWS_RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later",
  NEWS_INVALID_CATEGORY: "Invalid news category",
  NEWS_FETCH_FAILED: "Failed to load news",
  
  // System
  SYS_INTERNAL_ERROR: "An error occurred. Please try again later",
  SYS_DATABASE_ERROR: "Database error",
  SYS_VALIDATION_ERROR: "Invalid input data",
  SYS_NETWORK_ERROR: "Network connection error",
  SYS_TIMEOUT_ERROR: "Request timeout",
  
  // Validation
  VAL_MISSING_FIELD: "Required field is missing",
  VAL_INVALID_FORMAT: "Invalid data format",
  VAL_OUT_OF_RANGE: "Value out of allowed range"
};
```

## Error Code Implementation

Backend'de error factory fonksiyonları kullanılmalı:

```javascript
// utils/errors.js
function createError(code, message, details = {}) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString()
    }
  };
}

// Usage
throw createError('AUTH_INVALID_CREDENTIALS', 'Wrong email or password');
```

