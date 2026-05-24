# Source of Truth

This app repo is the implementation layer for Sapporo Life OS.

The living planning documents are maintained in the Obsidian Life OS vault:

```text
F:\ai-obsidian\지식창고\wiki\projects\Sapporo-Life-OS-MVP\project-docs
```

## Operating Rule

```text
Obsidian wiki = product source of truth
App repo docs = implementation reference
App code = running product
```

Do not copy the entire PRD into this repo. If product direction, scope, data model, privacy policy, or daily loop changes, update the Obsidian wiki first, then reflect the decision in this repo.

## Key Wiki Docs

```text
03-prd.md
05-information-architecture.md
06-screen-flow-wireframe.md
07-data-model.md
09-tech-stack.md
10-api-design.md
11-privacy-publication-policy.md
12-mvp-roadmap.md
14-orchestration-guide.md
15-daily-operating-loop.md
16-development-plan.md
17-quality-test-plan.md
```

## Current Implementation Scope

MVP v0.1 focuses on the daily operating loop:

- `/` Today dashboard
- `/north-star` North Star alignment
- `/review` Weekly review
- Task
- Reflection
- LearningLog
- Review
- Supabase SDK first

Deferred:

- Prisma
- Supabase Auth
- Supabase Storage
- AI Agent
- RAG
- LinkedIn/public export
