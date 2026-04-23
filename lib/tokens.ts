export const T = {
  household: '#2cb5a0',
  mustDo: '#f06449',
  ongoing: '#4a90d9',
  challenge: '#f5a623',
  baseline: '#9099a6',
  event: '#8b5cf6',

  householdBg: '#e8f8f6',
  mustDoBg: '#fdf0ed',
  ongoingBg: '#eaf3fc',
  challengeBg: '#fef6e8',
  baselineBg: '#f2f3f5',
  eventBg: '#f3effe',

  bg: '#f5f2ee',
  surface: '#ffffff',
  surf2: '#f0ece6',
  text: '#1e1a16',
  text2: '#6b6460',
  text3: '#9e9a96',
  border: '#e4dfd8',

  avatars: ['#e85d75', '#f5a623', '#2cb5a0', '#4a90d9', '#8b5cf6', '#f06449', '#44b77a', '#e8a838'],
} as const;

export const TASK_TYPES = {
  household: { label: 'Домашно', color: T.household, bg: T.householdBg },
  must_do: { label: 'Must‑do', color: T.mustDo, bg: T.mustDoBg },
  ongoing: { label: 'Ежедневно', color: T.ongoing, bg: T.ongoingBg },
  challenge: { label: 'Предизвик.', color: T.challenge, bg: T.challengeBg },
  baseline: { label: 'Базово', color: T.baseline, bg: T.baselineBg },
  event: { label: 'Събитие', color: T.event, bg: T.eventBg },
} as const;

export const STATUSES = {
  active: { label: 'Активна', color: T.ongoing, dot: '#4a90d9' },
  pending_approval: { label: 'Чака', color: T.challenge, dot: '#f5a623' },
  approved: { label: 'Одобрена', color: T.household, dot: '#2cb5a0' },
  rejected: { label: 'Отхвърлена', color: T.mustDo, dot: '#f06449' },
  expired: { label: 'Изтекла', color: T.baseline, dot: '#9099a6' },
} as const;

export const BADGE_TIERS = {
  bronze: '#cd7f32',
  silver: '#a8a9ad',
  gold: '#ffd700',
  legendary: '#8b5cf6',
} as const;

export const REWARD_ICONS = {
  none: '—',
  fixed: '🎯',
  choice: '🎲',
  mystery: '🎁',
} as const;
