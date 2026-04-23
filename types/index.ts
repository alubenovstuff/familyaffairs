export type TaskType = 'household' | 'must_do' | 'ongoing' | 'challenge' | 'baseline';
export type TaskStatus = 'active' | 'pending_approval' | 'approved' | 'rejected' | 'expired';
export type RewardType = 'none' | 'fixed' | 'choice' | 'mystery';
export type SplitType = 'equal' | 'custom' | 'full';
export type UserRole = 'parent' | 'teen' | 'child' | 'young_child' | 'extended';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'legendary';
export type WishStatus = 'available' | 'pending' | 'redeemed';
export type LedgerSourceType =
  | 'task_approval'
  | 'daily_base'
  | 'streak_bonus'
  | 'bonus'
  | 'redemption'
  | 'penalty';

export interface Member {
  id: string;
  name: string;
  init: string;
  color: string;
  role: UserRole;
  pointsBalance: number;
  pointsTotalEarned: number;
  currentStreak: number;
}

export interface Task {
  id: number;
  title: string;
  type: TaskType;
  status: TaskStatus;
  assignees: number[];
  pts: number;
  due: string;
  streak: number;
  reward: RewardType;
  rewardLabel: string;
  description?: string;
  duration?: number;
}

export interface CalendarTask {
  type: TaskType | 'event';
  title: string;
  dur: number;
  member: number;
  y: number;
  h: number;
  streak: boolean;
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  tier: BadgeTier;
  earned: boolean;
  category: string;
  description: string;
  progress?: number;
  maxProgress?: number;
  earnedBy?: number[];
}

export interface WishItem {
  id: number;
  title: string;
  pts: number;
  status: WishStatus;
  locked?: boolean;
  mystery?: boolean;
}

export interface LedgerEntry {
  id: number;
  icon: string;
  label: string;
  source: LedgerSourceType;
  delta: number;
  date: string;
  color: string;
}
