# Orphaned API Routes Analysis

## Analysis Method
- Searched codebase for fetch('/api/<segment>'), axios.*('/api/<segment>'), new Request('/api/<segment>')
- Checked for dynamic builders (e.g., ${base}/api/...)
- Searched for route directory/filename strings
- Checked tests, middleware.ts, and config files
- Verified package.json scripts for health checks

## API Routes Status

### ✅ USED ROUTES (Keep)
- `/api/bookings/draft` - Used in booking flow components
- `/api/bookings/select-cleaner` - Used in test scripts and booking flow
- `/api/bookings/confirm` - Used in test scripts and booking flow
- `/api/cleaners/availability` - Used in cleaner selection step
- `/api/cleaners/available` - Has tests, likely used
- `/api/services` - Used in quick quote and service pages
- `/api/services/[slug]` - Used in service detail pages
- `/api/regions` - Used in location selection and geo fetching
- `/api/suburbs` - Used in location selection and geo fetching
- `/api/extras` - Used in booking flow
- `/api/quote/calculate` - Used in quick quote component
- `/api/quotes` - Used in quick quote component
- `/api/quote` - Used in quote page
- `/api/content/blocks` - Used in homepage data hooks
- `/api/content/hero` - Used in homepage data hooks
- `/api/team/members` - Used in homepage data hooks
- `/api/testimonials/featured` - Used in homepage data hooks
- `/api/blog/recent` - Used in homepage data hooks
- `/api/availability` - Used in location scheduling step
- `/api/health` - Used in package.json health check scripts

### ❌ CONFIRMED ORPHANED (Safe to Delete)
- `/api/cleaners` (root) - No usage found in codebase, cleaner dashboard is placeholder only

## Deletion Plan
1. Delete `/api/cleaners/route.ts` - No references found
2. All other routes are actively used in the application
