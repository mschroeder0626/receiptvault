# ReceiptVault

## What It Does
Business receipt capture and management app. Users snap, upload, or drag-and-drop receipts. Claude AI extracts vendor, amount, date, and category via OCR. Receipts are stored in Supabase with images in cloud storage.

## Tech Stack
- **Frontend:** Single-page HTML app (`server/index.html`) — vanilla JS, no framework
- **Backend:** Node.js/Express server (`server/server.js`)
- **Database:** Supabase (PostgreSQL with RLS)
- **Storage:** Supabase Storage (`receipt-images` bucket)
- **Auth:** Supabase Auth (email/password)
- **AI:** Anthropic Claude API via server-side proxy (`/api/claude`)
- **Fonts:** Playfair Display, DM Sans, DM Mono

## Supabase Tables
- `profiles` — shared auth profile (auto-created on signup)
- `rv_receipts` — receipt records (merchant, amount, date, category, image_url, ocr_raw)
- `rv_categories` — user-defined categories (auto-created on first use)

## Deployment
- **URL:** https://receiptvault-nggiu.ondigitalocean.app
- **Platform:** DigitalOcean App Platform
- **App spec:** `.do/app.yaml`
- **Source dir:** `/server` (DigitalOcean only deploys the server/ folder)
- **Auto-deploy:** Push to `main` triggers deploy

## GitHub
- **Repo:** mschroeder0626/receiptvault
- **Branch:** main

## Environment Variables (set in DigitalOcean)
- `ANTHROPIC_API_KEY` — Claude API key (secret)
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anonymous/public key

## Key Architecture Notes
- `server.js` injects `SUPABASE_URL` and `SUPABASE_ANON_KEY` into the HTML at serve time via `window.__SUPABASE_URL__` and `window.__SUPABASE_ANON_KEY__`
- Supabase JS client loaded via CDN (`@supabase/supabase-js@2` UMD build)
- Receipt images stored at `{user_id}/{receipt_id}.{ext}` in Supabase Storage
- Company list (names/colors) stored in localStorage; receipt data in Supabase
- OCR metadata stored in `ocr_raw` JSONB column (name, employee, time, status, confidence, method, companyId)

## Completed
- Supabase Auth (email/password sign-in, sign-up, sign-out)
- Receipt CRUD persisted to `rv_receipts` table
- Category auto-creation in `rv_categories`
- Receipt image upload to Supabase Storage
- Claude AI OCR extraction (vendor, date, amount, category)
- Multi-company switcher (company list in localStorage)
- Receipt detail view/edit (desktop side panel + mobile modal)
- CSV export and email export
- Approve/sync workflow for receipts
- DigitalOcean deployment with auto-deploy
- Responsive layout (desktop sidebar + mobile tabs)

## TODO
- Email-in receipt forwarding
- Receipt search and filtering
- Multi-user company sharing (currently single-user per company)
- Receipt image zoom/annotation
- BankTracker sync integration (currently placeholder)
- Proper date picker (currently free-text MM-DD-YY)
- Pagination for large receipt lists
