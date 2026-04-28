'use client';

import { useState, useEffect, useMemo } from 'react';
import { T, TASK_TYPES } from '@/lib/tokens';
import { BottomNav, FAB, MobileShell } from '@/components/layout/Shell';
import { Avatar, ToggleTabs } from '@/components/ui';
import { getTasks, getMembers, checkDailyPoints } from '@/lib/actions';

type Member = Awaited<ReturnType<typeof getMembers>>[number];
type Task = Awaited<ReturnType<typeof getTasks>>[number];

// ── Week helpers ───────────────────────────────────────────────────────────

const BG_DAY_SHORT = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTH_LABELS = ['Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни', 'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'];
const DAY_NAMES_LONG = ['Неделя', 'Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота'];

function getWeekDays() {
  const today = new Date();
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { date: d, short: BG_DAY_SHORT[(d.getDay())], num: d.getDate() };
  });
}

function isoDate(d: Date) {
  return d.toISOString().split('T')[0];
}

const HOUR_START = 8;
const HOUR_END = 20;
const HOUR_PX = 44;
const TOTAL_HOURS = HOUR_END - HOUR_START;

function typeColor(type: string) { return (TASK_TYPES as Record<string, { color: string }>)[type]?.color ?? T.event; }
function typeBg(type: string) { return (TASK_TYPES as Record<string, { bg: string }>)[type]?.bg ?? T.eventBg; }
function typeLabel(type: string) { return (TASK_TYPES as Record<string, { label: string }>)[type]?.label ?? 'Събитие'; }

// Map flat tasks list → tasks grouped by ISO date string
function groupByDate(tasks: Task[]) {
  const map: Record<string, Task[]> = {};
  for (const t of tasks) {
    if (!t.due) continue;
    if (!map[t.due]) map[t.due] = [];
    map[t.due].push(t);
  }
  return map;
}

// ── Unscheduled strip ──────────────────────────────────────────────────────

function UnscheduledStrip({ tasks, members }: { tasks: Task[]; members: Member[] }) {
  const unscheduled = tasks.filter(t => !t.due && t.status === 'active');
  if (unscheduled.length === 0) return null;

  return (
    <div style={{ background: T.surf2, borderBottom: `1px solid ${T.border}`, padding: '6px 12px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0, paddingRight: 4 }}>Floating</span>
        {unscheduled.map((task) => {
          const color = typeColor(task.type);
          const assigneeId = task.task_assignees?.[0]?.member_id;
          const member = members.find(m => m.id === assigneeId);
          return (
            <div key={task.id} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 99, padding: '3px 8px 3px 6px', flexShrink: 0, cursor: 'pointer',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{task.title}</span>
              {member && (
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {member.init}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Variant A: Week Grid ───────────────────────────────────────────────────

function WeekGrid({ filterMemberId, weekDays, byDate, members }: {
  filterMemberId: string | 'all';
  weekDays: ReturnType<typeof getWeekDays>;
  byDate: Record<string, Task[]>;
  members: Member[];
}) {
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => HOUR_START + i);

  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', minWidth: 0 }}>
        {/* Time gutter */}
        <div style={{ width: 32, flexShrink: 0, paddingTop: 36 }}>
          {hours.map((h) => (
            <div key={h} style={{ height: HOUR_PX, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 6, paddingTop: 2 }}>
              <span style={{ fontSize: 9, color: T.text3, fontWeight: 500 }}>{h}:00</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
          {weekDays.map((day, colIdx) => {
            const isToday = isoDate(day.date) === isoDate(new Date());
            const dayTasks = (byDate[isoDate(day.date)] ?? []).filter(t =>
              filterMemberId === 'all' || t.task_assignees?.some(a => a.member_id === filterMemberId)
            );

            return (
              <div key={colIdx} style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                <div style={{ position: 'sticky', top: 0, zIndex: 5, background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 4, paddingTop: 4, borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: T.text3, textTransform: 'uppercase' }}>{day.short}</span>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: isToday ? T.mustDo : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isToday ? '#fff' : T.text }}>{day.num}</span>
                  </div>
                </div>

                <div style={{ position: 'relative', height: TOTAL_HOURS * HOUR_PX }}>
                  {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                    <div key={i} style={{ position: 'absolute', top: i * HOUR_PX, left: 0, right: 0, height: 1, background: T.border, opacity: 0.5 }} />
                  ))}

                  {dayTasks.map((task, ti) => {
                    const color = typeColor(task.type);
                    const bg = typeBg(task.type);
                    const topPx = (ti % TOTAL_HOURS) * HOUR_PX + 1;
                    const heightPx = HOUR_PX - 2;
                    const assigneeId = task.task_assignees?.[0]?.member_id;
                    const member = members.find(m => m.id === assigneeId);

                    return (
                      <div key={task.id} style={{
                        position: 'absolute', top: topPx, left: 2, right: 2, height: heightPx,
                        background: bg, borderLeft: `2.5px solid ${color}`,
                        borderRadius: '0 6px 6px 0', padding: '3px 3px 2px 4px',
                        cursor: 'pointer', overflow: 'hidden',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>
                          {task.title}{task.streak > 0 && <span style={{ marginLeft: 2 }}>🔥</span>}
                        </div>
                        {member && (
                          <div style={{ alignSelf: 'flex-end' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: '#fff' }}>
                              {member.init}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GridHeader({ viewTab, setViewTab, filterMemberId, setFilterMemberId, members, pendingCount, weekDays }: {
  viewTab: number; setViewTab: (i: number) => void;
  filterMemberId: string | 'all'; setFilterMemberId: (v: string | 'all') => void;
  members: Member[]; pendingCount: number;
  weekDays: ReturnType<typeof getWeekDays>;
}) {
  const now = new Date();
  const monthLabel = MONTH_LABELS[now.getMonth()];
  const year = now.getFullYear();

  return (
    <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 6px' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>{monthLabel} {year}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {pendingCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${T.mustDo}15`, borderRadius: 99, padding: '4px 10px' }}>
              <span style={{ fontSize: 13 }}>⏳</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.mustDo }}>{pendingCount}</span>
            </div>
          )}
          {members[0] && <Avatar color={members[0].color} initials={members[0].init} size={34} ring badge={T.household} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px 8px' }}>
        <ToggleTabs options={['Ден', 'Седм', 'Месец']} active={viewTab} onChange={setViewTab} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px 10px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div onClick={() => setFilterMemberId('all')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.surf2, border: filterMemberId === 'all' ? `2.5px solid ${T.mustDo}` : `2px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👨‍👩‍👧</div>
          <span style={{ fontSize: 9, fontWeight: 600, color: filterMemberId === 'all' ? T.mustDo : T.text3 }}>Всички</span>
        </div>
        {members.map((m) => (
          <div key={m.id} onClick={() => setFilterMemberId(m.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ borderRadius: '50%', border: filterMemberId === m.id ? `2.5px solid ${m.color}` : '2.5px solid transparent', padding: 1 }}>
              <Avatar color={m.color} initials={m.init} size={28} />
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, color: filterMemberId === m.id ? m.color : T.text3 }}>{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Variant B: Swimlanes ───────────────────────────────────────────────────

function SwimlanesView({ activeDay, weekDays, byDate, members }: {
  activeDay: number;
  weekDays: ReturnType<typeof getWeekDays>;
  byDate: Record<string, Task[]>;
  members: Member[];
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const dayTasks = byDate[isoDate(weekDays[activeDay]?.date ?? new Date())] ?? [];

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {members.map((member) => {
        const memberTasks = dayTasks.filter(t => t.task_assignees?.some(a => a.member_id === member.id));
        const isExpanded = expanded[member.id] !== false;
        const pointsToday = memberTasks.filter(t => t.status === 'approved').reduce((s, t) => s + t.pts, 0);

        return (
          <div key={member.id} style={{ margin: '8px 12px', background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
            <div onClick={() => setExpanded(p => ({ ...p, [member.id]: !isExpanded }))} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', cursor: 'pointer' }}>
              <Avatar color={member.color} initials={member.init} size={36} ring />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{member.name}</div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>
                  {memberTasks.length > 0 ? `${memberTasks.length} задач${memberTasks.length === 1 ? 'а' : 'и'} днес` : 'Без задачи днес'}
                </div>
              </div>
              {pointsToday > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: `${T.challenge}18`, borderRadius: 99, padding: '3px 9px', flexShrink: 0 }}>
                  <span style={{ fontSize: 12 }}>⭐</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.challenge }}>+{pointsToday}</span>
                </div>
              )}
              <span style={{ fontSize: 12, color: T.text3, marginLeft: 4 }}>{isExpanded ? '▲' : '▼'}</span>
            </div>

            {isExpanded && memberTasks.length > 0 && (
              <div style={{ borderTop: `1px solid ${T.border}` }}>
                {memberTasks.map((task, ti) => {
                  const color = typeColor(task.type);
                  const bg = typeBg(task.type);
                  const label = typeLabel(task.type);
                  return (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: ti < memberTasks.length - 1 ? `1px solid ${T.border}` : 'none', borderLeft: `3px solid ${color}` }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>
                          {task.title}{task.streak > 0 && <span style={{ marginLeft: 4, fontSize: 12 }}>🔥</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', background: bg, color, borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 600 }}>{label}</div>
                          <span style={{ fontSize: 10, color: T.text3 }}>⭐ {task.pts}</span>
                        </div>
                      </div>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', border: `2px solid ${T.border}`, background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer', flexShrink: 0, color: T.text3 }}>✓</div>
                    </div>
                  );
                })}
              </div>
            )}
            {isExpanded && memberTasks.length === 0 && (
              <div style={{ borderTop: `1px solid ${T.border}`, padding: '12px 14px', fontSize: 12, color: T.text3, textAlign: 'center' }}>Няма задачи за днес</div>
            )}
          </div>
        );
      })}
      <div style={{ height: 16 }} />
    </div>
  );
}

function LanesHeader({ activeDay, setActiveDay, weekDays, members, todayPoints }: {
  activeDay: number; setActiveDay: (i: number) => void;
  weekDays: ReturnType<typeof getWeekDays>;
  members: Member[];
  todayPoints: number;
}) {
  const today = new Date();
  const currentDay = weekDays[activeDay];

  return (
    <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 6px' }}>
        <div>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 500 }}>
            {currentDay && DAY_NAMES_LONG[currentDay.date.getDay()]}, {currentDay?.num} {MONTH_LABELS[today.getMonth()]}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Днес</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {todayPoints > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${T.challenge}15`, borderRadius: 99, padding: '4px 10px' }}>
              <span style={{ fontSize: 14 }}>⭐</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.challenge }}>{todayPoints}</span>
            </div>
          )}
          {members[0] && <Avatar color={members[0].color} initials={members[0].init} size={34} ring badge={T.household} />}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 2, padding: '4px 12px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {weekDays.map((day, i) => {
          const isActive = i === activeDay;
          const isToday = isoDate(day.date) === isoDate(today);
          return (
            <div key={i} onClick={() => setActiveDay(i)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 2px', borderRadius: 10, cursor: 'pointer', background: isActive ? T.mustDo : 'transparent', minWidth: 36 }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: isActive ? '#fff' : T.text3 }}>{day.short}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#fff' : isToday ? T.mustDo : T.text }}>{day.num}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function HomePage() {
  const [variant, setVariant] = useState<0 | 1>(0);
  const [viewTab, setViewTab] = useState(1);
  const [filterMemberId, setFilterMemberId] = useState<string | 'all'>('all');
  const [activeDay, setActiveDay] = useState(() => {
    const days = getWeekDays();
    const todayStr = isoDate(new Date());
    const idx = days.findIndex(d => isoDate(d.date) === todayStr);
    return idx >= 0 ? idx : 0;
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    getTasks().then(setTasks).catch(() => {});
    getMembers().then(setMembers).catch(() => {});
    checkDailyPoints().catch(() => {});
  }, []);

  const weekDays = useMemo(() => getWeekDays(), []);
  const byDate = useMemo(() => groupByDate(tasks), [tasks]);
  const pendingCount = tasks.filter(t => t.status === 'pending_approval').length;
  const todayStr = isoDate(new Date());
  const todayPoints = (byDate[todayStr] ?? []).filter(t => t.status === 'approved').reduce((s, t) => s + t.pts, 0);

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 16px 0', background: T.surface, flexShrink: 0 }}>
          <ToggleTabs options={['Grid', 'Lanes']} active={variant} onChange={(i) => setVariant(i as 0 | 1)} />
        </div>

        {variant === 0 ? (
          <>
            <GridHeader viewTab={viewTab} setViewTab={setViewTab} filterMemberId={filterMemberId} setFilterMemberId={setFilterMemberId} members={members} pendingCount={pendingCount} weekDays={weekDays} />
            <UnscheduledStrip tasks={tasks} members={members} />
            <WeekGrid filterMemberId={filterMemberId} weekDays={weekDays} byDate={byDate} members={members} />
          </>
        ) : (
          <>
            <LanesHeader activeDay={activeDay} setActiveDay={setActiveDay} weekDays={weekDays} members={members} todayPoints={todayPoints} />
            <UnscheduledStrip tasks={tasks} members={members} />
            <SwimlanesView activeDay={activeDay} weekDays={weekDays} byDate={byDate} members={members} />
          </>
        )}

        <BottomNav activeIdx={0} />
        <FAB />
      </div>
    </MobileShell>
  );
}
