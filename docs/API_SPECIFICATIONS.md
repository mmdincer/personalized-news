# API Specifications

Bu dosya projede kullanılan external API'lerin detaylı spesifikasyonlarını içerir.

## NewsAPI.org

### Genel Bilgiler

- **URL**: https://newsapi.org/
- **Endpoint**: `https://newsapi.org/v2/top-headlines`
- **Free Tier Limits**:
  - 100 requests per day
  - 1 request per second
  - Development only (not for production)

### Desteklenen Kategoriler

```javascript
const ALLOWED_CATEGORIES = [
  'business',      // Business news
  'entertainment', // Entertainment news
  'general',       // General news
  'health',        // Health news
  'science',       // Science news
  'sports',        // Sports news
  'technology'     // Technology news
];
```

### API Parametreleri

**Required Parameters:**
- `apiKey` - NewsAPI.org API key
- `category` - News category (required)

**Optional Parameters:**
- `pageSize` - Sayfa başına sonuç sayısı (max: 100, default: 20)
- `page` - Sayfa numarası (default: 1)

**Not:** Bu projede sadece `category` parametresi kullanılıyor. Country parametresi kullanılmıyor (NewsAPI.org default davranışı kullanılır).

### Request Örnekleri

```javascript
// Kategori ile (country parametresi kullanılmıyor)
GET https://newsapi.org/v2/top-headlines?category=technology&apiKey=YOUR_API_KEY&pageSize=20&page=1
```

### Response Format (NewsAPI.org)

```javascript
{
  "status": "ok",
  "totalResults": 100,
  "articles": [
    {
      "source": {
        "id": "techcrunch",
        "name": "TechCrunch"
      },
      "author": "Author Name",
      "title": "Article Title",
      "description": "Article description",
      "url": "https://...",
      "urlToImage": "https://...",
      "publishedAt": "2024-01-05T12:00:00Z",
      "content": "Article content..."
    }
  ]
}
```

### Normalized Response Format (Backend)

Backend'den döndürülecek normalize edilmiş format:

```javascript
{
  success: true,
  data: {
    articles: [
      {
        title: "Article title",
        description: "Article description",
        url: "https://...",
        imageUrl: "https://...",
        publishedAt: "2024-01-05T12:00:00Z",
        source: {
          name: "Source name"
        }
      }
    ],
    totalResults: 100,
    page: 1,
    pageSize: 20
  }
}
```

### Error Handling

NewsAPI.org hataları:

- **401 Unauthorized** - Invalid API key → `NEWS_API_INVALID_KEY`
- **429 Too Many Requests** - Rate limit exceeded → `NEWS_API_RATE_LIMIT`
- **500 Internal Server Error** - NewsAPI server error → `NEWS_API_SERVER_ERROR`

### Rate Limiting Implementation

```javascript
// Rate limiting strategy
- Track daily request count (100/day limit)
- Implement per-second rate limiting (1/second)
- Return cached results when limit reached
- Log rate limit warnings
```

### Caching Strategy

- Cache news by category for 15 minutes
- Use in-memory cache (node-cache or Map)
- Clear cache on invalidation
- Reduce API calls to stay within limits

## Supabase API

### Connection Configuration

```javascript
// Environment variables
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

### Database Schema

#### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### User Preferences Table

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  categories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
-- Optional: GIN index for JSONB search
CREATE INDEX idx_user_preferences_categories ON user_preferences USING GIN(categories);
```

### Supabase Client Usage

```javascript
// config/database.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;
```

### Query Examples

#### User Insert

```javascript
const { data, error } = await supabase
  .from('users')
  .insert({ email, name, password_hash })
  .select();
```

#### User Preferences Upsert

```javascript
const { data, error } = await supabase
  .from('user_preferences')
  .upsert({ 
    user_id, 
    categories: ['general', 'technology'],
    updated_at: new Date().toISOString()
  })
  .select();
```

### Row Level Security (RLS)

RLS policies production'da aktif edilmeli:

- Users can only read their own preferences
- Users can only update their own preferences
- Public read for news (if caching in DB)

## Internal API Endpoints

### Authentication Endpoints

#### POST /api/auth/register

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt_token_here"
  }
}
```

### User Preferences Endpoints

#### GET /api/user/preferences

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": ["general", "technology"]
  }
}
```

#### PUT /api/user/preferences

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request:**
```json
{
  "categories": ["business", "technology", "science"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": ["business", "technology", "science"]
  }
}
```

### News Endpoints

#### GET /api/news

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [...],
    "totalResults": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

#### GET /api/news/:category

**Path Parameters:**
- `category` - One of: business, entertainment, general, health, science, sports, technology

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [...],
    "totalResults": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

