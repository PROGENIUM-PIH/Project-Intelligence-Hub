# Project Intelligence Hub

A program management hub for a global automotive sales transformation initiative. Tracks markets, initiatives, tasks, risks, and meetings in one place, with a dashboard for at-a-glance status and a preview of an AI assistant for free-text updates.

> **Note on location:** this project lives at `C:\Users\Lewis\dev\project-intelligence-hub` rather than under the OneDrive-synced `Desktop\Claude` folder it was originally requested in. The OneDrive path contains `&` (`...GmbH & Co. KG...`), which breaks how Windows `cmd.exe` spawns Node build tools (Prisma, shadcn, Next's own typegen all failed with mangled paths). Feel free to move the folder once `&`-safe, but avoid running `npm`/`npx` commands from inside a path containing `&` on Windows.

## Tech Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives)
- **Prisma 7** ORM — PostgreSQL (via `@prisma/adapter-pg`), local dev and Vercel deployment point at the same database
- **react-hook-form** + **zod** for forms and validation
- **TanStack Table v8** for data tables

## Getting Started

1. Set `DATABASE_URL` in `.env` to a Postgres connection string (see [Database](#database) below).
2. ```bash
   npm install
   npx prisma migrate dev
   npm run seed
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). The app redirects `/` to `/dashboard`.

## Database

This app requires Postgres — there's no bundled/local database. For local dev and the Vercel deployment to share data, both point at the same connection string:

1. In your Vercel project: **Storage → Create Database → Postgres**.
2. Copy the connection string from the **.env.local** tab there (use the pooled one, usually `POSTGRES_PRISMA_URL` or `POSTGRES_URL`) into this project's `.env` as `DATABASE_URL`.
3. Run `npx prisma migrate dev` once to create the tables, then `npm run seed` for demo data.
4. In the Vercel project's environment variables, add the same `DATABASE_URL` (Vercel Postgres usually sets its own `POSTGRES_*` vars automatically — add `DATABASE_URL` pointing to the same value so the app's `prisma.config.ts` picks it up).

## Project Structure

```
prisma/
  schema.prisma        Data model
  seed.ts               Demo data (DE/FR/CZ markets, ID1–ID4 initiatives)
src/
  app/
    (app)/               Route group with the sidebar + top nav shell
      dashboard/
      markets/[id]/
      initiatives/[id]/
      tasks/ risks/ meetings/ settings/
  components/
    layout/              Sidebar, top nav, mobile nav sheet
    dashboard/           KPI cards, status overview, activity timeline, upcoming meetings
    shared/               DataTable, StatusBadge, SearchBar, FilterBar, PageHeader, ConfirmDeleteDialog
    forms/                Task/Risk/Meeting forms (react-hook-form + zod)
    ai/                   AI Assistant preview panel
    ui/                   shadcn/ui primitives
  lib/
    prisma.ts             Prisma client singleton (pg driver adapter)
    status.ts             Status → label/tone mapping (semantic colors only)
    actions/               Server Actions for Task/Risk/Meeting CRUD and the AI assistant
public/
  branding/
    skoda-logo.jpg        Wordmark shown in the top nav
```

## Data Model

- **Market** (Germany, France, Czech Republic) ↔ **Initiative** (ID1–ID4): many-to-many via `MarketInitiative`, which also tracks a per-market local status and local lead.
- **Task** belongs to exactly one **Initiative**.
- **Risk** belongs to exactly one **Initiative**.
- **Meeting** belongs to either one **Market** or one **Initiative** (`scope` field + app-level validation ensures exactly one is set).
- **Activity** is an append-only log feeding the dashboard timeline; entries are written by the CRUD server actions and by the AI assistant.

Status colors (`src/lib/status.ts` + `StatusBadge`) are semantic only — green/amber/red communicate on-track/at-risk/critical and never double as brand colors. The brand palette (Emerald Green background, Electric Green nav buttons) is only used for chrome: the sidebar and active nav state.

## AI Assistant (Preview)

The **Settings** page includes a free-text box that proposes a structured update — e.g. *"Mark task Finalize configurator UAT sign-off as done"* or *"Set Germany status to at risk"*. It's a rule-based keyword/fuzzy-match parser (`src/lib/actions/ai-assistant.ts`), not a call to an external AI service — this keeps the demo self-contained and free to run. The proposed change is always shown for review before anything is written, and applying it goes through the same validated update paths as the rest of the app. To wire in a real model later, replace the matching logic inside `proposeUpdate` with a call to an LLM that returns the same `ProposedUpdate` shape; `applyProposal` and the confirm-before-save UI don't need to change.

## Deferred Steps (not done by this build)

These were intentionally left for you to run — they need your own GitHub/Vercel accounts:

1. **GitHub**: create a repo (e.g. at github.com/new) and push.
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. **Vercel**: import the GitHub repo at [vercel.com/new](https://vercel.com/new).
3. **Database**: provision Postgres and set `DATABASE_URL` — see [Database](#database) above. Do this before or right after the first deploy; the app will error on any page without it.
4. **Real Škoda logo asset**: `public/branding/skoda-logo.jpg` is a low-resolution (200×22) copy of the file you supplied. Swap in an official, higher-resolution SVG when available for crisper rendering, especially on high-DPI displays.
5. Before sharing a live/public URL: this app displays the real Škoda wordmark — check with whoever owns brand/trademark approval on your side before publishing it externally.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Lint |
| `npm run seed` | Reset and reseed the database with demo data |
