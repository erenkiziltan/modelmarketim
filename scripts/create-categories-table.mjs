import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://tqobzccyxpodzbuxukpd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxb2J6Y2N5eHBvZHpidXh1a3BkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjUxNDM1NiwiZXhwIjoyMDkyMDkwMzU2fQ.HokPt3Q8jodFC2_vmvzazB4D9hmYU62wwQVl_wY8yRA'
)

// Test: categories tablosunun var olup olmadığını kontrol et
const { error } = await supabase.from('categories').select('id').limit(1)
if (error) {
  console.log('categories tablosu yok, SQL ile oluşturulmalı.')
  console.log('\nSupabase SQL Editor\'e şunu yapıştır:\n')
  console.log(`
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_tr text NOT NULL,
  name_en text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id);
  `)
} else {
  console.log('✅ categories tablosu zaten mevcut, devam edebilirsin.')
}
