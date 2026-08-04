# Architecture

## High-Level Overview

- The application is a single-page React app without a URL router.
- Navigation is managed via in-memory state in `AppContext` (`currentPath`, `navigateTo`, `goBack`).
- Desktop and mobile shells are selected at runtime via `useIsMobile()` and rendered by `src/App.tsx`.

## Rendering Model

### Shell Selection

Entry point:
- `src/App.tsx` chooses between `DesktopApp` and `MobileApp`.

### Page Selection

`DesktopApp` (and the mobile equivalent) selects the active page based on context state:
- `currentPath`: `home | search | detail | cart | orders | profile`
- `currentVertical`: `shop | quick | services`

This is effectively a small internal router.

## State Management

Primary state container:
- `src/context/AppContext.tsx`

Key state:
- Navigation: `currentPath`, `history`, `selectedProductId`
- Business mode: `currentVertical`
- Commerce: `cart`, `orders`
- UI inputs: `searchQuery`, `location`

Persistence:
- `cart` and `orders` are persisted to `localStorage` (`shopindia_cart`, `shopindia_orders`).

## Data Access

### Supabase

- Client: `src/lib/supabase.ts`
- Schema/seed: `supabase/schema.sql`, `supabase/seed.sql`
- Seeding scripts: `scripts/generateSeedSql.ts`, `scripts/seedSupabase.ts`

### Product Dataset

- Mock dataset: `src/data/mockData.ts`
- Used by seed tooling and by UI logic where appropriate.

### Cloudinary

- Upload helper: `src/lib/cloudinary.ts`
- Uses Vite env variables; see [ENV.md](ENV.md) for security considerations.

## Project Structure

- `src/components/common/`: shared UI (carousel, skeletons, cart drawer)
- `src/components/desktop/`: desktop shell + vertical modules
- `src/components/mobile/`: mobile shell + vertical modules
- `src/pages/`: route-level screens (selected by `currentPath`)
- `src/hooks/`: cross-cutting hooks (`useMediaQuery`, `useProducts`)
- `src/lib/`: external service wrappers
