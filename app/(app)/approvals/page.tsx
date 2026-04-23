'use client';

import { useState, useEffect } from 'react';
import { T, TASK_TYPES } from '@/lib/tokens';
import { getTasks, getMembers, approveTask, rejectTask } from '@/lib/actions';
import { MobileShell, BottomNav } from '@/components/layout/Shell';
import { Avatar, TypePill, Btn, ToggleTabs, Confetti } from '@/components/ui';

type Task = Awaited<ReturnType<typeof getTasks>>[number];
type Member = Awaited<ReturnType<typeof getMembers>>[number];

function getStreakMultiplier(streak: number) { return streak >= 14 ? 2.0 : streak >= 7 ? 1.5 : 1.0; }
function getStreakLabel(streak: number) { return streak >= 14 ? '×2.0' : streak >= 7 ? '×1.5' : null; }

// ── Variant A — Queue List ────────────────────────────────────────────────────

function VariantA({ pending, members, onAction }: { pending: Task[]; members: Member[]; onAction: () => void }) {
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [showRejectFor, setShowRejectFor] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [flyingOut, setFlyingOut] = useState<Record<string, 'approve' | 'reject'>>({});
  const [showConfetti, setShowConfetti] = useState(false);

  const handleApprove = async (id: string) => {
    setFlyingOut(p => ({ ...p, [id]: 'approve' }));
    await approveTask(id);
    setTimeout(() => {
      setApprovedIds(s => { const n = new Set(s); n.add(id); return n; });
      setFlyingOut(p => { const n = { ...p }; delete n[id]; return n; });
      if (approvedIds.size + rejectedIds.size + 1 >= pending.length) setShowConfetti(true);
      onAction();
    }, 320);
  };

  const handleRejectConfirm = async (id: string) => {
    setFlyingOut(p => ({ ...p, [id]: 'reject' }));
    await rejectTask(id);
    setTimeout(() => {
      setRejectedIds(s => { const n = new Set(s); n.add(id); return n; });
      setShowRejectFor(null);
      setFlyingOut(p => { const n = { ...p }; delete n[id]; return n; });
      if (approvedIds.size + rejectedIds.size + 1 >= pending.length) setShowConfetti(true);
      onAction();
    }, 320);
  };

  const handleApproveAll = () => {
    pending.filter(t => !approvedIds.has(t.id) && !rejectedIds.has(t.id))
      .forEach((t, i) => setTimeout(() => handleApprove(t.id), i * 100));
  };

  const allDone = pending.every(t => approvedIds.has(t.id) || rejectedIds.has(t.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', position: 'relative' }}>
      {showConfetti && <Confetti />}

      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 16px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Одобрения</div>
            {pending.length > 0 && (
              <div style={{ background: T.mustDo, color: '#fff', borderRadius: 99, minWidth: 22, height: 22, padding: '0 7px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                {Math.max(0, pending.length - approvedIds.size - rejectedIds.size)}
              </div>
            )}
          </div>
          <Btn variant="success" size="sm" onClick={handleApproveAll}>✓ Одобри всички</Btn>
        </div>
        <div style={{ background: T.surf2, borderRadius: 10, padding: '7px 12px', fontSize: 12, fontWeight: 600, color: T.text2, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: T.text3 }}>Днес:</span>
          <span style={{ color: T.household }}>✓ {approvedIds.size} одобрени</span>
          <span style={{ color: T.text3 }}>·</span>
          <span style={{ color: T.mustDo }}>✕ {rejectedIds.size} отхвърлени</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 80px' }}>
        {allDone ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280, gap: 14 }}>
            <div style={{ fontSize: 52 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>Всичко е одобрено за днес!</div>
            <div style={{ fontSize: 13, color: T.text3, textAlign: 'center' }}>Няма чакащи задачи</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pending.map(task => {
              if (approvedIds.has(task.id) || rejectedIds.has(task.id)) return null;
              const assigneeId = task.task_assignees?.[0]?.member_id;
              const member = members.find(m => m.id === assigneeId);
              const multiplier = getStreakMultiplier(task.streak);
              const multiplierLabel = getStreakLabel(task.streak);
              const effectivePts = Math.round(task.pts * multiplier);
              const tp = (TASK_TYPES as Record<string, { color: string }>)[task.type] ?? TASK_TYPES.household;
              const flying = flyingOut[task.id];
              const isRejectOpen = showRejectFor === task.id;

              return (
                <div key={task.id} style={{ background: flying === 'approve' ? '#edfaf4' : T.surface, borderRadius: 14, border: `1px solid ${flying === 'approve' ? T.household : flying === 'reject' ? T.mustDo : T.border}`, overflow: 'hidden', opacity: flying ? 0 : 1, transform: flying === 'approve' ? 'translateX(80px) scale(0.95)' : flying === 'reject' ? 'translateX(-80px) scale(0.95)' : 'none', transition: 'opacity 0.28s ease, transform 0.28s ease' }}>
                  <div style={{ height: 3, background: tp.color }} />
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      {member && <Avatar color={member.color} initials={member.init} size={36} ring />}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: T.text3, marginBottom: 1 }}>{member?.name ?? '—'}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                      </div>
                      <TypePill type={task.type} small />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: T.challengeBg, borderRadius: 99, padding: '4px 10px', fontSize: 13, fontWeight: 800, color: T.challenge, fontFamily: 'Nunito, sans-serif' }}>⭐ {effectivePts}</div>
                      {multiplierLabel && (
                        <div style={{ background: '#fff3e0', borderRadius: 99, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#c77700', display: 'flex', alignItems: 'center', gap: 3 }}>
                          🔥 {multiplierLabel}<span style={{ fontWeight: 500, color: T.text3 }}>·&nbsp;{task.streak} дни</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Btn variant="danger" size="sm" onClick={() => setShowRejectFor(isRejectOpen ? null : task.id)} style={{ flex: 1, justifyContent: 'center' }}>✕ Отхвърли</Btn>
                      <Btn variant="success" size="sm" onClick={() => handleApprove(task.id)} style={{ flex: 1, justifyContent: 'center' }}>✓ Одобри</Btn>
                    </div>
                  </div>
                  {isRejectOpen && (
                    <div style={{ padding: '0 14px 14px', background: T.mustDoBg, borderTop: `1px solid ${T.border}` }}>
                      <div style={{ paddingTop: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: T.mustDo, marginBottom: 6 }}>Причина (по избор)</div>
                        <textarea value={rejectReasons[task.id] ?? ''} onChange={e => setRejectReasons(p => ({ ...p, [task.id]: e.target.value }))} placeholder="Напишете причина..." rows={2} style={{ width: '100%', borderRadius: 10, padding: '10px 12px', border: `1.5px solid ${T.mustDo}40`, background: T.surface, color: T.text, fontSize: 13, fontFamily: 'DM Sans, sans-serif', resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                          <Btn variant="primary" size="sm" onClick={() => handleRejectConfirm(task.id)}>Потвърди</Btn>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Variant B — Card Stack ────────────────────────────────────────────────────

function VariantB({ pending, members, onAction }: { pending: Task[]; members: Member[]; onAction: () => void }) {
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null);

  const processedCount = approvedIds.size + rejectedIds.size;
  const total = pending.length;
  const remaining = pending.filter(t => !approvedIds.has(t.id) && !rejectedIds.has(t.id));
  const current = remaining[0];
  const next = remaining[1];
  const allDone = remaining.length === 0;

  const handleApprove = async () => {
    if (!current) return;
    setAnimDir('right');
    await approveTask(current.id);
    setTimeout(() => {
      setApprovedIds(s => { const n = new Set(s); n.add(current.id); return n; });
      setAnimDir(null);
      setShowRejectInput(false);
      onAction();
    }, 300);
  };

  const handleReject = async () => {
    if (!current) return;
    setAnimDir('left');
    await rejectTask(current.id);
    setTimeout(() => {
      setRejectedIds(s => { const n = new Set(s); n.add(current.id); return n; });
      setAnimDir(null);
      setShowRejectInput(false);
      onAction();
    }, 300);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Одобрения</div>
          <div style={{ background: T.challengeBg, color: T.challenge, borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{processedCount} / {total}</div>
        </div>
        <div style={{ height: 6, background: T.surf2, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${total > 0 ? (processedCount / total) * 100 : 0}%`, background: `linear-gradient(90deg, ${T.household}, ${T.ongoing})`, borderRadius: 99, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 8px', overflowY: 'auto' }}>
        {allDone ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 14 }}>
            <div style={{ fontSize: 52 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>Всичко е одобрено!</div>
            <div style={{ fontSize: 13, color: T.text3 }}>✓ {approvedIds.size} одобрени · ✕ {rejectedIds.size} отхвърлени</div>
          </div>
        ) : (
          <>
            <div style={{ position: 'relative', width: '100%', maxWidth: 360, height: 300, marginBottom: 14, flexShrink: 0 }}>
              {next && <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%) scale(0.96)', width: '100%', height: '100%', background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, zIndex: 1, opacity: 0.65 }} />}
              {current && (() => {
                const member = members.find(m => m.id === current.task_assignees?.[0]?.member_id);
                const effectivePts = Math.round(current.pts * getStreakMultiplier(current.streak));
                const multiplierLabel = getStreakLabel(current.streak);
                const tp = (TASK_TYPES as Record<string, { color: string }>)[current.type] ?? TASK_TYPES.household;
                return (
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: animDir === 'right' ? 'translateX(calc(-50% + 110px)) rotate(8deg)' : animDir === 'left' ? 'translateX(calc(-50% - 110px)) rotate(-8deg)' : 'translateX(-50%)', width: '100%', height: '100%', background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 8px 28px rgba(0,0,0,0.12)', zIndex: 2, overflow: 'hidden', opacity: animDir ? 0 : 1, transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease' }}>
                    <div style={{ height: 8, background: tp.color }} />
                    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 8px)', boxSizing: 'border-box' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        {member && <Avatar color={member.color} initials={member.init} size={40} ring />}
                        <div>
                          <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Задача от</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{member?.name ?? '—'}</div>
                        </div>
                        <div style={{ marginLeft: 'auto' }}><TypePill type={current.type} /></div>
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif', lineHeight: 1.25, flex: 1, marginBottom: 12 }}>{current.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: T.challengeBg, borderRadius: 99, padding: '5px 12px', fontSize: 15, fontWeight: 800, color: T.challenge }}>⭐ {effectivePts}</div>
                        {multiplierLabel && <div style={{ background: '#fff3e0', borderRadius: 99, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#c77700' }}>🔥 {multiplierLabel}</div>}
                      </div>
                      <div style={{ textAlign: 'center', fontSize: 11, color: T.text3, fontWeight: 600 }}>← Отхвърли · Одобри →</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 360, flexShrink: 0 }}>
              <div onClick={showRejectInput ? handleReject : () => setShowRejectInput(true)} style={{ flex: 1, height: 54, borderRadius: 16, background: T.mustDoBg, border: `1.5px solid ${T.mustDo}50`, color: T.mustDo, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                ✕ {showRejectInput ? 'Потвърди' : 'Отхвърли'}
              </div>
              <div onClick={handleApprove} style={{ flex: 1, height: 54, borderRadius: 16, background: T.householdBg, border: `1.5px solid ${T.household}50`, color: T.household, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                ✓ Одобри
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ApprovalsPage() {
  const [view, setView] = useState(0);
  const [pending, setPending] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const load = () => {
    getTasks().then(t => setPending(t.filter(x => x.status === 'pending_approval'))).catch(() => {});
    getMembers().then(setMembers).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ToggleTabs options={['Списък', 'Стек']} active={view} onChange={setView} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {view === 0
            ? <VariantA pending={pending} members={members} onAction={load} />
            : <VariantB pending={pending} members={members} onAction={load} />
          }
        </div>
        <BottomNav activeIdx={1} />
      </div>
    </MobileShell>
  );
}
