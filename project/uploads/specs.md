# specs.md — FamilyAffairs MVP

> Само MVP scope (фази 0–3). За V2 и отворени въпроси → `backlog.md`. За "защо" → `decisions.md`.

---

## Core concept

Семейният календар е централният екран. Всичко останало — задачи, навици, точки — се организира около него. Отваряш приложението и виждаш седмицата на цялото семейство като един жив организъм.

---

## Три типа calendar entities

| Entity | Описание | Points | Approval |
|--------|---------|--------|---------|
| `Event` | Фиксиран час, без изпълнение — рожден ден, час по пиано, лекар | Няма | Няма |
| `Task` | Floating или scheduled — има `duration_minutes`, `due_at`, approval flow | Да | Да |
| `Habit` | Streak-базиран — маркира се за деня, без конкретен час | Да | Опционално |

**Task scheduling**: задачите имат `duration_minutes` и `due_at` (краен срок), но **без фиксирано `starts_at`**. Floating по подразбиране — рендират се като неразположени блокове в деня. Членът може сам да ги планира в конкретен слот ако иска.

**Event**: фиксиран `starts_at` + `duration_minutes`. Рендира се като блок в точния времеви слот.

---

## Task types

| Type | Reward | Points | Deadline | Notes |
|------|--------|--------|----------|-------|
| `household` | Optional | 5–20 | Optional | Chores; may have rotation |
| `must_do` | Optional / mystery | 15–30 | Soft | Blocks reward redemption if incomplete |
| `ongoing` | Optional | 10/occurrence | Per occurrence | Recurring schedule |
| `challenge` | Milestone bonuses | 20/day | Per day | Streak mechanic |
| `baseline` | None | 0 | Optional | Accountability only |

**Reward types**: `none` · `fixed` · `choice` (2–3 options revealed at approval) · `mystery` (hidden until approval)

**Split types** (shared tasks): `equal` · `custom` (parent sets % per assignee) · `full` (everyone gets full points)

**Цветове**: всеки `task_type` има системен цвят; всеки `user` има аватар цвят. Календарът използва и двата — цвят на блока по тип, аватар на изпълнителя.

---

## Calendar color system

| Task type | Цвят |
|-----------|------|
| `household` | Teal |
| `must_do` | Coral |
| `ongoing` | Blue |
| `challenge` | Amber |
| `baseline` | Gray |
| `event` | Purple |

Всеки `user` има `avatar_color` поле — показва се като малък кръг върху блока в календара.

---

## Points economy

**Sources**

| Source | Trigger | Amount |
|--------|---------|--------|
| Daily base | Cron 00:01 | Configurable per family (default 10) |
| Task approval | Parent approves | `planned_points` × streak multiplier |
| Streak milestone | Streak hits threshold | Defined in `milestone_bonuses` JSON |
| Bonus | Parent adds | Free-form |

**Streak multipliers** (applied at approval)

| Streak | Multiplier |
|--------|-----------|
| 1–6 days | ×1.0 |
| 7–13 days | ×1.5 |
| 14–29 days | ×2.0 |
| 30+ days | ×3.0 |

**Ledger `source_type` values**: `task_approval` · `daily_base` · `streak_bonus` · `bonus` · `redemption` · `penalty`

---

## Recurrence rule shape (JSON)

```ts
{ freq: "daily" }
{ freq: "weekly", days: [0, 3] }      // 0 = Sunday
{ freq: "monthly", day: 1 }
{ freq: "weekdays" }
{ freq: "interval", every: 3, unit: "days" }
```

Template also carries `rotation_members: uuid[]` (cycled per instance) and `paused_until: date`.

---

## DB tables

| Table | Key fields |
|-------|-----------|
| `families` | `id`, `name`, `timezone`, `daily_base_points`, `auto_approve_hours` |
| `users` | `id`, `family_id`, `name`, `email`, `role`, `age_group`, `avatar_color`, `tracking_public`, `points_balance`, `points_total_earned` |
| `events` | `id`, `family_id`, `created_by`, `title`, `starts_at`, `ends_at`, `all_day`, `color`, `recurrence_rule`, `attendees` (uuid[]) |
| `task_templates` | `id`, `family_id`, `created_by`, `title`, `task_type`, `color`, `duration_minutes`, `recurrence_rule`, `rotation_members`, `paused_until`, `planned_points`, `reward_type`, `reward_options`, `split_type`, `due_offset_hours`, `penalty_points` |
| `tasks` | `id`, `template_id`, `family_id`, `created_by`, `approved_by`, `title`, `task_type`, `color`, `duration_minutes`, `scheduled_at`, `status`, `due_at`, `expired_at`, `planned_points`, `reward_type`, `reward_options`, `split_type`, `penalty_points`, `approved_at`, `deleted_at` |
| `task_assignments` | `id`, `task_id`, `user_id`, `points_share`, `claimed_at`, `approved_at`, `excluded_at` |
| `task_streaks` | `id`, `template_id`, `user_id`, `current_streak`, `longest_streak`, `last_completed_at`, `milestone_bonuses` |
| `reward_requests` | `id`, `family_id`, `requested_by`, `title`, `description`, `status`, `difficulty`, `cost_points`, `redeemed_at` |
| `bonuses` | `id`, `family_id`, `recipient_id` (null = family scope), `created_by`, `points`, `reason`, `type`, `scope`, `scheduled_at`, `applied_at` |
| `points_ledger` | `id`, `user_id`, `family_id`, `delta`, `source_type`, `source_id`, `note`, `balance_after` |
| `daily_base_grants` | `id`, `user_id`, `grant_date`, `points` — idempotency log |
| `badge_definitions` | `id`, `slug`, `name`, `description`, `tier`, `scope`, `condition_type`, `condition_value`, `icon`, `is_active`, `available_from`, `available_until` |
| `user_badges` | `id`, `user_id`, `badge_id`, `earned_at`, `is_featured` |
| `family_badges` | `id`, `family_id`, `badge_id`, `earned_at`, `earned_by_members` (uuid[]) |

---

## MVP screens

| # | Route | Title | Roles |
|---|-------|-------|-------|
| 1 | `/login` | Вход / регистрация | All |
| 2 | `/onboarding` | Настройка на семейство | Parent |
| 3 | `/invite` | Покана на член | Parent |
| 4 | `/home` | Семеен календар | All (role-adapted) |
| 5 | `/tasks` | Таблото с обяви | All |
| 6 | `/tasks/[id]` | Детайл на задача | All |
| 7 | `/tasks/new` | Създаване на задача / събитие | Parent |
| 8 | `/approvals` | Pending approvals | Parent |
| 9 | `/profile/[id]` | Профил + точки + badge-ове | All |
| 10 | `/wishes` | Wish list | All (role-adapted) |
| 11 | `/bonuses/new` | Добавяне на бонус | Parent |
| 12 | `/settings` | Настройки | Parent + All |

**Home screen — семеен календар**: седмичен изглед по подразбиране. Лента с аватари на членовете — кликване филтрира към техните задачи. Floating задачи се показват в "unscheduled" лента в горната част на деня. Events заемат точния времеви слот. Превключване месечен/седмичен/дневен изглед.

---

## Notifications (MVP)

| Event | Recipient | Channel |
|-------|-----------|---------|
| Completion claimed | Task creator | Push + in-app |
| Task approved | Assignee(s) | Push + in-app |
| Task rejected | Assignee(s) | Push + in-app |
| Deadline in 24h | Assignee(s) | Push |
| Event tomorrow | Attendees | Push |
| Reward request priced | Child | Push + in-app |
| Bonus granted | Recipient | Push + in-app |
| Badge earned | Earner (+ family for family badges) | Push + in-app |
| Weekly family digest | All | Email (Sunday 18:00) |

---

## MVP build phases

| Phase | Duration | Delivers |
|-------|----------|---------|
| 0 — Foundation | 1–2 weeks | Next.js + Prisma + Auth + invite flow + CI/CD |
| 1 — Calendar core | 3–4 weeks | Events CRUD, calendar view (week/month/day), avatar filters, task blocks on calendar |
| 2 — Tasks & points | 3–4 weeks | Task CRUD, assignments, approval flow, points engine, floating vs scheduled tasks, crons |
| 3 — Streaks, wishes & badges | 3–4 weeks | Challenge/streak, mystery rewards, wish list, must-do gate, recurrence, bonuses, badge engine |
| 4 — Notifications | 2–3 weeks | Push, email digest, notification preferences, in-app centre |
