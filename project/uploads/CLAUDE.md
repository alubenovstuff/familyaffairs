# CLAUDE.md — FamilyAffairs

> **Навигация по документацията**
> - Имплементираш нещо → ти си тук + `specs.md`
> - Взимаш архитектурно решение или нещо изглежда нелогично → `decisions.md`
> - Планираш следваща фаза или питаш за V2 → `backlog.md`

---

## What this is

Family operating system с **семейния календар като core**. Задачи, навици и точки се организират около споделен календар, в който всеки член има аватар и всеки тип активност има цвят.

**Stack**: Next.js 14 (App Router) · TypeScript strict · Tailwind · tRPC v11 · Prisma · PostgreSQL · NextAuth v5 · Pusher · Resend · Vercel

---

## Repo structure

```
app/(auth)/           login, register, onboarding, invite
app/(app)/
  home/               семеен календар — role-adapted, single route
  tasks/              board, detail, create/edit
  approvals/          pending approvals queue (parents only)
  wishes/             reward requests (wish list)
  profile/[id]/       member profile + points history + badges
  bonuses/new/        add bonus (parents only)
  settings/           family + personal settings
components/
  calendar/           CalendarWeek, CalendarMonth, CalendarDay
                      TaskBlock, EventBlock, UnscheduledStrip
                      AvatarFilterBar
  tasks/              TaskCard, TaskDetail, TaskForm, ApprovalQueue
  points/             PointsBadge, Ledger, StreakFlame
  rewards/            WishCard, MysteryBox, RewardReveal
  badges/             BadgeGrid, BadgeCard, BadgeReveal
  layout/             Shell, Nav, ProfileSwitcher
server/api/routers/   one tRPC router per domain
lib/
  points/engine.ts    ALL point mutations go here — never bypass
  recurrence/         rule compiler + next-instance generator
  streaks/            streak eval + milestone bonuses
  notifications/      push + email dispatch
  roles.ts            permission helpers — use these, never hardcode
jobs/                 Vercel Cron handlers (one file per job)
prisma/schema.prisma
lib/validators/       zod schemas for all forms
types/index.ts        shared domain types incl. JSON field shapes
```

---

## Roles

| Role | Auth | Key capability |
|------|------|----------------|
| `parent` | Login | Full admin — create tasks/events, approve, add bonuses, manage family |
| `teen` | Login | Claim tasks, request rewards, propose tasks, create own events |
| `child` | Profile switch | Simplified UI, claim via big button |
| `young_child` | Profile switch | Icon-only UI, parent acts on their behalf |
| `extended` | Login | Read-only |

Young children have no login — parent switches to their profile. Always use `lib/roles.ts` for permission checks.

---

## Non-negotiable rules

**Calendar is the home screen**
- `/home` renders the family calendar — week view by default
- Three entity types live on the calendar: `Event` (fixed time), `Task` (floating or scheduled), `Habit` (day-level)
- Tasks have `duration_minutes` and `due_at` but NO forced `starts_at` — floating by default
- A member may self-schedule a task into a slot (`scheduled_at`) — this does not affect approval flow

**Points — always through the engine**
- Never write to `points_ledger` or mutate `points_balance` directly in a router
- Always call `lib/points/engine.ts`
- Points are credited only after parent approval — never on claim submission
- `points_balance` = spendable, decrements on redemption
- `points_total_earned` = lifetime counter, never decrements

**Task lifecycle**
```
active → pending_approval → approved
                          ↘ rejected → active  (assignee may retry)
active → expired           (cron only; pending_approval is immune)
```

**Recurrence**
- `task_templates` = source of truth; `tasks` = single instances
- Generate only the next instance — never the full future series
- On instance approval → generate next instance immediately
- Events also support recurrence via `recurrence_rule` on `events` table

**Shared tasks**
- Assignees live in `task_assignments` (junction table) — never as an array on `tasks`
- Approval is per-task; parent may exclude individual assignees at approval time

**Reward redemption gate**
- Allowed only when: `points_balance >= cost_points` AND all `must_do` tasks today = `approved`
- Enforced in the tRPC mutation, not the component

**Mystery/choice rewards**
- Never expose `reward_options` to the client before task status = `approved`
- Filter in the tRPC router select — not in the component

---

## UI conventions

- `/home` renders the calendar — single route, role-based overlays via `useRole()`
- Calendar has avatar filter bar — click avatar to filter to that member's tasks/events
- Floating tasks render in an "unscheduled" strip at the top of each day column
- Task blocks are colored by `task_type`; event blocks by `event.color`; avatar dot shows assignee
- `young_child` age group: min tap target 64px, icon-based, no raw numbers
- Must-do tasks visually block the wish list until completed today
- Streak flame on tasks with `current_streak >= 3`
- All forms: `react-hook-form` + `zod` — define schemas in `lib/validators/`
- Dark mode: `dark:` Tailwind variants everywhere, no hardcoded colours

---

## DB / API conventions

- All IDs: `uuid @default(uuid())`
- Soft delete: `deleted_at DateTime?` on `tasks`, `task_templates`, `events` — no hard deletes
- JSON fields (`recurrence_rule`, `reward_options`, `milestone_bonuses`, `rotation_members`, `attendees`): typed in `types/index.ts`, always cast with `as`
- Indexes on: `family_id`, `user_id`, `status`, `due_at`, `starts_at`, `template_id`
- Parent-only mutations: `parentProcedure` middleware
- Lists (ledger, task history): cursor-based pagination

---

## Cron jobs

| File | Schedule | Does |
|------|----------|------|
| `daily-base-grants` | `0 0 * * *` | Grants base points to all active members; idempotent via `daily_base_grants` table |
| `expire-tasks` | `*/15 * * * *` | Sets `expired` on overdue `active` tasks; skips `pending_approval` |
| `generate-recurrences` | `5 0 * * *` | Creates next instance for recurring templates and events whose last instance is done/expired |
| `streak-evaluator` | `10 0 * * *` | Resets `current_streak` where no completion exists for today |
| `scheduled-bonuses` | `15 0 * * *` | Applies bonuses with `scheduled_at <= now()` and `applied_at IS NULL` |
| `badge-evaluator` | `20 0 * * *` | Checks all active badge_definitions against current data; writes to user_badges / family_badges |

All jobs must be **idempotent** — safe to run twice without side effects.
