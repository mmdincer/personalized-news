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
- `country` veya `category` - En az biri gerekli

**Optional Parameters:**
- `country` - ISO 3166-1 alpha-2 ülke kodu (örn: us, gb, tr, de, fr, it, es, jp, kr, cn, in, br, mx, ar, au, ca, nl, se, no, dk, fi, pl, cz, hu, ro, gr, pt, be, ch, at, ie, nz, za, eg, ng, ke, ma, ae, sa, il, ae)
- `pageSize` - Sayfa başına sonuç sayısı (max: 100, default: 20)
- `page` - Sayfa numarası (default: 1)

**Not:** `language` parametresi top-headlines endpoint'inde desteklenmiyor. Dil filtrelemesi için `everything` endpoint'i kullanılabilir, ancak bu projede top-headlines kullanılıyor.

### Request Örnekleri

```javascript
// Kategori ile
GET https://newsapi.org/v2/top-headlines?category=technology&apiKey=YOUR_API_KEY&pageSize=20&page=1

// Ülke ile
GET https://newsapi.org/v2/top-headlines?country=tr&apiKey=YOUR_API_KEY&pageSize=20&page=1

// Kategori ve ülke ile
GET https://newsapi.org/v2/top-headlines?category=technology&country=us&apiKey=YOUR_API_KEY&pageSize=20&page=1
```

### Desteklenen Ülke/Dil Kodları (Proje İçin)

Projede 5 ülke/dil desteği sağlanacak:

```javascript
const SUPPORTED_COUNTRIES = [
  {
    code: 'tr',
    name: 'Turkey',
    language: 'tr',
    languageName: 'Türkçe',
    flag: '🇹🇷',
    default: true  // Default country/language
  },
  {
    code: 'us',
    name: 'United States',
    language: 'en',
    languageName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'de',
    name: 'Germany',
    language: 'de',
    languageName: 'Deutsch',
    flag: '🇩🇪'
  },
  {
    code: 'fr',
    name: 'France',
    language: 'fr',
    languageName: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'es',
    name: 'Spain',
    language: 'es',
    languageName: 'Español',
    flag: '🇪🇸'
  }
];

// Default country
const DEFAULT_COUNTRY = 'tr';
```

**Not:** Ülke seçimi hem haberlerin kaynağını hem de uygulama dilini belirler. Örneğin Türkiye seçildiğinde haberler Türkiye'den gelecek ve UI Türkçe olacak.

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
  country VARCHAR(2) DEFAULT 'tr' NOT NULL CHECK (country IN ('tr', 'us', 'de', 'fr', 'es')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_country ON user_preferences(country);
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
  .insert({ email, password_hash })
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
      "email": "user@example.com"
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
      "email": "user@example.com"
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
    "categories": ["general", "technology"],
    "country": "tr"
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
  "categories": ["business", "technology", "science"],
  "country": "us"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": ["business", "technology", "science"],
    "country": "us"
  }
}
```

**Note:** `country` field is optional. If not provided, existing value is kept. Valid values: `tr`, `us`, `de`, `fr`, `es`. Changing country will:
- Update UI language automatically
- Change news source country for future requests

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

