-- Ruchira Foods - Restaurant & Mess Management Schema
-- Run in Supabase SQL Editor

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  customer_type TEXT NOT NULL DEFAULT 'regular' CHECK (customer_type IN ('regular', 'monthly')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Monthly Plans
CREATE TABLE IF NOT EXISTS monthly_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'
  )),
  table_number INTEGER,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  gst_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  item_total NUMERIC(10, 2) NOT NULL
);

-- Receipts
CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_monthly_plans_customer ON monthly_plans(customer_id);
CREATE INDEX IF NOT EXISTS idx_monthly_plans_active ON monthly_plans(is_active);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (safe to re-run this script)
DROP POLICY IF EXISTS "Admin full access on customers" ON customers;
DROP POLICY IF EXISTS "Admin full access on monthly_plans" ON monthly_plans;
DROP POLICY IF EXISTS "Admin full access on menu_items" ON menu_items;
DROP POLICY IF EXISTS "Admin full access on orders" ON orders;
DROP POLICY IF EXISTS "Admin full access on order_items" ON order_items;
DROP POLICY IF EXISTS "Admin full access on receipts" ON receipts;
CREATE POLICY "Admin full access on customers" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on monthly_plans" ON monthly_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on menu_items" ON menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on order_items" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on receipts" ON receipts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sample menu (only if table is empty)
INSERT INTO menu_items (name, category, price, available)
SELECT name, category, price, available FROM (VALUES
  ('Butter Chicken', 'Main Course', 280.00, true),
  ('Paneer Tikka', 'Starters', 220.00, true),
  ('Dal Makhani', 'Main Course', 180.00, true),
  ('Garlic Naan', 'Breads', 60.00, true),
  ('Mango Lassi', 'Beverages', 80.00, true),
  ('Gulab Jamun', 'Desserts', 90.00, true)
) AS sample(name, category, price, available)
WHERE NOT EXISTS (SELECT 1 FROM menu_items LIMIT 1);
