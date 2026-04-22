# Дизайн система

_Started 2026-04-22 17:14 UTC_

---

## User

по тези документи можеш ли да разбереш проекта и да направиш дизайн система

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: invoke_skill]_

_[tool: copy_starter_component]_

_[tool: update_todos]_

_[tool: read_file]_

_[tool: update_todos]_

Разбирам — строя системата директно! Ще покрия цветове, типография, компоненти и role-базирани варианти.

_[tool: write_file]_

Строя!

_[tool: done]_

_[tool: fork_verifier_agent]_

Дизайн системата е готова! Ето какво покрива:

**8 секции:**
- **Foundation** — цветова палитра (6 task type цвята + 8 avatar цвята + неутрали), typography scale (Nunito + DM Sans), spacing/radius/shadows
- **Controls** — бутони, inputs, toggles, tab controls
- **Calendar** — седмичен изглед с unscheduled strip, TaskBlock, EventBlock, avatar filter bar
- **Tasks** — TaskCard за всички типове и статуси (active → pending → approved/rejected/expired)
- **Points & Gamification** — PointsBadge, StreakChip, мултипликатори, ledger rows, badge grid
- **Wish/Rewards** — WishCard варианти (available, pending, redeemed, locked, mystery)
- **Role-based UI** — young\_child (64px targets, icon-only), parent approval queue, permission matrix
- **Dark Mode** — token mapping light→dark + preview

Можеш да пан/zoom по canvas-а и да отваряш всеки artboard на цял екран за по-детайлен поглед.

## User

можеш ли да направип екрани по тези задания - първо списък с екрани и после един по един да ги мислим

## Assistant

От `specs.md` има 12 MVP екрана. Ето пълния списък:

| # | Route | Заглавие | Роли |
|---|-------|----------|------|
| 1 | `/login` | Вход / регистрация | Всички |
| 2 | `/onboarding` | Настройка на семейство | Parent |
| 3 | `/invite` | Покана на член | Parent |
| 4 | `/home` | **Семеен календар** ← core screen | Всички (role-adapted) |
| 5 | `/tasks` | Табло с обяви | Всички |
| 6 | `/tasks/[id]` | Детайл на задача | Всички |
| 7 | `/tasks/new` | Създаване на задача / събитие | Parent |
| 8 | `/approvals` | Pending approvals | Parent |
| 9 | `/profile/[id]` | Профил + точки + badges | Всички |
| 10 | `/wishes` | Wish list | Всички (role-adapted) |
| 11 | `/bonuses/new` | Добавяне на бонус | Parent |
| 12 | `/settings` | Настройки | Parent + All |

---

Бих предложил да започнем с **`/home` (Семейния календар)** — той е core screen-ът, от него зависи visual language-ът на останалите. После логично вървим към tasks flow, после gamification (wishes/profile), после parent-only екрани.

Съгласен ли си с това? Или искаш да започнем от `/login` и да вървим в ред?

## User

да започнем с /home

## Assistant

_[tool: questions_v2]_

## User

Questions answered:
- device: Mobile (375px)
- default_view: Week view (седмица)
- role: Parent (пълен достъп)
- calendar_density: Компактен — вижда се повече
- unscheduled_strip: Тясна лента с малки chips
- avatar_filter: Decide for me
- task_block_info: Decide for me
- variations: 2
- visual_direction: Playful & colorful (семейно приложение)

## Assistant

_[tool: copy_starter_component]_

_[tool: write_file]_

Строя! Два варианта — **Grid** (класически седмичен) и **Swimlanes** (по член на семейството).

_[tool: done]_

_[tool: fork_verifier_agent]_

Готово! Ето двата варианта на `/home`:

**A · Week Grid** — класически седмичен изглед с:
- Avatar filter bar (кликни аватар → филтрира задачите)
- Unscheduled strip с малки chips за floating задачи
- Compact time grid с цветни task blocks (цвят по тип, аватар dot на изпълнителя)
- Streak 🔥 индикатор директно в блока

**B · Swimlanes** — изглед по член на семейството:
- Day strip отгоре за навигация между дни
- Всеки член има своя карта с разгъваем списък с задачи
- Директен ✓ бутон за бързо изпълнение
- Точки earned за деня видими веднага

И двата варианта имат еднакви FAB (＋), bottom nav и pending badge.

Кой вариант ти харесва повече, или искаш да смесим елементи от двата?

## User

A background task has completed. Here are the results:

## Assistant

Верификацията мина чисто ✅

Кой вариант ти харесва — **A (Week Grid)** или **B (Swimlanes)**? Или комбинация от двата? После вървим към следващия екран.

## User

и двете са добре, и двете имат своята роля

## Assistant

Перфектно! Тогава:

- **A · Week Grid** → `/home` по подразбиране (седмичен overview за целия ден)
- **B · Swimlanes** → алтернативен view, достъпен чрез toggle (или отделен таб "По член")

Запазваме и двата в дизайн системата.

---

Кой екран следва? Предлагам:

**→ `/tasks` — Табло с обяви** (списък/board с всички задачи, филтри по статус и тип)

или ако предпочиташ да затворим parent flow-а първо:

**→ `/approvals` — Pending approvals** (директно свързан с pending badge-а от `/home`)

## User

/tasks

## Assistant

_[tool: questions_v2]_

## User

Questions answered:
- layout: Board (Kanban колони по статус)
- grouping: Decide for me
- filters: По статус, По тип, По член (assignee), По дата, Само моите задачи
- card_detail: Пълна — всичко вкл. streak и reward
- empty_state: Decide for me

## Assistant

_[tool: write_file]_

Строя! Kanban с пълни карти + 2 варианта — хоризонтален scroll board и вертикален grouped list.

_[tool: done]_

_[tool: fork_verifier_agent]_

Готово! Двата варианта на `/tasks`:

**A · Kanban Board** — хоризонтален scroll с 4 колони:
- Активни → Чакат одобрение → Одобрени → Отхвърлени
- Филтри: "Само моите" + по член + по тип
- Пълни карти с тип pill, streak 🔥, assignees, точки, reward икона

**B · Smart List** — групиран по дата:
- Tabs: Всички / Активни / Чакат / Готово
- Групи: Днес / Утре / По-късно / Приключени (разгъваеми)
- Бърз ✓ бутон директно в картата за active задачи
- Empty state с мотивиращо съобщение

---

Кой следва? Предлагам `/tasks/[id]` — детайл на задача, за да затворим tasks flow-а преди да минем към gamification.

## User

да /tasks/[id]

## Assistant

_[tool: questions_v2]_

## User

Questions answered:
- role_view: Parent (вижда всичко + одобрява)
- sections: Заглавие + тип + статус, Описание, Action buttons (одобри/отхвърли или изпълни)
- reward_reveal: Mystery reward се показва само след одобрение
- actions: Decide for me

## Assistant

_[tool: write_file]_

Строя — един интерактивен екран с approve flow и mystery reward reveal!

_[tool: done]_

_[tool: fork_verifier_agent]_

Готово! Три стейта на един екран:

**Чака одобрение** — интерактивен:
- Тапни **Одобри** → confetti burst + mystery reward reveal с shimmer анимация + точки с ×1.5 мултипликатор
- Тапни **Отхвърли** → поле за причина → потвърди
- Points preview bar показва точните точки преди approve

**След одобрение** — mystery 🎁 → 🎮 reveal с gradient карта

**Отхвърлена** — чисто, без drama

---

Следващ екран? Продължаваме с:
- **`/approvals`** — parent queue (свързан директно с pending badge)
- **`/profile/[id]`** — точки + badges
- **`/wishes`** — wish list

## User

давай

## Assistant

_[tool: write_file]_

Строя `/approvals` директно — достатъчно context имам!

_[tool: done]_

_[tool: fork_verifier_agent]_

Готово! Два варианта на `/approvals`:

**A · Queue list** — всички чакащи наведнъж:
- "Одобри всички" бутон горе вдясно
- Всяка карта показва: member, тип, streak, reward type, точки × мултипликатор
- Approve → slide out right | Reject → slide out left
- Summary bar "Днес: ✓ 3 одобрени"
- Empty state 🎉 след последната

**B · Card stack** — едно по едно:
- Progress bar горе показва напредъка
- Ghost карта отдолу за depth ефект
- История на обработените в лента отдолу
- По-фокусиран — добре за mobile

---

Следва `/profile/[id]` или `/wishes`? Предлагам profile — там се събира всичко: точки, streak, badges.

## User

/profile

## Assistant

_[tool: write_file]_

Строя директно!

_[tool: done]_

_[tool: fork_verifier_agent]_

Готово! Два варианта на `/profile`:

**A · Собствен профил** — с hero header и 3 tabs:
- **Значки** — earned badges с tier цветове + предстоящи (затъмнени)
- **Точки** — пълна ledger история с source type, дата, streak бонус бележки
- **Задачи** — седмичен streak calendar + breakdown по тип с progress bars
- Level progress bar в hero-то

**B · Родителски изглед** — по-компактен:
- Big points display (баланс vs. общо спечелени)
- Streak banner с ×2.0 мултипликатор
- Badges horizontal scroll
- Quick ledger preview
- **⭐ Бонус** бутон → bottom sheet с amount selector (10/20/50/100) + бележка → изпращане с анимация

---

Остават: `/wishes`, `/tasks/new`, `/login`, `/onboarding`. Кой следва?

## User

/tasks/new

## Assistant

_[tool: write_file]_

Строя — wizard форма vs. single scroll!

_[tool: done]_

_[tool: fork_verifier_agent]_

Готово! Два варианта на `/tasks/new`:

**A · Step wizard** — фокусиран, стъпка по стъпка:
- Progress bar показва напредъка
- **Стъпка 1** — избор на тип (визуални карти с описание)
- **Стъпка 2** — заглавие, описание, duration chips, точки, повторение
- **Стъпка 3** — assignees + split type (равно/пълно/по избор)
- **Стъпка 4** — вид награда (none/fixed/choice/mystery)
- Превключва между Задача и Събитие с отделен flow
- Success state 🎉 след създаване

**B · Single scroll** — power user:
- Всичко видимо наведнъж
- Type picker като хоризонтален scroll
- Live preview карта появява се след въвеждане на заглавие
- "Запази" бутон горе вдясно — активира се само след title

---

Остават: `/wishes`, `/login`, `/onboarding`, `/settings`. Кой следва?

## User

/wishes

## Assistant

_[tool: write_file]_

Строя директно!

_[tool: done]_

_[tool: fork_verifier_agent]_

Готово! Два варианта на `/wishes`:

**A · Child/Teen view** — интерактивен:
- Points balance горе вдясно
- 🔒 Must-do gate — показва чеклист с днешните must-do задачи (тапни за маркиране), блокира "Заяви" докато не са готови
- Grid с налични награди — locked overlay, "Малко" ако нямаш достатъчно точки
- Mystery 🎁 с float анимация → тапни "Заяви" → **mystery reveal overlay** с shimmer gradient
- Pending и redeemed секции
- ＋ FAB → bottom sheet за ново желание

**B · Parent view** — два таба:
- **Заявки** — unpriced (нужна оценка) с inline price picker (chips + input), priced с approve/reject
- **Каталог** — семейният reward каталог с add/edit

---

Остават: `/login`, `/onboarding`, `/settings`. Продължаваме?

## User

/settings

## Assistant

_[tool: write_file]_

Строя директно!

_[tool: done]_

_[tool: fork_verifier_agent]_

Готово! Два варианта на `/settings`:

**A · Parent view** — пълни настройки с под-екрани:
- Profile card с edit аватар
- **Семейни настройки** → под-екран: daily base points (chips), авто-одобрение toggle, streak мултипликатори, опасна зона
- **Членове** → под-екран: списък с роли + чакащи покани
- Notifications, Privacy, Account секции с toggles
- Danger zone: изтрий акаунт/семейство

**B · Teen view** — ограничен достъп:
- Inline color picker за аватар (🎨 иконка → разгъва се)
- Notification toggles по тип (одобрения, значки, бонуси, дедлайни)
- **"Само за родители"** секция — затъмнена с 🔒 обяснение
- По-чист, по-малко опции

---

**Всички 8 екрана са готови!** Остават: `/login` и `/onboarding`. Правим ли ги, или предпочиташ да прегледаме и итерираме нещо от вече направеното?

## User

имаме ли екран с всички баджове, които могат да се печелят

## Assistant

_[tool: write_file]_

Нямаме — имаме само badge grid в профила. Строя отделен Badge Explorer екран!

_[tool: done]_

_[tool: fork_verifier_agent]_

Готово! Два варианта на Badge екрана:

**A · Семеен badge explorer** — пълен каталог:
- Tier filter chips (Бронз/Сребро/Злато/Легендарен) + "Спечелени" toggle
- Category tabs (Стрийк / Задачи / Точки / Типове / Семейство / Специални)
- Семеен progress bar с breakdown по tier
- 3-колонна grid — progress bar за неспечелени, earned-by аватари
- 🔒 Mystery badge скрит докато не е спечелен
- **Тапни badge → detail bottom sheet** с glow анимация, прогрес, кой го е спечелил

**B · Личен прогрес (Елена)** — индивидуален изглед:
- Tier stats row (брой спечелени от всеки tier)
- **В прогрес** — хоризонтален list с progress bars и точен брой
- Locked grid с 🔒 mystery badges
- Тапни badge → същия detail sheet

---

**Пълен списък на направените екрани:**
`/home` · `/tasks` · `/tasks/[id]` · `/tasks/new` · `/approvals` · `/profile` · `/wishes` · `/settings` · `Badges`

Остават само `/login` и `/onboarding`. Правим ли ги?

## User

da

## Assistant

_[tool: write_file]_

Строя `/login` и `/onboarding` в един файл!

_[tool: done]_

_[tool: fork_verifier_agent]_

Готово! `/login` + `/onboarding` в един файл:

**Login:**
- Gradient hero с 🏡 floating анимация
- Вход / Регистрация tab toggle
- Забравена парола link
- Profile switcher за деца (без логин) — Елена и Иван директно
- Success state след вход

**Onboarding — 5 стъпки (всички интерактивни):**
1. **Добре дошли** — feature pills с анимация
2. **Семейство** — name input + timezone picker + live preview
3. **Членове** — add/remove, role selector (Родител/Тийн/Дете/Малко дете), avatar color picker, inline name
4. **Точки** — daily base chips, авто-одобрение toggle, streak мултипликатори info
5. **Готово!** — summary, "покани изпратени" badge → към календара

---

**Всички екрани са завършени! 🎉**

| # | Екран | Файл |
|---|-------|------|
| 1 | /home | Home Screen.html |
| 2 | /tasks | Tasks Screen.html |
| 3 | /tasks/[id] | Task Detail Screen.html |
| 4 | /tasks/new | Create Task Screen.html |
| 5 | /approvals | Approvals Screen.html |
| 6 | /profile | Profile Screen.html |
| 7 | /wishes | Wishes Screen.html |
| 8 | /settings | Settings Screen.html |
| 9 | Badges | Badges Screen.html |
| 10 | /login + /onboarding | Login & Onboarding.html |

Плюс Design System с всички токени. Какво следва — итерации, нов екран, или нещо друго?

## User

да направим експорт на всичко това към claude code

