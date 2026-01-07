# Kişiselleştirilmiş Haber Akışı Uygulaması

Modern web teknolojileri ve yazılım geliştirme prensipleri kullanılarak geliştirilmiş, kullanıcı odaklı profesyonel bir haber platformu. Bu uygulama, SOLID prensipleri, Clean Code standartları ve OWASP güvenlik en iyi uygulamalarına tam uyum ile geliştirilmiştir.

## 🌐 Canlı Uygulama

**Production URL:** [https://news.mmdincer.com](https://news.mmdincer.com)

> **Not:** Uygulama Render'ın ücretsiz tier'ında deploy edilmiştir. 15 dakika kullanılmadığında uyku moduna geçer ve ilk istekte uyanması 30-60 saniye sürebilir (cold start). Bu normaldir ve ücretsiz tier'ın bir özelliğidir.

## 📖 Hakkında

**Kişiselleştirilmiş Haber Akışı**, kullanıcıların kendi tercihlerine göre haber içeriklerini filtreleyip görüntüleyebildiği, enterprise-grade güvenlik standartlarına sahip full-stack bir web uygulamasıdır. Uygulama, The Guardian API'den gerçek zamanlı haber verilerini çekerek, kullanıcıların seçtikleri 20 farklı kategoriye göre kişiselleştirilmiş bir haber deneyimi sunar.

### 🎯 Temel Özellikler

#### Haber Yönetimi
- **20 Kategori Desteği**: Business, Technology, Science, Sport, Culture, News, World, Politics, Environment, Society, Life & Style, Food, Travel, Fashion, Books, Music, Film, Games, Education, Media
- **Kişiselleştirilmiş Ana Sayfa**: Kullanıcı tercihlerine göre özelleştirilmiş haber akışı
- **Kategori Bazlı Filtreleme**: /news sayfasında kategori seçerek haberleri filtreleme
- **Gelişmiş Arama**: Anahtar kelime ile tam metin arama, tarih aralığı filtreleme
- **Sıralama Seçenekleri**: En yeni, en eski, alakalı sıralama
- **Kayıtlı Haberler**: İlginizi çeken haberleri kaydederek daha sonra okumak üzere saklama
- **Sonsuz Kaydırma**: Sayfanın sonuna gelindiğinde otomatik haber yükleme


#### Kullanıcı Yönetimi
- **Güvenli Kimlik Doğrulama**: JWT tabanlı authentication sistemi (7 gün geçerlilik)
- **Şifre Güvenliği**: bcrypt ile hash'lenmiş şifreler, güçlü şifre validasyonu
- **Profil Yönetimi**: Şifre değiştirme, profil bilgileri görüntüleme
- **Tercih Yönetimi**: Kategori seçimi ve kaydetme

#### Güvenlik ve Performans
- **OWASP Top 10 Uyumluluğu**: Injection, XSS, CSRF koruması
- **Rate Limiting**: Auth (5/15dk), News (100/saat), Genel API (1000/saat)
- **Input Validation**: express-validator ile tüm girdilerin doğrulanması
- **Helmet.js**: HTTP header güvenliği
- **CORS Koruması**: Yapılandırılabilir origin kontrolü
- **Error Logging**: Winston ile kapsamlı loglama sistemi

#### Kullanıcı Deneyimi
- **Responsive Tasarım**: Mobil-first yaklaşım ile tüm cihazlarda mükemmel görünüm
- **Modern UI**: Tailwind CSS ile temiz ve profesyonel arayüz
- **Toast Bildirimleri**: Kullanıcı dostu geri bildirimler
- **Loading States**: Skeleton ekranlar ve yükleme göstergeleri
- **Error Boundary**: Hata yakalama ve kullanıcı dostu hata mesajları

### 🏗️ Mimari ve Yazılım Kalitesi

#### SOLID Prensipleri
- **Single Responsibility**: Her modül tek bir sorumluluğa sahip
- **Open/Closed**: Genişlemeye açık, değişikliğe kapalı yapı
- **Liskov Substitution**: Interface tutarlılığı
- **Interface Segregation**: Odaklı, küçük interface'ler
- **Dependency Inversion**: Dependency injection pattern

#### Katmanlı Mimari
- **Controllers**: HTTP request/response yönetimi
- **Services**: Business logic ve veri işleme
- **Middleware**: Authentication, validation, error handling
- **Utils**: Yardımcı fonksiyonlar ve custom error sınıfları
- **Constants**: Sabit değerler ve enum'lar

#### Teknoloji Yığını
- **Backend**: Node.js + Express.js (RESTful API)
- **Frontend**: React 18 + Vite (Component-based architecture)
- **Veritabanı**: Supabase (PostgreSQL) ile RLS (Row Level Security)
- **API Entegrasyonu**: The Guardian Open Platform API
- **Güvenlik**: JWT, bcrypt, Helmet, express-rate-limit, express-validator
- **Styling**: Tailwind CSS + Typography plugin
- **State Management**: React Context API
- **Form Yönetimi**: React Hook Form
- **Testing**: Jest + Supertest
- **Linting/Formatting**: ESLint + Prettier
- **Deployment**: Docker + Docker Compose, DigitalOcean/Render ready

## 📦 Proje Yapısı

```
personalized-news/
├── backend/                    # Backend API servisi
│   ├── config/                 # Veritabanı ve logger konfigürasyonları
│   ├── constants/              # Sabit değerler (kategoriler, ülkeler)
│   ├── controllers/            # HTTP request/response yönetimi
│   ├── middleware/             # Auth, validation, error handling
│   ├── services/               # Business logic katmanı
│   ├── routes/                 # API endpoint tanımları
│   ├── utils/                  # Yardımcı fonksiyonlar ve error sınıfları
│   ├── database/migrations/    # Veritabanı migration dosyaları
│   ├── tests/                  # Unit ve integration testleri
│   ├── server.js               # Ana uygulama giriş noktası
│   └── package.json
│
├── frontend/                   # React frontend uygulaması
│   ├── src/
│   │   ├── components/         # UI bileşenleri (auth, news, layout, common)
│   │   ├── contexts/           # React Context (Auth, Preferences)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Route-level sayfalar
│   │   ├── services/           # API service katmanı
│   │   ├── utils/              # Yardımcı fonksiyonlar
│   │   ├── config/             # Axios konfigürasyonu
│   │   ├── App.jsx             # Ana uygulama bileşeni
│   │   └── main.jsx            # React DOM render
│   ├── public/                 # Statik dosyalar
│   └── package.json
│
├── docs/                       # Detaylı dokümantasyon
│   ├── API_SPECIFICATIONS.md   # API endpoint detayları
│   ├── DEVELOPMENT_PLAN.md     # Geliştirme planı
│   ├── ERROR_CODES.md          # Hata kodları kataloğu
│   ├── MIGRATION_GUIDE.md      # Veritabanı migration rehberi
│   ├── PROJECT_STRUCTURE.md    # Proje yapısı ve mimari
│   ├── SECURITY_GUIDELINES.md  # Güvenlik standartları
│   ├── TECHNOLOGY_STACK.md     # Teknoloji kararları
│   └── TASKS.md                # Proje gereksinimleri
│
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
└── README.md                   # Bu dosya
```

## 🔧 Detaylı Teknoloji Yığını

### Backend Teknolojileri
- **Runtime**: Node.js 20+
- **Framework**: Express.js 4.x (RESTful API)
- **Veritabanı**: Supabase (PostgreSQL)
- **Kimlik Doğrulama**: JWT (jsonwebtoken 9.x)
- **Şifreleme**: bcrypt 5.x (10 rounds)
- **Validation**: express-validator 7.x, password-validator 5.x
- **Güvenlik**: Helmet 8.x, express-rate-limit 7.x, CORS 2.x
- **HTTP Client**: Axios 1.x (The Guardian API entegrasyonu)
- **Logging**: Winston 3.x
- **Testing**: Jest 29.x + Supertest 6.x
- **Code Quality**: ESLint + Prettier

### Frontend Teknolojileri
- **Framework**: React 18.x
- **Build Tool**: Vite 7.x
- **Routing**: React Router DOM 6.x
- **Styling**: Tailwind CSS 3.x + @tailwindcss/typography
- **Form Yönetimi**: React Hook Form 7.x
- **HTTP Client**: Axios 1.x
- **State Management**: React Context API
- **Notifications**: React Hot Toast 2.x
- **Code Quality**: ESLint 9.x + Prettier 3.x

### DevOps ve Deployment
- **Containerization**: Docker + Docker Compose
- **Production**: DigitalOcean App Platform / Render
- **CI/CD**: Git-based deployment
- **Environment Management**: dotenv

## 📋 Ön Gereksinimler

### Gerekli Yazılımlar
- **Node.js**: 20.x veya üzeri
- **npm**: Node.js ile birlikte gelir
- **Docker**: 20.x veya üzeri (Docker deployment için)
- **Docker Compose**: 2.x veya üzeri (Docker deployment için)
- **Git**: Version control için

### Gerekli Hesaplar ve API Anahtarları
- **Supabase Hesabı**: [supabase.com](https://supabase.com) - PostgreSQL veritabanı için
- **The Guardian API Key**: [open-platform.theguardian.com](https://open-platform.theguardian.com/access) - Haber verisi için

## Supabase Kurulum Rehberi

### 1. Supabase Hesabı Oluşturma

1. [Supabase](https://supabase.com/) web sitesine gidin
2. "Start your project" butonuna tıklayın
3. GitHub, GitLab veya e-posta ile kayıt olun
4. Yeni bir proje oluşturun

### 2. Supabase Proje Kurulumu

1. **Proje Oluşturma:**
   - Dashboard'dan "New Project" butonuna tıklayın
   - Proje adı, veritabanı şifresi ve bölge seçin
   - Proje oluşturulmasını bekleyin (birkaç dakika sürebilir)

2. **API Anahtarlarını Alma:**
   - Proje ayarlarına gidin (Settings → API)
   - `Project URL` değerini kopyalayın (SUPABASE_URL)
   - `service_role` anahtarını kopyalayın (SUPABASE_SERVICE_ROLE_KEY)
   - ⚠️ **Önemli**: `service_role` anahtarı sadece backend'de kullanılmalıdır, frontend'e expose edilmemelidir

3. **Veritabanı Schema Kurulumu:**
   - SQL Editor'e gidin (Dashboard → SQL Editor)
   - `backend/database/migrations/` klasöründeki migration dosyalarını sırayla çalıştırın:
     - `001_create_users_table.sql`
     - `002_create_user_preferences_table.sql`
     - `003_enable_rls_policies.sql`
     - `004_remove_country_column.sql`
     - `005_create_saved_articles_table.sql`
     - `006_update_categories_to_guardian_sections.sql`
     - `007_add_article_details_to_saved_articles.sql`
   - Her migration'ı tek tek çalıştırın ve sonucu kontrol edin
   - Detaylı bilgi için `docs/MIGRATION_GUIDE.md` dosyasına bakın

### 3. Environment Variables Ayarlama

Supabase bilgilerini `.env` dosyanıza ekleyin:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## The Guardian API Anahtarı Alma

1. [The Guardian Open Platform](https://open-platform.theguardian.com/access) sayfasına gidin
2. "Register" butonuna tıklayın
3. Formu doldurun ve kayıt olun
4. E-posta doğrulamasını tamamlayın
5. Dashboard'dan API anahtarınızı kopyalayın
6. `.env` dosyanıza ekleyin:

```env
GUARDIAN_API_KEY=your_guardian_api_key_here
```

**Not:** Ücretsiz tier günlük 500 istek ve saniyede 1 istek limitine sahiptir.

## Docker ile Hızlı Başlangıç

**Önemli**: Devam etmeden önce Docker Desktop'ın çalıştığından emin olun. Bunu terminalinizde `docker ps` komutunu çalıştırarak doğrulayabilirsiniz; hata göstermemelidir.

### 1. Depoyu klonlayın

```bash
git clone https://github.com/mmdincer/personalized-news.git
cd personalized-news
```


### 2. Ortam değişkenlerini ayarlayın

**Kök dizinde** (`docker-compose.yml` ile aynı seviyede) bir `.env` dosyası oluşturun. Bu dosya Docker Compose tarafından otomatik olarak yüklenecektir.

```bash
# Kök dizinde .env dosyası oluşturun
touch .env
```

`.env` dosyanıza aşağıdaki ortam değişkenlerini ekleyin:

```env
# Supabase Yapılandırması
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Yapılandırması
JWT_SECRET=your_jwt_secret_key

# The Guardian API
GUARDIAN_API_KEY=your_guardian_api_key

# CORS Origins (virgülle ayrılmış)
CORS_ORIGINS=http://localhost:5173,http://localhost:80
```

**Önemli**:
- `.env` dosyası kök dizinde olmalıdır (`docker-compose.yml` ile aynı seviyede).
- Bir sonraki adıma geçmeden önce Docker Desktop'ın çalıştığından emin olun.
- Docker'ın çalıştığını doğrulayın: `docker ps` hata göstermemelidir.

### 3. Docker Compose ile derleyin ve çalıştırın

Projenin kök dizininden şu komutu çalıştırın:

```bash
docker-compose up --build
```

Bu komut şunları yapacaktır:
- Hem backend hem de frontend için Docker görüntülerini derler.
- `backend` ve `frontend` servislerini oluşturur ve başlatır.
- Host port `3001`'i backend container port `3000`'e eşler.
- Host port `80`'i frontend container port `80`'e eşler.

### 4. Uygulamaya erişin

Servisler çalıştıktan sonra:
- **Frontend**: Tarayıcınızı açın ve `http://localhost` adresine gidin
- **Backend API**: Backend API, frontend tarafından dahili olarak `http://backend:3000` adresinden ve harici olarak (doğrudan test için) `http://localhost:3001/api` adresinden erişilebilir olacaktır

### 5. Docker servislerini yönetin

- Servisleri arka planda çalıştırmak için (detached mode):
  ```bash
  docker-compose up -d
  ```
- Logları görüntülemek için:
  ```bash
  docker-compose logs -f
  ```
- Servisleri durdurmak için:
  ```bash
  docker-compose down
  ```
- Container'ları, ağları ve volume'ları durdurup kaldırmak için:
  ```bash
  docker-compose down --volumes
  ```

## Yerel Geliştirme (Docker Olmadan)

### Backend Kurulumu

1. **Bağımlılıkları yükleyin**:
   ```bash
   cd backend
   npm install
   ```
2. **Ortam Değişkenleri**: `backend/` dizininde aşağıdaki içeriğe sahip bir `.env` dosyası oluşturun:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_jwt_secret_key
   GUARDIAN_API_KEY=your_guardian_api_key
   PORT=3000
   CORS_ORIGINS=http://localhost:5173
   ```
3. **Migration'ları Çalıştırın**:
   ```bash
   npm run migrate up
   ```
4. **Backend sunucusunu başlatın**:
   ```bash
   npm run dev
   ```
   Backend `http://localhost:3000` adresinde çalışacaktır.

### Frontend Kurulumu

1. **Bağımlılıkları yükleyin**:
   ```bash
   cd frontend
   npm install
   ```
2. **Ortam Değişkenleri**: `frontend/` dizininde aşağıdaki içeriğe sahip bir `.env` dosyası oluşturun:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```
3. **Frontend geliştirme sunucusunu başlatın**:
   ```bash
   npm run dev
   ```
   Frontend `http://localhost:5173` adresinde çalışacaktır.

## Veritabanı Migration'ları

Veritabanı migration'ları SQL dosyaları kullanılarak yönetilir.

- **Migration Dosyaları**: `backend/database/migrations/` klasöründe bulunur
- **İsimlendirme Kuralı**: `XXX_migration_name.sql` (örn: `001_create_users_table.sql`)

**Not:** Migration'lar Supabase SQL Editor'de manuel olarak çalıştırılmalıdır.

## Test Çalıştırma

### Backend Testleri

```bash
cd backend
npm test                    # Tüm testleri çalıştır
npm run test:unit          # Sadece unit testler
npm run test:integration   # Sadece integration testler
npm run test:watch         # Watch mode ile test
```

### Test Coverage

```bash
cd backend
npm test -- --coverage
```

Coverage raporu `backend/coverage/` klasöründe oluşturulur.

## Kod Kalitesi

### Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Formatting

```bash
# Backend
cd backend
npm run format

# Frontend
cd frontend
npm run format
```

## API Dokümantasyonu

Detaylı API endpoint dokümantasyonu için `docs/API_SPECIFICATIONS.md` dosyasına bakın.

## Proje Yapısı

Projenin klasör ve dosya yapısının genel bir bakışı için `docs/PROJECT_STRUCTURE.md` dosyasına bakın.

## Güvenlik Rehberi

Projede uygulanan güvenlik en iyi uygulamaları için `docs/SECURITY_GUIDELINES.md` dosyasına bakın.

## Hata Kodları

Özel hata kodlarının ve anlamlarının listesi için `docs/ERROR_CODES.md` dosyasına bakın.

## Troubleshooting (Sorun Giderme)

### Genel Sorunlar

#### Backend Bağlantı Sorunları

**Sorun:** Backend başlamıyor veya bağlantı hatası alıyorsunuz

**Çözümler:**
- `.env` dosyasının doğru konumda olduğundan emin olun
- Environment değişkenlerinin doğru yazıldığını kontrol edin
- Port 3000'in kullanımda olmadığını kontrol edin: `lsof -ti:3000`
- Backend loglarını kontrol edin: `docker-compose logs backend`

#### Frontend API Bağlantı Sorunları

**Sorun:** Frontend backend'e bağlanamıyor

**Çözümler:**
- `VITE_API_BASE_URL` değişkeninin doğru olduğundan emin olun
- Backend'in çalıştığını kontrol edin
- CORS ayarlarını kontrol edin (`CORS_ORIGINS`)
- Tarayıcı konsolunda hata mesajlarını kontrol edin

#### Supabase Bağlantı Sorunları

**Sorun:** Veritabanı bağlantı hatası

**Çözümler:**
- `SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY` değerlerini kontrol edin
- Supabase projenizin aktif olduğundan emin olun
- Network bağlantınızı kontrol edin
- RLS (Row Level Security) politikalarını kontrol edin

#### Migration Sorunları

**Sorun:** Migration çalıştırılamıyor

**Çözümler:**
- Migration dosyalarının doğru sırayla çalıştırıldığından emin olun
- SQL syntax hatalarını kontrol edin
- Supabase SQL Editor'de migration'ı manuel olarak test edin
- Detaylı bilgi için `docs/MIGRATION_GUIDE.md` dosyasındaki "Troubleshooting" bölümüne bakın

#### Docker Sorunları

**Sorun:** Docker container'ları başlamıyor

**Çözümler:**
- Docker Desktop'ın çalıştığından emin olun: `docker ps`
- Port çakışmalarını kontrol edin (3000, 3001, 80)
- `.env` dosyasının kök dizinde olduğundan emin olun
- Container loglarını kontrol edin: `docker-compose logs`

### Detaylı Troubleshooting

Daha detaylı sorun giderme bilgileri için şu dosyalara bakın:
- **Migration Sorunları:** `docs/MIGRATION_GUIDE.md` - Troubleshooting bölümü
- **Deployment Sorunları:** `docs/DEPLOYMENT.md` - Troubleshooting bölümü
- **Güvenlik Sorunları:** `docs/SECURITY_GUIDELINES.md`
- **Hata Kodları:** `docs/ERROR_CODES.md`

## Geliştirme Planı

Projenin geliştirme yol haritası ve görev takibi için `docs/DEVELOPMENT_PLAN.md` dosyasına bakın.

## Lisans

Bu proje ISC lisansı altında lisanslanmıştır.
