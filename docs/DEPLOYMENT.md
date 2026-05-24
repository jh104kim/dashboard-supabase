# Deployment

This file mirrors the implementation-relevant deployment plan.

Source of truth:

```text
F:\ai-obsidian\지식창고\wiki\projects\Sapporo-Life-OS-MVP\project-docs\20-private-preview-deployment-plan.md
```

## Target

- GitHub repo: `https://github.com/jh104kim/dashboard-supabase`
- Vercel project: `sapporo-polar`
- Expected URL: `https://sapporo-polar.vercel.app`

## Required Environment Variables

```text
APP_PASSWORD=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_COCKPIT_KEY=
```

Private health and finance values are optional and should be added only after
the production domain password gate is verified.

## Security Notes

- `APP_PASSWORD` is server-only and protects the app before dashboard pages load.
- `NEXT_PUBLIC_*` values are exposed to the browser bundle.
- Broad MVP Supabase anon policies must be replaced with Auth and user-scoped
  RLS before public use.

## Quality

Local password gate:

```bash
APP_PASSWORD=3178 npm run dev
npm run quality:phase5
```

Production password gate:

```bash
PHASE5_BASE_URL=https://sapporo-polar.vercel.app PHASE5_APP_PASSWORD=3178 npm run quality:phase5
```
