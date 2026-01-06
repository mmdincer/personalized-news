# Security Guidelines

Bu dosya proje için güvenlik rehberi ve best practice'leri içerir.

## OWASP Top 10 Checklist

### A01:2021 – Broken Access Control

- [ ] JWT authentication on protected routes
- [ ] User can only access their own data
- [ ] Validate user permissions before data access
- [ ] Test authorization on all endpoints

### A02:2021 – Cryptographic Failures

- [ ] Passwords hashed with bcrypt (10 rounds)
- [ ] No sensitive data in logs
- [ ] HTTPS in production
- [ ] API keys stored in environment variables only
- [ ] No sensitive data in error messages

### A03:2021 – Injection

- [ ] Parameterized Supabase queries (NEVER string concatenation)
- [ ] Input validation on all endpoints
- [ ] Sanitize HTML inputs (prevent XSS)
- [ ] Use Supabase query builder or prepared statements
- [ ] Review all database queries

### A04:2021 – Insecure Design

- [ ] Password strength requirements enforced
- [ ] Rate limiting on auth endpoints
- [ ] Secure default configurations
- [ ] Security by design principles

### A05:2021 – Security Misconfiguration

- [ ] No sensitive data in `.env` committed to Git
- [ ] CORS properly configured
- [ ] Security headers (helmet.js)
- [ ] Error messages don't expose system details
- [ ] Default credentials changed

### A06:2021 – Vulnerable Components

- [ ] All dependencies up to date
- [ ] No known vulnerabilities (npm audit)
- [ ] Regular dependency updates
- [ ] Monitor security advisories

### A07:2021 – Authentication Failures

- [ ] JWT tokens expire after 7 days
- [ ] Secure password requirements
- [ ] Brute force protection (rate limiting)
- [ ] Password reset functionality (if implemented)
- [ ] Session management

### A08:2021 – Data Integrity Failures

- [ ] Validate all user inputs
- [ ] Transaction support for multi-step operations
- [ ] Data validation on both frontend and backend
- [ ] Prevent data tampering

### A09:2021 – Security Logging Failures

- [ ] Log authentication failures
- [ ] Log authorization failures
- [ ] Winston logging configured
- [ ] Log security events
- [ ] Monitor suspicious activities

### A10:2021 – Server-Side Request Forgery

- [ ] Validate The Guardian API responses
- [ ] No user-controlled URLs
- [ ] Whitelist allowed domains
- [ ] Validate external API responses

## Security Implementation Details

### Password Requirements

```javascript
// Password validation rules
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)
- No common passwords (optional: use password-strength library)
```

### JWT Token Configuration

```javascript
// Token settings
- Expiration: 7 days (configurable)
- Secret key: From environment variable
- Payload: user id and email
- Algorithm: HS256
```

### Rate Limiting Configuration

```javascript
// Rate limits
- Auth endpoints: 5 requests per 15 minutes per IP
- News endpoints: 100 requests per hour per user
- General API: 1000 requests per hour per IP
- Return 429 status code when exceeded
- Include Retry-After header
```

### Request Size Limiting

```javascript
// Size limits
- Auth endpoints: 10KB max
- Preferences endpoints: 1KB max
- Return 413 status code when exceeded
- Prevent large payload attacks
```

### Input Validation

**Backend:**
- Validate all request bodies
- Validate all query parameters
- Validate all URL parameters
- Sanitize HTML inputs (prevent XSS)
- Reject invalid data types

**Frontend:**
- Client-side validation before API call
- Real-time validation feedback
- Display validation errors clearly
- Prevent multiple submissions

### XSS Prevention

- Escape HTML in user-generated content
- Use Content Security Policy (CSP) headers
- Sanitize inputs on both frontend and backend
- Use secure React patterns (avoid dangerouslySetInnerHTML)
- Validate and sanitize all user inputs

### SQL Injection Prevention

- NEVER use string concatenation in queries
- ALWAYS use parameterized queries
- Review all database queries
- Use Supabase query builder or prepared statements
- Test with malicious inputs

### Supabase RLS Policies

**Users Table:**
- Users can only read their own data
- Users can only update their own data

**User Preferences Table:**
- Users can only read their own preferences
- Users can only update their own preferences
- Public read for news (if caching in DB)

**Testing:**
- Test RLS policies thoroughly
- Verify users cannot access other users' data
- Test with different user roles

### Error Handling Security

- Don't expose sensitive information in error messages
- Use generic error messages for users
- Log detailed errors server-side only
- Don't reveal system internals
- Handle errors gracefully

### CORS Configuration

```javascript
// CORS settings
- Allow frontend origin: http://localhost:5173 (Vite dev server)
- Allow credentials: true
- Allowed methods: GET, POST, PUT, DELETE
- Allowed headers: Content-Type, Authorization
- Production: Update with actual frontend URL
```

### Security Headers

```javascript
// Recommended headers (helmet.js)
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HTTPS only)
```

### Environment Variables Security

- Never commit `.env` files
- Use `.env.example` for reference
- Rotate API keys regularly
- Use different keys for dev/prod
- Store secrets securely

### Logging Security

```javascript
// Winston logging configuration
- Log levels: error, warn, info, debug
- Separate log files: error.log, combined.log
- Include timestamp, request ID, user ID
- Rotate logs daily
- Don't log sensitive data (passwords, tokens)
```

### Network Security

- Use HTTPS in production
- Validate SSL certificates
- Implement request timeout (10 seconds)
- Handle network errors gracefully
- Detect offline status

### Connection Pool Management

```javascript
// Supabase connection pool
- Configure connection pool size (default: 10)
- Handle connection errors gracefully
- Implement connection retry logic
- Log connection pool warnings
- Monitor connection usage
```

## Security Audit Checklist

- [ ] All OWASP Top 10 items addressed
- [ ] Password requirements enforced
- [ ] Rate limiting active
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Error handling secure
- [ ] Logging configured correctly
- [ ] Environment variables secure
- [ ] Dependencies up to date
- [ ] No known vulnerabilities

## Security Testing

- [ ] Test authentication flows
- [ ] Test authorization boundaries
- [ ] Test input validation
- [ ] Test rate limiting
- [ ] Test SQL injection attempts
- [ ] Test XSS attempts
- [ ] Test error handling
- [ ] Test CORS configuration
- [ ] Test security headers
- [ ] Test password requirements

