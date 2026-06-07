-- =====================================================
-- YORUM SİSTEMİ MIGRATION
-- Tek seferde çalıştır. Hepsi idempotent (tekrar çalıştırılabilir).
-- =====================================================

-- 1) PROFILES TABLOSU
-- Google OAuth ile gelen kullanıcı bilgilerini tutar
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- Herkes profilleri okuyabilir (yorum gösterirken ad/avatar lazım)
drop policy if exists "profiles okunabilir" on profiles;
create policy "profiles okunabilir" on profiles for select using (true);

-- Kullanıcı kendi profilini güncelleyebilir
drop policy if exists "profil sahibi günceller" on profiles;
create policy "profil sahibi günceller" on profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- Yeni kullanıcı kaydolunca otomatik profile oluştur
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- 2) REVIEWS TABLOSU
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Aynı kullanıcı aynı ürüne 1 kere yorum atabilir
  unique (product_id, user_id)
);

create index if not exists reviews_product_idx on reviews(product_id);
create index if not exists reviews_created_idx on reviews(created_at desc);

alter table reviews enable row level security;

-- Herkes onaylı yorumları okuyabilir (otomatik yayın seçildi → hepsi görünür)
drop policy if exists "yorumlar okunabilir" on reviews;
create policy "yorumlar okunabilir" on reviews for select using (true);

-- Sadece giriş yapmış kullanıcılar yorum ekleyebilir + kendi adına
drop policy if exists "kullanıcı yorum ekler" on reviews;
create policy "kullanıcı yorum ekler" on reviews for insert
  to authenticated with check (auth.uid() = user_id);

-- Kullanıcı kendi yorumunu güncelleyebilir
drop policy if exists "yorum sahibi günceller" on reviews;
create policy "yorum sahibi günceller" on reviews for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Kullanıcı kendi yorumunu silebilir
drop policy if exists "yorum sahibi siler" on reviews;
create policy "yorum sahibi siler" on reviews for delete
  to authenticated using (auth.uid() = user_id);


-- 3) REVIEW_IMAGES TABLOSU
create table if not exists review_images (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index if not exists review_images_review_idx on review_images(review_id);

alter table review_images enable row level security;

-- Herkes okuyabilir
drop policy if exists "review_images okunabilir" on review_images;
create policy "review_images okunabilir" on review_images for select using (true);

-- Sadece yorumun sahibi ekleyebilir
drop policy if exists "yorum sahibi resim ekler" on review_images;
create policy "yorum sahibi resim ekler" on review_images for insert
  to authenticated with check (
    exists (select 1 from reviews where reviews.id = review_id and reviews.user_id = auth.uid())
  );

-- Sadece yorumun sahibi silebilir
drop policy if exists "yorum sahibi resim siler" on review_images;
create policy "yorum sahibi resim siler" on review_images for delete
  to authenticated using (
    exists (select 1 from reviews where reviews.id = review_id and reviews.user_id = auth.uid())
  );


-- 4) STORAGE BUCKET: review-images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-images', 'review-images', true, 5242880, array['image/jpeg','image/jpg','image/png','image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/jpg','image/png','image/webp'];

-- Storage policies
drop policy if exists "review-images public read" on storage.objects;
create policy "review-images public read" on storage.objects for select
  using (bucket_id = 'review-images');

drop policy if exists "authenticated kullanıcı resim yükler" on storage.objects;
create policy "authenticated kullanıcı resim yükler" on storage.objects for insert
  to authenticated with check (bucket_id = 'review-images');

drop policy if exists "kullanıcı kendi resmini siler" on storage.objects;
create policy "kullanıcı kendi resmini siler" on storage.objects for delete
  to authenticated using (bucket_id = 'review-images' and owner = auth.uid());


-- 5) MEVCUT KULLANICILAR İÇİN BACKFILL
-- (admin@modelmarketim.com gibi mevcut user'ı profiles'a kopyala)
insert into profiles (id, email, full_name, avatar_url)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  raw_user_meta_data->>'avatar_url'
from auth.users
on conflict (id) do nothing;


-- =====================================================
-- ✅ TAMAM. Aşağıdaki sorgu ile kontrol et:
-- =====================================================
-- select count(*) as profile_count from profiles;
-- select count(*) as bucket_count from storage.buckets where id = 'review-images';
