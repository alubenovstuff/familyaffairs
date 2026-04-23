'use client';

import { T, TASK_TYPES, BADGE_TIERS } from '@/lib/tokens';
import type { TaskType, BadgeTier } from '@/types';
import { MEMBERS } from '@/lib/mock-data';

// ── Avatar ────────────────────────────────────────────────────────────────

interface AvatarProps {
  color: string;
  initials: string;
  size?: number;
  ring?: boolean;
  badge?: string;
}

export const Avatar = ({ color, initials, size = 32, ring = false, badge }: AvatarProps) => (
  <div style={{ position: 'relative', flexShrink: 0 }}>
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color,
      border: ring ? '2.5px solid #fff' : `1.5px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: size * 0.35, fontWeight: 700, fontFamily: 'Nunito, sans-serif',
      flexShrink: 0,
    }}>
      {initials}
    </div>
    {badge && (
      <div style={{
        position: 'absolute', bottom: -2, right: -2,
        width: 10, height: 10, borderRadius: '50%',
        background: badge, border: '1.5px solid #fff',
      }} />
    )}
  </div>
);

export const MemberAvatar = ({ memberIdx, size = 24, ring = false, badge }: { memberIdx: number; size?: number; ring?: boolean; badge?: string }) => {
  const m = MEMBERS[memberIdx];
  if (!m) return null;
  return <Avatar color={m.color} initials={m.init} size={size} ring={ring} badge={badge} />;
};

// ── Pill ──────────────────────────────────────────────────────────────────

interface PillProps {
  color: string;
  bg?: string;
  small?: boolean;
  children: React.ReactNode;
}

export const Pill = ({ color, bg, small = false, children }: PillProps) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center',
    background: bg || `${color}18`, color,
    border: `1px solid ${color}30`,
    borderRadius: 99, padding: small ? '2px 7px' : '3px 9px',
    fontSize: small ? 10 : 11, fontWeight: 600,
    fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.01em',
    lineHeight: 1.3,
  }}>
    {children}
  </span>
);

export const TypePill = ({ type, small = false }: { type: string; small?: boolean }) => {
  const t = TASK_TYPES[type as keyof typeof TASK_TYPES] || TASK_TYPES.household;
  return <Pill color={t.color} bg={t.bg} small={small}>{t.label}</Pill>;
};

// ── Points badge ──────────────────────────────────────────────────────────

interface PointsBadgeProps {
  pts: number;
  variant?: 'default' | 'earn' | 'spend' | 'balance';
}

export const PointsBadge = ({ pts, variant = 'default' }: PointsBadgeProps) => {
  const variants = {
    default: { bg: T.challengeBg, color: T.challenge, prefix: '' },
    earn: { bg: '#e8f8ef', color: '#2d9e5f', prefix: '+' },
    spend: { bg: T.mustDoBg, color: T.mustDo, prefix: '−' },
    balance: { bg: '#1e1a16', color: '#fff', prefix: '' },
  };
  const v = variants[variant];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: v.bg, color: v.color,
      borderRadius: 99, padding: '4px 12px',
      fontSize: 14, fontWeight: 800, fontFamily: 'Nunito, sans-serif',
    }}>
      <span style={{ fontSize: 16 }}>⭐</span>
      {v.prefix}{pts}
    </div>
  );
};

export const SmallPtsBadge = ({ pts, color }: { pts: number; color?: string }) => (
  <div style={{
    background: T.challengeBg, borderRadius: 99, padding: '2px 8px',
    fontSize: 11, fontWeight: 700, color: color || T.challenge,
    fontFamily: 'Nunito, sans-serif',
    display: 'flex', alignItems: 'center', gap: 3,
  }}>⭐ {pts}</div>
);

// ── Streak chip ───────────────────────────────────────────────────────────

export const StreakChip = ({ days }: { days: number }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: '#fff3e0', color: '#c77700',
    borderRadius: 99, padding: '4px 12px',
    fontSize: 13, fontWeight: 700, fontFamily: 'Nunito, sans-serif',
  }}>
    🔥 {days} дни
  </div>
);

// ── Badge card ────────────────────────────────────────────────────────────

interface BadgeCardProps {
  icon: string;
  name: string;
  tier: BadgeTier;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
  size?: 'sm' | 'md';
}

export const BadgeCard = ({ icon, name, tier, earned, progress, maxProgress, size = 'md' }: BadgeCardProps) => {
  const tierColor = BADGE_TIERS[tier];
  const dim = size === 'sm' ? 44 : 56;
  const showProgress = !earned && progress !== undefined && maxProgress !== undefined;
  return (
    <div style={{ width: size === 'sm' ? 64 : 80, textAlign: 'center', opacity: earned ? 1 : 0.5 }}>
      <div style={{
        width: dim, height: dim, borderRadius: 16,
        background: earned ? `${tierColor}20` : T.surf2,
        border: `2px solid ${earned ? tierColor : T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size === 'sm' ? 20 : 24, margin: '0 auto 6px',
        boxShadow: earned ? `0 0 12px ${tierColor}40` : 'none',
      }}>{icon}</div>
      <div style={{ fontSize: size === 'sm' ? 9 : 11, fontWeight: 600, color: T.text }}>{name}</div>
      <div style={{ fontSize: 10, color: tierColor, fontWeight: 600, marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tier}</div>
      {showProgress && maxProgress && (
        <div style={{ marginTop: 4, height: 3, background: T.border, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(progress! / maxProgress) * 100}%`, background: tierColor, borderRadius: 99 }} />
        </div>
      )}
    </div>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────

export const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: T.surface, borderRadius: 12,
    border: `1px solid ${T.border}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    overflow: 'hidden', ...style,
  }}>
    {children}
  </div>
);

// ── Filter chip ───────────────────────────────────────────────────────────

interface FilterChipProps {
  label: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}

export const FilterChip = ({ label, active, color, onClick }: FilterChipProps) => (
  <div onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: active ? (color || T.mustDo) : T.surface,
    color: active ? '#fff' : T.text2,
    border: `1px solid ${active ? (color || T.mustDo) : T.border}`,
    borderRadius: 99, padding: '5px 12px',
    fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
    transition: 'all 0.15s',
  }}>{label}</div>
);

// ── Primary button ────────────────────────────────────────────────────────

interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  style?: React.CSSProperties;
}

export const Btn = ({ children, onClick, color, disabled, loading, variant = 'primary', size = 'md', icon, style }: BtnProps) => {
  const sz = size === 'sm' ? { px: 12, py: 6, fs: 12 } : size === 'lg' ? { px: 20, py: 12, fs: 15 } : { px: 16, py: 9, fs: 13 };
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: color || T.mustDo, text: '#fff', border: 'none' },
    secondary: { bg: T.surf2, text: T.text, border: `1px solid ${T.border}` },
    outline: { bg: 'transparent', text: color || T.mustDo, border: `1.5px solid ${color || T.mustDo}` },
    ghost: { bg: 'transparent', text: T.text2, border: 'none' },
    danger: { bg: '#fdf0ed', text: T.mustDo, border: `1.5px solid ${T.mustDo}` },
    success: { bg: T.householdBg, text: T.household, border: `1.5px solid ${T.household}` },
  };
  const s = styles[variant];
  return (
    <div
      onClick={disabled || loading ? undefined : onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: disabled ? T.border : s.bg, color: disabled ? '#fff' : s.text,
        border: s.border, borderRadius: 99,
        padding: `${sz.py}px ${sz.px}px`,
        fontSize: sz.fs, fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        letterSpacing: '0.01em',
        animation: loading ? 'pulse 1s infinite' : 'none',
        boxShadow: variant === 'primary' && !disabled ? `0 3px 12px ${(color || T.mustDo)}40` : 'none',
        transition: 'all 0.15s',
        ...style,
      }}
    >
      {icon && <span style={{ fontSize: sz.fs + 1 }}>{icon}</span>}
      {loading ? '...' : children}
    </div>
  );
};

// ── Toggle tabs ───────────────────────────────────────────────────────────

interface ToggleTabsProps {
  options: string[];
  active: number;
  onChange: (i: number) => void;
}

export const ToggleTabs = ({ options, active, onChange }: ToggleTabsProps) => (
  <div style={{ display: 'inline-flex', background: T.surf2, borderRadius: 99, padding: 2, gap: 1 }}>
    {options.map((o, i) => (
      <div key={o} onClick={() => onChange(i)} style={{
        padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
        background: i === active ? '#fff' : 'transparent',
        color: i === active ? T.text : T.text2,
        boxShadow: i === active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        cursor: 'pointer', transition: 'all 0.15s',
      }}>{o}</div>
    ))}
  </div>
);

// ── Input ─────────────────────────────────────────────────────────────────

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export const Input = ({ label, placeholder, type = 'text', value, onChange, error }: InputProps) => (
  <div>
    {label && <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 5 }}>{label}</div>}
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', borderRadius: 10, padding: '12px 14px', fontSize: 14,
        border: `1.5px solid ${error ? '#e53e3e' : T.border}`,
        background: '#fff', color: T.text, fontFamily: 'DM Sans, sans-serif', outline: 'none',
        transition: 'border-color 0.15s',
      }}
    />
    {error && <div style={{ fontSize: 11, color: '#e53e3e', marginTop: 3 }}>{error}</div>}
  </div>
);

// ── Confetti ──────────────────────────────────────────────────────────────

export const Confetti = () => {
  const colors = [T.challenge, T.mustDo, T.household, T.ongoing, T.event, '#e85d75'];
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160, overflow: 'hidden', pointerEvents: 'none', zIndex: 30 }}>
      {Array.from({ length: 26 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', top: -10, left: `${3 + (i * 3.7) % 94}%`,
          width: 5 + (i % 3) * 3, height: 5 + (i % 3) * 3,
          borderRadius: i % 3 === 0 ? '50%' : 2, background: colors[i % colors.length],
          animation: `confettiFall ${0.9 + i * 0.04}s ${i * 0.04}s ease-out forwards`,
        }} />
      ))}
    </div>
  );
};
