# Personalized News Feed - Development Plan

> **Not:** Detaylı bilgiler için ilgili dokümantasyon dosyalarına bakın:
> - [ERROR_CODES.md](./ERROR_CODES.md) - Error code'lar ve mesajlar
> - [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md) - API detayları
> - [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md) - Güvenlik rehberi
> - [TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md) - Teknoloji kararları
> - [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Database migration rehberi

## Branch Strategy

- **feat/**: Yeni özellikler
- **refactor/**: Kod iyileştirmeleri
- **fix/**: Hata düzeltmeleri
- **chore/**: Altyapı ve konfigürasyon
- **docs/**: Dokümantasyon
- **test/**: Test eklemeleri

---

## 1. feat/project-setup

### Görevler
- [ ] Proje kök dizin yapısını oluştur (backend/, frontend/, docs/)
- [ ] Backend klasör yapısını kur (config/, controllers/, middleware/, models/, routes/, services/, database/)
- [ ] Database klasör yapısını kur (`backend/database/migrations/`)
- [ ] Frontend klasör yapısını kur (components/, services/, utils/, contexts/)
- [ ] `.gitignore` dosyasını yapılandır (node_modules, .env, dist, build)
- [ ] Backend `package.json` oluştur ve temel bağımlılıkları ekle (bakınız: [TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md))
- [ ] Backend `server.js` entry point dosyasını oluştur
- [ ] Temel Express.js sunucusunu kur (port dinleme, middleware setup)
- [ ] Frontend Vite ile React projesi oluştur
- [ ] Frontend `package.json` ve `vite.config.js` yapılandırması
- [ ] Tailwind CSS kurulumu ve yapılandırması
- [ ] Frontend bağımlılıkları ekle (bakınız: [TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md))
- [ ] i18n (internationalization) kurulumu (`react-i18next` veya `i18next`)
  - [ ] i18next ve react-i18next paketlerini kur
  - [ ] Dil dosyaları yapısını oluştur (locales/tr, locales/en, locales/de, locales/fr, locales/es)
  - [ ] i18n configuration dosyası oluştur
  - [ ] Default language: 'tr' (Türkçe)
- [ ] `.env.example` dosyası oluştur (backend ve frontend için)
- [ ] Temel health check endpoint'i ekle (`GET /api/health`)
- [ ] Kök dizinde `README.md` şablonu oluştur
- [ ] Git repository'yi initialize et

### Başarı Kriterleri
- [ ] Tüm klasör yapıları oluşturuldu
- [ ] `.gitignore` doğru yapılandırıldı
- [ ] Express sunucusu çalışıyor
- [ ] Vite dev server çalışıyor
- [ ] Health check endpoint'i çalışıyor
- [ ] Environment variables doğru yükleniyor
- [ ] `.env.example` dosyası mevcut ve güncel

---

## 2. feat/backend-database-and-models

### Görevler
- [ ] Supabase hesabı oluştur ve proje kurulumu yap
- [ ] Supabase client library kurulumu (`@supabase/supabase-js`)
- [ ] Supabase connection yapılandırması (`config/database.js`)
- [ ] Supabase client instance oluştur (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Error handling için database connection hatalarını yönet
- [ ] Database migrations klasör yapısını oluştur (`backend/database/migrations/`)
- [ ] Migration dosyası naming convention belirle (bakınız: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md))
- [ ] `001_create_users_table.sql` migration dosyası oluştur (bakınız: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md))
- [ ] `002_create_user_preferences_table.sql` migration dosyası oluştur (bakınız: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md))
- [ ] Migration dosyalarını Supabase SQL Editor'de manuel olarak çalıştır (bakınız: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md))
- [ ] Migration dosyalarını version control'e ekle
- [ ] Password hash için bcrypt entegrasyonu
- [ ] Email validation ve uniqueness kontrolü
- [ ] `.env.example`'a Supabase credentials ekle

### Başarı Kriterleri
- [ ] Supabase bağlantısı başarılı
- [ ] Database migrations klasör yapısı oluşturuldu
- [ ] Tüm migration dosyaları `backend/database/migrations/` klasöründe
- [ ] Migration dosyaları doğru sırayla çalıştırıldı
- [ ] Users tablosu doğru şekilde oluşturuldu
- [ ] User preferences tablosu doğru şekilde oluşturuldu
- [ ] Foreign key constraint çalışıyor
- [ ] Password hash işlemi çalışıyor
- [ ] Email validation ve uniqueness çalışıyor
- [ ] Supabase client başarıyla query yapabiliyor

---

## 3. feat/backend-authentication

### Görevler
- [ ] JWT token oluşturma utility fonksiyonu (`jsonwebtoken`)
  - [ ] Token expiration: 7 days (configurable)
  - [ ] Secret key from environment variable
  - [ ] Include user id and email in payload
- [ ] JWT token doğrulama middleware'i (`middleware/auth.js`)
  - [ ] Verify token from Authorization header (Bearer token)
  - [ ] Attach user info to request object
  - [ ] Handle expired tokens gracefully
- [ ] Password hash karşılaştırma fonksiyonu (bcrypt.compare)
  - [ ] Salt rounds: 10
  - [ ] Async comparison for performance
- [ ] Error handling middleware'i oluştur
- [ ] Password validation rules implementation (bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md))
- [ ] `POST /api/auth/register` endpoint'i oluştur
  - [ ] Supabase'de user insert işlemi
  - [ ] Password hash'leme (bcrypt with 10 salt rounds)
  - [ ] Email duplicate kontrolü (Supabase query)
  - [ ] Password strength validation
  - [ ] Return sanitized user data (no password_hash)
- [ ] `POST /api/auth/login` endpoint'i oluştur
  - [ ] Supabase'den user lookup (email ile)
  - [ ] Password karşılaştırma
  - [ ] JWT token oluşturma ve döndürme
  - [ ] Return user data with token
- [ ] Input validation middleware'i ekle (`express-validator`)
  - [ ] Email format validation (valid email regex)
  - [ ] Password format validation (call password validator)
  - [ ] Trim whitespace from inputs
- [ ] Error response formatlarını standardize et (bakınız: [ERROR_CODES.md](./ERROR_CODES.md))
- [ ] Supabase RLS (Row Level Security) politikalarını yapılandır (bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md))

### Başarı Kriterleri
- [ ] JWT token başarıyla oluşturuluyor ve doğrulanıyor
- [ ] Kullanıcı kaydı Supabase'e başarıyla yazılıyor
- [ ] Login işlemi token döndürüyor
- [ ] Protected route'lar korunuyor
- [ ] Validation hataları uygun şekilde döndürülüyor (bakınız: [ERROR_CODES.md](./ERROR_CODES.md))
- [ ] Password güvenli şekilde hash'leniyor
- [ ] Supabase query'leri doğru çalışıyor

---

## 4. feat/backend-user-preferences

### Görevler
- [ ] Category constants file oluştur (`constants/categories.js`)
  - [ ] ALLOWED_CATEGORIES array tanımla (bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md))
  - [ ] Category validation helper function
  - [ ] Category display names mapping (multi-language support)
- [ ] Country/Language constants file oluştur (`constants/countries.js`)
  - [ ] SUPPORTED_COUNTRIES array tanımla (tr, us, de, fr, es) (bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md))
  - [ ] Country validation helper function
  - [ ] Country to language mapping
  - [ ] Default country: 'tr'
- [ ] `GET /api/user/preferences` endpoint'i oluştur (protected)
  - [ ] Supabase'den user preferences sorgusu (user_id ile)
  - [ ] JSONB categories array döndürme
  - [ ] Country field döndürme (default: 'tr')
  - [ ] Empty array döndür eğer preferences yoksa
  - [ ] User ID from JWT token
- [ ] `PUT /api/user/preferences` endpoint'i oluştur (protected)
  - [ ] Supabase upsert işlemi (INSERT ... ON CONFLICT UPDATE)
  - [ ] JSONB array update işlemi
  - [ ] Country field update işlemi
  - [ ] Validate all categories before update
  - [ ] Validate country (must be one of: tr, us, de, fr, es)
  - [ ] User ID from JWT token
- [ ] Kategori validation (sadece izin verilen kategoriler)
  - [ ] Check each category against ALLOWED_CATEGORIES
  - [ ] Reject invalid categories with error code (bakınız: [ERROR_CODES.md](./ERROR_CODES.md))
  - [ ] Allow empty array (user wants no categories)
  - [ ] Remove duplicates from input
- [ ] User preferences update logic (Supabase query)
  - [ ] Use parameterized queries (SQL injection prevention)
  - [ ] Handle concurrent updates gracefully
- [ ] Default preferences atama (kayıt sırasında)
  - [ ] Register endpoint'inde default categories ile preferences insert
  - [ ] Default categories: ['general', 'technology'] (recommended categories)
  - [ ] Default country: 'tr' (Türkiye - Türkçe)
  - [ ] Transaction: user insert + preferences insert (atomic operation)
- [ ] Supabase JSONB query optimizasyonu
  - [ ] Use JSONB operators for efficient queries
  - [ ] Add GIN index on categories column (optional, for search)

### Başarı Kriterleri
- [ ] Kullanıcı tercihleri Supabase'den okunabiliyor
- [ ] Tercihler Supabase'de güncellenebiliyor
- [ ] Sadece 7 geçerli kategori kabul ediliyor (bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md))
- [ ] Default preferences yeni kullanıcılara atanıyor (general, technology, country: 'tr')
- [ ] Country field doğru şekilde kaydediliyor ve okunuyor
- [ ] Sadece 5 geçerli ülke kabul ediliyor (tr, us, de, fr, es)
- [ ] JSONB array işlemleri doğru çalışıyor
- [ ] Invalid kategoriler reddediliyor
- [ ] Duplicate kategoriler otomatik temizleniyor
- [ ] Invalid country kodları reddediliyor

---

## 5. feat/backend-news-api

### Görevler
- [ ] NewsAPI.org API key'i `.env`'e ekle (bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md))
- [ ] News service layer oluştur (`services/newsService.js`)
  - [ ] Separate service from controller (SRP - Single Responsibility)
  - [ ] Pure business logic, no HTTP concerns
  - [ ] Reusable functions for different controllers
- [ ] NewsAPI.org entegrasyonu (`axios` kullanarak) (bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md))
  - [ ] Create axios instance with base URL
  - [ ] Add API key to all requests (interceptor or config)
  - [ ] Set timeout: 10 seconds
  - [ ] Handle network errors gracefully
- [ ] Kategori bazlı haber çekme fonksiyonu
  - [ ] Validate category against ALLOWED_CATEGORIES
  - [ ] Country parametresi ekle (user preferences'ten veya default: 'tr')
  - [ ] Default country: 'tr' (Türkiye - Türkçe)
  - [ ] Default pageSize: 20 (configurable, max 100)
  - [ ] Map NewsAPI response to normalized format (bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md))
- [ ] User country preference'ine göre haber çekme
  - [ ] Kullanıcı country preference'ini al
  - [ ] NewsAPI.org'a country parametresi ile istek gönder
  - [ ] Eğer user country preference yoksa default 'tr' kullan
- [ ] API rate limiting kontrolü (bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md))
  - [ ] Track daily request count (100/day limit)
  - [ ] Implement per-second rate limiting (1/second)
  - [ ] Return cached results when limit reached
  - [ ] Log rate limit warnings
- [ ] Error handling (API hataları için) (bakınız: [ERROR_CODES.md](./ERROR_CODES.md))
- [ ] Response transformation (API response'unu normalize et) (bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md))
- [ ] `GET /api/news` endpoint'i oluştur (genel haberler)
- [ ] `GET /api/news/:category` endpoint'i oluştur
- [ ] Query parameters desteği (page, limit)
- [ ] CORS yapılandırması (bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md))
- [ ] Response caching stratejisi (opsiyonel) (bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md))

### Başarı Kriterleri
- [ ] NewsAPI.org'dan haberler çekiliyor
- [ ] 7 kategori filtreleme çalışıyor (bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md))
- [ ] Country parametresi ile haberler çekiliyor (user preference'e göre)
- [ ] Default country 'tr' kullanılıyor (eğer user preference yoksa)
- [ ] API key güvenli şekilde yönetiliyor (sadece backend'de)
- [ ] Haberler normalize edilmiş formatta döndürülüyor
- [ ] Pagination çalışıyor (page, limit)
- [ ] CORS doğru yapılandırıldı (Vite dev server için)
- [ ] Rate limiting kontrolleri aktif (100/day, 1/second)
- [ ] API hataları uygun şekilde handle ediliyor
- [ ] Response caching çalışıyor (15 dakika)

---

## 6. feat/frontend-api-and-auth

### Görevler
- [ ] API base URL yapılandırması (`config/api.js`)
- [ ] Axios instance oluştur ve interceptors ekle
- [ ] Auth service fonksiyonları (login, register, logout)
- [ ] News service fonksiyonları (getNews, getNewsByCategory)
- [ ] User service fonksiyonları (getPreferences, updatePreferences)
- [ ] Error handling utility fonksiyonları (bakınız: [ERROR_CODES.md](./ERROR_CODES.md))
- [ ] Token storage yönetimi (`localStorage` kullanarak)
- [ ] AuthContext oluştur (`contexts/AuthContext.js`)
- [ ] AuthProvider component'i oluştur
- [ ] Login, register, logout fonksiyonları
- [ ] Token validation ve auto-logout (token expire)
- [ ] Protected route wrapper component'i
- [ ] Auth state management (user bilgileri, isAuthenticated)

### Başarı Kriterleri
- [ ] API çağrıları başarıyla yapılıyor
- [ ] Token otomatik olarak header'a ekleniyor
- [ ] Auth state global olarak yönetiliyor
- [ ] Login/logout işlemleri çalışıyor
- [ ] Protected route'lar korunuyor
- [ ] Token expire kontrolü çalışıyor

---

## 7. feat/frontend-auth-and-routing

### Görevler
- [ ] Login form component'i oluştur (`react-hook-form` kullanarak)
- [ ] Register form component'i oluştur (`react-hook-form` kullanarak)
- [ ] Form validation (`react-hook-form` ile email, password, confirm password validation)
- [ ] Error message display (bakınız: [ERROR_CODES.md](./ERROR_CODES.md))
- [ ] Loading states
- [ ] Form styling (Tailwind CSS ile modern ve kullanıcı dostu)
- [ ] Success redirect handling
- [ ] React Router yapılandırması
- [ ] Route tanımlamaları (/, /login, /register, /news, /preferences)
- [ ] Protected route wrapper'ı entegre et
- [ ] Public route wrapper'ı (login/register için)
- [ ] 404 page oluştur
- [ ] Navigation component'i (Header/Navbar)

### Başarı Kriterleri
- [ ] Form validation çalışıyor
- [ ] Login/register formları çalışıyor
- [ ] Tüm route'lar çalışıyor
- [ ] Protected route'lar korunuyor
- [ ] 404 page gösteriliyor
- [ ] Navigation entegre edildi

---

## 8. feat/frontend-news-and-preferences

### Görevler
- [ ] NewsFeed component'i oluştur
- [ ] NewsCard component'i oluştur
- [ ] Kategori bazlı haber filtreleme
- [ ] Loading skeleton/placeholder
- [ ] Empty state handling
- [ ] Error state handling
- [ ] Responsive grid layout
- [ ] CategorySelector component'i oluştur
- [ ] Kategori checkbox/button UI
- [ ] Kullanıcı tercihlerini yükleme
- [ ] Tercih güncelleme fonksiyonu
- [ ] Visual feedback (seçili kategoriler)
- [ ] UserPreferences page component'i oluştur
- [ ] Country/Language selector component'i oluştur
  - [ ] 5 ülke seçeneği (tr, us, de, fr, es)
  - [ ] Ülke bayrakları ve isimleri göster
  - [ ] Seçilen ülkeye göre UI dilini değiştir (i18n.changeLanguage)
  - [ ] Country preference'i backend'e kaydet
  - [ ] Country değiştiğinde haberleri yeniden çek (yeni ülkeden)
  - [ ] Loading state göster (dil değişimi ve haber yükleme sırasında)
- [ ] i18n entegrasyonu
  - [ ] Tüm UI metinlerini translation dosyalarına taşı
  - [ ] useTranslation hook kullanımı
  - [ ] Dil değiştiğinde UI'ı güncelle
  - [ ] 5 dil dosyası oluştur (tr.json, en.json, de.json, fr.json, es.json)
- [ ] Success/error notifications (`react-hot-toast` kullanarak)

### Başarı Kriterleri
- [ ] Haberler başarıyla gösteriliyor
- [ ] Kategori filtreleme çalışıyor
- [ ] Kullanıcı tercihleri yükleniyor ve güncellenebiliyor
- [ ] Country/Language seçimi çalışıyor
- [ ] UI dili seçilen ülkeye göre değişiyor (5 dil desteği)
- [ ] Haberler seçilen ülkeye göre çekiliyor
- [ ] Loading, empty ve error states handle ediliyor
- [ ] Tercihler kaydediliyor
- [ ] Bildirimler gösteriliyor (seçilen dile göre)
- [ ] Tüm UI metinleri çevrilmiş (tr, en, de, fr, es)

---

## 9. refactor/security-and-error-handling

### Görevler

#### Error Handling
- [ ] Global error boundary component (React)
- [ ] Backend error response standardizasyonu (bakınız: [ERROR_CODES.md](./ERROR_CODES.md))
- [ ] Frontend error handling utility'leri (bakınız: [ERROR_CODES.md](./ERROR_CODES.md))
- [ ] User-friendly error mesajları (bakınız: [ERROR_CODES.md](./ERROR_CODES.md))
- [ ] Error logging (`winston` kütüphanesi ile)
- [ ] Network error handling

#### Security Hardening
- [ ] Backend input validation middleware'i güçlendir (bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md))
- [ ] Frontend form validation iyileştirmeleri
- [ ] XSS prevention kontrolleri (bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md))
- [ ] SQL injection prevention (bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md))
- [ ] Supabase RLS (Row Level Security) politikalarını gözden geçir (bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md))
- [ ] Rate limiting middleware'i (`express-rate-limit` kullanarak) (bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md))
- [ ] Request size limiting (bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md))
- [ ] Supabase connection pool yönetimi
- [ ] OWASP Top 10 checklist tamamla (bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md))

### Başarı Kriterleri
- [ ] Error boundary çalışıyor ve kullanıcı dostu mesajlar gösteriyor
- [ ] Tüm error'lar standardize edilmiş formatta döndürülüyor
- [ ] Error codes catalog'da tanımlı ve tutarlı (bakınız: [ERROR_CODES.md](./ERROR_CODES.md))
- [ ] Multi-language error messages kullanıcı dostu ve actionable (5 dil: tr, en, de, fr, es)
- [ ] Error mesajları seçilen dile göre gösteriliyor
- [ ] Winston logging aktif (error.log, combined.log)
- [ ] Tüm input'lar validate ediliyor (frontend ve backend)
- [ ] XSS koruması aktif (HTML sanitization, CSP headers)
- [ ] SQL injection koruması aktif (Supabase parameterized queries)
- [ ] Supabase RLS policies aktif ve test edildi
- [ ] Rate limiting aktif (bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md))
- [ ] Request size limiting aktif
- [ ] Network hataları handle ediliyor (offline detection, retry)
- [ ] Supabase connection errors handle ediliyor (retry logic)
- [ ] OWASP Top 10 kontrolleri tamamlandı

---

## 10. feat/responsive-and-config

### Görevler
- [ ] Mobile-first CSS yaklaşımı (Tailwind CSS ile)
- [ ] Tailwind CSS breakpoint'lerini yapılandır (sm, md, lg, xl, 2xl)
- [ ] Responsive navigation (hamburger menu)
- [ ] Responsive news grid
- [ ] Touch-friendly button sizes
- [ ] Mobile form optimizasyonu
- [ ] Production ve development environment ayrımı
- [ ] `.env.example` dosyasını güncelle
- [ ] Environment variable validation
- [ ] Build script'leri optimize et
- [ ] Deployment hazırlığı

### Başarı Kriterleri
- [ ] Mobil cihazlarda düzgün görünüyor
- [ ] Tablet görünümü optimize edildi
- [ ] Touch interactions çalışıyor
- [ ] Environment'lar doğru yapılandırıldı
- [ ] Build işlemleri başarılı
- [ ] Production hazır

---

## 11. docs/readme-documentation

### Görevler
- [ ] Proje açıklaması
- [ ] Kurulum talimatları
- [ ] Supabase setup guide (hesap oluşturma, proje kurulumu)
- [ ] Database migration dosyaları kurulum adımları (bakınız: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md))
- [ ] Supabase database schema kurulum adımları
- [ ] Environment setup guide (Supabase credentials)
- [ ] NewsAPI.org API key configuration steps (bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md))
- [ ] Running instructions (dev ve production)
- [ ] Technology stack documentation (bakınız: [TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md))
- [ ] API endpoint documentation (bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md))
- [ ] Supabase connection troubleshooting
- [ ] Migration dosyaları troubleshooting (bakınız: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md))
- [ ] Troubleshooting section

### Başarı Kriterleri
- [ ] README.md kapsamlı ve anlaşılır
- [ ] Tüm kurulum adımları mevcut (Supabase dahil)
- [ ] Supabase setup adımları açıkça belirtilmiş
- [ ] API dokümantasyonu eksiksiz
- [ ] Troubleshooting guide hazır

---

## 12. test/integration-tests (Opsiyonel)

### Görevler
- [ ] Jest test framework kurulumu (bakınız: [TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md))
- [ ] Backend API endpoint testleri (Jest ve Supertest ile)
- [ ] Auth flow testleri
- [ ] News API integration testleri
- [ ] User preferences testleri
- [ ] Error scenario testleri

### Başarı Kriterleri
- [ ] Tüm kritik endpoint'ler test edildi
- [ ] Test coverage %70+ (hedef)
- [ ] Test'ler CI/CD'ye entegre edilebilir

---

## 13. fix/bug-fixes-and-polish

### Görevler
- [ ] Kullanıcı testleri sonrası bug fix'ler
- [ ] Performance optimizasyonları
- [ ] UI/UX iyileştirmeleri
- [ ] Code cleanup ve refactoring
- [ ] Console.log'ları temizle
- [ ] Final security audit (bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md))

### Başarı Kriterleri
- [ ] Kritik bug'lar düzeltildi
- [ ] Performance kabul edilebilir seviyede
- [ ] Code quality standartlarına uygun
- [ ] Security audit tamamlandı

---

## Branch Merge Sırası (Önerilen)

1. feat/project-setup → main
2. feat/backend-database-and-models → main
3. feat/backend-authentication → main
4. feat/backend-user-preferences → main
5. feat/backend-news-api → main
6. feat/frontend-api-and-auth → main
7. feat/frontend-auth-and-routing → main
8. feat/frontend-news-and-preferences → main
9. refactor/security-and-error-handling → main
10. feat/responsive-and-config → main
11. docs/readme-documentation → main
12. test/integration-tests → main (opsiyonel)
13. fix/bug-fixes-and-polish → main

---

## Notlar

- Her branch merge'den önce code review yapılmalı
- Her branch'te anlamlı commit mesajları kullanılmalı
- Her branch'te `.env` dosyası commit edilmemeli
- Her branch'te linter ve formatter çalıştırılmalı
- Kritik branch'lerde (auth, security) ekstra dikkat gösterilmeli
- Her branch mümkün olduğunca küçük ve odaklı tutulmalı, ancak mantıklı birleştirmeler yapılabilir

### Teknoloji Stack

Detaylı teknoloji kararları için bakınız: [TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md)

### Supabase Notları

- Supabase Service Role Key sadece backend'de kullanılmalı, frontend'e expose edilmemeli
- Supabase Anon Key frontend'de kullanılabilir (eğer Supabase Auth kullanılırsa)
- Database schema değişiklikleri için migration dosyaları kullanılmalı (bakınız: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md))
- Supabase dashboard'dan SQL editor ile de schema oluşturulabilir
- RLS (Row Level Security) politikaları production'da aktif edilmeli (bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md))
- Supabase connection string `.env` dosyasında güvenli şekilde saklanmalı

### Database Migration Notları

Detaylı migration rehberi için bakınız: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

- Tüm migration dosyaları `backend/database/migrations/` klasöründe tutulmalı
- Migration dosyaları sıralı numaralandırılmalı (001_, 002_, vb.)
- Her migration dosyası tek bir değişiklik yapmalı (single responsibility)
- Migration dosyaları SQL formatında olmalı
- Migration dosyaları version control'e commit edilmeli
- Yeni migration eklerken mevcut migration'ları değiştirmemeli (yeni dosya oluştur)
- Migration dosyaları Supabase SQL Editor'de manuel olarak çalıştırılmalı (sırayla)
