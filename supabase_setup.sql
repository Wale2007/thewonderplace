-- 1. Create MENU ITEMS table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true
);

-- 2. Create ORDERS table (The collation system)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  items JSONB NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' -- 'pending', 'confirmed', 'delivered'
);

-- 3. Create SETTINGS table
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  is_open BOOLEAN DEFAULT true,
  announcement TEXT,
  whatsapp_number TEXT NOT NULL,
  delivery_fee NUMERIC DEFAULT 0
);

-- 4. Create REVIEWS table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_name TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 6. Create POLICIES
DROP POLICY IF EXISTS "Public Read Menu" ON menu_items;
CREATE POLICY "Public Read Menu" ON menu_items FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin All Menu" ON menu_items;
CREATE POLICY "Admin All Menu" ON menu_items FOR ALL TO public USING (true);

DROP POLICY IF EXISTS "Public Insert Orders" ON orders;
CREATE POLICY "Public Insert Orders" ON orders FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Orders" ON orders;
CREATE POLICY "Admin All Orders" ON orders FOR ALL TO public USING (true);

DROP POLICY IF EXISTS "Public Read Settings" ON settings;
CREATE POLICY "Public Read Settings" ON settings FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin All Settings" ON settings;
CREATE POLICY "Admin All Settings" ON settings FOR ALL TO public USING (true);

DROP POLICY IF EXISTS "Public Read/Insert Reviews" ON reviews;
CREATE POLICY "Public Read/Insert Reviews" ON reviews FOR ALL TO public USING (true);

-- 7. Seed Initial Settings
INSERT INTO settings (id, whatsapp_number, announcement, delivery_fee)
VALUES (1, '2348067765275', 'Welcome to THEWONDERPLACE! We are now open for pre-orders.', 1000)
ON CONFLICT (id) DO NOTHING;

-- 8. Create Storage Bucket for Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Storage Policies
DROP POLICY IF EXISTS "Public Read Images" ON storage.objects;
CREATE POLICY "Public Read Images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Public Insert Images" ON storage.objects;
CREATE POLICY "Public Insert Images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Public Update Images" ON storage.objects;
CREATE POLICY "Public Update Images" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Public Delete Images" ON storage.objects;
CREATE POLICY "Public Delete Images" ON storage.objects FOR DELETE TO public USING (bucket_id = 'images');
