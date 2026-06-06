-- Restaurant Receipt Generator Database Schema
-- Run this in your Supabase SQL Editor

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipts Table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  subtotal NUMERIC(10, 2) NOT NULL,
  gst_amount NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipt Items Table
CREATE TABLE IF NOT EXISTS receipt_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  item_total NUMERIC(10, 2) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users (admin) have full access
CREATE POLICY "Admin full access on menu_items"
  ON menu_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on receipts"
  ON receipts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access on receipt_items"
  ON receipt_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Sample menu data (optional)
INSERT INTO menu_items (name, category, price, available) VALUES
  ('Butter Chicken', 'Main Course', 280.00, true),
  ('Paneer Tikka', 'Starters', 220.00, true),
  ('Dal Makhani', 'Main Course', 180.00, true),
  ('Garlic Naan', 'Breads', 60.00, true),
  ('Mango Lassi', 'Beverages', 80.00, true),
  ('Gulab Jamun', 'Desserts', 90.00, true);
