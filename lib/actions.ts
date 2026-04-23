'use server';

import { createServerClient } from './supabase';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import type { Database } from './db.types';

type TaskRow = Database['public']['Tables']['tasks']['Row'];
type TaskWithAssignees = TaskRow & { task_assignees: { member_id: string }[] };

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

  const { data: task } = await db.from('tasks').select('pts').eq('id', taskId).single();
  if (!task) throw new Error('Task not found');

  await db.from('tasks').update({ status: 'approved' }).eq('id', taskId);

  // Award points to all assignees
  const { data: assignees } = await db
    .from('task_assignees')
    .select('member_id')
    .eq('task_id', taskId);

  if (assignees) {
    for (const a of assignees) {
      await db.rpc('increment_points', { p_member_id: a.member_id, p_amount: task.pts });
      await db.from('ledger').insert({
        member_id: a.member_id,
        family_id: member.family_id,
        amount: task.pts,
        description: 'Задача одобрена',
        type: 'earned',
        task_id: taskId,
      });
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
