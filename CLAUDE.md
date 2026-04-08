# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # TypeScript check + production build
npm run preview  # Preview production build locally
npx tsc --noEmit # Type-check only (no build)
```

## Architecture

React 19 SPA (Vite 6) communicating directly with Supabase PostgreSQL via `@supabase/supabase-js`. No backend. Deployed as static site on Vercel.

**Stack:** React 19, TypeScript 5, TailwindCSS 4 (via `@tailwindcss/postcss`), Recharts 3, react-router-dom 7, date-fns, papaparse, react-hot-toast, Lucide React icons.

**Data flow:** Browser → Supabase JS client → PostgreSQL. No auth — RLS policies allow all operations (private app).

## Key Design Decisions

- **Theme system:** CSS custom variables (`--color-surface`, `--color-card`, etc.) in `src/styles/index.css`. Dark mode via `.dark` class on `<html>`, toggled in `useTheme` hook with localStorage persistence.
- **Categories are constants, not DB tables:** Defined in `src/lib/constants.ts`. Each category has a key, label, icon, VAT rate, subcategories list, and freeText flag.
- **Salary payments support both monthly and daily types:** The `type` field in `salary_payments` accepts 'stipendio', 'inps', 'tfr', and 'giornata'. The `month` field always stores first-of-month date regardless of payment type.
- **Dashboard aggregates from multiple tables:** `daily_revenues` + `expenses` + `salary_payments`. Salary queries must use first-of-month (`YYYY-MM-01`) not the selected date.
- **Mobile-first:** Bottom nav (<768px) + sidebar (>=768px). All pages need `overflow-hidden` to prevent horizontal scroll. Touch targets minimum 44px.
- **Warm Shopify-style theme:** Light default with cream background (#FAF8F5). Colored card borders per type (green=cash, blue=POS, red=expenses, purple=salaries, amber=totals). Both light and dark variants for all gradient cards.
- **Italian locale:** All dates formatted DD/MM/YYYY via date-fns `it` locale. Currency via `Intl.NumberFormat('it-IT')`. Working week is Monday-Saturday.
- **CSV export uses standard comma delimiter** for Google Sheets compatibility (not semicolon).

## Supabase

- Project ref: `kqkgmdoscetlybpwqyqp`
- Schema in `schema.sql` — 4 tables: `daily_revenues`, `expenses`, `employees`, `salary_payments`
- Credentials via env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Vercel

- Static SPA deployment with `vercel.json` rewrite for client-side routing
- Production URL: `https://gianluca-ten.vercel.app`
- Deploy: `vercel --yes --prod`

## Gotchas

- This is NOT Next.js — do not add "use client" directives
- TailwindCSS v4 uses `@import "tailwindcss"` syntax, not `@tailwind base/components/utilities`
- Recharts v3 Tooltip `formatter` receives `ValueType | undefined`, must cast with `Number(value)`
- `react-router-dom` v7 — imports from `react-router-dom`, not `react-router`
