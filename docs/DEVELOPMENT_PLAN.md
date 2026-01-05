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
- [x] Tüm klasör yapılarını kur (backend: config/, controllers/, middleware/, routes/, services/, utils/, constants/, database/migrations/; frontend: components/, services/, utils/, contexts/, config/, i18n/, locales/, pages/) - bakınız: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- [x] Backend setup: `package.json`, dependencies, `server.js`, Express.js sunucusu, health check endpoint (`GET /api/health`) - bakınız: [TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md)
- [x] Frontend setup: Vite + React projesi, `package.json`, `vite.config.js`, Tailwind CSS kurulumu ve yapılandırması, dependencies - bakınız: [TECHNOLOGY_STACK.md](./TECHNOLOGY_STACK.md)
- [x] i18n kurulumu: react-i18next paketleri, dil dosyaları yapısı (locales/tr, en, de, fr, es), i18n config, default language: 'tr'
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
- [ ] Database migrations: migration dosyaları oluştur (`001_create_users_table.sql`, `002_create_user_preferences_table.sql`), Supabase SQL Editor'de çalıştır - bakınız: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- [ ] User utilities: bcrypt password hashing, email validation ve uniqueness kontrolü
- [ ] Environment: `.env.example`'a Supabase credentials ekle

### Başarı Kriterleri
- [x] Supabase bağlantısı başarılı (config/database.js oluşturuldu, client library kurulu)
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
- [ ] Auth service: JWT token oluşturma (7 days expiration, user id + email payload), password hash karşılaştırma (bcrypt.compare, 10 salt rounds), password validation rules - bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md)
- [ ] Auth middleware: JWT token doğrulama (`middleware/auth.js`), Authorization header'dan token okuma, user info'yu request'e ekleme, expired token handling
- [ ] Auth endpoints: `POST /api/auth/register` (user insert, password hash, email duplicate check, password validation, sanitized response), `POST /api/auth/login` (user lookup, password compare, JWT token return)
- [ ] Validation middleware: `express-validator` ile email format, password format, input trimming
- [ ] Error handling: standardized error response format, error handling middleware - bakınız: [ERROR_CODES.md](./ERROR_CODES.md)
- [ ] Security: Supabase RLS policies yapılandırma - bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md)

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
- [ ] Constants files: `constants/categories.js` (ALLOWED_CATEGORIES, validation helper, display names mapping), `constants/countries.js` (SUPPORTED_COUNTRIES: tr/us/de/fr/es, validation helper, country-to-language mapping, default: 'tr') - bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md)
- [ ] Preferences endpoints: `GET /api/user/preferences` (Supabase query, JSONB categories + country, default 'tr', JWT user ID), `PUT /api/user/preferences` (upsert, JSONB update, category/country validation, JWT user ID)
- [ ] Validation logic: category validation (ALLOWED_CATEGORIES check, reject invalid, allow empty array, remove duplicates), country validation (must be tr/us/de/fr/es) - bakınız: [ERROR_CODES.md](./ERROR_CODES.md)
- [ ] Default preferences: register endpoint'inde default categories ['general', 'technology'] ve country 'tr' ile preferences insert (atomic operation)
- [ ] Database optimization: parameterized queries (SQL injection prevention), JSONB operators, GIN index on categories (optional)

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
- [ ] News service layer: `services/newsService.js` oluştur (SRP: pure business logic, no HTTP concerns), NewsAPI.org entegrasyonu (axios instance, API key interceptor, 10s timeout, network error handling) - bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md)
- [ ] News fetching logic: kategori bazlı haber çekme (category validation, country parameter from user preferences/default 'tr', pageSize: 20, max 100), user country preference'e göre haber çekme, response normalization
- [ ] News endpoints: `GET /api/news` (genel haberler), `GET /api/news/:category` (kategori bazlı), query parameters (page, limit)
- [ ] Rate limiting: daily request tracking (100/day), per-second limiting (1/second), cached results when limit reached, logging - bakınız: [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md)
- [ ] Error handling ve response transformation: API error handling, response normalization - bakınız: [ERROR_CODES.md](./ERROR_CODES.md), [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md)
- [ ] Configuration: NewsAPI.org API key `.env`'e ekle, CORS yapılandırması, response caching (15 minutes) - bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md)

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
- [ ] API configuration: `config/api.js` (base URL, axios instance, request/response interceptors, token auto-injection)
- [ ] Service layer: auth service (login, register, logout), news service (getNews, getNewsByCategory), preferences service (getPreferences, updatePreferences)
- [ ] Error handling: error handling utilities, error parsing ve display - bakınız: [ERROR_CODES.md](./ERROR_CODES.md)
- [ ] Auth context: `AuthContext.js` ve `AuthProvider` component, login/register/logout fonksiyonları, token storage (`localStorage`), token validation ve auto-logout, protected route wrapper, auth state management (user, isAuthenticated)

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
- [ ] Auth forms: LoginForm ve RegisterForm component'leri (`react-hook-form`), form validation (email, password, confirm password), error message display, loading states, Tailwind CSS styling, success redirect handling - bakınız: [ERROR_CODES.md](./ERROR_CODES.md)
- [ ] Routing: React Router yapılandırması, route tanımlamaları (/, /login, /register, /news, /preferences), protected/public route wrappers entegrasyonu, 404 page
- [ ] Navigation: Header/Navbar component

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
- [ ] News components: NewsFeed ve NewsCard component'leri, kategori bazlı haber filtreleme, loading skeleton, empty/error state handling, responsive grid layout
- [ ] Preferences components: CategorySelector (checkbox/button UI, visual feedback), UserPreferences page component, kullanıcı tercihlerini yükleme ve güncelleme fonksiyonları
- [ ] Country/Language selector: CountrySelector component (5 ülke: tr/us/de/fr/es, bayraklar ve isimler), UI dilini değiştirme (i18n.changeLanguage), country preference backend'e kaydetme, country değiştiğinde haberleri yeniden çekme, loading states
- [ ] i18n entegrasyonu: tüm UI metinlerini translation dosyalarına taşıma, useTranslation hook kullanımı, dil değiştiğinde UI güncelleme, 5 dil dosyası (tr/en/de/fr/es.json)
- [ ] Notifications: success/error notifications (`react-hot-toast`)

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
- [ ] Error handling: global error boundary component (React), backend error response standardizasyonu, frontend error handling utilities, user-friendly error mesajları (multi-language), error logging (`winston`), network error handling - bakınız: [ERROR_CODES.md](./ERROR_CODES.md)
- [ ] Security hardening: backend input validation middleware güçlendirme, frontend form validation iyileştirmeleri, XSS prevention (HTML sanitization, CSP headers), SQL injection prevention (parameterized queries), Supabase RLS policies gözden geçirme, rate limiting middleware (`express-rate-limit`), request size limiting, Supabase connection pool yönetimi, OWASP Top 10 checklist - bakınız: [SECURITY_GUIDELINES.md](./SECURITY_GUIDELINES.md)

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
- [ ] Responsive design: mobile-first CSS (Tailwind), breakpoint yapılandırması (sm/md/lg/xl/2xl), responsive navigation (hamburger menu), responsive news grid, touch-friendly button sizes, mobile form optimizasyonu
- [ ] Environment configuration: production/development ayrımı, `.env.example` güncelleme, environment variable validation, build script optimizasyonu, deployment hazırlığı

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
- [ ] README.md: proje açıklaması, kurulum talimatları, Supabase setup guide (hesap oluşturma, proje kurulumu, database schema), environment setup (Supabase credentials, NewsAPI.org API key), running instructions (dev ve production) - bakınız: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md), [API_SPECIFICATIONS.md](./API_SPECIFICATIONS.md)
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
