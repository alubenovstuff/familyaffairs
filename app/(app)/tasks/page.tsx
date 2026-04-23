'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { T, TASK_TYPES, STATUSES, REWARD_ICONS } from '@/lib/tokens';
import { getTasks, getMembers, submitTaskForApproval } from '@/lib/actions';
import { BottomNav, FAB, MobileShell } from '@/components/layout/Shell';
import { Avatar, FilterChip, TypePill, SmallPtsBadge } from '@/components/ui';

type Task = Awaited<ReturnType<typeof getTasks>>[number];
type Member = Awaited<ReturnType<typeof getMembers>>[number];
type TaskStatus = 'active' | 'pending_approval' | 'approved' | 'rejected' | 'expired';
type TaskType = 'household' | 'must_do' | 'ongoing' | 'challenge' | 'baseline';
type StatusFilterId = 'all' | TaskStatus;
type GroupId = 'today' | 'tomorrow' | 'later' | 'done';

function isoToday() { return new Date().toISOString().split('T')[0]; }
function isoTomorrow() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; }

// ── Shared helpers ─────────────────────────────────────────────────────────

function AssigneeStack({ assignees, members, size = 22 }: { assignees: { member_id: string }[]; members: Member[]; size?: number }) {
  return (
    <div style={{ display: 'flex' }}>
      {assignees.slice(0, 3).map((a, i) => {
        const m = members.find(x => x.id === a.member_id);
        if (!m) return null;
        return (
          <div key={i} style={{ marginLeft: i > 0 ? -6 : 0, zIndex: assignees.length - i }}>
            <Avatar color={m.color} initials={m.init} size={size} ring />
          </div>
        );
      })}
    </div>
  );
}

function RewardBadge({ reward, rewardLabel }: { reward: string; rewardLabel: string | null }) {
  if (reward === 'none') return null;
  return (
    <div style={{ background: T.eventBg, borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 600, color: T.event, display: 'flex', alignItems: 'center', gap: 3 }}>
      {(REWARD_ICONS as Record<string, string>)[reward]} {rewardLabel}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const s = (STATUSES as Record<string, { label: string; dot: string }>)[status] ?? { label: status, dot: T.text3 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot }} />
      <span style={{ fontSize: 9, fontWeight: 600, color: s.dot }}>{s.label}</span>
    </div>
  );
}

function EmptyBox({ emoji, message, sub }: { emoji: string; message: string; sub?: string }) {
  return (
    <div style={{ background: T.surf2, borderRadius: 12, border: `1.5px dashed ${T.border}`, padding: '24px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.text2 }}>{message}</div>
      {sub && <div style={{ fontSize: 11, color: T.text3, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// VARIANT A — Kanban Board
// ════════════════════════════════════════════════════════════════════════════

const KANBAN_COLUMNS = [
  { id: 'active' as TaskStatus, label: 'Активни', color: T.ongoing, emoji: '🎉', emptyMsg: 'Всички задачи изпълнени!', emptySub: 'Супер работа 🙌' },
  { id: 'pending_approval' as TaskStatus, label: 'Чакат одобрение', color: T.challenge, emoji: '⏳', emptyMsg: 'Нищо за одобрение' },
  { id: 'approved' as TaskStatus, label: 'Одобрени', color: T.household, emoji: '✨', emptyMsg: 'Нищо одобрено' },
  { id: 'rejected' as TaskStatus, label: 'Отхвърлени', color: T.mustDo, emoji: '📭', emptyMsg: 'Нищо отхвърлено' },
];

function KanbanCard({ task, members }: { task: Task; members: Member[] }) {
  const tp = (TASK_TYPES as Record<string, { color: string; bg: string; label: string }>)[task.type] ?? TASK_TYPES.household;
  return (
    <Link href={`/tasks/${task.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', cursor: 'pointer' }}>
        <div style={{ height: 3, background: tp.color }} />
        <div style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <TypePill type={task.type} small />
            {task.streak >= 3 && <span style={{ fontSize: 11, fontWeight: 700, color: '#c77700' }}>🔥 {task.streak}</span>}
            <span style={{ marginLeft: 'auto', fontSize: 10, color: T.text3 }}>{task.due}</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8, lineHeight: 1.35 }}>{task.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <AssigneeStack assignees={task.task_assignees ?? []} members={members} size={22} />
            {task.pts > 0 && <SmallPtsBadge pts={task.pts} />}
            <RewardBadge reward={task.reward} rewardLabel={task.reward_label} />
            <div style={{ marginLeft: 'auto' }}><StatusDot status={task.status} /></div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function VariantA({ tasks, members }: { tasks: Task[]; members: Member[] }) {
  const [typeFilter, setTypeFilter] = useState<TaskType | null>(null);
  const [memberFilter, setMemberFilter] = useState<string | null>(null);

  const filtered = tasks.filter(t => {
    if (typeFilter && t.type !== typeFilter) return false;
    if (memberFilter && !t.task_assignees?.some(a => a.member_id === memberFilter)) return false;
    return true;
  });

  const byStatus = (st: TaskStatus) => filtered.filter(t => t.status === st);
  const pendingCount = tasks.filter(t => t.status === 'pending_approval').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '10px 14px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Задачи</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {pendingCount > 0 && (
              <div style={{ background: T.mustDoBg, borderRadius: 99, padding: '4px 8px', fontSize: 11, fontWeight: 700, color: T.mustDo, display: 'flex', alignItems: 'center', gap: 3 }}>
                ⏳ {pendingCount}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
          {members.map((m) => (
            <div key={m.id} onClick={() => setMemberFilter(memberFilter === m.id ? null : m.id)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: memberFilter === m.id ? m.color : T.surface,
              color: memberFilter === m.id ? '#fff' : T.text2,
              border: `1px solid ${memberFilter === m.id ? m.color : T.border}`,
              borderRadius: 99, padding: '4px 10px 4px 6px',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
            }}>
              <Avatar color={m.color} initials={m.init} size={16} />
              {m.name}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10 }}>
          {(Object.keys(TASK_TYPES) as TaskType[]).map(k => (
            <FilterChip key={k} label={(TASK_TYPES as Record<string, { label: string }>)[k].label} active={typeFilter === k} color={(TASK_TYPES as Record<string, { color: string }>)[k].color} onClick={() => setTypeFilter(typeFilter === k ? null : k)} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', display: 'flex', gap: 12, padding: '12px', alignItems: 'flex-start' }}>
        {KANBAN_COLUMNS.map(col => {
          const colTasks = byStatus(col.id);
          return (
            <div key={col.id} style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, padding: '6px 10px', background: '#fff', borderRadius: 10, border: `1px solid ${T.border}` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text, flex: 1 }}>{col.label}</span>
                <span style={{ background: `${col.color}18`, color: col.color, borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{colTasks.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 520 }}>
                {colTasks.length === 0
                  ? <EmptyBox emoji={col.emoji} message={col.emptyMsg} sub={col.emptySub} />
                  : colTasks.map(t => <KanbanCard key={t.id} task={t} members={members} />)
                }
              </div>
            </div>
          );
        })}
      </div>

      <FAB />
      <BottomNav activeIdx={1} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// VARIANT B — Smart List
// ════════════════════════════════════════════════════════════════════════════

const STATUS_TABS: { id: StatusFilterId; label: string; color?: string }[] = [
  { id: 'all', label: 'Всички' },
  { id: 'active', label: 'Активни', color: T.ongoing },
  { id: 'pending_approval', label: 'Чакат', color: T.challenge },
  { id: 'approved', label: 'Готово', color: T.household },
];

const LIST_GROUPS: { id: GroupId; label: string }[] = [
  { id: 'today', label: 'Днес' },
  { id: 'tomorrow', label: 'Утре' },
  { id: 'later', label: 'По-късно' },
  { id: 'done', label: 'Приключени' },
];

function ListCard({ task, members, onCheck }: { task: Task; members: Member[]; onCheck: (id: string) => void }) {
  const tp = (TASK_TYPES as Record<string, { color: string }>)[task.type] ?? TASK_TYPES.household;
  return (
    <Link href={`/tasks/${task.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden', cursor: 'pointer' }}>
        <div style={{ height: 3, background: tp.color }} />
        <div style={{ padding: '9px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <TypePill type={task.type} small />
            {task.streak >= 3 && <span style={{ fontSize: 10, fontWeight: 700, color: '#c77700' }}>🔥 {task.streak}</span>}
            <div style={{ marginLeft: 'auto' }}><StatusDot status={task.status} /></div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 7, lineHeight: 1.3 }}>{task.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <AssigneeStack assignees={task.task_assignees ?? []} members={members} size={20} />
            {task.pts > 0 && (
              <div style={{ background: T.challengeBg, borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 700, color: T.challenge, display: 'flex', alignItems: 'center', gap: 2 }}>
                ⭐ {task.pts}
              </div>
            )}
            <RewardBadge reward={task.reward} rewardLabel={task.reward_label} />
            {task.status === 'active' && (
              <div onClick={e => { e.preventDefault(); onCheck(task.id); }} style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: 8, background: `${T.household}20`, border: `1px solid ${T.household}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: T.household, cursor: 'pointer', flexShrink: 0 }}>✓</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function VariantB({ tasks, members, onRefresh }: { tasks: Task[]; members: Member[]; onRefresh: () => void }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilterId>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<GroupId, boolean>>({ today: true, tomorrow: true, later: false, done: false });
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const today = isoToday();
  const tomorrow = isoTomorrow();
  const pendingCount = tasks.filter(t => t.status === 'pending_approval').length;

  const handleCheck = async (id: string) => {
    setCheckedIds(s => { const n = new Set(s); n.add(id); return n; });
    await submitTaskForApproval(id);
    onRefresh();
  };

  const getGroupTasks = (groupId: GroupId): Task[] => {
    return tasks.filter(t => {
      if (groupId === 'done') {
        if (typeFilter && t.type !== typeFilter) return false;
        return t.status === 'approved' || t.status === 'rejected';
      }
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (typeFilter && t.type !== typeFilter) return false;
      if (groupId === 'today') return t.due === today;
      if (groupId === 'tomorrow') return t.due === tomorrow;
      if (groupId === 'later') return !t.due || (t.due !== today && t.due !== tomorrow && t.status !== 'approved' && t.status !== 'rejected');
      return false;
    }).filter(t => !checkedIds.has(t.id) || groupId === 'done');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '10px 14px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Задачи</div>
          {pendingCount > 0 && (
            <div style={{ background: T.mustDoBg, borderRadius: 99, padding: '4px 8px', fontSize: 11, fontWeight: 700, color: T.mustDo, display: 'flex', alignItems: 'center', gap: 3 }}>
              ⏳ {pendingCount}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.border}` }}>
          {STATUS_TABS.map(tab => (
            <div key={tab.id} onClick={() => setStatusFilter(tab.id)} style={{ padding: '7px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: statusFilter === tab.id ? (tab.color || T.text) : T.text3, borderBottom: `2px solid ${statusFilter === tab.id ? (tab.color || T.text) : 'transparent'}`, transition: 'all 0.15s', flexShrink: 0 }}>
              {tab.label}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 0 10px' }}>
          {(Object.keys(TASK_TYPES) as TaskType[]).map(k => (
            <FilterChip key={k} label={(TASK_TYPES as Record<string, { label: string }>)[k].label} active={typeFilter === k} color={(TASK_TYPES as Record<string, { color: string }>)[k].color} onClick={() => setTypeFilter(typeFilter === k ? null : k)} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {LIST_GROUPS.map(group => {
          const groupTasks = getGroupTasks(group.id);
          const isExpanded = expandedGroups[group.id];
          return (
            <div key={group.id}>
              <div onClick={() => setExpandedGroups(e => ({ ...e, [group.id]: !e[group.id] }))} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px', cursor: 'pointer' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text2, flex: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{group.label}</span>
                <span style={{ background: T.surf2, borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 700, color: T.text3 }}>{groupTasks.length}</span>
                <span style={{ fontSize: 11, color: T.text3 }}>{isExpanded ? '▲' : '▼'}</span>
              </div>
              {isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 4 }}>
                  {groupTasks.length === 0
                    ? <EmptyBox emoji="🎉" message={group.id === 'today' ? 'Всички задачи за днес са готови!' : 'Нищо тук'} />
                    : groupTasks.map(t => <ListCard key={t.id} task={t} members={members} onCheck={handleCheck} />)
                  }
                </div>
              )}
            </div>
          );
        })}
        <div style={{ height: 80 }} />
      </div>

      <FAB />
      <BottomNav activeIdx={1} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Page
// ════════════════════════════════════════════════════════════════════════════

export default function TasksPage() {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const load = () => {
    getTasks().then(setTasks).catch(() => {});
    getMembers().then(setMembers).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'inline-flex', background: T.surf2, borderRadius: 99, padding: 2, gap: 1 }}>
          {(['board', 'list'] as const).map((v) => (
            <div key={v} onClick={() => setView(v)} style={{ padding: '4px 14px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: view === v ? '#fff' : 'transparent', color: view === v ? T.text : T.text2, boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
              {v === 'board' ? 'Board' : 'Liste'}
            </div>
          ))}
        </div>

        {view === 'board'
          ? <VariantA tasks={tasks} members={members} />
          : <VariantB tasks={tasks} members={members} onRefresh={load} />
        }
      </div>
    </MobileShell>
  );
}
