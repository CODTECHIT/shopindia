# Setup

## Prerequisites

- Node.js (LTS recommended)
- npm

## Install

```bash
npm install
```

## Configure Environment

Create `.env` at the project root and set the variables documented in [ENV.md](ENV.md).

If you are working with Supabase, complete [SUPABASE.md](SUPABASE.md) first so the schema exists before seeding.

## Run (Development)

```bash
npm run dev
```

## Build (Production)

```bash
npm run build
npm run preview
```

## Optional: Seed Supabase

This repo includes two seeding paths:

- SQL-based: `supabase/seed.sql` (generated/updated by `scripts/generateSeedSql.ts`)
- Programmatic: `scripts/seedSupabase.ts`

Details: [SUPABASE.md](SUPABASE.md)
