import { T } from './tokens';
import type { Member, Task, CalendarTask, Badge, WishItem, LedgerEntry } from '@/types';

export const MEMBERS: Member[] = [
  { id: 'mama', name: 'Мама', init: 'М', color: T.avatars[0], role: 'parent', pointsBalance: 240, pointsTotalEarned: 1240, currentStreak: 14 },
  { id: 'petko', name: 'Петко', init: 'П', color: T.avatars[1], role: 'teen', pointsBalance: 185, pointsTotalEarned: 920, currentStreak: 7 },
  { id: 'elena', name: 'Елена', init: 'Е', color: T.avatars[2], role: 'child', pointsBalance: 95, pointsTotalEarned: 640, currentStreak: 3 },
  { id: 'ivan', name: 'Иван', init: 'И', color: T.avatars[3], role: 'young_child', pointsBalance: 45, pointsTotalEarned: 280, currentStreak: 5 },
];

export const ALL_MEMBER = { id: 'all', name: 'Всички', init: '', color: T.text, role: 'parent' as const, pointsBalance: 0, pointsTotalEarned: 0, currentStreak: 0 };

export const DAYS = ['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'];
export const DATES = [20, 21, 22, 23, 24, 25, 26];
export const TODAY_IDX = 2;

export const CALENDAR_TASKS: Record<number, CalendarTask[]> = {
  0: [
    { type: 'household', title: 'Кухня', dur: 20, member: 0, y: 8, h: 2, streak: false },
    { type: 'ongoing', title: 'Четене', dur: 20, member: 3, y: 10, h: 2, streak: true },
  ],
  1: [
    { type: 'must_do', title: 'Домашно', dur: 45, member: 2, y: 9, h: 3, streak: false },
    { type: 'event', title: 'Пиано', dur: 45, member: 1, y: 16, h: 3, streak: false },
  ],
  2: [
    { type: 'challenge', title: 'Спорт', dur: 30, member: 1, y: 8, h: 2, streak: true },
    { type: 'household', title: 'Маса', dur: 10, member: 2, y: 11, h: 1, streak: false },
    { type: 'must_do', title: 'Матем.', dur: 40, member: 1, y: 14, h: 3, streak: false },
  ],
  3: [
    { type: 'ongoing', title: 'Четене', dur: 20, member: 2, y: 9, h: 2, streak: true },
    { type: 'event', title: 'Лекар', dur: 60, member: 0, y: 10, h: 4, streak: false },
  ],
  4: [
    { type: 'household', title: 'Стая', dur: 25, member: 1, y: 8, h: 2, streak: false },
    { type: 'challenge', title: 'Спорт', dur: 30, member: 2, y: 10, h: 2, streak: true },
  ],
  5: [
    { type: 'event', title: 'Рожден ден', dur: 120, member: 0, y: 11, h: 5, streak: false },
  ],
  6: [],
};

export const UNSCHEDULED_TASKS = [
  { type: 'must_do' as const, title: 'Боклук', member: 0 },
  { type: 'household' as const, title: 'Перне', member: 1 },
  { type: 'ongoing' as const, title: 'Завод', member: 2 },
];

export const TASKS: Task[] = [
  { id: 1, title: 'Изчисти кухнята', type: 'household', status: 'active', assignees: [0, 1], pts: 15, due: 'Днес', streak: 0, reward: 'fixed', rewardLabel: '+15 т.', description: 'Избърши плотовете, измий чиниите и изчисти фурната.', duration: 30 },
  { id: 2, title: 'Домашно по математика', type: 'must_do', status: 'pending_approval', assignees: [2], pts: 20, due: 'Днес', streak: 7, reward: 'mystery', rewardLabel: '???', description: 'Реши задачи от страница 42–44.', duration: 45 },
  { id: 3, title: 'Сутрешен спорт', type: 'challenge', status: 'approved', assignees: [1], pts: 25, due: 'Всеки ден', streak: 14, reward: 'choice', rewardLabel: 'Избор', description: 'Бягане или колоездене за 30 минути.', duration: 30 },
  { id: 4, title: 'Прочети 20 минути', type: 'ongoing', status: 'active', assignees: [2, 3], pts: 10, due: 'Утре', streak: 3, reward: 'fixed', rewardLabel: '+10 т.', description: 'Четене по избор — книга или образователна статия.', duration: 20 },
  { id: 5, title: 'Провери заданието', type: 'baseline', status: 'rejected', assignees: [1], pts: 0, due: 'Вчера', streak: 0, reward: 'none', rewardLabel: '—', duration: 15 },
  { id: 6, title: 'Наредете масата', type: 'household', status: 'active', assignees: [0, 2], pts: 10, due: 'Днес', streak: 0, reward: 'none', rewardLabel: '—', duration: 10 },
  { id: 7, title: 'Пране + прибиране', type: 'household', status: 'pending_approval', assignees: [0], pts: 20, due: 'Утре', streak: 2, reward: 'fixed', rewardLabel: '+20 т.', duration: 40 },
  { id: 8, title: 'Упражнения пиано', type: 'ongoing', status: 'active', assignees: [2], pts: 15, due: 'Утре', streak: 5, reward: 'fixed', rewardLabel: '+15 т.', duration: 30 },
  { id: 9, title: 'Спортувай 30 мин', type: 'challenge', status: 'active', assignees: [3], pts: 20, due: 'Днес', streak: 1, reward: 'mystery', rewardLabel: '???', duration: 30 },
  { id: 10, title: 'Почисти стаята', type: 'household', status: 'approved', assignees: [1], pts: 15, due: 'Днес', streak: 0, reward: 'fixed', rewardLabel: '+15 т.', duration: 25 },
];

export const BADGES: Badge[] = [
  { id: 'streak-7', icon: '🔥', name: 'Стрийк 7', tier: 'bronze', earned: true, category: 'streak', description: 'Завърши задача 7 дни подред', progress: 7, maxProgress: 7, earnedBy: [0, 1] },
  { id: 'streak-14', icon: '🔥', name: 'Стрийк 14', tier: 'silver', earned: true, category: 'streak', description: 'Завърши задача 14 дни подред', progress: 14, maxProgress: 14, earnedBy: [0] },
  { id: 'streak-30', icon: '🔥', name: 'Стрийк 30', tier: 'gold', earned: false, category: 'streak', description: 'Завърши задача 30 дни подред', progress: 14, maxProgress: 30 },
  { id: 'tasks-100', icon: '✅', name: 'Сто задачи', tier: 'silver', earned: true, category: 'tasks', description: 'Завърши 100 задачи', progress: 100, maxProgress: 100, earnedBy: [0, 1, 2] },
  { id: 'tasks-500', icon: '🏆', name: 'Чистач', tier: 'gold', earned: false, category: 'tasks', description: 'Завърши 500 задачи', progress: 234, maxProgress: 500 },
  { id: 'points-1000', icon: '⭐', name: 'Хиляда точки', tier: 'bronze', earned: true, category: 'points', description: 'Спечели 1000 точки общо', earnedBy: [0, 1] },
  { id: 'challenge-king', icon: '👑', name: 'Легенда', tier: 'legendary', earned: false, category: 'special', description: 'Завърши 50 предизвикателства', progress: 23, maxProgress: 50 },
  { id: 'family-1', icon: '👨‍👩‍👧‍👦', name: 'Семейство', tier: 'bronze', earned: true, category: 'family', description: 'Цялото семейство активно 30 дни', earnedBy: [0, 1, 2, 3] },
  { id: 'mystery-1', icon: '🔒', name: '???', tier: 'legendary', earned: false, category: 'special', description: 'Неизвестен значок' },
  { id: 'sport-champ', icon: '🏅', name: 'Спортист', tier: 'silver', earned: true, category: 'tasks', description: 'Спортувай 50 пъти', earnedBy: [1] },
  { id: 'reader', icon: '📚', name: 'Четец', tier: 'bronze', earned: true, category: 'tasks', description: 'Прочети 20 пъти', earnedBy: [2] },
  { id: 'perfect-week', icon: '🌟', name: 'Перфектна седм.', tier: 'gold', earned: false, category: 'tasks', description: 'Завърши всички задачи за цяла седмица', progress: 0, maxProgress: 1 },
];

export const WISHES: WishItem[] = [
  { id: 1, title: 'Видеоигри 1ч', pts: 80, status: 'available' },
  { id: 2, title: 'Кино вечер', pts: 120, status: 'pending' },
  { id: 3, title: 'Пица вечер', pts: 60, status: 'redeemed' },
  { id: 4, title: 'Нова книга', pts: 100, status: 'available', locked: true },
  { id: 5, title: 'Изненада', pts: 150, status: 'available', mystery: true },
  { id: 6, title: 'Час извън', pts: 90, status: 'available' },
];

export const LEDGER: LedgerEntry[] = [
  { id: 1, icon: '✓', label: 'Изчисти кухнята', source: 'task_approval', delta: 20, date: 'Днес 14:32', color: T.household },
  { id: 2, icon: '⭐', label: 'Дневна база', source: 'daily_base', delta: 10, date: 'Днес 00:01', color: T.challenge },
  { id: 3, icon: '🔥', label: 'Стрийк бонус ×1.5', source: 'streak_bonus', delta: 15, date: 'Вчера 22:05', color: T.challenge },
  { id: 4, icon: '🎁', label: 'Redemption — Видеоигри', source: 'redemption', delta: -80, date: 'Вчера 16:10', color: T.mustDo },
  { id: 5, icon: '✓', label: 'Сутрешен спорт', source: 'task_approval', delta: 25, date: 'Вчера 09:12', color: T.challenge },
  { id: 6, icon: '⭐', label: 'Бонус от мама', source: 'bonus', delta: 50, date: '20 Апр 18:30', color: T.challenge },
  { id: 7, icon: '✓', label: 'Домашно по математика', source: 'task_approval', delta: 30, date: '20 Апр 15:00', color: T.mustDo },
];
