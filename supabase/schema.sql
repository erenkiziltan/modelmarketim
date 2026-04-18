-- PolyForge Supabase Schema
-- Supabase Dashboard > SQL Editor'a yapıştır ve çalıştır

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name_tr text not null,
  name_en text not null,
  description_tr text default '',
  description_en text default '',
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product images table
create table public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  url text not null,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product variants table
create table public.product_variants (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  name_tr text not null,
  name_en text not null,
  options jsonb not null default '[]',
  price_modifier numeric(10,2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text unique not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  items jsonb not null,
  total_price numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed')),
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger on_products_updated
  before update on public.products
  for each row execute procedure public.handle_updated_at();

create trigger on_orders_updated
  before update on public.orders
  for each row execute procedure public.handle_updated_at();

-- RLS (Row Level Security)
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;

-- Public read for active products
create policy "Public can read active products"
  on public.products for select
  using (is_active = true);

create policy "Public can read product images"
  on public.product_images for select
  using (true);

create policy "Public can read product variants"
  on public.product_variants for select
  using (true);

-- Public can insert orders
create policy "Public can create orders"
  on public.orders for insert
  with check (true);

-- Authenticated (admin) has full access
create policy "Authenticated full access to products"
  on public.products for all
  using (auth.role() = 'authenticated');

create policy "Authenticated full access to product_images"
  on public.product_images for all
  using (auth.role() = 'authenticated');

create policy "Authenticated full access to product_variants"
  on public.product_variants for all
  using (auth.role() = 'authenticated');

create policy "Authenticated can read all orders"
  on public.orders for select
  using (auth.role() = 'authenticated');

create policy "Authenticated can update orders"
  on public.orders for update
  using (auth.role() = 'authenticated');

-- Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Authenticated can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "Authenticated can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- Sample data (optional, delete if not needed)
insert into public.products (slug, name_tr, name_en, description_tr, description_en, price, stock, is_active) values
('ornek-figur-1', 'Ejderha Figürü', 'Dragon Figure', 'El yapımı 3D baskı ejderha figürü. Detaylı tasarım.', 'Handcrafted 3D printed dragon figure. Detailed design.', 299.90, 5, true),
('ornek-figur-2', 'Uzay Savaşçısı', 'Space Warrior', 'Yüksek detaylı uzay temalı savaşçı figürü.', 'Highly detailed space-themed warrior figure.', 249.90, 8, true);
