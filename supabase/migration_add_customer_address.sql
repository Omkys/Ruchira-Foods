-- Run this in Supabase SQL Editor if you already created the receipts table
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS customer_address TEXT;
