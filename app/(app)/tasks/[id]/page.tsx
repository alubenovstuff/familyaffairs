'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { T, TASK_TYPES, STATUSES, REWARD_ICONS } from '@/lib/tokens';
import { TASKS, MEMBERS } from '@/lib/mock-data';
import { MobileShell, BottomNav } from '@/components/layout/Shell';
import { Avatar, Pill, TypePill, Btn, Card, SmallPtsBadge, Confetti } from '@/components/ui';

// ── Helpers ──────────────────────────────────────────────────────────────────

const AssigneeStack = ({ assignees, size = 28 }: { assignees: number[]; size?: number }) => (
  <div style={{ display: 'flex' }}>
    {assignees.map((ai, i) => {
      const m = MEMBERS[ai];
      if (!m) return null;
      return (
        <div key={i} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: assignees.length - i }}>
          <Avatar color={m.color} initials={m.init} size={size} ring />
        </div>
      );
    })}
  </div>
);

const StatusPill = ({ status }: { status: 'pending' | 'approved' | 'rejected' }) => {
  const map = {
    pending: { label: 'Чака одобрение', color: T.challenge, bg: T.challengeBg, dot: '#f5a623' },
    approved: { label: 'Одобрена', color: T.household, bg: T.householdBg, dot: '#2cb5a0' },
    rejected: { label: 'Отхвърлена', color: T.mustDo, bg: T.mustDoBg, dot: '#f06449' },
  };
  const s = map[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color,
      border: `1px solid ${s.color}30`,
      borderRadius: 99, padding: '3px 10px',
      fontSize: 11, fontWeight: 700, fontFamily: 'DM Sans, sans-serif',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {s.label}
    </span>
  );
};

// ── Reward section ────────────────────────────────────────────────────────────

interface RewardSectionProps {
  reward: string;
  rewardLabel: string;
  revealed: boolean;
  revealedLabel?: string;
}

const RewardSection = ({ reward, rewardLabel, revealed, revealedLabel }: RewardSectionProps) => {
  if (reward === 'none') return null;

  if (reward === 'mystery') {
    if (revealed) {
      return (
        <div style={{
          borderRadius: 14,
          background: 'linear-gradient(135deg, #fef6e8 0%, #f3effe 50%, #e8f8f6 100%)',
          border: `2px solid ${T.challenge}50`,
          padding: '16px',
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'rewardReveal 0.5s ease-out',
        }}>
          <div style={{ fontSize: 32 }}>🎮</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.challenge, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Награда спечелена!</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>{revealedLabel || 'Видеоигри 1ч'}</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 22 }}>🎉</div>
        </div>
      );
    }
    return (
      <div style={{
        borderRadius: 14,
        background: `linear-gradient(135deg, ${T.surf2} 0%, #e8e4f0 100%)`,
        border: `1.5px dashed ${T.border}`,
        padding: '16px',
        display: 'flex', alignItems: 'center', gap: 12,
        filter: 'blur(0px)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* shimmer overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          animation: 'shimmer 2s infinite',
        }} />
        <div style={{ fontSize: 28, filter: 'blur(3px)', userSelect: 'none' }}>🎁</div>
        <div style={{ filter: 'blur(2.5px)', userSelect: 'none' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, marginBottom: 2 }}>МИСТЕРИОЗНА НАГРАДА</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text2 }}>🔒 Разкрива се след одобрение</div>
        </div>
      </div>
    );
  }

  if (reward === 'fixed') {
    return (
      <div style={{
        borderRadius: 14,
        background: T.challengeBg,
        border: `1.5px solid ${T.challenge}30`,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 22 }}>🎯</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.challenge, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Фиксирана награда</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>{rewardLabel}</div>
        </div>
      </div>
    );
  }

  if (reward === 'choice') {
    return (
      <div style={{
        borderRadius: 14,
        background: T.eventBg,
        border: `1.5px solid ${T.event}30`,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 22 }}>🎲</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.event, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Награда по избор</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>{rewardLabel}</div>
        </div>
      </div>
    );
  }

  return null;
};

// ── Points preview bar ────────────────────────────────────────────────────────

const PointsBar = ({ pts, streak, approved }: { pts: number; streak: number; approved: boolean }) => {
  const hasMultiplier = streak >= 7;
  const finalPts = hasMultiplier ? Math.round(pts * 1.5) : pts;

  return (
    <div style={{
      background: approved ? T.householdBg : T.surf2,
      borderRadius: 14,
      padding: '14px 16px',
      border: `1.5px solid ${approved ? T.household + '40' : T.border}`,
      display: 'flex', alignItems: 'center', gap: 10,
      transition: 'all 0.4s ease',
    }}>
      {approved ? (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#fff', borderRadius: 99, padding: '4px 14px',
            boxShadow: '0 2px 8px rgba(44,181,160,0.2)',
            animation: 'ptsPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <span style={{ fontSize: 18 }}>⭐</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: T.household, fontFamily: 'Nunito, sans-serif' }}>
              +{finalPts} т.
            </span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.household }}>Точки начислени!</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text2 }}>Одобри →</span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#fff', borderRadius: 99, padding: '4px 14px',
            border: `1px solid ${T.border}`,
          }}>
            <span style={{ fontSize: 16 }}>⭐</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: T.challenge, fontFamily: 'Nunito, sans-serif' }}>
              +{pts} т.
            </span>
          </div>
          {hasMultiplier && (
            <div style={{
              background: '#fff3e0', color: '#c77700',
              borderRadius: 99, padding: '3px 9px',
              fontSize: 11, fontWeight: 700, fontFamily: 'DM Sans, sans-serif',
              border: '1px solid #f5a62340',
            }}>
              🔥 ×1.5
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Reject panel ──────────────────────────────────────────────────────────────

interface RejectPanelProps {
  reason: string;
  onChangeReason: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const RejectPanel = ({ reason, onChangeReason, onConfirm, onCancel }: RejectPanelProps) => (
  <div style={{
    position: 'absolute', bottom: 0, left: 0, right: 0,
    background: T.surface,
    borderRadius: '20px 20px 0 0',
    border: `1px solid ${T.border}`,
    borderBottom: 'none',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
    padding: '20px 16px 32px',
    zIndex: 40,
    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  }}>
    {/* Handle */}
    <div style={{
      width: 36, height: 4, borderRadius: 99,
      background: T.border, margin: '0 auto 20px',
    }} />

    <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif', marginBottom: 4 }}>
      Отхвърли задача
    </div>
    <div style={{ fontSize: 13, color: T.text2, marginBottom: 16 }}>
      Задачата ще се върне като неизпълнена.
    </div>

    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 6 }}>
        Причина за отхвърляне (незадължително)
      </div>
      <textarea
        value={reason}
        onChange={e => onChangeReason(e.target.value)}
        placeholder="Напиши коментар за изпълнителя..."
        rows={3}
        style={{
          width: '100%', borderRadius: 10, padding: '10px 12px',
          fontSize: 13, fontFamily: 'DM Sans, sans-serif',
          border: `1.5px solid ${T.border}`, background: T.surf2,
          color: T.text, resize: 'none', outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
      />
    </div>

    <div style={{ display: 'flex', gap: 10 }}>
      <div
        onClick={onCancel}
        style={{
          flex: 1, textAlign: 'center', padding: '12px',
          borderRadius: 99, border: `1.5px solid ${T.border}`,
          fontSize: 14, fontWeight: 600, color: T.text2, cursor: 'pointer',
          background: T.surf2,
        }}
      >
        Назад
      </div>
      <div
        onClick={onConfirm}
        style={{
          flex: 2, textAlign: 'center', padding: '12px',
          borderRadius: 99, border: `1.5px solid ${T.mustDo}`,
          fontSize: 14, fontWeight: 700, color: T.mustDo, cursor: 'pointer',
          background: T.mustDoBg,
        }}
      >
        Потвърди отхвърлянето
      </div>
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const task = TASKS.find(t => t.id === parseInt(id)) || TASKS[1];

  const tp = TASK_TYPES[task.type as keyof typeof TASK_TYPES] || TASK_TYPES.household;

  // State
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approving, setApproving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleApprove = () => {
    setApproving(true);
    setShowConfetti(true);
    setTimeout(() => {
      setStatus('approved');
      setApproving(false);
    }, 600);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleRejectConfirm = () => {
    setStatus('rejected');
    setRejecting(false);
  };

  const hasMultiplier = task.streak >= 7;
  const finalPts = hasMultiplier ? Math.round(task.pts * 1.5) : task.pts;

  return (
    <MobileShell>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(160px) rotate(360deg); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes rewardReveal {
          0%   { transform: scale(0.9); opacity: 0; }
          60%  { transform: scale(1.03); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ptsPopIn {
          0%   { transform: scale(0.7); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes approveFlash {
          0%   { background: ${T.householdBg}; }
          40%  { background: #c8f5ee; }
          100% { background: ${T.bg}; }
        }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        fontFamily: 'DM Sans, sans-serif',
        background: status === 'approved' ? T.bg : status === 'rejected' ? '#fff8f7' : T.bg,
        transition: 'background 0.5s ease',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Confetti layer */}
        {showConfetti && <Confetti />}

        {/* Backdrop for reject panel */}
        {rejecting && (
          <div
            onClick={() => setRejecting(false)}
            style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
              zIndex: 39,
            }}
          />
        )}

        {/* Top bar */}
        <div style={{
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          flexShrink: 0,
        }}>
          <Link href="/tasks" style={{ textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, background: T.surf2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: T.text, cursor: 'pointer', flexShrink: 0,
            }}>
              ‹
            </div>
          </Link>
          <div style={{
            flex: 1, fontSize: 15, fontWeight: 700, color: T.text,
            fontFamily: 'Nunito, sans-serif',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {task.title}
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: T.surf2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: T.text2, cursor: 'pointer', flexShrink: 0,
          }}>
            ⋯
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Type + status pills row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <TypePill type={task.type} />
            <StatusPill status={status} />
            {task.streak > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: '#fff3e0', color: '#c77700',
                borderRadius: 99, padding: '3px 9px',
                fontSize: 11, fontWeight: 700,
              }}>
                🔥 {task.streak} дни стрийк
              </span>
            )}
          </div>

          {/* Title */}
          <div style={{
            fontSize: 22, fontWeight: 800, color: T.text,
            fontFamily: 'Nunito, sans-serif', lineHeight: 1.25,
          }}>
            {task.title}
          </div>

          {/* Description */}
          {task.description && (
            <div style={{ fontSize: 14, color: T.text2, lineHeight: 1.6 }}>
              {task.description}
            </div>
          )}

          {/* Metadata row */}
          <div style={{
            background: T.surface, borderRadius: 14,
            border: `1px solid ${T.border}`,
            padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          }}>
            {/* Assignees */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AssigneeStack assignees={task.assignees} size={26} />
              <div>
                <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Изпълнител</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>
                  {task.assignees.map(ai => MEMBERS[ai]?.name).filter(Boolean).join(', ')}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: T.border, flexShrink: 0 }} />

            {/* Duration */}
            {task.duration && (
              <div>
                <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Времетраене</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>⏱ {task.duration} мин</div>
              </div>
            )}

            {/* Divider */}
            {task.duration && <div style={{ width: 1, height: 28, background: T.border, flexShrink: 0 }} />}

            {/* Due */}
            <div>
              <div style={{ fontSize: 10, color: T.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Срок</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>📅 {task.due}</div>
            </div>
          </div>

          {/* Points bar */}
          <PointsBar pts={task.pts} streak={task.streak} approved={status === 'approved'} />

          {/* Reward section */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text2, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {REWARD_ICONS[task.reward as keyof typeof REWARD_ICONS]} Награда
            </div>
            <RewardSection
              reward={task.reward}
              rewardLabel={task.rewardLabel}
              revealed={status === 'approved'}
              revealedLabel="Видеоигри 1ч — награда спечелена!"
            />
          </div>

          {/* Reject reason display */}
          {status === 'rejected' && rejectReason && (
            <div style={{
              background: T.mustDoBg, borderRadius: 12,
              border: `1.5px solid ${T.mustDo}30`,
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.mustDo, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Причина за отхвърляне
              </div>
              <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{rejectReason}</div>
            </div>
          )}

          {/* Bottom padding for buttons */}
          <div style={{ height: 20 }} />
        </div>

        {/* Action buttons */}
        <div style={{
          padding: '12px 16px', paddingBottom: 8,
          background: T.surface,
          borderTop: `1px solid ${T.border}`,
          flexShrink: 0,
        }}>
          {status === 'pending' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div
                onClick={() => setRejecting(true)}
                style={{
                  flex: 1, textAlign: 'center', padding: '13px',
                  borderRadius: 99, border: `1.5px solid ${T.mustDo}`,
                  fontSize: 14, fontWeight: 700, color: T.mustDo, cursor: 'pointer',
                  background: T.mustDoBg,
                }}
              >
                Отхвърли
              </div>
              <div
                onClick={approving ? undefined : handleApprove}
                style={{
                  flex: 2, textAlign: 'center', padding: '13px',
                  borderRadius: 99, border: `1.5px solid ${T.household}`,
                  fontSize: 14, fontWeight: 700, color: T.household, cursor: approving ? 'default' : 'pointer',
                  background: approving ? '#c8f5ee' : T.householdBg,
                  transition: 'all 0.2s',
                  boxShadow: `0 3px 12px ${T.household}30`,
                }}
              >
                {approving ? '✓ Одобрявам...' : 'Одобри'}
              </div>
            </div>
          )}

          {status === 'approved' && (
            <Link href="/tasks" style={{ textDecoration: 'none' }}>
              <div style={{
                width: '100%', textAlign: 'center', padding: '13px',
                borderRadius: 99,
                fontSize: 14, fontWeight: 700, color: T.household, cursor: 'pointer',
                background: T.householdBg, border: `1.5px solid ${T.household}40`,
              }}>
                ← Обратно към задачите
              </div>
            </Link>
          )}

          {status === 'rejected' && (
            <Link href="/tasks" style={{ textDecoration: 'none' }}>
              <div style={{
                width: '100%', textAlign: 'center', padding: '13px',
                borderRadius: 99,
                fontSize: 14, fontWeight: 700, color: T.mustDo, cursor: 'pointer',
                background: T.mustDoBg, border: `1.5px solid ${T.mustDo}40`,
              }}>
                ← Обратно към задачите
              </div>
            </Link>
          )}
        </div>

        <BottomNav activeIdx={1} />

        {/* Reject panel */}
        {rejecting && (
          <RejectPanel
            reason={rejectReason}
            onChangeReason={setRejectReason}
            onConfirm={handleRejectConfirm}
            onCancel={() => setRejecting(false)}
          />
        )}
      </div>
    </MobileShell>
  );
}
