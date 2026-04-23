'use client';

import { useState } from 'react';
import Link from 'next/link';
import { T, TASK_TYPES, STATUSES, REWARD_ICONS } from '@/lib/tokens';
import { TASKS, MEMBERS } from '@/lib/mock-data';
import { BottomNav, FAB, MobileShell } from '@/components/layout/Shell';
import { Avatar, Pill, FilterChip, TypePill, SmallPtsBadge } from '@/components/ui';
import type { Task, TaskType, TaskStatus } from '@/types';

// ── Assignee avatar stack ────────────────────────────────────────────────────

const AssigneeStack = ({ assignees, size = 22 }: { assignees: number[]; size?: number }) => (
  <div style={{ display: 'flex' }}>
    {assignees.map((ai, i) => {
      const m = MEMBERS[ai];
      if (!m) return null;
      return (
        <div key={i} style={{ marginLeft: i > 0 ? -6 : 0, zIndex: assignees.length - i }}>
          <Avatar color={m.color} initials={m.init} size={size} ring />
        </div>
      );
    })}
  </div>
);

// ── Reward badge ─────────────────────────────────────────────────────────────

const RewardBadge = ({ reward, rewardLabel }: { reward: Task['reward']; rewardLabel: string }) => {
  if (reward === 'none') return null;
  return (
    <div style={{
      background: T.eventBg, borderRadius: 99, padding: '2px 8px',
      fontSize: 11, fontWeight: 600, color: T.event,
      display: 'flex', alignItems: 'center', gap: 3,
    }}>
      {REWARD_ICONS[reward]} {rewardLabel}
    </div>
  );
};

// ── Status dot ───────────────────────────────────────────────────────────────

const StatusDot = ({ status }: { status: TaskStatus }) => {
  const s = STATUSES[status];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot }} />
      <span style={{ fontSize: 9, fontWeight: 600, color: s.dot }}>{s.label}</span>
    </div>
  );
};

// ── Empty column / group placeholder ─────────────────────────────────────────

const EmptyBox = ({ emoji, message, sub }: { emoji: string; message: string; sub?: string }) => (
  <div style={{
    background: T.surf2, borderRadius: 12,
    border: `1.5px dashed ${T.border}`,
    padding: '24px 12px', textAlign: 'center',
  }}>
    <div style={{ fontSize: 24, marginBottom: 6 }}>{emoji}</div>
    <div style={{ fontSize: 12, fontWeight: 600, color: T.text2 }}>{message}</div>
    {sub && <div style={{ fontSize: 11, color: T.text3, marginTop: 3 }}>{sub}</div>}
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// VARIANT A — Kanban Board
// ════════════════════════════════════════════════════════════════════════════

const KanbanCard = ({ task }: { task: Task }) => {
  const tp = TASK_TYPES[task.type as keyof typeof TASK_TYPES] || TASK_TYPES.household;
  return (
    <Link href={`/tasks/${task.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: T.surface, borderRadius: 12,
        border: `1px solid ${T.border}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden', cursor: 'pointer',
      }}>
        {/* 3px top color bar */}
        <div style={{ height: 3, background: tp.color }} />
        <div style={{ padding: '10px 12px' }}>
          {/* Type + streak + due */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <TypePill type={task.type} small />
            {task.streak >= 3 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: '#c77700' }}>🔥 {task.streak}</span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 10, color: T.text3 }}>{task.due}</span>
          </div>

          {/* Title */}
          <div style={{
            fontSize: 13, fontWeight: 700, color: T.text,
            marginBottom: 8, lineHeight: 1.35,
          }}>
            {task.title}
          </div>

          {/* Bottom row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <AssigneeStack assignees={task.assignees} size={22} />
            {task.pts > 0 && <SmallPtsBadge pts={task.pts} />}
            <RewardBadge reward={task.reward} rewardLabel={task.rewardLabel} />
            <div style={{ marginLeft: 'auto' }}>
              <StatusDot status={task.status} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const KANBAN_COLUMNS: { id: TaskStatus; label: string; color: string; emoji: string; emptyMsg: string; emptySub?: string }[] = [
  { id: 'active', label: 'Активни', color: T.ongoing, emoji: '🎉', emptyMsg: 'Всички задачи изпълнени!', emptySub: 'Супер работа 🙌' },
  { id: 'pending_approval', label: 'Чакат одобрение', color: T.challenge, emoji: '⏳', emptyMsg: 'Нищо за одобрение' },
  { id: 'approved', label: 'Одобрени', color: T.household, emoji: '✨', emptyMsg: 'Нищо одобрено' },
  { id: 'rejected', label: 'Отхвърлени', color: T.mustDo, emoji: '📭', emptyMsg: 'Нищо отхвърлено' },
];

const VariantA = () => {
  const [typeFilter, setTypeFilter] = useState<TaskType | null>(null);
  const [memberFilter, setMemberFilter] = useState<number | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);

  const filtered = TASKS.filter(t => {
    if (typeFilter && t.type !== typeFilter) return false;
    if (memberFilter !== null && !t.assignees.includes(memberFilter)) return false;
    if (onlyMine && !t.assignees.includes(0)) return false;
    return true;
  });

  const byStatus = (st: TaskStatus) => filtered.filter(t => t.status === st);
  const pendingCount = TASKS.filter(t => t.status === 'pending_approval').length;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: `1px solid ${T.border}`,
        padding: '10px 14px 0', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>
            Задачи
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{
              background: T.mustDoBg, borderRadius: 99, padding: '4px 8px',
              fontSize: 11, fontWeight: 700, color: T.mustDo,
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              ⏳ {pendingCount}
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: T.surf2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, cursor: 'pointer',
            }}>
              ⚙
            </div>
          </div>
        </div>

        {/* Filter row 1: mine + members */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
          <FilterChip
            label="Само моите"
            active={onlyMine}
            onClick={() => setOnlyMine(v => !v)}
          />
          {MEMBERS.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <div
                onClick={() => setMemberFilter(memberFilter === i ? null : i)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: memberFilter === i ? m.color : T.surface,
                  color: memberFilter === i ? '#fff' : T.text2,
                  border: `1px solid ${memberFilter === i ? m.color : T.border}`,
                  borderRadius: 99, padding: '4px 10px 4px 6px',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                <Avatar color={m.color} initials={m.init} size={16} />
                {m.name}
              </div>
            </div>
          ))}
        </div>

        {/* Filter row 2: types */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10 }}>
          {(Object.keys(TASK_TYPES) as TaskType[]).map(k => (
            <FilterChip
              key={k}
              label={TASK_TYPES[k].label}
              active={typeFilter === k}
              color={TASK_TYPES[k].color}
              onClick={() => setTypeFilter(typeFilter === k ? null : k)}
            />
          ))}
        </div>
      </div>

      {/* Board columns — horizontal scroll */}
      <div style={{
        flex: 1, overflowX: 'auto', overflowY: 'hidden',
        display: 'flex', gap: 12, padding: '12px',
        alignItems: 'flex-start',
      }}>
        {KANBAN_COLUMNS.map(col => {
          const tasks = byStatus(col.id);
          return (
            <div key={col.id} style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              {/* Column header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
                padding: '6px 10px', background: '#fff', borderRadius: 10,
                border: `1px solid ${T.border}`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text, flex: 1 }}>{col.label}</span>
                <span style={{
                  background: `${col.color}18`, color: col.color,
                  borderRadius: 99, padding: '1px 8px',
                  fontSize: 11, fontWeight: 700, fontFamily: 'Nunito, sans-serif',
                }}>
                  {tasks.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 520 }}>
                {tasks.length === 0
                  ? <EmptyBox emoji={col.emoji} message={col.emptyMsg} sub={col.emptySub} />
                  : tasks.map(t => <KanbanCard key={t.id} task={t} />)
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
};

// ════════════════════════════════════════════════════════════════════════════
// VARIANT B — Smart List
// ════════════════════════════════════════════════════════════════════════════

type StatusFilterId = 'all' | TaskStatus;

const STATUS_TABS: { id: StatusFilterId; label: string; color?: string }[] = [
  { id: 'all', label: 'Всички' },
  { id: 'active', label: 'Активни', color: T.ongoing },
  { id: 'pending_approval', label: 'Чакат', color: T.challenge },
  { id: 'approved', label: 'Готово', color: T.household },
];

type GroupId = 'today' | 'tomorrow' | 'later' | 'done';

const LIST_GROUPS: { id: GroupId; label: string }[] = [
  { id: 'today', label: 'Днес' },
  { id: 'tomorrow', label: 'Утре' },
  { id: 'later', label: 'По-късно' },
  { id: 'done', label: 'Приключени' },
];

const ListCard = ({ task, onCheck }: { task: Task; onCheck: (id: number) => void }) => {
  const tp = TASK_TYPES[task.type as keyof typeof TASK_TYPES] || TASK_TYPES.household;
  return (
    <Link href={`/tasks/${task.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: T.surface, borderRadius: 12,
        border: `1px solid ${T.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden', cursor: 'pointer',
      }}>
        {/* 3px top color bar */}
        <div style={{ height: 3, background: tp.color }} />
        <div style={{ padding: '9px 12px' }}>
          {/* Row 1: type pill + streak + status dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <TypePill type={task.type} small />
            {task.streak >= 3 && (
              <span style={{ fontSize: 10, fontWeight: 700, color: '#c77700' }}>🔥 {task.streak}</span>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <StatusDot status={task.status} />
            </div>
          </div>

          {/* Row 2: title */}
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 7, lineHeight: 1.3 }}>
            {task.title}
          </div>

          {/* Row 3: assignees + pts + reward + quick check */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <AssigneeStack assignees={task.assignees} size={20} />
            {task.pts > 0 && (
              <div style={{
                background: T.challengeBg, borderRadius: 99, padding: '1px 7px',
                fontSize: 10, fontWeight: 700, color: T.challenge,
                fontFamily: 'Nunito, sans-serif',
                display: 'flex', alignItems: 'center', gap: 2,
              }}>
                ⭐ {task.pts}
              </div>
            )}
            <RewardBadge reward={task.reward} rewardLabel={task.rewardLabel} />
            {task.status === 'active' && (
              <div
                onClick={e => { e.preventDefault(); onCheck(task.id); }}
                style={{
                  marginLeft: 'auto',
                  width: 28, height: 28, borderRadius: 8,
                  background: `${T.household}20`, border: `1px solid ${T.household}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: T.household, cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                ✓
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

const VariantB = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilterId>('all');
  const [typeFilter, setTypeFilter] = useState<TaskType | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<GroupId, boolean>>({
    today: true,
    tomorrow: true,
    later: false,
    done: false,
  });
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());

  const pendingCount = TASKS.filter(t => t.status === 'pending_approval').length;

  const toggleGroup = (id: GroupId) =>
    setExpandedGroups(e => ({ ...e, [id]: !e[id] }));

  const handleCheck = (id: number) =>
    setCheckedIds(s => { const n = new Set(s); n.add(id); return n; });

  const getGroupTasks = (groupId: GroupId): Task[] => {
    return TASKS.filter(t => {
      // "done" group ignores status filter, shows approved/rejected
      if (groupId === 'done') {
        if (typeFilter && t.type !== typeFilter) return false;
        return t.status === 'approved' || t.status === 'rejected';
      }
      // other groups respect status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (typeFilter && t.type !== typeFilter) return false;
      if (groupId === 'today') return t.due === 'Днес';
      if (groupId === 'tomorrow') return t.due === 'Утре';
      if (groupId === 'later') return t.due === 'Всеки ден' || (t.due !== 'Днес' && t.due !== 'Утре' && t.status !== 'approved' && t.status !== 'rejected');
      return false;
    }).filter(t => !checkedIds.has(t.id) || groupId === 'done');
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: `1px solid ${T.border}`,
        padding: '10px 14px 0', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>
            Задачи
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{
              background: T.mustDoBg, borderRadius: 99, padding: '4px 8px',
              fontSize: 11, fontWeight: 700, color: T.mustDo,
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              ⏳ {pendingCount}
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: T.surf2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, cursor: 'pointer',
            }}>
              ⊞
            </div>
          </div>
        </div>

        {/* Status tabs — underline style */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.border}` }}>
          {STATUS_TABS.map(tab => (
            <div
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '7px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                color: statusFilter === tab.id ? (tab.color || T.text) : T.text3,
                borderBottom: `2px solid ${statusFilter === tab.id ? (tab.color || T.text) : 'transparent'}`,
                transition: 'all 0.15s', flexShrink: 0,
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Type filter chips */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 0 10px' }}>
          {(Object.keys(TASK_TYPES) as TaskType[]).map(k => (
            <FilterChip
              key={k}
              label={TASK_TYPES[k].label}
              active={typeFilter === k}
              color={TASK_TYPES[k].color}
              onClick={() => setTypeFilter(typeFilter === k ? null : k)}
            />
          ))}
        </div>
      </div>

      {/* Collapsible groups */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {LIST_GROUPS.map(group => {
          const tasks = getGroupTasks(group.id);
          const isExpanded = expandedGroups[group.id];
          return (
            <div key={group.id}>
              {/* Group header */}
              <div
                onClick={() => toggleGroup(group.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 4px', cursor: 'pointer',
                }}
              >
                <span style={{
                  fontSize: 12, fontWeight: 700, color: T.text2, flex: 1,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {group.label}
                </span>
                <span style={{
                  background: T.surf2, borderRadius: 99, padding: '1px 8px',
                  fontSize: 11, fontWeight: 700, color: T.text3,
                  fontFamily: 'Nunito, sans-serif',
                }}>
                  {tasks.length}
                </span>
                <span style={{ fontSize: 11, color: T.text3 }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>

              {/* Group content */}
              {isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 4 }}>
                  {tasks.length === 0 ? (
                    <EmptyBox
                      emoji="🎉"
                      message={group.id === 'today' ? 'Всички задачи за днес са готови!' : 'Нищо тук'}
                    />
                  ) : (
                    tasks.map(t => (
                      <ListCard key={t.id} task={t} onCheck={handleCheck} />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
        {/* Bottom padding for FAB + nav */}
        <div style={{ height: 80 }} />
      </div>

      <FAB />
      <BottomNav activeIdx={1} />
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// Page — Board / Liste toggle
// ════════════════════════════════════════════════════════════════════════════

export default function TasksPage() {
  const [view, setView] = useState<'board' | 'list'>('board');

  return (
    <MobileShell>
      {/* View toggle — floated at top-center */}
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'inline-flex', background: T.surf2, borderRadius: 99, padding: 2, gap: 1,
      }}>
        {(['board', 'list'] as const).map((v, i) => (
          <div
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '4px 14px', borderRadius: 99,
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
              background: view === v ? '#fff' : 'transparent',
              color: view === v ? T.text : T.text2,
              boxShadow: view === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {v === 'board' ? 'Board' : 'Liste'}
          </div>
        ))}
      </div>

      {view === 'board' ? <VariantA /> : <VariantB />}
    </MobileShell>
  );
}
