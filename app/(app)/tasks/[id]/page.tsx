'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { T, TASK_TYPES, REWARD_ICONS } from '@/lib/tokens';
import { getTask, getMembers, approveTask, rejectTask } from '@/lib/actions';
import { MobileShell, BottomNav } from '@/components/layout/Shell';
import { Avatar, TypePill, Confetti } from '@/components/ui';

type Task = NonNullable<Awaited<ReturnType<typeof getTask>>>;
type Member = Awaited<ReturnType<typeof getMembers>>[number];

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    pending_approval: { label: 'Чака одобрение', color: T.challenge, bg: T.challengeBg, dot: '#f5a623' },
    approved: { label: 'Одобрена', color: T.household, bg: T.householdBg, dot: '#2cb5a0' },
    rejected: { label: 'Отхвърлена', color: T.mustDo, bg: T.mustDoBg, dot: '#f06449' },
    active: { label: 'Активна', color: T.ongoing, bg: '#e8f0fc', dot: '#4a90d9' },
  };
  const s = map[status] ?? map.active;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, color: s.color, border: `1px solid ${s.color}30`, borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {s.label}
    </span>
  );
}

function RewardSection({ reward, rewardLabel, revealed }: { reward: string; rewardLabel: string | null; revealed: boolean }) {
  if (reward === 'none') return null;

  if (reward === 'mystery') {
    if (revealed) {
      return (
        <div style={{ borderRadius: 14, background: 'linear-gradient(135deg, #fef6e8 0%, #f3effe 50%, #e8f8f6 100%)', border: `2px solid ${T.challenge}50`, padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 32 }}>🎮</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.challenge, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Награда спечелена!</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>{rewardLabel || 'Изненада!'}</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 22 }}>🎉</div>
        </div>
      );
    }
    return (
      <div style={{ borderRadius: 14, background: `linear-gradient(135deg, ${T.surf2} 0%, #e8e4f0 100%)`, border: `1.5px dashed ${T.border}`, padding: '16px', display: 'flex', alignItems: 'center', gap: 12, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)', animation: 'shimmer 2s infinite' }} />
        <div style={{ fontSize: 28, filter: 'blur(3px)', userSelect: 'none' }}>🎁</div>
        <div style={{ filter: 'blur(2.5px)', userSelect: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, marginBottom: 2 }}>МИСТЕРИОЗНА НАГРАДА</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text2 }}>🔒 Разкрива се след одобрение</div>
        </div>
      </div>
    );
  }

  const config = reward === 'fixed'
    ? { emoji: '🎯', label: 'Фиксирана награда', color: T.challenge, bg: T.challengeBg }
    : { emoji: '🎲', label: 'Награда по избор', color: T.event, bg: T.eventBg };

  return (
    <div style={{ borderRadius: 14, background: config.bg, border: `1.5px solid ${config.color}30`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 22 }}>{config.emoji}</span>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: config.color, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{config.label}</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>{rewardLabel}</div>
      </div>
    </div>
  );
}

function PointsBar({ pts, streak, approved }: { pts: number; streak: number; approved: boolean }) {
  const hasMultiplier = streak >= 7;
  const finalPts = hasMultiplier ? Math.round(pts * 1.5) : pts;
  return (
    <div style={{ background: approved ? T.householdBg : T.surf2, borderRadius: 14, padding: '14px 16px', border: `1.5px solid ${approved ? T.household + '40' : T.border}`, display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.4s ease' }}>
      {approved ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', borderRadius: 99, padding: '4px 14px', boxShadow: '0 2px 8px rgba(44,181,160,0.2)' }}>
            <span style={{ fontSize: 18 }}>⭐</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: T.household, fontFamily: 'Nunito, sans-serif' }}>+{finalPts} т.</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.household }}>Точки начислени!</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text2 }}>Одобри →</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', borderRadius: 99, padding: '4px 14px', border: `1px solid ${T.border}` }}>
            <span style={{ fontSize: 16 }}>⭐</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: T.challenge, fontFamily: 'Nunito, sans-serif' }}>+{pts} т.</span>
          </div>
          {hasMultiplier && <div style={{ background: '#fff3e0', color: '#c77700', borderRadius: 99, padding: '3px 9px', fontSize: 11, fontWeight: 700, border: '1px solid #f5a62340' }}>🔥 ×1.5</div>}
        </>
      )}
    </div>
  );
}

function RejectPanel({ reason, onChangeReason, onConfirm, onCancel }: { reason: string; onChangeReason: (v: string) => void; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: T.surface, borderRadius: '20px 20px 0 0', border: `1px solid ${T.border}`, borderBottom: 'none', boxShadow: '0 -4px 24px rgba(0,0,0,0.12)', padding: '20px 16px 32px', zIndex: 40, animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div style={{ width: 36, height: 4, borderRadius: 99, background: T.border, margin: '0 auto 20px' }} />
      <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif', marginBottom: 4 }}>Отхвърли задача</div>
      <div style={{ fontSize: 13, color: T.text2, marginBottom: 16 }}>Задачата ще се върне като неизпълнена.</div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 6 }}>Причина (незадължително)</div>
        <textarea value={reason} onChange={e => onChangeReason(e.target.value)} placeholder="Напиши коментар..." rows={3} style={{ width: '100%', borderRadius: 10, padding: '10px 12px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', border: `1.5px solid ${T.border}`, background: T.surf2, color: T.text, resize: 'none', outline: 'none', boxSizing: 'border-box' }} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div onClick={onCancel} style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: 99, border: `1.5px solid ${T.border}`, fontSize: 14, fontWeight: 600, color: T.text2, cursor: 'pointer', background: T.surf2 }}>Назад</div>
        <div onClick={onConfirm} style={{ flex: 2, textAlign: 'center', padding: '12px', borderRadius: 99, border: `1.5px solid ${T.mustDo}`, fontSize: 14, fontWeight: 700, color: T.mustDo, cursor: 'pointer', background: T.mustDoBg }}>Потвърди отхвърлянето</div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [task, setTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [uiStatus, setUiStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approving, setApproving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    getTask(id).then(t => {
      if (t) {
        setTask(t);
        if (t.status === 'approved') setUiStatus('approved');
        else if (t.status === 'rejected') setUiStatus('rejected');
        else setUiStatus('pending');
      }
    });
    getMembers().then(setMembers);
  }, [id]);

  if (!task) {
    return (
      <MobileShell>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text3, fontSize: 14 }}>Зареждане...</div>
      </MobileShell>
    );
  }

  const tp = (TASK_TYPES as Record<string, { color: string; label: string }>)[task.type] ?? TASK_TYPES.household;
  const assignees = (task.task_assignees ?? []).map(a => members.find(m => m.id === a.member_id)).filter(Boolean) as Member[];

  const handleApprove = async () => {
    setApproving(true);
    setShowConfetti(true);
    await approveTask(task.id);
    setUiStatus('approved');
    setApproving(false);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleRejectConfirm = async () => {
    await rejectTask(task.id);
    setUiStatus('rejected');
    setRejecting(false);
  };

  return (
    <MobileShell>
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'DM Sans, sans-serif', background: T.bg, position: 'relative', overflow: 'hidden' }}>
        {showConfetti && <Confetti />}
        {rejecting && <div onClick={() => setRejecting(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 39 }} />}

        {/* Top bar */}
        <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Link href="/tasks" style={{ textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: T.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: T.text, cursor: 'pointer', flexShrink: 0 }}>‹</div>
          </Link>
          <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: T.text, fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <TypePill type={task.type} />
            <StatusPill status={uiStatus === 'pending' ? task.status : uiStatus} />
            {task.streak > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff3e0', color: '#c77700', borderRadius: 99, padding: '3px 9px', fontSize: 11, fontWeight: 700 }}>
                🔥 {task.streak} дни стрийк
              </span>
            )}
          </div>

          <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif', lineHeight: 1.25 }}>{task.title}</div>

          {task.description && <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>{task.description}</div>}

          <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            {assignees.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex' }}>
                    {assignees.map((m, i) => (
                      <div key={m.id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                        <Avatar color={m.color} initials={m.init} size={26} ring />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Изпълнител</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{assignees.map(m => m.name).join(', ')}</div>
                  </div>
                </div>
                <div style={{ width: 1, height: 28, background: T.border, flexShrink: 0 }} />
              </>
            )}
            {task.duration && (
              <>
                <div>
                  <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Времетраене</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>⏱ {task.duration} мин</div>
                </div>
                <div style={{ width: 1, height: 28, background: T.border, flexShrink: 0 }} />
              </>
            )}
            {task.due && (
              <div>
                <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Срок</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>📅 {task.due}</div>
              </div>
            )}
          </div>

          <PointsBar pts={task.pts} streak={task.streak} approved={uiStatus === 'approved'} />

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text2, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {(REWARD_ICONS as Record<string, string>)[task.reward]} Награда
            </div>
            <RewardSection reward={task.reward} rewardLabel={task.reward_label} revealed={uiStatus === 'approved'} />
          </div>

          <div style={{ height: 20 }} />
        </div>

        {/* Action buttons */}
        <div style={{ padding: '12px 16px 8px', background: T.surface, borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          {uiStatus === 'pending' && task.status === 'pending_approval' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div onClick={() => setRejecting(true)} style={{ flex: 1, textAlign: 'center', padding: '13px', borderRadius: 99, border: `1.5px solid ${T.mustDo}`, fontSize: 14, fontWeight: 700, color: T.mustDo, cursor: 'pointer', background: T.mustDoBg }}>Отхвърли</div>
              <div onClick={approving ? undefined : handleApprove} style={{ flex: 2, textAlign: 'center', padding: '13px', borderRadius: 99, border: `1.5px solid ${T.household}`, fontSize: 14, fontWeight: 700, color: T.household, cursor: approving ? 'default' : 'pointer', background: approving ? '#c8f5ee' : T.householdBg, transition: 'all 0.2s', boxShadow: `0 3px 12px ${T.household}30` }}>
                {approving ? '✓ Одобрявам...' : 'Одобри'}
              </div>
            </div>
          )}
          {(uiStatus === 'approved' || uiStatus === 'rejected') && (
            <Link href="/tasks" style={{ textDecoration: 'none' }}>
              <div style={{ width: '100%', textAlign: 'center', padding: '13px', borderRadius: 99, fontSize: 14, fontWeight: 700, color: uiStatus === 'approved' ? T.household : T.mustDo, cursor: 'pointer', background: uiStatus === 'approved' ? T.householdBg : T.mustDoBg, border: `1.5px solid ${uiStatus === 'approved' ? T.household : T.mustDo}40` }}>
                ← Обратно към задачите
              </div>
            </Link>
          )}
        </div>

        <BottomNav activeIdx={1} />

        {rejecting && (
          <RejectPanel reason={rejectReason} onChangeReason={setRejectReason} onConfirm={handleRejectConfirm} onCancel={() => setRejecting(false)} />
        )}
      </div>
    </MobileShell>
  );
}
