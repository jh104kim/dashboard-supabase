# Sapporo Life OS

Private Life OS cockpit for daily north-star alignment.

## Purpose

This app is the implementation repo for the Sapporo Life OS MVP planned in the Obsidian vault.

The product is not a Notion clone, todo app, or PKM replacement. The core job is:

```text
Help me see whether today's actions are aligned with my north star.
```

## MVP v0.1 Scope

- `/` - Today dashboard
- `/north-star` - north star, milestones, capabilities, private financial track
- `/review` - weekly alignment review
- Task
- Reflection
- LearningLog
- Review
- North Star alignment calculation

Deferred:

- Prisma
- Supabase Auth
- Supabase Storage
- AI Agent
- RAG
- LinkedIn/public export

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase SDK
- GitHub
- Vercel

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment

Copy `.env.example` to `.env.local` when Supabase is ready.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
APP_PASSWORD=
NEXT_PUBLIC_COCKPIT_KEY=
```

Private health and financial values are intentionally not committed. Configure
them locally with the `NEXT_PUBLIC_PRIVATE_*` placeholders in `.env.example`.

`APP_PASSWORD` protects the deployed domain through server middleware. Use it
for the private preview password.

`NEXT_PUBLIC_*` values are visible in the browser bundle. Use them only for a
private preview MVP, and replace broad Supabase policies with real Auth before
public deployment.

## Supabase

The initial schema draft is in:

```text
supabase/schema.sql
```

Use it after creating a Supabase project.

## Planning Docs

The product source of truth lives in the Obsidian vault. See:

```text
docs/SOURCE_OF_TRUTH.md
docs/DEVELOPMENT_PLAN.md
```
