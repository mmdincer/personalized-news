# Kişiselleştirilmiş Haber Akışı Uygulaması

Bu, kullanıcılara kişiselleştirilmiş bir haber akışı sağlamak için tasarlanmış tam yığın (full-stack) bir uygulamadır.

## 🌐 Canlı Uygulama

**Production URL:** [https://news.mmdincer.com](https://news.mmdincer.com)

## 🚀 Ücretsiz Deployment

Uygulamayı **tamamen ücretsiz** olarak deploy etmek için detaylı rehber: **[Ücretsiz Deployment Rehberi](./docs/FREE_DEPLOYMENT_GUIDE.md)**

Bu rehberde şunları öğreneceksiniz:
- Render, Railway, Vercel gibi ücretsiz platformlarda deploy etme
- Backend ve frontend'i ayrı ayrı deploy etme
- Environment variables yapılandırması
- CORS ayarları
- Sorun giderme ipuçları

## Özellikler

- Kullanıcı kimlik doğrulama (kayıt, giriş, çıkış)
- Seçilen kategorilere göre kişiselleştirilmiş haber akışı
- Anahtar kelimeler, tarih aralığı ve sıralama düzenine göre haber makalelerini arama ve filtreleme
- Daha sonra okumak için makaleleri kaydetme
- Kullanıcı profil yönetimi (şifre güncelleme, tercihleri yönetme)
- Çeşitli cihazlar için duyarlı tasarım
- Kolay dağıtım için Docker desteği

## Teknoloji Yığını

**Backend:**
- Node.js (Express.js)
- PostgreSQL (Supabase)
- The Guardian API
- Kimlik doğrulama için JWT
- Şifre hash'leme için bcrypt
- Loglama için Winston
- Test için Jest

**Frontend:**
- React.js (Vite)
- React Router DOM
- Tailwind CSS
- API çağrıları için Axios
- Bildirimler için React Hot Toast

## Ön Gereksinimler

- Node.js 18+ ve npm
- Docker ve Docker Compose (Docker kurulumu için)
- Supabase hesabı ve projesi
- The Guardian API anahtarı

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
git clone <repository-url>
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

Migration'ları çalıştırmak için:
```bash
# Backend dizininden
npm run migrate up   # Tüm bekleyen migration'ları uygula
npm run migrate down # Son migration'ı geri al
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
