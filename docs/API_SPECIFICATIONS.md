# API Specifications

Bu dosya projede kullanılan external API'lerin detaylı spesifikasyonlarını içerir.

## The Guardian API

### Genel Bilgiler

- **URL**: https://open-platform.theguardian.com/
- **Base URL**: `https://content.guardianapis.com`
- **Endpoint**: `/search`
- **Free Tier Limits** (Developer Key):
  - 500 requests per day
  - 1 request per second
  - Non-commercial use only
  - Register at: https://open-platform.theguardian.com/access

### Desteklenen Kategoriler (Guardian API Sections)

```javascript
const ALLOWED_CATEGORIES = [
  'business',      // Business news
  'technology',    // Technology news
  'science',       // Science news
  'sport',         // Sports news (Guardian uses singular 'sport')
  'culture',       // Culture/Entertainment news
  'news',          // General news
  'world',         // World news
  'politics',      // Politics news
  'environment',   // Environment news
  'society',       // Society news (includes health, social issues)
  'lifeandstyle',  // Life and style
  'food',          // Food news
  'travel',        // Travel news
  'fashion',       // Fashion news
  'books',         // Books news
  'music',         // Music news
  'film',          // Film news
  'games',         // Games news
  'education',     // Education news
  'media',         // Media news
];
```

### Kategori Mapping

Kategoriler doğrudan Guardian API section ID'leri kullanılmaktadır. 1:1 mapping vardır:

| Category | Guardian Section | Description |
|----------|-----------------|-------------|
| `business` | `business` | Business news |
| `technology` | `technology` | Technology news |
| `science` | `science` | Science news |
| `sport` | `sport` | Sports news |
| `culture` | `culture` | Culture/Entertainment news |
| `news` | `news` | General news |
| `world` | `world` | World news |
| `politics` | `politics` | Politics news |
| `environment` | `environment` | Environment news |
| `society` | `society` | Society news (includes health) |
| `lifeandstyle` | `lifeandstyle` | Life and style |
| `food` | `food` | Food news |
| `travel` | `travel` | Travel news |
| `fashion` | `fashion` | Fashion news |
| `books` | `books` | Books news |
| `music` | `music` | Music news |
| `film` | `film` | Film news |
| `games` | `games` | Games news |
| `education` | `education` | Education news |
| `media` | `media` | Media news |

### API Parametreleri

**Required Parameters:**
- `api-key` - The Guardian API key (obtained from https://open-platform.theguardian.com/access)

**Optional Parameters:**
- `section` - Guardian section name (for category filtering). Omit for 'general' category.
- `page` - Page number (default: 1)
- `page-size` - Results per page (max: 50, default: 20)
- `show-fields` - Comma-separated list of fields to include (e.g., `thumbnail,headline,trailText`)
- `order-by` - Sort order (`newest`, `oldest`, `relevance`)

**Not:** When category is 'general', the `section` parameter is not sent, which fetches articles from all sections.

### Request Örnekleri

```javascript
// Technology category
GET https://content.guardianapis.com/search?api-key=YOUR_API_KEY&section=technology&page=1&page-size=20&show-fields=thumbnail,headline,trailText&order-by=newest

// General category (all sections)
GET https://content.guardianapis.com/search?api-key=YOUR_API_KEY&page=1&page-size=20&show-fields=thumbnail,headline,trailText&order-by=newest
```

### Response Format (The Guardian API)

```javascript
{
  "response": {
    "status": "ok",
    "total": 100,
    "pages": 5,
    "results": [
      {
        "id": "technology/2024/01/05/article-id",
        "webTitle": "Article Title",
        "webUrl": "https://www.theguardian.com/...",
        "webPublicationDate": "2024-01-05T12:00:00Z",
        "sectionName": "Technology",
        "fields": {
          "headline": "Article Title",
          "trailText": "Article description...",
          "thumbnail": "https://media.guim.co.uk/..."
        }
      }
    ]
  }
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

The Guardian API hataları:

- **401 Unauthorized** - Invalid API key → `NEWS_API_INVALID_KEY`
- **429 Too Many Requests** - Rate limit exceeded → `NEWS_API_RATE_LIMIT`
- **500 Internal Server Error** - The Guardian API server error → `NEWS_API_SERVER_ERROR`

### Rate Limiting Implementation

```javascript
// Rate limiting strategy
- Track daily request count (500/day limit for free tier)
- Implement per-second rate limiting (1/second for free tier)
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

#### Saved Articles Table

```sql
CREATE TABLE saved_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  article_url VARCHAR(500) NOT NULL,
  article_title VARCHAR(500) NOT NULL,
  article_image_url VARCHAR(500),
  article_description TEXT,
  article_content TEXT,
  article_source_name VARCHAR(100),
  article_published_at TIMESTAMP WITH TIME ZONE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, article_url)
);

-- Create indexes for performance
CREATE INDEX idx_saved_articles_user_id ON saved_articles(user_id);
CREATE INDEX idx_saved_articles_saved_at ON saved_articles(saved_at DESC);
CREATE INDEX idx_saved_articles_published_at ON saved_articles(article_published_at DESC);
```

**Column Descriptions:**
- `id`: Unique saved article identifier (UUID)
- `user_id`: Reference to users table (foreign key)
- `article_url`: URL of the saved article (unique per user, combined with user_id)
- `article_title`: Title of the saved article
- `article_image_url`: Image URL of the saved article (optional)
- `article_description`: Short description/trail text of the article (optional, fetched from Guardian API)
- `article_content`: Full article content/body text (optional, fetched from Guardian API)
- `article_source_name`: Source name (e.g., The Guardian, section name) (optional, fetched from Guardian API)
- `article_published_at`: Original publication date of the article (optional, fetched from Guardian API)
- `saved_at`: Timestamp when article was saved

**Note:** When saving an article, the backend automatically fetches full article details (description, content, source, published date) from The Guardian API and stores them in the database. This allows offline access to saved articles and reduces API calls when viewing saved articles.

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
    categories: ['news', 'technology'],
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
    "categories": ["news", "technology"]
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
- `limit` (optional, default: 20, max: 50)
- `from` (optional) - Start date filter (YYYY-MM-DD format)
- `to` (optional) - End date filter (YYYY-MM-DD format)
- `sort` (optional) - Sort order: newest, oldest, relevance (default: newest)

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

#### GET /api/news/search

**Query Parameters:**
- `q` (required) - Search query string
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 50)
- `from` (optional) - Start date filter (YYYY-MM-DD format)
- `to` (optional) - End date filter (YYYY-MM-DD format)
- `sort` (optional) - Sort order: newest, oldest, relevance (default: relevance)

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

### Saved Articles Endpoints

#### POST /api/user/saved-articles

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request:**
```json
{
  "article_url": "https://www.theguardian.com/...",
  "article_title": "Article Title",
  "article_image_url": "https://media.guim.co.uk/..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "article_url": "https://www.theguardian.com/...",
    "article_title": "Article Title",
    "article_image_url": "https://media.guim.co.uk/...",
    "article_description": "Short description/trail text of the article",
    "article_content": "Full article content/body text",
    "article_source_name": "The Guardian",
    "article_published_at": "2024-01-05T12:00:00Z",
    "saved_at": "2024-01-06T10:00:00Z"
  }
}
```

**Note:** When saving an article, the backend automatically fetches full article details (description, content, source, published date) from The Guardian API and stores them in the database. This allows offline access to saved articles.

#### GET /api/user/saved-articles

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "article_url": "https://www.theguardian.com/...",
      "article_title": "Article Title",
      "article_image_url": "https://media.guim.co.uk/...",
      "article_description": "Short description/trail text of the article",
      "article_content": "Full article content/body text",
      "article_source_name": "The Guardian",
      "article_published_at": "2024-01-05T12:00:00Z",
      "saved_at": "2024-01-06T10:00:00Z"
    }
  ]
}
```

**Note:** Returns an array of saved articles ordered by `saved_at` DESC (newest first). All article details including full content are included.

#### DELETE /api/user/saved-articles/:id

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Path Parameters:**
- `id` - Saved article UUID

**Response:**
```json
{
  "success": true,
  "message": "Saved article deleted successfully"
}
```

### Reading History Endpoints

#### POST /api/user/reading-history

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request:**
```json
{
  "articleUrl": "https://www.theguardian.com/...",
  "articleTitle": "Article Title",
  "articleImageUrl": "https://media.guim.co.uk/..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "articleUrl": "https://www.theguardian.com/...",
    "articleTitle": "Article Title",
    "articleImageUrl": "https://media.guim.co.uk/...",
    "readAt": "2024-01-05T12:00:00Z"
  }
}
```

#### GET /api/user/reading-history

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "uuid",
        "articleUrl": "https://www.theguardian.com/...",
        "articleTitle": "Article Title",
        "articleImageUrl": "https://media.guim.co.uk/...",
        "readAt": "2024-01-05T12:00:00Z"
      }
    ],
    "totalResults": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

#### DELETE /api/user/reading-history

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "message": "Reading history cleared successfully"
}
```

### Profile Endpoints

#### GET /api/user/profile

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### PUT /api/user/password

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

