# ShopIndia

A responsive e-commerce UI built with React + TypeScript + Vite. The app is structured with desktop/mobile shells and uses Supabase for data persistence.

## Features

- Responsive desktop/mobile UI split (see `src/components/desktop` and `src/components/mobile`)
- Product listing + product detail pages
- Search page
- Cart experience (drawer + cart page)
- Orders page
- Supabase integration for products/orders
- Optional Cloudinary upload utility

## Tech Stack

- React 19, TypeScript, Vite
- Tailwind CSS
- Supabase (`@supabase/supabase-js`)
- Animations/UI: framer-motion, embla-carousel-react, lucide-react
- Linting: Oxlint

## Quickstart

```bash
npm install
npm run dev
```

The app expects environment variables in `.env` at the project root.

See:
- [Setup](docs/SETUP.md)
- [Environment variables](docs/ENV.md)
- [Supabase](docs/SUPABASE.md)

## Commands

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Repository Layout

- `src/components/`: UI components (desktop/mobile/common)
- `src/pages/`: route-level pages (Cart, Orders, ProductDetail, Profile, Search)
- `src/context/`: global app context and shared state
- `src/hooks/`: custom hooks (`useProducts`, `useMediaQuery`)
- `src/lib/`: integrations (Supabase, Cloudinary)
- `supabase/`: schema + seed SQL
- `scripts/`: seeding utilities

## Docs

- [docs/README.md](docs/README.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Development guide](docs/DEVELOPMENT.md)
- [Deployment](docs/DEPLOYMENT.md)

## Security Notes

- Do not commit real secrets in `.env`.
- `src/lib/cloudinary.ts` references `VITE_CLOUDINARY_API_SECRET` in browser code. Treat this as unsafe for production and prefer signed uploads via a backend.
