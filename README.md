# Restaurant Receipt Generator Admin Dashboard

A modern POS-style admin dashboard for restaurant billing and receipt generation, built with React, Vite, Tailwind CSS, and Supabase.

## Features

- **Admin Authentication** — Secure login via Supabase Auth with protected routes
- **Dashboard** — Revenue stats, order counts, and recent receipts at a glance
- **Menu Management** — Add, edit, and delete food items with categories and pricing
- **Receipt Generator** — Select items, calculate total, generate unique receipt numbers
- **Receipt Preview** — Thermal-style receipt layout with restaurant branding
- **Print & PDF** — Browser print support and PDF download via jsPDF
- **Receipt History** — Search by receipt number, customer name, or date filter
- **Reports** — Daily, weekly, and monthly revenue analytics

## Tech Stack

- React 19 + Vite
- Tailwind CSS 4
- Supabase (Auth + PostgreSQL)
- React Router 7
- jsPDF
- Lucide React Icons

## Getting Started

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Authentication > Users** and create an admin user with email/password
4. Copy your project URL and anon key from **Settings > API**

### 3. Configure Environment

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and log in with your admin credentials.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── layouts/        # App layouts (Dashboard, Auth)
├── context/        # React context (Auth, Toast)
├── services/       # Supabase data services
├── utils/          # Helpers (formatters, PDF, receipt numbers)
├── lib/            # Supabase client
└── App.jsx         # Router and providers
```

## Receipt Number Format

Receipts are auto-numbered as: `REC-YYYYMMDD-XXX`

Example: `REC-20260606-001`

## Database Tables

| Table | Description |
|-------|-------------|
| `menu_items` | Food items with name, category, price, availability |
| `receipts` | Receipt headers with totals and customer info |
| `receipt_items` | Line items for each receipt |

## Build for Production

```bash
npm run build
npm run preview
```

## License

MIT
