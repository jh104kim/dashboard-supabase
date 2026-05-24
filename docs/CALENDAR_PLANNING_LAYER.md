# Calendar Planning Layer

This document mirrors the wiki source-of-truth plan for Phase 5.5.

Source of truth:

- `F:\ai-obsidian\지식창고\wiki\projects\Sapporo-Life-OS-MVP\project-docs\21-calendar-and-wiki-data-enhancement-plan.md`

## What Changed

- The Today schedule card is now a Calendar Planning layer.
- Calendar views support Day, Week, and List modes.
- The week strip shows event counts by day.
- Manual events support date, start/end time, domain, intent, linked value, and north-star alignment.
- Tasks can be converted into calendar time blocks.
- Review now includes time-use intelligence:
  - time-use signal
  - calendar block to protect
  - remove/defer candidate
  - calendar alignment

## Persistence

Calendar events are written to Supabase only after the `calendar_events` table is applied.

Apply:

```sql
supabase/phase55-calendar-events.sql
```

If the table is not present, the UI remains usable in local state and surfaces:

```text
Calendar local-only: Supabase SQL phase55-calendar-events.sql 적용 필요
```

## Quality

Commands:

```bash
npm run quality
npm run quality:phase55
npm run quality:phase56
```

Artifacts:

```text
quality-artifacts/phase55/
├── desktop-today-calendar-planning.png
├── desktop-review-time-use.png
├── mobile-calendar-planning.png
└── phase55-quality-report.json

quality-artifacts/phase56/
├── desktop-calendar-persistence-review.png
└── phase56-quality-report.json
```
