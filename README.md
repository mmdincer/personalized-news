# Kişiselleştirilmiş Haber Akışı

> 🌟 **Canlı Demo**: Uygulamayı [https://news.mmdincer.com](https://news.mmdincer.com) adresinden deneyebilirsiniz

The Guardian API ile desteklenen, kişiselleştirilmiş haber deneyimleri sunan modern, full-stack haber toplama platformu. Node.js, Express, React ve PostgreSQL (Supabase) ile geliştirilmiş bu uygulama, SOLID prensipleri, temiz mimari ve kapsamlı güvenlik önlemleri dahil olmak üzere profesyonel yazılım mühendisliği uygulamalarını göstermektedir.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Mimari](#-mimari)
- [Başlangıç](#-başlangıç)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Proje Yapısı](#-proje-yapısı)
- [Güvenlik](#-güvenlik)
- [Geliştirme](#-geliştirme)
- [Dökümantasyon](#-dokümantasyon)

## ✨ Özellikler

### Kullanıcı Deneyimi
- 🎯 **Kişiselleştirilmiş Haber Akışı** - 20 kategoriye göre özelleştirilebilir haber tercihleri
- 🔍 **Gelişmiş Arama** - Tarih aralığı ve alaka düzeyi filtreleme ile tam metin arama
- 📱 **Duyarlı Tasarım** - Tailwind CSS ile oluşturulmuş responsive arayüz
- ♾️ **Sonsuz Kaydırma** - Intersection Observer API ile kesintisiz içerik yükleme
- 💾 **Makale Kaydetme** - Tam içerik depolama ile makaleleri yer imlerine ekleme
- 🔐 **Güvenli Kimlik Doğrulama** - bcrypt parola hashleme ile JWT tabanlı kimlik doğrulama

### Haber Kategorileri
20 kategori: Haberler, Dünya, Politika, İş, Teknoloji, Bilim, Kültür, Spor, Çevre, Toplum, Yaşam & Stil, Yemek, Seyahat, Moda, Kitaplar, Müzik, Film, Oyunlar, Eğitim, Medya

### Teknik Özellikler
- ⚡ **Yüksek Performans** - Response caching, optimized queries ve efficient data loading
- 🛡️ **Kurumsal Güvenlik** - OWASP Top 10 compliance, rate limiting, input validation
- 📊 **Üretim Loglama** - Error tracking ile Winston-based structured logging
- 🐳 **Docker Desteği** - docker-compose ile containerized deployment
- 🔄 **Gerçek Zamanlı Güncellemeler** - The Guardian API'den canlı haber akışı güncellemeleri
- 📈 **Ölçeklenebilir Mimari** - Layered architecture with service-oriented design

## 🚀 Teknoloji Yığını

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Veritabanı**: PostgreSQL (Supabase üzerinden)
- **Kimlik Doğrulama**: JWT + bcrypt
- **Doğrulama**: express-validator
- **Güvenlik**: helmet, cors, express-rate-limit
- **Loglama**: Winston
- **API İstemcisi**: Axios
- **Harici API**: The Guardian Content API

### Frontend
- **Framework**: React 18
- **Build Aracı**: Vite
- **Stil**: Tailwind CSS
- **Yönlendirme**: React Router v6
- **State Yönetimi**: Context API
- **Form Yönetimi**: react-hook-form
- **Bildirimler**: react-hot-toast
- **HTTP İstemcisi**: Axios

### DevOps
- **Deployment**: DigitalOcean
- **Containerization**: Docker + Docker Compose
- **Version Control**: Git
- **CI/CD**: Otomatik deployment pipeline

## 🏗️ Mimari

### Sistem Tasarımı
```
┌─────────────────────────────────────────────────────────────┐
│                      İstemci Katmanı                         │
│   React SPA (Vite) - Tailwind CSS - Context API - Router    │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST
┌──────────────────────▼──────────────────────────────────────┐
│                   API Gateway Katmanı                        │
│     Express.js - CORS - Rate Limiting - Authentication      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Uygulama Katmanı                            │
│  Controllers → Services → Harici API'ler & Veritabanı        │
│  • Auth Controller      • Auth Service                       │
│  • News Controller      • News Service → Guardian API        │
│  • Preferences          • Preferences Service                │
│  • Profile              • Saved Articles Service             │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                     Veri Katmanı                             │
│            PostgreSQL (Supabase) + Yanıt Önbelleği           │
│  • Kullanıcılar     • Kullanıcı Tercihleri • Kaydedilen Makaleler │
└─────────────────────────────────────────────────────────────┘
```

### Mimari Prensipler

**SOLID Principles**
- **Single Responsibility Principle**: Her modülün bir net amacı var
- **Open/Closed Principle**: Değişiklik olmadan genişletilebilir
- **Liskov Substitution Principle**: Uygulamalar arasında tutarlı interface'ler
- **Interface Segregation Principle**: Odaklı, minimal interface'ler
- **Dependency Inversion Principle**: Concrete implementation'lara değil, abstraction'lara bağımlı

**Clean Architecture**
- Layered architecture (Sunum → Uygulama → Domain → Altyapı)
- Service-oriented design ile iş mantığı
- Repository pattern ile veri erişimi
- Dependency injection ile test edilebilirlik

## 🚦 Başlangıç

### Ön Gereksinimler
- Node.js 18+ ve npm
- PostgreSQL (veya Supabase hesabı)
- The Guardian API anahtarı ([Buradan alın](https://open-platform.theguardian.com/access))
- Git

### Kurulum

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/mmdincer/personalized-news.git
cd personalized-news
```

2. **Backend Kurulumu**
```bash
cd backend
npm install

# Environment şablonunu kopyalayın
cp .env.example .env

# .env dosyasını yapılandırmanızla düzenleyin
# Gerekli değişkenler:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - JWT_SECRET
# - GUARDIAN_API_KEY
```

3. **Frontend Kurulumu**
```bash
cd frontend
npm install

# Environment şablonunu kopyalayın
cp .env.example .env

# .env dosyasını backend URL'si ile düzenleyin
# VITE_API_BASE_URL=http://localhost:3000/api
```

4. **Veritabanı Kurulumu**

`backend/database/migrations/` dizinindeki migration dosyalarını sırayla çalıştırın:

```bash
# Supabase projenize bağlanın ve çalıştırın:
# 001_create_users_table.sql
# 002_create_user_preferences_table.sql
# 003_enable_rls_policies.sql (development için opsiyonel)
# 004_remove_country_column.sql
# 005_create_saved_articles_table.sql
# 006_update_categories_to_guardian_sections.sql
# 007_add_article_details_to_saved_articles.sql
```

5. **Development Sunucularını Başlatın**

```bash
# Terminal 1 - Backend
cd backend
npm run dev    # http://localhost:3000 üzerinde çalışır

# Terminal 2 - Frontend
cd frontend
npm run dev    # http://localhost:5173 üzerinde çalışır
```

### Docker Deployment

```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 API Dokümantasyonu

### Temel URL
```
Production: https://news.mmdincer.com/api
Development: http://localhost:3000/api
```

### Auth Endpoint'leri

#### Kullanıcı Kaydı
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "Ahmet Yılmaz",
  "password": "GüvenliŞifre123!"
}
```

#### Giriş
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "GüvenliŞifre123!"
}
```

### Haber Endpoint'leri

#### Kategoriye Göre Haber Al
```http
GET /api/news/:category?page=1&limit=20&from=2024-01-01&to=2024-01-31&sort=newest
Authorization: Bearer {token}
```

**Kategoriler**: business, technology, science, sport, culture, news, world, politics, environment, society, lifeandstyle, food, travel, fashion, books, music, film, games, education, media

#### Haber Ara
```http
GET /api/news/search?q=teknoloji&page=1&limit=20&sort=relevance
Authorization: Bearer {token}
```

### Kullanıcı Tercihleri

#### Tercihleri Al
```http
GET /api/user/preferences
Authorization: Bearer {token}
```

#### Tercihleri Güncelle
```http
PUT /api/user/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "categories": ["technology", "science", "business"]
}
```

### Kaydedilen Makaleler

#### Makale Kaydet
```http
POST /api/user/saved-articles
Authorization: Bearer {token}
Content-Type: application/json

{
  "article_url": "https://www.theguardian.com/...",
  "article_title": "Makale Başlığı",
  "article_image_url": "https://..."
}
```

#### Kaydedilen Makaleleri Al
```http
GET /api/user/saved-articles?page=1&limit=20
Authorization: Bearer {token}
```

#### Kaydedilen Makaleyi Sil
```http
DELETE /api/user/saved-articles/:id
Authorization: Bearer {token}
```

Tüm API spesifikasyonları için, [docs/API_SPECIFICATIONS.md](docs/API_SPECIFICATIONS.md) dosyasına bakın.

## 📁 Proje Yapısı

```
personalized-news/
├── backend/
│   ├── config/              # Yapılandırma (veritabanı, logger)
│   ├── constants/           # Uygulama sabitleri (kategoriler)
│   ├── controllers/         # İstek işleyiciler
│   ├── middleware/          # Auth, validation, error handling
│   ├── services/            # İş mantığı katmanı
│   ├── routes/              # API route tanımları
│   ├── utils/               # Yardımcı fonksiyonlar & özel hatalar
│   ├── database/            # SQL migration'lar
│   ├── logs/                # Winston log dosyaları
│   └── server.js            # Uygulama giriş noktası
│
├── frontend/
│   ├── public/              # Statik dosyalar
│   └── src/
│       ├── components/      # React bileşenleri
│       │   ├── auth/        # Login, Register
│       │   ├── news/        # NewsCard, NewsFeed
│       │   ├── filters/     # SearchBar, DateFilter, SortDropdown
│       │   ├── common/      # Yeniden kullanılabilir UI bileşenleri
│       │   └── layout/      # Header, Footer
│       ├── contexts/        # React Context (Auth, Preferences)
│       ├── services/        # API istemci servisleri
│       ├── pages/           # Route bileşenleri
│       ├── hooks/           # Özel React hook'ları
│       └── utils/           # Yardımcı fonksiyonlar
│
├── docs/                    # Kapsamlı dokümantasyon
│   ├── API_SPECIFICATIONS.md
│   ├── DEVELOPMENT_PLAN.md
│   ├── ERROR_CODES.md
│   ├── MIGRATION_GUIDE.md
│   ├── PROJECT_STRUCTURE.md
│   ├── SECURITY_GUIDELINES.md
│   └── TECHNOLOGY_STACK.md
│
├── docker-compose.yml       # Development konteynerleri
├── docker-compose.prod.yml  # Production konteynerleri
└── README.md               # Bu dosya
```

Detaylı yapı dokümantasyonu için, [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) dosyasına bakın.

## 🔒 Güvenlik

### Uygulanan Güvenlik Önlemleri

**OWASP Top 10 Uyumluluğu**
- ✅ **Injection Önleme**: Parametrize sorgular, girdi doğrulama
- ✅ **Bozuk Kimlik Doğrulama**: JWT tokenları, bcrypt hashleme (10 round)
- ✅ **Hassas Veri Açığı**: Environment değişkenleri, güvenli header'lar
- ✅ **XML Harici Varlıkları**: Yalnızca JSON API
- ✅ **Bozuk Erişim Kontrolü**: Route seviyesinde kimlik doğrulama middleware
- ✅ **Güvenlik Yanlış Yapılandırması**: helmet.js, güvenli varsayılanlar
- ✅ **XSS**: Girdi temizleme, Content Security Policy
- ✅ **Güvensiz Deserializasyon**: JSON şema doğrulama
- ✅ **Bilinen Güvenlik Açıkları Olan Bileşenler**: Düzenli bağımlılık denetimleri
- ✅ **Yetersiz Loglama**: Winston yapılandırılmış loglama

**Rate Limit**
- Kimlik doğrulama endpoint'leri: 5 istek / 15 dakika
- Haber endpoint'leri: 100 istek / saat
- Genel API: 1000 istek / saat

**Veri Koruma**
- Şifreler: 10 round ile bcrypt
- JWT tokenları: 7 günlük süre sonu, güvenli imzalama
- Production'da yalnızca HTTPS
- Güvenilir origin'ler için yapılandırılmış CORS

Tam güvenlik dokümantasyonu için, [docs/SECURITY_GUIDELINES.md](docs/SECURITY_GUIDELINES.md) dosyasına bakın.


## 🛠️ Geliştirme

### Geliştirme İş Akışı

1. **Backend Geliştirme**
```bash
cd backend
npm run dev       # nodemon ile başlat
npm run lint      # ESLint'i çalıştır
npm test          # Testleri çalıştır
```

2. **Frontend Geliştirme**
```bash
cd frontend
npm run dev       # Vite dev sunucusunu başlat
npm run build     # Production build
npm run preview   # Production build önizleme
npm run lint      # ESLint'i çalıştır
```

### Kod Kalite Standartları

**ESLint Yapılandırması**
- Airbnb style guide (backend)
- React önerilen kurallar (frontend)
- Proje konvansiyonları için özel kurallar

**Prettier Yapılandırması**
- 2 boşluk girinti
- Tek tırnak
- Trailing virgüller (ES5)
- 100 karakter satır sınırı

### Test Etme

```bash
# Backend testleri
cd backend
npm test                    # Tüm testleri çalıştır
npm run test:watch          # Watch modu
npm run test:coverage       # Kapsam raporu

# Frontend testleri
cd frontend
npm test                    # Vitest'i çalıştır
npm run test:coverage       # Kapsam raporu
```

## 📖 Dokümantasyon

Kapsamlı dokümantasyon `docs/` dizininde mevcuttur:

- **[API Spesifikasyonları](docs/API_SPECIFICATIONS.md)** - Tam API referansı, Guardian API entegrasyonu
- **[Proje Yapısı](docs/PROJECT_STRUCTURE.md)** - Mimari, SOLID prensipleri, isimlendirme konvansiyonları
- **[Geliştirme Planı](docs/DEVELOPMENT_PLAN.md)** - Branch bazında uygulama kılavuzu
- **[Güvenlik Kılavuzları](docs/SECURITY_GUIDELINES.md)** - OWASP uyumluluğu, güvenlik en iyi uygulamaları
- **[Hata Kodları](docs/ERROR_CODES.md)** - Standartlaştırılmış hata kodu kataloğu
- **[Migration Kılavuzu](docs/MIGRATION_GUIDE.md)** - Veritabanı kurulumu ve migration'lar
- **[Teknoloji Yığını](docs/TECHNOLOGY_STACK.md)** - Teknoloji seçimleri ve gerekçeleri

