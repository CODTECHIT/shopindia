# Contributing

## Setup

Follow [docs/SETUP.md](docs/SETUP.md).

## Development Workflow

- Create a feature branch.
- Keep changes scoped and readable.
- Run checks before opening a PR:

```bash
npm run lint
npm run build
```

## Project Conventions

- Navigation is context-driven (no URL router). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- Keep desktop/mobile concerns isolated under `src/components/desktop` and `src/components/mobile`.

## What to Include in a PR

- A clear description of the user-facing behavior change
- Any schema/seed updates under `supabase/` if the data model changed
