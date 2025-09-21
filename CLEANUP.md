# Shalean Cleaning Services - PRD Cleanup Checklist

## Overview
This document tracks the systematic cleanup of the codebase to align with the PRD for Shalean Cleaning Services. The goal is to fix known issues while preserving UI/branding and ensuring the booking flow works reliably.

## PRD Flow
Service → Rooms & Extras → Location & Date/Time → Cleaner Selection → Review & Pay (Paystack) → Confirmation

## Environment
- **Stack**: Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui, Supabase, Paystack
- **Project Ref**: gcmndztkikfwnxbfqctn
- **Branch**: chore/prd-cleanup

---

## Phase 0 - Foundation & Environment
- [ ] **0.1** Create CLEANUP.md checklist at repo root
- [ ] **0.2** Verify .env.local contains ONLY Supabase keys
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY  
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] SUPABASE_JWT_SECRET
- [ ] **0.3** Ensure server-only keys used ONLY in server code
- [ ] **0.4** Add /healthz route returning 200 JSON {ok:true, version, time}

## Phase 1 - Routes & Navigation  
- [ ] **1.1** Ensure /booking redirects to /booking/service
- [ ] **1.2** Fix 404s for /booking/service/[slug] - show list if invalid
- [ ] **1.3** Ensure all "Book" CTAs navigate to /booking/service
- [ ] **1.4** Verify favicon at /app/favicon.ico and referenced correctly
- [ ] **1.5** Fix Next.js runtime "reading 'call'" error

## Phase 2 - Draft Booking Reliability (PRD Step 0)
- [x] **2.1** API /api/bookings/draft: GET/POST returns current draft
- [x] **2.2** Accept customer_id (logged in) OR session_id cookie (guests)
- [x] **2.3** status default 'DRAFT'
- [x] **2.4** Schema: Allow NULLs for fields not chosen yet while status='DRAFT'
- [x] **2.5** Add unique index: one draft per customer_id/session_id
- [x] **2.6** Add validation on transition DRAFT → READY_FOR_PAYMENT
- [x] **2.7** RLS: owners read/write own drafts, guests scoped by session_id

## Phase 3 - Payment Integration (PRD Step 0)
- [x] **3.1** Mock Paystack implementation for development/testing
- [x] **3.2** Payment initiation with mock support (`/api/payments/initiate`)
- [x] **3.3** Payment verification with mock support (`/api/payments/verify`)
- [x] **3.4** Payment callback handling (`/booking/payment/callback`)
- [x] **3.5** Order confirmation page (`/order/[shortId]`)
- [x] **3.6** Payment status page (`/payment-status`)
- [x] **3.7** Payment testing utilities (`/api/payments/test`)
- [x] **3.8** Environment-based mock/real Paystack switching

## Phase 4 - Quick Quote & Service Data
- [x] **4.1** Fix queries to match actual columns (remove service_categories.slug refs)
- [x] **4.2** /api/services and /api/service-categories read from REMOTE DB
- [x] **4.3** On-demand seed minimal categories/services/regions/suburbs if empty
- [x] **4.4** Quick Quote UI: handle empty states and API errors gracefully

## Phase 5 - Booking Steps & Price
- [x] **5.1** Steps 1-3: write incremental booking updates
- [x] **5.2** total_price: NULL during DRAFT, required before READY_FOR_PAYMENT
- [x] **5.3** Cleaner Selection API: validate inputs, return stable JSON
- [x] **5.4** Review & Pay: move to READY_FOR_PAYMENT only when all required fields set

## Phase 6 - Auth, Navbar, & Resume Flow
- [x] **6.1** Navbar: avatar dropdown (Name, Dashboard, Sign Out) if authenticated
- [x] **6.2** Navbar: Login/Sign Up buttons if not authenticated
- [x] **6.3** Sign Out: Supabase signOut + redirect without breaking draft
- [x] **6.4** Login mid-flow: use returnTo param to resume exact booking step

## Phase 7 - Payments (Stubbed)
- [x] **7.1** Paystack integration: validate booking → READY_FOR_PAYMENT → launch
- [x] **7.2** Success callback: status=CONFIRMED, store payment reference
- [x] **7.3** Idempotent payment handling (no double charge on refresh)

## Phase 8 - QA, Lint, CI
- [ ] **8.1** Fix ESLint invalid RegExp in eslint.config.mjs
- [ ] **8.2** Add alt text for all <Image> usage
- [ ] **8.3** Add minimal error boundaries/progressive error toasts
- [ ] **8.4** Ensure npm scripts: typecheck, lint, build, dev
- [ ] **8.5** Ensure CI passes

---

## How to Test

### URLs to Test
- `http://localhost:3000/healthz` - Should return 200 JSON
- `http://localhost:3000/booking` - Should redirect to /booking/service
- `http://localhost:3000/booking/service` - Should show service list
- `http://localhost:3000/booking/service/[slug]` - Should show service or fallback to list

### API Endpoints to Test
```bash
# Health check
curl -s http://localhost:3000/healthz

# Services
curl -s http://localhost:3000/api/services

# Draft booking
curl -s -X POST http://localhost:3000/api/bookings/draft

# Service categories
curl -s http://localhost:3000/api/service-categories

# Cleaner availability
curl -s "http://localhost:3000/api/cleaners/availability?date=2024-01-15&region=1"
```

### Expected Results
- No 404s on booking routes
- Draft creation never 500/401
- Quick Quote loads from remote DB
- Cleaner availability returns stable JSON
- Navbar shows correct auth state
- ESLint & CI clean

---

## Environment Matrix

| Variable | Client | Server | Purpose |
|----------|--------|--------|---------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ | ✅ | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ | ✅ | Public anon key |
| SUPABASE_SERVICE_ROLE_KEY | ❌ | ✅ | Server-only operations |
| SUPABASE_JWT_SECRET | ❌ | ✅ | JWT verification |

---

## Commands to Run
```bash
npm run typecheck
npm run lint  
npm run build
npm run dev
```

---

## Rollback Notes
- Each phase can be rolled back independently
- Database changes are reversible via migrations
- Environment variables are safe to modify
- UI changes are minimal and reversible

---

## Commit History
- [ ] Phase 0: Foundation & Environment
- [ ] Phase 1: Routes & Navigation
- [ ] Phase 2: Draft Booking Reliability  
- [ ] Phase 3: Quick Quote & Service Data
- [ ] Phase 4: Booking Steps & Price
- [ ] Phase 5: Auth, Navbar, & Resume Flow
- [ ] Phase 6: Payments (Stubbed)
- [ ] Phase 7: QA, Lint, CI
