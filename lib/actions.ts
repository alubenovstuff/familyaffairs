'use server';

import { createServerClient } from './supabase';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import type { Database } from './db.types';

type TaskRow = Database['public']['Tables']['tasks']['Row'];
type TaskWithAssignees = TaskRow & { task_assignees: { member_id: string }[] };
type DB = ReturnType<typeof createServerClient>;

const DEFAULT_BADGES = [
  { emoji: '🔥', title: 'Пламък',          description: 'Изпълни задачи 3 дни подред',   category: 'streak', tier: 'bronze',    pts_reward: 10, requirement_value: 3 },
  { emoji: '🔥', title: 'Огнена серия',     description: 'Изпълни задачи 7 дни подред',   category: 'streak', tier: 'silver',    pts_reward: 25, requirement_value: 7 },
  { emoji: '⚡', title: 'Легенден стрийк', description: 'Изпълни задачи 21 дни подред',  category: 'streak', tier: 'gold',      pts_reward: 50, requirement_value: 21 },
  { emoji: '✅', title: 'Начало',           description: 'Одобри 5 задачи',              category: 'tasks',  tier: 'bronze',    pts_reward: 10, requirement_value: 5 },
  { emoji: '🏆', title: 'Прилежен',         description: 'Одобри 25 задачи',             category: 'tasks',  tier: 'silver',    pts_reward: 25, requirement_value: 25 },
  { emoji: '👑', title: 'Майстор',          description: 'Одобри 75 задачи',             category: 'tasks',  tier: 'gold',      pts_reward: 50, requirement_value: 75 },
  { emoji: '⭐', title: 'Запалил се',       description: 'Спечели 100 точки',            category: 'points', tier: 'bronze',    pts_reward: 10, requirement_value: 100 },
  { emoji: '💰', title: 'Събирач',          description: 'Спечели 500 точки',            category: 'points', tier: 'silver',    pts_reward: 25, requirement_value: 500 },
  { emoji: '💎', title: 'Богаташ',          description: 'Спечели 2000 точки',           category: 'points', tier: 'gold',      pts_reward: 50, requirement_value: 2000 },
] as const;

async function seedDefaultBadges(db: DB, familyId: string) {
  await db.from('badges').insert(
    DEFAULT_BADGES.map(b => ({ ...b, family_id: familyId })),
  );
}

async function checkAndAwardBadges(
  db: DB,
  memberId: string,
  familyId: string,
  currentStreak: number,
  pointsEarned: number,
  approvedTasks: number,
) {
  const [{ data: allBadges }, { data: earnedRows }] = await Promise.all([
    db.from('badges').select('*').eq('family_id', familyId),
    db.from('member_badges').select('badge_id').eq('member_id', memberId),
  ]);

  const earnedIds = new Set(earnedRows?.map(e => e.badge_id) ?? []);

  for (const badge of allBadges ?? []) {
    if (earnedIds.has(badge.id) || badge.requirement_value === null) continue;
    const v = badge.requirement_value;
    const qualifies =
      (badge.category === 'streak' && currentStreak >= v) ||
      (badge.category === 'tasks'  && approvedTasks >= v) ||
      (badge.category === 'points' && pointsEarned  >= v);
    if (!qualifies) continue;

    await db.from('member_badges').insert({ member_id: memberId, badge_id: badge.id });
    if (badge.pts_reward > 0) {
      await db.rpc('increment_points', { p_member_id: memberId, p_amount: badge.pts_reward });
      await db.from('ledger').insert({
        member_id: memberId,
        family_id: familyId,
        amount: badge.pts_reward,
        description: `🏅 Значка: ${badge.title}`,
        type: 'bonus',
        badge_id: badge.id,
      });
    }
  }
}

async function getSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session as typeof session & { user: { id: string } };
}

async function getMemberFamily(userId: string) {
  const db = createServerClient();
  const { data } = await db
    .from('members')
    .select('id, family_id')
    .eq('user_id', userId)
    .single();
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────

export async function registerUser(email: string, password: string, name: string) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true,
  });

  if (error) throw new Error(error.message);
  return data.user;
}

// ── Family setup (onboarding) ─────────────────────────────────────────────

export async function createFamily(
  familyName: string,
  dailyBasePts: number,
  parentName: string,
  parentColor: string,
  membersInput: Array<{ name: string; role: string; color: string }>,
) {
  const session = await getSession();
  const db = createServerClient();

  const { data: family, error: famErr } = await db
    .from('families')
    .insert({ name: familyName, daily_base_pts: dailyBasePts, auto_approve: 'Off' })
    .select()
    .single();

  if (famErr || !family) throw new Error(famErr?.message ?? 'Family creation failed');

  function makeInit(name: string) {
    return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  // Registrant is always the first parent, linked to their auth account
  const allMembers = [
    {
      family_id: family.id,
      name: parentName,
      init: makeInit(parentName),
      color: parentColor,
      role: 'parent',
      user_id: session.user.id,
      points_balance: 0,
      points_total_earned: 0,
      current_streak: 0,
    },
    ...membersInput.map((m) => ({
      family_id: family.id,
      name: m.name,
      init: makeInit(m.name),
      color: m.color,
      role: m.role,
      user_id: null as string | null,
      points_balance: 0,
      points_total_earned: 0,
      current_streak: 0,
    })),
  ];

  const { error: memErr } = await db.from('members').insert(allMembers);
  if (memErr) throw new Error(memErr.message);

  await seedDefaultBadges(db, family.id);

  revalidatePath('/home');
  return family;
}

// ── Tasks ─────────────────────────────────────────────────────────────────

export async function getTasks() {
  const session = await getSession();
  const db = createServerClient();
  const member = await getMemberFamily(session.user.id);
  if (!member) return [];

  const { data } = await db
    .from('tasks')
    .select('*, task_assignees(member_id)')
    .eq('family_id', member.family_id)
    .order('created_at', { ascending: false });

  return (data ?? []) as unknown as TaskWithAssignees[];
}

export async function createTask(input: {
  title: string;
  type: string;
  pts: number;
  due: string | null;
  description: string | null;
  reward: string;
  reward_label: string | null;
  assignee_ids: string[];
}) {
  const session = await getSession();
  const db = createServerClient();
  const member = await getMemberFamily(session.user.id);
  if (!member) throw new Error('No family found');

  const { data: task, error } = await db
    .from('tasks')
    .insert({
      family_id: member.family_id,
      title: input.title,
      type: input.type,
      pts: input.pts,
      due: input.due,
      description: input.description,
      reward: input.reward,
      reward_label: input.reward_label,
      status: 'active',
      streak: 0,
      created_by: member.id,
    })
    .select()
    .single();

  if (error || !task) throw new Error(error?.message ?? 'Task creation failed');

  if (input.assignee_ids.length > 0) {
    await db.from('task_assignees').insert(
      input.assignee_ids.map((mid) => ({ task_id: task.id, member_id: mid })),
    );
  }

  revalidatePath('/tasks');
  return task;
}

export async function approveTask(taskId: string) {
  const session = await getSession();
  const db = createServerClient();
  const member = await getMemberFamily(session.user.id);
  if (!member) throw new Error('No family found');

  const { data: task } = await db.from('tasks').select('pts, title').eq('id', taskId).single();
  if (!task) throw new Error('Task not found');

  await db.from('tasks').update({ status: 'approved' }).eq('id', taskId);

  // Award points to all assignees
  const { data: assignees } = await db
    .from('task_assignees')
    .select('member_id')
    .eq('task_id', taskId);

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (assignees) {
    for (const a of assignees) {
      await db.rpc('increment_points', { p_member_id: a.member_id, p_amount: task.pts });
      await db.from('ledger').insert({
        member_id: a.member_id,
        family_id: member.family_id,
        amount: task.pts,
        description: `✅ ${task.title}`,
        type: 'earned',
        task_id: taskId,
      });

      const { data: m } = await db
        .from('members')
        .select('current_streak, last_streak_date, points_total_earned')
        .eq('id', a.member_id)
        .single();

      if (m) {
        const lastDate = m.last_streak_date as string | null;
        const newStreak =
          lastDate === today ? m.current_streak
          : lastDate === yesterday ? (m.current_streak ?? 0) + 1
          : 1;
        await db.from('members')
          .update({ current_streak: newStreak, last_streak_date: today })
          .eq('id', a.member_id);

        // Count approved tasks for this member
        const { data: memberAssignments } = await db
          .from('task_assignees').select('task_id').eq('member_id', a.member_id);
        const memberTaskIds = memberAssignments?.map(x => x.task_id) ?? [];
        let approvedCount = 0;
        if (memberTaskIds.length > 0) {
          const { count } = await db.from('tasks')
            .select('id', { count: 'exact', head: true })
            .in('id', memberTaskIds)
            .eq('status', 'approved');
          approvedCount = count ?? 0;
        }

        await checkAndAwardBadges(
          db, a.member_id, member.family_id,
          newStreak,
          (m.points_total_earned ?? 0) + task.pts,
          approvedCount,
        );
      }
    }
  }

  revalidatePath('/tasks');
  revalidatePath('/approvals');
}

export async function rejectTask(taskId: string) {
  await getSession();
  const db = createServerClient();
  await db.from('tasks').update({ status: 'rejected' }).eq('id', taskId);
  revalidatePath('/tasks');
  revalidatePath('/approvals');
}

export async function submitTaskForApproval(taskId: string) {
  await getSession();
  const db = createServerClient();
  await db.from('tasks').update({ status: 'pending_approval' }).eq('id', taskId);
  revalidatePath('/tasks');
}

export async function getTask(taskId: string): Promise<TaskWithAssignees | null> {
  await getSession();
  const db = createServerClient();
  const { data } = await db
    .from('tasks')
    .select('*, task_assignees(member_id)')
    .eq('id', taskId)
    .single();
  return data as unknown as TaskWithAssignees | null;
}

// ── Family ────────────────────────────────────────────────────────────────

export async function getFamily() {
  const session = await getSession();
  const db = createServerClient();
  const member = await getMemberFamily(session.user.id);
  if (!member) return null;
  const { data } = await db.from('families').select('*').eq('id', member.family_id).single();
  return data;
}

export async function updateFamily(updates: { name?: string; daily_base_pts?: number; auto_approve?: string }) {
  const session = await getSession();
  const db = createServerClient();
  const member = await getMemberFamily(session.user.id);
  if (!member) throw new Error('No family found');
  await db.from('families').update(updates).eq('id', member.family_id);
  revalidatePath('/settings');
}

export async function updateMember(memberId: string, updates: { name?: string; color?: string; role?: string }) {
  await getSession();
  const db = createServerClient();
  await db.from('members').update(updates).eq('id', memberId);
  revalidatePath('/settings');
  revalidatePath('/profile/' + memberId);
}

export async function getCurrentMember() {
  const session = await getSession();
  const db = createServerClient();
  const base = await getMemberFamily(session.user.id);
  if (!base) return null;
  const { data } = await db.from('members').select('*').eq('id', base.id).single();
  return data;
}

// ── Members ───────────────────────────────────────────────────────────────

export async function getMembers() {
  const session = await getSession();
  const db = createServerClient();
  const member = await getMemberFamily(session.user.id);
  if (!member) return [];

  const { data } = await db
    .from('members')
    .select('*')
    .eq('family_id', member.family_id)
    .order('created_at');

  return data ?? [];
}

export async function getMember(memberId: string) {
  const db = createServerClient();
  const { data } = await db.from('members').select('*').eq('id', memberId).single();
  return data;
}

// ── Wishes ────────────────────────────────────────────────────────────────

export async function getWishes() {
  const session = await getSession();
  const db = createServerClient();
  const member = await getMemberFamily(session.user.id);
  if (!member) return [];

  const { data } = await db
    .from('wishes')
    .select('*')
    .eq('family_id', member.family_id)
    .order('created_at', { ascending: false });

  return data ?? [];
}

export async function createWish(title: string, emoji: string, price: number) {
  const session = await getSession();
  const db = createServerClient();
  const member = await getMemberFamily(session.user.id);
  if (!member) throw new Error('No family found');

  const { error } = await db.from('wishes').insert({
    member_id: member.id,
    family_id: member.family_id,
    title,
    emoji,
    price,
    status: 'pending',
  });

  if (error) throw new Error(error.message);
  revalidatePath('/wishes');
}

export async function approveWish(wishId: string) {
  const session = await getSession();
  const db = createServerClient();
  const member = await getMemberFamily(session.user.id);
  if (!member) throw new Error('No family');

  const { data: wish } = await db.from('wishes').select('*').eq('id', wishId).single();
  if (!wish) throw new Error('Wish not found');

  await db.from('wishes').update({ status: 'approved' }).eq('id', wishId);

  // Deduct points
  await db.rpc('decrement_points', { p_member_id: wish.member_id, p_amount: wish.price });
  await db.from('ledger').insert({
    member_id: wish.member_id,
    family_id: member.family_id,
    amount: -wish.price,
    description: `Желание: ${wish.title}`,
    type: 'spent',
  });

  revalidatePath('/wishes');
}

// ── Badges ────────────────────────────────────────────────────────────────

export async function getBadges() {
  const session = await getSession();
  const db = createServerClient();
  const member = await getMemberFamily(session.user.id);
  if (!member) return { badges: [], earned: [] };

  const [{ data: badges }, { data: earned }] = await Promise.all([
    db.from('badges').select('*').eq('family_id', member.family_id),
    db.from('member_badges').select('*').eq('member_id', member.id),
  ]);

  return { badges: badges ?? [], earned: earned ?? [] };
}

// ── Ledger ────────────────────────────────────────────────────────────────

export async function getLedger(memberId?: string) {
  const session = await getSession();
  const db = createServerClient();
  const member = await getMemberFamily(session.user.id);
  if (!member) return [];

  const targetId = memberId ?? member.id;
  const { data } = await db
    .from('ledger')
    .select('*')
    .eq('member_id', targetId)
    .order('created_at', { ascending: false })
    .limit(50);

  return data ?? [];
}

// ── Bonus ─────────────────────────────────────────────────────────────────

export async function addBonus(memberId: string, amount: number, note: string) {
  const session = await getSession();
  const db = createServerClient();
  const member = await getMemberFamily(session.user.id);
  if (!member) throw new Error('No family found');

  await db.rpc('increment_points', { p_member_id: memberId, p_amount: amount });
  await db.from('ledger').insert({
    member_id: memberId,
    family_id: member.family_id,
    amount,
    description: note ? `⭐ Бонус: ${note}` : '⭐ Бонус',
    type: 'bonus',
  });

  revalidatePath('/profile/' + memberId);
}

// ── Daily Points ──────────────────────────────────────────────────────────

export async function checkDailyPoints() {
  const session = await getSession();
  const db = createServerClient();
  const member = await getMemberFamily(session.user.id);
  if (!member) return;

  const { data: family } = await db.from('families').select('daily_base_pts').eq('id', member.family_id).single();
  if (!family?.daily_base_pts) return;

  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await db
    .from('ledger')
    .select('id')
    .eq('member_id', member.id)
    .eq('type', 'daily')
    .gte('created_at', today + 'T00:00:00')
    .limit(1);

  if (existing && existing.length > 0) return;

  await db.rpc('increment_points', { p_member_id: member.id, p_amount: family.daily_base_pts });
  await db.from('ledger').insert({
    member_id: member.id,
    family_id: member.family_id,
    amount: family.daily_base_pts,
    description: '🌅 Дневни точки',
    type: 'daily',
  });

  revalidatePath('/home');
}

// ── Stats ─────────────────────────────────────────────────────────────────

export async function getMemberStats(memberId: string) {
  await getSession();
  const db = createServerClient();

  const { data: assignments } = await db
    .from('task_assignees')
    .select('task_id')
    .eq('member_id', memberId);

  if (!assignments?.length) return {} as Record<string, { approved: number; total: number }>;

  const taskIds = assignments.map(a => a.task_id);
  const { data: tasks } = await db
    .from('tasks')
    .select('type, status')
    .in('id', taskIds);

  const result: Record<string, { approved: number; total: number }> = {};
  for (const t of tasks ?? []) {
    if (!result[t.type]) result[t.type] = { approved: 0, total: 0 };
    result[t.type].total++;
    if (t.status === 'approved') result[t.type].approved++;
  }
  return result;
}

export async function getWeekActivity(memberId: string) {
  await getSession();
  const db = createServerClient();

  const now = new Date();
  const mondayOffset = now.getDay() === 0 ? -6 : 1 - now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const mondayStr = monday.toISOString().split('T')[0];

  const { data } = await db
    .from('ledger')
    .select('created_at')
    .eq('member_id', memberId)
    .eq('type', 'earned')
    .gte('created_at', mondayStr + 'T00:00:00');

  const dates = new Set((data ?? []).map(e => e.created_at.split('T')[0]));
  return [...dates];
}

// ── Invites ───────────────────────────────────────────────────────────────

export async function generateInvite(): Promise<string> {
  const session = await getSession();
  const db = createServerClient();
  const member = await getMemberFamily(session.user.id);
  if (!member) throw new Error('No family found');

  const { data, error } = await db
    .from('family_invites')
    .insert({ family_id: member.family_id })
    .select('token')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Failed to create invite');
  return data.token;
}

export async function getInviteInfo(token: string) {
  const db = createServerClient();
  const { data: invite } = await db
    .from('family_invites')
    .select('family_id, used')
    .eq('token', token)
    .single();

  if (!invite) return null;
  if (invite.used) return { valid: false, familyName: '' };

  const { data: family } = await db
    .from('families')
    .select('name')
    .eq('id', invite.family_id)
    .single();

  return { valid: true, familyName: family?.name ?? '' };
}

export async function joinFamily(token: string) {
  const session = await getSession();
  const db = createServerClient();

  const { data: invite } = await db
    .from('family_invites')
    .select('id, family_id, used')
    .eq('token', token)
    .single();

  if (!invite || invite.used) throw new Error('Invalid or expired invite');

  const existing = await getMemberFamily(session.user.id);
  if (existing) throw new Error('Already in a family');

  function makeInit(name: string) {
    return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  // Link to an unlinked parent member if one exists, otherwise create new
  const { data: unlinked } = await db
    .from('members')
    .select('id')
    .eq('family_id', invite.family_id)
    .eq('role', 'parent')
    .is('user_id', null)
    .limit(1)
    .single();

  if (unlinked) {
    await db.from('members').update({ user_id: session.user.id }).eq('id', unlinked.id);
  } else {
    const userName = session.user.name ?? session.user.email ?? 'Родител';
    await db.from('members').insert({
      family_id: invite.family_id,
      name: userName,
      init: makeInit(userName),
      color: '#6366f1',
      role: 'parent',
      user_id: session.user.id,
      points_balance: 0,
      points_total_earned: 0,
      current_streak: 0,
    });
  }

  await db.from('family_invites').update({ used: true }).eq('id', invite.id);
  revalidatePath('/home');
}
