-- Migration from v1 (receipt-based) to v2 (order-based mess management)
-- WARNING: This drops old receipt tables. Backup data first if needed.

DROP TABLE IF EXISTS receipt_items CASCADE;
DROP TABLE IF EXISTS receipts CASCADE;

-- Then run the full schema.sql to create new tables
