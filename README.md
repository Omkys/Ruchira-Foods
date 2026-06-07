# Ruchira Foods — Restaurant & Mess Management

Admin-only dashboard for dine-in billing, delivery orders, customer management, monthly mess plans, delivery tracking, and reports.

**Tagline:** Where Every Meal Feels Like Home

## Features

- **Admin Auth** — Supabase login, protected routes, logout
- **Dashboard** — Dine In & Delivery workflow cards + live stats
- **Dine In** — Table selection, menu cart, auto bill, receipt print/PDF
- **Delivery** — Live customer search, new customer registration, delivery order creation
- **Delivery Board** — Kanban-style status tracking (Pending → Delivered)
- **Customers** — Search, edit, profile view, order history
- **Monthly Plans** — Create, edit, renew, deactivate mess subscriptions
- **Menu Management** — Full menu CRUD
- **Reports** — Daily/weekly/monthly revenue, deliveries, top selling items

## Tech Stack

React 19 · Vite · Tailwind CSS 4 · Supabase · React Router · jsPDF · react-to-print

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Create an admin user under **Authentication → Users**
4. Copy project URL and anon key

### 3. Environment

Create `.env`:

```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### 4. Run

```bash
npm run dev
```

## Database Tables

| Table | Purpose |
|-------|---------|
| `customers` | Customer registry (regular / monthly) |
| `monthly_plans` | Mess subscription plans |
| `menu_items` | Food menu |
| `orders` | All orders (dine_in, delivery) |
| `order_items` | Line items per order |
| `receipts` | Receipt numbers linked to orders |

## Receipt Numbers

Format: `REC-2026-0001`, `REC-2026-0002`, ...

## Migrating from v1

If you used the old receipt-only schema, run `supabase/migration_v2_mess_management.sql` then `schema.sql`.

## License

MIT
