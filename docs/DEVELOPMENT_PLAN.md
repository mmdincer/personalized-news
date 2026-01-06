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
- [x] Proje kök dizin yapısını oluştur (backend/, frontend/, docs/)
- [x] Tüm klasör yapılarını kur (backend: config/, controllers/, middleware/, routes/, services/, utils/, constants/, database/migrations/; frontend: components/, services/, utils/, contexts/, config/, pages/) - bakınız: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- [x] Backend setup: `package.json`, dependencies, `server.js`, Express.js sunucusu, health check endpoint (`GET /api/health`) - bakınız: [TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md)
- [x] Frontend setup: Vite + React projesi, `package.json`, `vite.config.js`, Tailwind CSS kurulumu ve yapılandırması, dependencies - bakınız: [TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md)
- [x] Konfigürasyon dosyaları: `.gitignore`, `.env.example` (backend ve frontend), ESLint, Prettier

### Başarı Kriterleri
- [x] Tüm klasör yapıları oluşturuldu
- [x] `.gitignore` doğru yapılandırıldı
- [x] Express sunucusu çalışıyor
- [x] Vite dev server çalışıyor
- [x] Health check endpoint'i çalışıyor
- [x] Environment variables doğru yükleniyor
- [x] `.env.example` dosyası mevcut ve güncel

---

## 2. feat/backend-database-and-models

### Görevler
- [x] Supabase setup: proje kurulumu, client library (`@supabase/supabase-js`), connection yapılandırması (`config/database.js`), error handling
- [x] Database migrations: migration dosyaları oluştur (`001_create_users_table.sql`, `002_create_user_preferences_table.sql`), Supabase SQL Editor'de çalıştır - bakınız: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- [x] User utilities: bcrypt password hashing, email validation ve uniqueness kontrolü

### Başarı Kriterleri
- [x] Supabase bağlantısı başarılı (config/database.js oluşturuldu, client library kurulu)
- [x] Database migrations klasör yapısı oluşturuldu
- [x] Tüm migration dosyaları `backend/database/migrations/` klasöründe
- [x] Migration dosyaları doğru sırayla çalıştırıldı
- [x] Users tablosu doğru şekilde oluşturuldu
- [x] User preferences tablosu doğru şekilde oluşturuldu
- [x] Foreign key constraint çalışıyor
- [x] Password hash işlemi çalışıyor (utils/password.js: hashPassword, comparePassword, 10 salt rounds)
- [x] Email validation ve uniqueness çalışıyor (utils/email.js: isValidEmailFormat, isEmailUnique, validateEmail)

---

## 3. feat/backend-authentication

### Görevler
- [x] Auth service: JWT token oluşturma (7 days expiration, user id + email payload), password hash karşılaştırma (bcrypt.compare, 10 salt rounds), password validation rules - bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md)
- [x] Auth middleware: JWT token doğrulama (`middleware/auth.js`), Authorization header'dan token okuma, user info'yu request'e ekleme, expired token handling
- [x] Auth endpoints: `POST /api/auth/register` (user insert with name, email, password hash, email duplicate check, password validation, sanitized response), `POST /api/auth/login` (user lookup, password compare, JWT token return)
- [x] Validation middleware: `express-validator` ile name validation (required, min length, max length), email format, password format, input trimming
- [x] Error handling: standardized error response format, error handling middleware - bakınız: [ERROR_CODES.md](./ERROR_CODES.md)
- [x] Security: Supabase RLS policies yapılandırma - bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md), [RLS_POLICIES.md](./RLS_POLICIES.md)

### Başarı Kriterleri
- [x] JWT token başarıyla oluşturuluyor ve doğrulanıyor
- [x] Kullanıcı kaydı Supabase'e başarıyla yazılıyor
- [x] Login işlemi token döndürüyor
- [x] Protected route'lar korunuyor
- [x] Validation hataları uygun şekilde döndürülüyor (bakınız: [ERROR_CODES.md](./ERROR_CODES.md))
- [x] Password güvenli şekilde hash'leniyor
- [x] Supabase query'leri doğru çalışıyor

---

## 4. feat/backend-user-preferences

### Görevler
- [x] Constants files: `constants/categories.js` (ALLOWED_CATEGORIES, validation helper, display names mapping) - bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md)
- [x] Preferences endpoints: `GET /api/user/preferences` (Supabase query, JSONB categories, JWT user ID), `PUT /api/user/preferences` (upsert, JSONB update, category validation, JWT user ID)
- [x] Validation logic: category validation (ALLOWED_CATEGORIES check, reject invalid, reject empty array, remove duplicates) - bakınız: [ERROR_CODES.md](./ERROR_CODES.md)
- [x] Default preferences: register endpoint'inde default categories ['general', 'technology'] ile preferences insert (atomic operation - preferences oluşturulamazsa user silinir)
- [x] Database optimization: parameterized queries (SQL injection prevention), JSONB operators, GIN index on categories (optional)

### Başarı Kriterleri
- [x] Kullanıcı tercihleri Supabase'den okunabiliyor (Terminal testi geçti)
- [x] Tercihler Supabase'de güncellenebiliyor (Terminal testi geçti)
- [x] Sadece 7 geçerli kategori kabul ediliyor (bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md)) (Terminal testi geçti)
- [x] Default preferences yeni kullanıcılara atanıyor (general, technology) (Terminal testi geçti)
- [x] JSONB array işlemleri doğru çalışıyor (Terminal testi geçti)
- [x] Invalid kategoriler reddediliyor (Terminal testi geçti)
- [x] Duplicate kategoriler otomatik temizleniyor (Terminal testi geçti)
- [x] **Manuel Kontroller:** Supabase Dashboard ve SQL Editor kontrolleri - bakınız: [MANUAL_TEST_CHECKLIST.md](./MANUAL_TEST_CHECKLIST.md)

---

## 5. feat/backend-news-api

### Görevler
- [x] News service layer: `services/newsService.js` oluştur (SRP: pure business logic, no HTTP concerns), The Guardian API entegrasyonu (axios instance, API key interceptor, 10s timeout, network error handling) - bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md)
- [x] News fetching logic: kategori bazlı haber çekme (category validation, pageSize: 20, max 100), response normalization
- [x] News endpoints: `GET /api/news` (genel haberler), `GET /api/news/:category` (kategori bazlı), query parameters (page, limit)
- [x] Rate limiting: daily request tracking (100/day), per-second limiting (1/second), cached results when limit reached, logging - bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md) 
- [x] Error handling ve response transformation: API error handling, response normalization - bakınız: [ERROR_CODES.md](./ERROR_CODES.md), [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md) 
- [x] Configuration: CORS yapılandırması, response caching (15 minutes) - bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md) 

### Başarı Kriterleri
- [x] The Guardian API'den haberler çekiliyor ✅ (Kategori mapping ile test edildi, gerçek haberler geliyor)
- [x] 7 kategori filtreleme çalışıyor (bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md)) ✅ (Tüm kategoriler test edildi)
- [x] API key güvenli şekilde yönetiliyor (sadece backend'de) ✅ (Kod kontrolü geçti, manuel test gerekli - bakınız: [MANUAL_TEST_NEWS_API.md](./MANUAL_TEST_NEWS_API.md))
- [x] Haberler normalize edilmiş formatta döndürülüyor ✅ (API_SPECIFICATIONS.md formatına tam uyumlu, tüm fields mevcut)
- [x] Pagination çalışıyor (page, limit) ✅ (Test edildi ve çalışıyor)
- [x] CORS doğru yapılandırıldı (Vite dev server için) ✅ (Headers doğru, browser testi gerekli - bakınız: [MANUAL_TEST_NEWS_API.md](./MANUAL_TEST_NEWS_API.md))
- [x] Rate limiting kontrolleri aktif (100/day, 1/second) ✅ (Stats çalışıyor, per-second limit çalışıyor, manuel test gerekli - bakınız: [MANUAL_TEST_NEWS_API.md](./MANUAL_TEST_NEWS_API.md))
- [x] API hataları uygun şekilde handle ediliyor ✅ (Validation errors test edildi)
- [x] Response caching çalışıyor (15 dakika) ✅ (Cache hit/miss test edildi)

---

## 6. feat/frontend-api-and-auth

### Görevler
- [x] API configuration: `config/api.js` (base URL, axios instance, request/response interceptors, token auto-injection)
- [x] Service layer: auth service (login, register, logout), news service (getNews, getNewsByCategory), preferences service (getPreferences, updatePreferences)
- [x] Error handling: error handling utilities, error parsing ve display - bakınız: [ERROR_CODES.md](./ERROR_CODES.md)
- [x] Auth context: `AuthContext.jsx` ve `AuthProvider` component, login/register/logout fonksiyonları, token storage (`localStorage`), token validation ve auto-logout, protected route wrapper, auth state management (user, isAuthenticated)

### Başarı Kriterleri
- [x] API çağrıları başarıyla yapılıyor
- [x] Token otomatik olarak header'a ekleniyor
- [x] Auth state global olarak yönetiliyor
- [x] Login/logout işlemleri çalışıyor
- [x] Protected route'lar korunuyor
- [x] Token expire kontrolü çalışıyor

---

## 7. feat/frontend-auth-and-routing

### Görevler
- [x] Auth forms: LoginForm ve RegisterForm component'leri (`react-hook-form`), form validation (RegisterForm: name, email, password, confirm password; LoginForm: email, password), error message display, loading states, Tailwind CSS styling, success redirect handling - bakınız: [ERROR_CODES.md](./ERROR_CODES.md)
- [x] Routing: React Router yapılandırması, route tanımlamaları (/, /login, /register, /news, /preferences), protected/public route wrappers entegrasyonu, 404 page
- [x] Navigation: Header/Navbar component

### Başarı Kriterleri
- [x] Form validation çalışıyor
- [x] Login/register formları çalışıyor
- [x] Tüm route'lar çalışıyor
- [x] Protected route'lar korunuyor
- [x] 404 page gösteriliyor
- [x] Navigation entegre edildi

---

## 8. feat/frontend-news-and-preferences

### Görevler
- [x] News components: NewsFeed ve NewsCard component'leri, kategori bazlı haber filtreleme (NewsPage'de aktif, HomePage'de devre dışı), loading skeleton, empty/error state handling, responsive grid layout
- [x] Preferences components: CategorySelector (checkbox/button UI, visual feedback), UserPreferences page component, kullanıcı tercihlerini yükleme ve güncelleme fonksiyonları
- [x] Notifications: success/error notifications (`react-hot-toast`)
- [x] HomePage: Sadece kullanıcı preferences'larına göre haberler gösterilir, kategori filtreleme yok
- [x] NewsPage: Kategori filtreleme aktif, kullanıcı istediği kategoriyi seçebilir

### Başarı Kriterleri
- [x] Haberler başarıyla gösteriliyor
- [x] Kategori filtreleme çalışıyor
- [x] Kullanıcı tercihleri yükleniyor ve güncellenebiliyor
- [x] Loading, empty ve error states handle ediliyor
- [x] Tercihler kaydediliyor
- [x] Bildirimler gösteriliyor

---

## 9. refactor/security-and-error-handling

### Görevler
- [x] Error handling: global error boundary component (React), backend error response standardizasyonu, frontend error handling utilities, user-friendly error mesajları (English), error logging (`winston`), network error handling - bakınız: [ERROR_CODES.md](./ERROR_CODES.md)
- [x] Security hardening: backend input validation middleware güçlendirme, frontend form validation iyileştirmeleri, XSS prevention (HTML sanitization, CSP headers), SQL injection prevention (parameterized queries), Supabase RLS policies gözden geçirme, rate limiting middleware (`express-rate-limit`), request size limiting, Supabase connection pool yönetimi, OWASP Top 10 checklist - bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md)

### Başarı Kriterleri
- [x] Error boundary çalışıyor ve kullanıcı dostu mesajlar gösteriyor
- [x] Tüm error'lar standardize edilmiş formatta döndürülüyor
- [x] Error codes catalog'da tanımlı ve tutarlı (bakınız: [ERROR_CODES.md](./ERROR_CODES.md))
- [x] Winston logging aktif (error.log, combined.log)
- [x] Tüm input'lar validate ediliyor (frontend ve backend)
- [x] XSS koruması aktif (HTML sanitization, CSP headers)
- [x] SQL injection koruması aktif (Supabase parameterized queries)
- [x] Supabase RLS policies aktif ve test edildi
- [x] Rate limiting aktif (bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md))
- [x] Request size limiting aktif
- [x] Network hataları handle ediliyor (offline detection, retry)
- [x] Supabase connection errors handle ediliyor (retry logic)
- [x] OWASP Top 10 kontrolleri tamamlandı

---

## 10. feat/responsive-and-config

### Görevler
- [x] Responsive design: mobile-first CSS (Tailwind), breakpoint yapılandırması (sm/md/lg/xl/2xl), responsive navigation (hamburger menu), responsive news grid, touch-friendly button sizes, mobile form optimizasyonu
- [x] Environment configuration: production/development ayrımı, `.env.example` güncelleme, environment variable validation, build script optimizasyonu, deployment hazırlığı

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
- [ ] README.md: proje açıklaması, kurulum talimatları, Supabase setup guide (hesap oluşturma, proje kurulumu, database schema), environment setup (Supabase credentials, The Guardian API key), running instructions (dev ve production) - bakınız: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md), [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md)
- [ ] Documentation: technology stack documentation, API endpoint documentation, Supabase connection troubleshooting, migration troubleshooting, genel troubleshooting section - bakınız: [TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md), [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md), [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

### Başarı Kriterleri
- [ ] README.md kapsamlı ve anlaşılır
- [ ] Tüm kurulum adımları mevcut (Supabase dahil)
- [ ] Supabase setup adımları açıkça belirtilmiş
- [ ] API dokümantasyonu eksiksiz
- [ ] Troubleshooting guide hazır

---

## 12. test/integration-tests (Opsiyonel)

### Görevler
- [ ] Test setup: Jest test framework kurulumu - bakınız: [TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md)
- [ ] Test implementation: backend API endpoint testleri (Jest + Supertest), auth flow testleri, news API integration testleri, user preferences testleri, error scenario testleri

### Başarı Kriterleri
- [ ] Tüm kritik endpoint'ler test edildi
- [ ] Test coverage %70+ (hedef)
- [ ] Test'ler CI/CD'ye entegre edilebilir

---

## 13. fix/bug-fixes-and-polish

### Görevler
- [ ] Bug fixes: kullanıcı testleri sonrası bug fix'ler
- [ ] Optimization: performance optimizasyonları, code cleanup ve refactoring, console.log temizleme
- [ ] Polish: UI/UX iyileştirmeleri, final security audit - bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md)

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
