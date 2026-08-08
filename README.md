# ShopIndia

A responsive e-commerce UI built with React + TypeScript + Vite. The app is structured with desktop/mobile shells and talks to the ShopIndia REST API (`server/`).

## Features

- Responsive desktop/mobile UI split (see `src/components/desktop` and `src/components/mobile`)
- Product listing + product detail pages
- Search page
- Cart experience (drawer + cart page)
- Orders page
- Customer/Admin/Vendor portals

## Tech Stack

- React 19, TypeScript, Vite
- Tailwind CSS
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
- `src/lib/`: API wrappers
- `server/`: ShopIndia REST API (Node/Express/PostgreSQL)

## Docs

- [docs/README.md](docs/README.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Development guide](docs/DEVELOPMENT.md)
- [Deployment](docs/DEPLOYMENT.md)

## Security Notes

- Do not commit real secrets in `.env`.
