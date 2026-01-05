# Technology Stack

Bu dosya projede kullanılan teknolojiler ve karar gerekçelerini içerir.

## Backend Technologies

### Node.js & Express.js

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **Gerekçe**: Hızlı geliştirme, geniş ekosistem, JavaScript kullanımı

### Database: Supabase (PostgreSQL)

- **Supabase**: PostgreSQL-based BaaS
- **PostgreSQL**: İlişkisel veritabanı
- **Gerekçe**: 
  - Remote database (production-ready)
  - Ücretsiz tier yeterli
  - Modern API
  - JSONB desteği (kategoriler için)

### Authentication: JWT

- **jsonwebtoken**: JWT token oluşturma ve doğrulama
- **bcrypt**: Password hashing
- **Gerekçe**: Stateless authentication, scalable

### Validation & Security

- **express-validator**: Input validation
- **password-validator**: Password strength validation
- **express-rate-limit**: Rate limiting
- **winston**: Error logging
- **Gerekçe**: Güvenlik ve data integrity için kritik

### HTTP Client

- **axios**: HTTP client for NewsAPI.org
- **Gerekçe**: Interceptor desteği, kolay hata yönetimi

## Frontend Technologies

### React & Vite

- **React**: UI library
- **Vite**: Build tool ve dev server
- **Gerekçe**: Hızlı development, modern tooling

### Routing

- **react-router-dom**: Client-side routing
- **Gerekçe**: Standart React routing çözümü

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Gerekçe**: 
  - Hızlı UI geliştirme
  - Responsive design kolaylığı
  - Modern ve temiz kod

### Form Management

- **react-hook-form**: Form state management
- **Gerekçe**: 
  - Performanslı (minimal re-renders)
  - Kolay validation
  - Küçük bundle size

### State Management

- **Context API**: React built-in state management
- **Gerekçe**: 
  - Küçük proje için yeterli
  - Ekstra dependency yok
  - Basit kullanım

### Notifications

- **react-hot-toast**: Toast notification library
- **Gerekçe**: 
  - Hafif ve performanslı
  - Kolay kullanım
  - Modern UI

### Internationalization (i18n)

- **react-i18next**: React i18n framework
- **i18next**: Core i18n framework
- **Gerekçe**: 
  - 5 dil desteği (tr, en, de, fr, es)
  - Ülke seçimine göre otomatik dil değişimi
  - Yaygın kullanım
  - Kolay entegrasyon

### HTTP Client

- **axios**: HTTP client for API calls
- **Gerekçe**: Backend ile tutarlılık, interceptor desteği

## Testing

### Jest

- **Jest**: Test framework
- **Supertest**: API testing
- **Gerekçe**: Yaygın kullanım, kolay setup

## Development Tools

### Package Managers

- **npm**: Node package manager
- **Gerekçe**: Node.js ile birlikte gelir

### Version Control

- **Git**: Version control system
- **Gerekçe**: Standart, yaygın kullanım

## Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.x",
    "dotenv": "^16.x",
    "cors": "^2.x",
    "axios": "^1.x",
    "express-validator": "^7.x",
    "express-rate-limit": "^7.x",
    "jsonwebtoken": "^9.x",
    "bcrypt": "^5.x",
    "winston": "^3.x",
    "password-validator": "^5.x",
    "@supabase/supabase-js": "^2.x"
  }
}
```

## Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "react-hook-form": "^7.x",
    "react-hot-toast": "^2.x",
    "react-i18next": "^13.x",
    "i18next": "^23.x"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

## Technology Decisions Summary

| Category | Technology | Reason |
|----------|-----------|--------|
| Backend Framework | Express.js | Hızlı, yaygın, kolay |
| Database | Supabase (PostgreSQL) | Remote, ücretsiz tier, modern |
| Authentication | JWT | Stateless, scalable |
| Validation | express-validator | Express entegrasyonu |
| HTTP Client | axios | Interceptor, hata yönetimi |
| Rate Limiting | express-rate-limit | Basit, etkili |
| Logging | winston | Production-ready |
| Frontend Framework | React + Vite | Modern, hızlı |
| CSS Framework | Tailwind CSS | Hızlı UI geliştirme |
| Form Management | react-hook-form | Performanslı |
| State Management | Context API | Basit, yeterli |
| Notifications | react-hot-toast | Hafif, modern |
| i18n | react-i18next | 5 dil desteği |
| Testing | Jest | Yaygın, kolay |

## Environment Variables

### Backend (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# NewsAPI
NEWSAPI_KEY=your_newsapi_key
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

## Build & Deployment

### Backend Build

```bash
npm install
npm start  # Development
npm run build  # Production (if needed)
```

### Frontend Build

```bash
npm install
npm run dev  # Development
npm run build  # Production build
npm run preview  # Preview production build
```

## Development Workflow

1. **Backend**: Express server runs on port 3000
2. **Frontend**: Vite dev server runs on port 5173
3. **Database**: Supabase remote PostgreSQL
4. **API**: Backend proxies NewsAPI.org requests

## Future Considerations

- **State Management**: Redux/Zustand (if app grows)
- **Caching**: Redis (if needed)
- **Monitoring**: Sentry (error tracking)
- **CI/CD**: GitHub Actions
- **Containerization**: Docker (if needed)

