# Database Migration Guide

Bu dosya database migration dosyalarının yönetimi ve kullanımı hakkında bilgi içerir.

## Migration Dosya Yapısı

### Klasör Yapısı

```
backend/
└── database/
    └── migrations/
        ├── 001_create_users_table.sql
        ├── 002_create_user_preferences_table.sql
        ├── 003_enable_rls_policies.sql (optional)
        ├── 004_remove_country_column.sql
        ├── 005_create_saved_articles_table.sql
        ├── 006_create_reading_history_table.sql (henüz oluşturulmadı)
        ├── 007_update_categories_to_guardian_sections.sql
        └── 008_add_article_details_to_saved_articles.sql
```

### Naming Convention

Migration dosyaları sıralı numaralandırılmalı:

- `001_<description>.sql`
- `002_<description>.sql`
- `003_<description>.sql`
- ...

## Migration Dosyaları

### 001_create_users_table.sql

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add comment
COMMENT ON TABLE users IS 'User accounts table';
COMMENT ON COLUMN users.email IS 'User email address (unique)';
COMMENT ON COLUMN users.name IS 'User full name';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
```

### 002_create_user_preferences_table.sql

```sql
-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  categories JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_user_preferences_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
  ON user_preferences(user_id);

-- Optional: Create GIN index on categories for JSONB search
CREATE INDEX IF NOT EXISTS idx_user_preferences_categories 
  ON user_preferences USING GIN(categories);

-- Add comments
COMMENT ON TABLE user_preferences IS 'User news category preferences';
COMMENT ON COLUMN user_preferences.categories IS 'Array of preferred news categories (JSONB)';
COMMENT ON COLUMN user_preferences.user_id IS 'Foreign key to users table';
```

### 005_create_saved_articles_table.sql

```sql
-- Create saved_articles table
CREATE TABLE saved_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  article_url VARCHAR(500) NOT NULL,
  article_title VARCHAR(500) NOT NULL,
  article_image_url VARCHAR(500),
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, article_url)
);

-- Create indexes for performance
CREATE INDEX idx_saved_articles_user_id ON saved_articles(user_id);
CREATE INDEX idx_saved_articles_saved_at ON saved_articles(saved_at DESC);

-- Add comment to table
COMMENT ON TABLE saved_articles IS 'User saved articles for later reading';
COMMENT ON COLUMN saved_articles.id IS 'Unique saved article identifier (UUID)';
COMMENT ON COLUMN saved_articles.user_id IS 'Reference to users table (foreign key)';
COMMENT ON COLUMN saved_articles.article_url IS 'URL of the saved article (unique per user, combined with user_id)';
COMMENT ON COLUMN saved_articles.article_title IS 'Title of the saved article';
COMMENT ON COLUMN saved_articles.article_image_url IS 'Image URL of the saved article (optional)';
COMMENT ON COLUMN saved_articles.saved_at IS 'Timestamp when article was saved';
```

### 008_add_article_details_to_saved_articles.sql

```sql
-- Add new columns for article details
ALTER TABLE saved_articles
  ADD COLUMN IF NOT EXISTS article_description TEXT,
  ADD COLUMN IF NOT EXISTS article_content TEXT,
  ADD COLUMN IF NOT EXISTS article_source_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS article_published_at TIMESTAMP WITH TIME ZONE;

-- Create index on article_published_at for sorting
CREATE INDEX IF NOT EXISTS idx_saved_articles_published_at ON saved_articles(article_published_at DESC);

-- Add comments to new columns
COMMENT ON COLUMN saved_articles.article_description IS 'Short description/trail text of the article';
COMMENT ON COLUMN saved_articles.article_content IS 'Full article content/body text';
COMMENT ON COLUMN saved_articles.article_source_name IS 'Source name (e.g., The Guardian, section name)';
COMMENT ON COLUMN saved_articles.article_published_at IS 'Original publication date of the article';
```

### 004_create_reading_history_table.sql

```sql
-- Create reading_history table
CREATE TABLE IF NOT EXISTS reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  article_url VARCHAR(500) NOT NULL,
  article_title VARCHAR(500) NOT NULL,
  article_image_url VARCHAR(500),
  read_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_read_at ON reading_history(user_id, read_at DESC);

-- Add comments
COMMENT ON TABLE reading_history IS 'User reading history (auto-tracked)';
COMMENT ON COLUMN reading_history.article_url IS 'URL of the read article';
COMMENT ON COLUMN reading_history.read_at IS 'Timestamp when article was read';
```

## Migration Çalıştırma

### Supabase SQL Editor ile (Önerilen)

1. Supabase Dashboard'a giriş yapın
2. SQL Editor sekmesine gidin
3. Migration dosyasını açın
4. SQL kodunu kopyalayın
5. SQL Editor'e yapıştırın
6. "Run" butonuna tıklayın
7. Sonucu kontrol edin

**Önemli:** Migration'ları sırayla çalıştırın (001, 002, ...)

### Migration Sırası

1. `001_create_users_table.sql` - Önce users tablosu oluşturulmalı
2. `002_create_user_preferences_table.sql` - Sonra preferences tablosu (foreign key için)
3. `003_enable_rls_policies.sql` (optional) - Row Level Security politikaları
4. `004_remove_country_column.sql` - Country kolonunu kaldır (user_preferences tablosu için)
5. `005_create_saved_articles_table.sql` - Saved articles tablosu (foreign key için users gerekli)
6. `006_create_reading_history_table.sql` - Reading history tablosu (foreign key için users gerekli) (henüz oluşturulmadı)
7. `007_update_categories_to_guardian_sections.sql` - Kategorileri Guardian API section'larına güncelle
8. `008_add_article_details_to_saved_articles.sql` - Saved articles tablosuna article detayları ekle (description, content, source, published_at)

## Migration Best Practices

### 1. Single Responsibility

Her migration dosyası tek bir değişiklik yapmalı:

- ✅ İyi: `001_create_users_table.sql`
- ❌ Kötü: `001_create_users_and_preferences_tables.sql`

### 2. Idempotent Queries

Migration'lar birden fazla çalıştırıldığında hata vermemeli:

```sql
-- ✅ İyi: IF NOT EXISTS kullan
CREATE TABLE IF NOT EXISTS users (...);

-- ❌ Kötü: Hata verir eğer tablo varsa
CREATE TABLE users (...);
```

### 3. Version Control

- Migration dosyaları Git'e commit edilmeli
- Migration dosyaları değiştirilmemeli (yeni migration oluştur)
- Her migration bir commit olmalı

### 4. Rollback Stratejisi (Opsiyonel)

Production için rollback script'leri hazırlanabilir:

```sql
-- rollback_002_create_user_preferences_table.sql
DROP TABLE IF EXISTS user_preferences;
```

### 5. Testing

- Migration'ları test environment'ta önce çalıştırın
- Veri kaybı olmayacak şekilde test edin
- Foreign key constraint'leri kontrol edin

## Migration Checklist

- [ ] Migration dosyası doğru klasörde (`backend/database/migrations/`)
- [ ] Dosya adı sıralı numaralandırılmış
- [ ] SQL syntax doğru
- [ ] IF NOT EXISTS kullanılmış (idempotent)
- [ ] Foreign key constraint'ler doğru
- [ ] Index'ler oluşturulmuş
- [ ] Migration test environment'ta test edilmiş
- [ ] Migration Git'e commit edilmiş
- [ ] Migration Supabase'de çalıştırılmış

## Yeni Migration Ekleme

1. Mevcut migration'ları kontrol et (en son numara nedir?)
2. Yeni migration dosyası oluştur (`003_<description>.sql`)
3. SQL kodunu yaz
4. Test environment'ta test et
5. Git'e commit et
6. Supabase SQL Editor'de çalıştır
7. Sonucu doğrula

## Troubleshooting

### Migration Hatası: Table Already Exists

**Sorun:** Tablo zaten var

**Çözüm:** `IF NOT EXISTS` kullan veya migration'ı atla

### Migration Hatası: Foreign Key Constraint

**Sorun:** Foreign key referans ettiği tablo yok

**Çözüm:** Migration sırasını kontrol et, önce parent tablo oluşturulmalı

### Migration Hatası: Syntax Error

**Sorun:** SQL syntax hatası

**Çözüm:** SQL'i Supabase SQL Editor'de test et, syntax'ı düzelt

### Migration Hatası: Permission Denied

**Sorun:** Supabase Service Role Key yetkisi yok

**Çözüm:** Supabase dashboard'dan Service Role Key'i kontrol et

## Migration Dosyaları Örnekleri

### Index Ekleme Migration

```sql
-- 003_add_index_to_users_created_at.sql
CREATE INDEX IF NOT EXISTS idx_users_created_at 
  ON users(created_at);
```

### Column Ekleme Migration

```sql
-- 004_add_bio_to_users.sql (örnek - name kolonu zaten 001_create_users_table.sql'de mevcut)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT;
```

### Column Değiştirme Migration

```sql
-- 005_modify_email_length.sql
ALTER TABLE users 
ALTER COLUMN email TYPE VARCHAR(320);
```

## Notlar

- Migration dosyaları production'da dikkatli kullanılmalı
- Önce backup alınmalı (production için)
- Migration'lar test environment'ta test edilmeli
- Her migration bir commit olmalı
- Migration dosyaları değiştirilmemeli (yeni migration oluştur)

