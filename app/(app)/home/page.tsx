'use client';

import { useState } from 'react';
import { T, TASK_TYPES } from '@/lib/tokens';
import { MEMBERS, ALL_MEMBER, DAYS, DATES, TODAY_IDX, CALENDAR_TASKS, UNSCHEDULED_TASKS } from '@/lib/mock-data';
import { BottomNav, FAB, MobileShell } from '@/components/layout/Shell';
import { Avatar, ToggleTabs, FilterChip } from '@/components/ui';
import type { CalendarTask } from '@/types';

// ── helpers ────────────────────────────────────────────────────────────────

const HOUR_START = 7;
const HOUR_END = 19;
const HOUR_PX = 44;
const TOTAL_HOURS = HOUR_END - HOUR_START;

function typeColor(type: CalendarTask['type']): string {
  return TASK_TYPES[type as keyof typeof TASK_TYPES]?.color ?? T.event;
}

function typeBg(type: CalendarTask['type']): string {
  return TASK_TYPES[type as keyof typeof TASK_TYPES]?.bg ?? T.eventBg;
}

function typeLabel(type: CalendarTask['type']): string {
  return TASK_TYPES[type as keyof typeof TASK_TYPES]?.label ?? 'Събитие';
}

function hourToY(h: number): number {
  return (h - HOUR_START) * HOUR_PX;
}

const BG_MONTH_LABELS = ['Яну', 'Фев', 'Мар', 'Апр', 'Май', 'Юни', 'Юли', 'Авг', 'Сеп', 'Окт', 'Ное', 'Дек'];
const MONTH_LABELS = ['Януари', 'Февруари', 'Март', 'Април', 'Май', 'Юни', 'Юли', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември'];
const DAY_NAMES_LONG = ['Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя'];

const PENDING_COUNT = 3;
const TODAY_POINTS = 45;

// ── Unscheduled strip ──────────────────────────────────────────────────────

function UnscheduledStrip() {
  return (
    <div style={{
      background: T.surf2,
      borderBottom: `1px solid ${T.border}`,
      padding: '6px 12px 8px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        <span style={{
          fontSize: 9, fontWeight: 700, color: T.text3, textTransform: 'uppercase',
          letterSpacing: '0.08em', flexShrink: 0, paddingRight: 4,
        }}>Floating</span>
        {UNSCHEDULED_TASKS.map((task, i) => {
          const color = typeColor(task.type);
          const member = MEMBERS[task.member];
          return (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 99, padding: '3px 8px 3px 6px',
              flexShrink: 0, cursor: 'pointer',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: color, flexShrink: 0,
              }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{task.title}</span>
              {member && (
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: member.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
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

function WeekGrid({ filterMember }: { filterMember: number | 'all' }) {
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => HOUR_START + i);

  return (
    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', minWidth: 0 }}>
        {/* Time gutter */}
        <div style={{ width: 32, flexShrink: 0, paddingTop: 36 }}>
          {hours.map((h) => (
            <div key={h} style={{
              height: HOUR_PX, display: 'flex', alignItems: 'flex-start',
              justifyContent: 'flex-end', paddingRight: 6, paddingTop: 2,
            }}>
              <span style={{ fontSize: 9, color: T.text3, fontWeight: 500 }}>
                {h}:00
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
          {DAYS.map((day, colIdx) => {
            const isToday = colIdx === TODAY_IDX;
            const tasks = (CALENDAR_TASKS[colIdx] || []).filter(task =>
              filterMember === 'all' || task.member === filterMember
            );

            return (
              <div key={colIdx} style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                {/* Sticky day header */}
                <div style={{
                  position: 'sticky', top: 0, zIndex: 5,
                  background: T.bg,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  paddingBottom: 4, paddingTop: 4,
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: T.text3, textTransform: 'uppercase' }}>
                    {day}
                  </span>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: isToday ? T.mustDo : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: 2,
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: isToday ? '#fff' : T.text,
                    }}>
                      {DATES[colIdx]}
                    </span>
                  </div>
                </div>

                {/* Hour grid lines */}
                <div style={{
                  position: 'relative',
                  height: TOTAL_HOURS * HOUR_PX,
                }}>
                  {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                    <div key={i} style={{
                      position: 'absolute', top: i * HOUR_PX,
                      left: 0, right: 0, height: 1,
                      background: T.border, opacity: 0.5,
                    }} />
                  ))}

                  {/* Task blocks */}
                  {tasks.map((task, ti) => {
                    const color = typeColor(task.type);
                    const bg = typeBg(task.type);
                    const topPx = hourToY(task.y);
                    const heightPx = task.h * HOUR_PX - 2;
                    const member = MEMBERS[task.member];

                    return (
                      <div key={ti} style={{
                        position: 'absolute',
                        top: topPx + 1,
                        left: 2, right: 2,
                        height: heightPx,
                        background: bg,
                        borderLeft: `2.5px solid ${color}`,
                        borderRadius: '0 6px 6px 0',
                        padding: '3px 3px 2px 4px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>
                          {task.title}
                          {task.streak && <span style={{ marginLeft: 2 }}>🔥</span>}
                        </div>
                        {member && heightPx > 20 && (
                          <div style={{ alignSelf: 'flex-end' }}>
                            <div style={{
                              width: 12, height: 12, borderRadius: '50%',
                              background: member.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 7, fontWeight: 700, color: '#fff',
                            }}>
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

// ── Variant A header + filter ──────────────────────────────────────────────

function GridHeader({
  viewTab, setViewTab,
  filterMember, setFilterMember,
}: {
  viewTab: number; setViewTab: (i: number) => void;
  filterMember: number | 'all'; setFilterMember: (v: number | 'all') => void;
}) {
  const loggedUser = MEMBERS[0];

  return (
    <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
      {/* Top row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 6px',
      }}>
        <div>
          <div style={{
            fontSize: 9, fontWeight: 700, color: T.text3,
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2,
          }}>
            Семейство Иванови
          </div>
          <div style={{
            fontSize: 20, fontWeight: 800, color: T.text,
            fontFamily: 'Nunito, sans-serif',
          }}>
            Април 2026
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Pending badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: `${T.mustDo}15`, borderRadius: 99,
            padding: '4px 10px',
          }}>
            <span style={{ fontSize: 13 }}>⏳</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.mustDo }}>{PENDING_COUNT}</span>
          </div>
          {/* Logged user avatar */}
          <Avatar
            color={loggedUser.color}
            initials={loggedUser.init}
            size={34}
            ring
            badge={T.household}
          />
        </div>
      </div>

      {/* View tabs row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 16px 8px',
      }}>
        <ToggleTabs
          options={['Ден', 'Седм', 'Месец']}
          active={viewTab}
          onChange={setViewTab}
        />
      </div>

      {/* Avatar filter bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 16px 10px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {/* "Всички" button */}
        <div
          onClick={() => setFilterMember('all')}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: T.surf2,
            border: filterMember === 'all' ? `2.5px solid ${T.mustDo}` : `2px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>
            {ALL_MEMBER.name.charAt(0)}
          </div>
          <span style={{ fontSize: 9, fontWeight: 600, color: filterMember === 'all' ? T.mustDo : T.text3 }}>
            Всички
          </span>
        </div>

        {MEMBERS.map((m, i) => (
          <div
            key={m.id}
            onClick={() => setFilterMember(i)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              borderRadius: '50%',
              border: filterMember === i ? `2.5px solid ${m.color}` : '2.5px solid transparent',
              padding: 1,
            }}>
              <Avatar
                color={m.color}
                initials={m.init}
                size={28}
              />
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, color: filterMember === i ? m.color : T.text3 }}>
              {m.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Variant B: Swimlanes ───────────────────────────────────────────────────

function SwimlanesView({ activeDay, setActiveDay }: { activeDay: number; setActiveDay: (i: number) => void }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MEMBERS.map(m => [m.id, true]))
  );

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {MEMBERS.map((member, mi) => {
        const memberTasks = (CALENDAR_TASKS[activeDay] || []).filter(t => t.member === mi);
        const isExpanded = expanded[member.id];
        const pointsToday = memberTasks.reduce((sum, t) => sum + Math.round(t.dur / 3), 0);

        return (
          <div key={member.id} style={{
            margin: '8px 12px',
            background: T.surface,
            borderRadius: 12,
            border: `1px solid ${T.border}`,
            overflow: 'hidden',
          }}>
            {/* Card header */}
            <div
              onClick={() => toggleExpand(member.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', cursor: 'pointer',
              }}
            >
              <Avatar color={member.color} initials={member.init} size={36} ring />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{member.name}</div>
                <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>
                  {memberTasks.length > 0
                    ? `${memberTasks.length} задач${memberTasks.length === 1 ? 'а' : 'и'} днес`
                    : 'Без задачи днес'}
                </div>
              </div>
              {/* Points today */}
              {pointsToday > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  background: `${T.challenge}18`, borderRadius: 99,
                  padding: '3px 9px', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 12 }}>⭐</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.challenge }}>+{pointsToday}</span>
                </div>
              )}
              <span style={{ fontSize: 12, color: T.text3, marginLeft: 4 }}>
                {isExpanded ? '▲' : '▼'}
              </span>
            </div>

            {/* Task list */}
            {isExpanded && memberTasks.length > 0 && (
              <div style={{ borderTop: `1px solid ${T.border}` }}>
                {memberTasks.map((task, ti) => {
                  const color = typeColor(task.type);
                  const bg = typeBg(task.type);
                  const label = typeLabel(task.type);

                  return (
                    <div key={ti} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px',
                      borderBottom: ti < memberTasks.length - 1 ? `1px solid ${T.border}` : 'none',
                      borderLeft: `3px solid ${color}`,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>
                          {task.title}
                          {task.streak && <span style={{ marginLeft: 4, fontSize: 12 }}>🔥</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center',
                            background: bg, color: color,
                            borderRadius: 99, padding: '1px 7px',
                            fontSize: 10, fontWeight: 600,
                          }}>
                            {label}
                          </div>
                          <span style={{ fontSize: 10, color: T.text3 }}>{task.dur} мин</span>
                        </div>
                      </div>
                      {/* Quick check button */}
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        border: `2px solid ${T.border}`,
                        background: T.surface,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, cursor: 'pointer', flexShrink: 0,
                        color: T.text3,
                      }}>
                        ✓
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {isExpanded && memberTasks.length === 0 && (
              <div style={{
                borderTop: `1px solid ${T.border}`,
                padding: '12px 14px',
                fontSize: 12, color: T.text3, textAlign: 'center',
              }}>
                Няма задачи за днес
              </div>
            )}
          </div>
        );
      })}
      <div style={{ height: 16 }} />
    </div>
  );
}

function LanesHeader({
  activeDay, setActiveDay,
}: {
  activeDay: number; setActiveDay: (i: number) => void;
}) {
  const loggedUser = MEMBERS[0];
  const currentDate = DATES[activeDay];

  return (
    <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
      {/* Top row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 6px',
      }}>
        <div>
          <div style={{ fontSize: 11, color: T.text3, fontWeight: 500 }}>
            {DAY_NAMES_LONG[activeDay]}, {currentDate} Апр
          </div>
          <div style={{
            fontSize: 22, fontWeight: 800, color: T.text,
            fontFamily: 'Nunito, sans-serif',
          }}>
            Днес
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Points badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: `${T.challenge}15`, borderRadius: 99,
            padding: '4px 10px',
          }}>
            <span style={{ fontSize: 14 }}>⭐</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.challenge }}>{TODAY_POINTS}</span>
          </div>
          <Avatar
            color={loggedUser.color}
            initials={loggedUser.init}
            size={34}
            ring
            badge={T.household}
          />
        </div>
      </div>

      {/* Day strip */}
      <div style={{
        display: 'flex', gap: 2,
        padding: '4px 12px 12px',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {DAYS.map((day, i) => {
          const isActive = i === activeDay;
          const isToday = i === TODAY_IDX;
          return (
            <div
              key={i}
              onClick={() => setActiveDay(i)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, padding: '6px 2px', borderRadius: 10, cursor: 'pointer',
                background: isActive ? T.mustDo : 'transparent',
                minWidth: 36,
              }}
            >
              <span style={{
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                color: isActive ? '#fff' : T.text3,
              }}>
                {day}
              </span>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: isActive ? '#fff' : isToday ? T.mustDo : T.text,
              }}>
                {DATES[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function HomePage() {
  const [variant, setVariant] = useState<0 | 1>(0); // 0 = Grid, 1 = Lanes
  const [viewTab, setViewTab] = useState(1); // 0=Ден 1=Седм 2=Месец
  const [filterMember, setFilterMember] = useState<number | 'all'>('all');
  const [activeDay, setActiveDay] = useState(TODAY_IDX);

  return (
    <MobileShell>
      {/* Top bar with Grid/Lanes toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '10px 16px 0',
        background: T.surface,
        flexShrink: 0,
      }}>
        <ToggleTabs
          options={['Grid', 'Lanes']}
          active={variant}
          onChange={(i) => setVariant(i as 0 | 1)}
        />
      </div>

      {variant === 0 ? (
        <>
          <GridHeader
            viewTab={viewTab}
            setViewTab={setViewTab}
            filterMember={filterMember}
            setFilterMember={setFilterMember}
          />
          <UnscheduledStrip />
          <WeekGrid filterMember={filterMember} />
        </>
      ) : (
        <>
          <LanesHeader activeDay={activeDay} setActiveDay={setActiveDay} />
          <UnscheduledStrip />
          <SwimlanesView activeDay={activeDay} setActiveDay={setActiveDay} />
        </>
      )}

      <BottomNav activeIdx={0} />
      <FAB />
    </MobileShell>
  );
}
