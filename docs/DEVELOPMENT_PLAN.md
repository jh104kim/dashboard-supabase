# Development Plan

This document is a mirror for implementation convenience.

The source of truth is:

```text
F:\ai-obsidian\지식창고\wiki\projects\Sapporo-Life-OS-MVP\project-docs\16-development-plan.md
```

Product decisions remain in the Obsidian wiki. Update the wiki first, then mirror only the implementation-relevant changes here.

Quality test source of truth:

```text
F:\ai-obsidian\지식창고\wiki\projects\Sapporo-Life-OS-MVP\project-docs\17-quality-test-plan.md
```

## Phase 0. Repo Foundation

Status: done

- Next.js App Router project created.
- TypeScript and Tailwind CSS configured.
- `@supabase/supabase-js` installed.
- `lucide-react` installed.
- Base routes created: `/`, `/north-star`, `/review`.
- Static seed data created in `src/lib/life-os-data.ts`.
- Supabase schema draft created in `supabase/schema.sql`.

## Phase 1. Static MVP Screen Completion

Status: done

Goal: make the private cockpit coherent before persistence.

- Refine `/` as Today dashboard.
- Refine `/north-star` as the most important page.
- Refine `/review` as weekly alignment review.
- Add empty states and realistic sample states.
- Confirm mobile layout.
- Keep all data static.
- Lock private financial and health tracks behind the locally configured cockpit key.

Exit criteria:

- The three pages explain the product without extra documentation.
- The daily operating loop is visible in the UI.
- The page can be demoed as a private cockpit.
- `npm run quality` passes.
- Desktop/mobile layout checks pass.
- `npm run quality:phase1` records screenshots and basic layout/text checks.
- Private financial/health numbers are hidden by default and visible only after cockpit key entry.

## Phase 2. Local Interaction Layer

Status: quality-passed-needs-ux-refinement

Goal: make the app feel usable before database work.

- Add client-side task checkbox interactions.
- Add quick capture fields for task, learning, and reflection.
- Add local in-memory state.
- Add simple alignment score calculation from selected values/goals.
- Add review snapshot preview.
- Start with only the minimum interactive inputs: priority, schedule, energy, quick capture, and weekly review fields.
- Run `npm run quality:phase2` to verify priority/schedule/energy/capture/review sync.

Exit criteria:

- A user can simulate a morning/during/evening loop without Supabase.
- North Star alignment changes based on task state.
- Today inputs update Review preview during the same browser session.
- A local-only reset policy is visible before persistence work begins.

## Phase 2.5. Pre-Persistence UI/UX Refinement

Status: done

Goal: improve the cockpit before saving data.

- Keep Today input flow lightweight.
- Add hide-after-unlock behavior to Private Financial/Health Track.
- Add hide-after-unlock behavior to Private Health Track.
- Prepare a wiki-based current baseline seed before Review redesign.
- Redesign Review around baseline/input/gap/next action.
- Reduce mobile information burden before persistence.
- Use `19-current-baseline.md` in the wiki as the app baseline seed.

Exit criteria:

- Private financial/health tracks can be unlocked and hidden again.
- Review explains the user's current level, not only the latest input.
- Review shows baseline, today's input, gap, and next action.
- Mobile flow remains usable before database persistence.
- Quality gates pass after the UI/UX refinement.

## Phase 3. Supabase Persistence

Status: done

Goal: store the v0.1 core data.

- Create Supabase project.
- Apply `supabase/schema.sql`.
- Add `.env.local` with Supabase URL and anon key.
- Implement data access functions using Supabase SDK.
- Persist tasks.
- Persist reflections.
- Persist learning logs.
- Persist reviews.
- Phase 3 app code is implemented.
- The base schema has been applied and REST table checks pass.
- The MVP private cockpit RLS policy section has been applied.
- `npm run quality:phase3` passes.
- `npm run quality` passes.

Exit criteria:

- Data survives page reload.
- No Prisma required.
- No Auth required unless deployment privacy requires it.

## Phase 4. Aggregation and Review Intelligence

Status: done

Goal: make the app useful, not just writable.

- Implement `getNorthStarAlignment`.
- Implement `getDailyLoopState`.
- Implement `getWeeklyInsights`.
- Implement `generateReviewSnapshot`.
- Show weekly aligned action, wasted area, evidence count, and next improvement.
- Phase 4 app logic is implemented.
- `npm run quality` passes.
- `reviews` table RLS policy patch has been applied.
- `npm run quality:phase4` passes.

Exit criteria:

- Weekly review produces a useful operating snapshot.
- The user can see whether action and values are diverging.

## Phase 5. Private Preview Deployment

Status: done

Goal: make the app accessible privately.

- Push to GitHub.
- Connect to Vercel.
- Configure environment variables.
- Decide whether Vercel preview protection is enough.
- Add Supabase Auth only if private access cannot be controlled safely.
- Add app-level server password gate using `APP_PASSWORD`.
- Deploy as `sapporo-polar`.

Exit criteria:

- App is available from a private URL.
- Sensitive financial/private data is not exposed publicly.

## Phase 5.5. Calendar Planning Layer

Status: done

Goal: turn the Today schedule panel into a calendar planning layer before adding external calendar sync.

- Add Day / Week / List calendar views.
- Add week strip with event counts.
- Extend schedule input to date, start/end time, domain, intent, linked value, and north-star alignment.
- Add task-to-calendar time block action.
- Keep external calendar sync out of scope.
- Keep FullCalendar as a later option; current implementation uses a lightweight custom UI.
- Add Review time-use signals based on calendar events.
- Add `supabase/phase55-calendar-events.sql`.
- Add `npm run quality:phase55`.

Exit criteria:

- The user can see today's schedule as time blocks, not only as a text list.
- Calendar events can be linked to task/value/domain.
- Mobile layout has no horizontal overflow.
- Review can show calendar alignment and time-use signals.

## Phase 5.6. Calendar Persistence

Status: done

Goal: persist calendar events in Supabase.

- Apply `supabase/phase55-calendar-events.sql` in Supabase SQL Editor.
- Verify event create and reload persistence after the table exists.
- Keep the app usable in local-only mode if the table is not applied.
- `npm run quality:phase56` passes.

Exit criteria:

- Calendar events save to Supabase.
- Calendar events survive page reload.
- Review can read persisted calendar event data.

## Phase 6. v0.15 Evidence and Content Pipeline

Goal: connect learning and action to output.

- Add Evidence model/UI.
- Add ContentIdea model/UI.
- Connect LearningLog to ContentIdea.
- Connect completed tasks to Evidence.
- Add candidate/public/private visibility.

Exit criteria:

- Learning and actions produce reusable evidence.
- Content candidates can be reviewed weekly.

## Phase 7. v0.2 Capability, Life Domain, Financial Track

Goal: expand from daily operation to long-term self-development.

- Add Capability model/UI.
- Add LearningNeed model/UI.
- Add LifeDomain model/UI.
- Add FinancialGoal private UI.
- Keep financial goals private-only.

Exit criteria:

- The app shows current position, required capabilities, learning needs, and long-term private goals.

## Phase 8. Public Portfolio Layer

Goal: extract public career value from private evidence.

- Add public profile view.
- Add portfolio signal review.
- Add export candidates for LinkedIn/blog.
- Keep private reflections and financial data excluded.

Exit criteria:

- Public output is generated from reviewed evidence, not raw private notes.
