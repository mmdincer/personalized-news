# Deployment Guide

Bu dosya projenin production'a deploy edilmesi için gerekli adımları içerir.

## Prerequisites

- Node.js 18+ installed
- Supabase project created
- NewsAPI.org API key
- Production server/hosting (Vercel, Railway, Heroku, etc.)

## Environment Setup

### Backend Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Fill in required variables:
   ```env
   NODE_ENV=production
   PORT=3000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_strong_secret_key_min_64_chars
   JWT_EXPIRES_IN=7d
   NEWSAPI_KEY=your_newsapi_key
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ADMIN_EMAILS=admin@yourdomain.com
   ```

3. Validate environment variables:
   ```bash
   npm run validate-env
   ```

### Frontend Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Fill in required variables:
   ```env
   VITE_API_BASE_URL=https://your-api-domain.com/api
   ```

## Build Process

### Backend Build

```bash
cd backend
npm install --production
npm start
```

### Frontend Build

```bash
cd frontend
npm install
npm run build
```

Build output will be in `frontend/dist/` directory.

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)

**Frontend:**
1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `cd frontend && vercel`
3. Set environment variables in Vercel dashboard

**Backend:**
- Use Railway, Render, or similar Node.js hosting
- Set environment variables in hosting dashboard

### Option 2: Railway

**Backend:**
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

**Frontend:**
- Deploy separately or use Railway's static site hosting

### Option 3: Docker (Self-hosted)

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Frontend can connect to backend API
- [ ] Environment variables are set correctly
- [ ] CORS is configured for production domain
- [ ] Database migrations are run
- [ ] SSL/HTTPS is enabled
- [ ] Error logging is working
- [ ] Rate limiting is active
- [ ] Health check endpoint responds

## Monitoring

- Monitor error logs (Winston logs)
- Check API response times
- Monitor rate limit usage
- Track NewsAPI.org quota usage

## Troubleshooting

### Backend Issues

1. **Environment variables not loading:**
   - Ensure `.env` file exists
   - Check variable names match exactly
   - Run `npm run validate-env`

2. **Database connection errors:**
   - Verify Supabase credentials
   - Check network connectivity
   - Verify RLS policies

3. **CORS errors:**
   - Check `CORS_ORIGINS` includes frontend domain
   - Verify frontend `VITE_API_BASE_URL` matches backend

### Frontend Issues

1. **API calls failing:**
   - Check `VITE_API_BASE_URL` is correct
   - Verify backend is running
   - Check browser console for errors

2. **Build errors:**
   - Clear `node_modules` and reinstall
   - Check Node.js version (18+)
   - Verify all dependencies are installed

## Security Checklist

- [ ] All secrets are in environment variables (not in code)
- [ ] `.env` files are in `.gitignore`
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is active
- [ ] JWT secret is strong (64+ characters)
- [ ] Admin emails are configured
- [ ] Error messages don't expose sensitive info

