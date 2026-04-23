'use client';

import { useState } from 'react';
import { T, BADGE_TIERS } from '@/lib/tokens';
import { BADGES, MEMBERS } from '@/lib/mock-data';
import { MobileShell, BottomNav } from '@/components/layout/Shell';
import { ToggleTabs, BadgeCard } from '@/components/ui';
import type { Badge, BadgeTier } from '@/types';

const CATEGORIES = ['Всички', 'Стрийк', 'Задачи', 'Точки', 'Семейство', 'Специални'];
const CAT_MAP: Record<string, string> = {
  'Стрийк': 'streak', 'Задачи': 'tasks', 'Точки': 'points', 'Семейство': 'family', 'Специални': 'special',
};
const TIERS: BadgeTier[] = ['bronze', 'silver', 'gold', 'legendary'];
const TIER_LABELS: Record<BadgeTier, string> = { bronze: 'Бронз', silver: 'Сребро', gold: 'Злато', legendary: 'Легенд.' };

// ── Badge detail sheet ────────────────────────────────────────────────────

function BadgeDetailSheet({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  const tierColor = BADGE_TIERS[badge.tier];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <div onClick={onClose} style={{ fontSize: 20, color: T.text3, cursor: 'pointer' }}>✕</div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: badge.earned ? `${tierColor}20` : T.surf2,
            border: `3px solid ${badge.earned ? tierColor : T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 12px',
            boxShadow: badge.earned ? `0 0 24px ${tierColor}60` : 'none',
          }}>{badge.icon}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif', marginBottom: 4 }}>{badge.name}</div>
          <div style={{ display: 'inline-block', background: `${tierColor}20`, color: tierColor, borderRadius: 99, padding: '2px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{badge.tier}</div>
        </div>
        <div style={{ fontSize: 13, color: T.text2, textAlign: 'center', marginBottom: 16, lineHeight: 1.6 }}>{badge.description}</div>

        {/* Progress */}
        {!badge.earned && badge.progress !== undefined && badge.maxProgress && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>Прогрес</span>
              <span style={{ fontSize: 12, color: T.text3 }}>{badge.progress}/{badge.maxProgress}</span>
            </div>
            <div style={{ height: 8, background: T.surf2, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(badge.progress / badge.maxProgress) * 100}%`, background: tierColor, borderRadius: 99, transition: 'width 0.5s' }} />
            </div>
          </div>
        )}

        {/* Earned by */}
        {badge.earned && badge.earnedBy && badge.earnedBy.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Спечелен от</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {badge.earnedBy.map(mi => {
                const m = MEMBERS[mi];
                return (
                  <div key={mi} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Nunito, sans-serif' }}>{m.init}</div>
                    <span style={{ fontSize: 10, color: T.text3 }}>{m.name.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

// ── Variant A — Family Explorer ───────────────────────────────────────────

function FamilyExplorer() {
  const [tierFilter, setTierFilter] = useState<BadgeTier | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('Всички');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const filtered = BADGES.filter(b => {
    if (tierFilter && b.tier !== tierFilter) return false;
    if (categoryFilter !== 'Всички' && b.category !== CAT_MAP[categoryFilter]) return false;
    return true;
  });

  const earned = BADGES.filter(b => b.earned).length;
  const tierCounts = TIERS.map(t => ({ tier: t, count: BADGES.filter(b => b.earned && b.tier === t).length }));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {selectedBadge && <BadgeDetailSheet badge={selectedBadge} onClose={() => setSelectedBadge(null)} />}

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '12px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Значки</div>
          <div style={{ background: T.challengeBg, borderRadius: 99, padding: '4px 12px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.challenge }}>{earned}/{BADGES.length} спечелени</span>
          </div>
        </div>

        {/* Family progress by tier */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {tierCounts.map(({ tier, count }) => (
            <div key={tier} style={{ flex: 1, background: T.surf2, borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: BADGE_TIERS[tier], fontFamily: 'Nunito, sans-serif' }}>{count}</div>
              <div style={{ fontSize: 9, color: T.text3, textTransform: 'uppercase', fontWeight: 600 }}>{TIER_LABELS[tier]}</div>
            </div>
          ))}
        </div>

        {/* Tier filter */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 8 }}>
          <div onClick={() => setTierFilter(null)} style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0, background: !tierFilter ? T.mustDo : T.surf2, color: !tierFilter ? '#fff' : T.text2, border: `1px solid ${!tierFilter ? T.mustDo : T.border}` }}>Всички</div>
          {TIERS.map(t => (
            <div key={t} onClick={() => setTierFilter(tierFilter === t ? null : t)} style={{
              padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
              background: tierFilter === t ? BADGE_TIERS[t] : T.surf2,
              color: tierFilter === t ? '#fff' : T.text2,
              border: `1px solid ${tierFilter === t ? BADGE_TIERS[t] : T.border}`,
            }}>{TIER_LABELS[t]}</div>
          ))}
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          {CATEGORIES.map(c => (
            <div key={c} onClick={() => setCategoryFilter(c)} style={{
              padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0,
              color: categoryFilter === c ? T.mustDo : T.text3,
              borderBottom: `2px solid ${categoryFilter === c ? T.mustDo : 'transparent'}`,
              transition: 'all 0.15s',
            }}>{c}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, justifyItems: 'center' }}>
          {filtered.map(b => (
            <div key={b.id} onClick={() => setSelectedBadge(b)} style={{ cursor: 'pointer' }}>
              <BadgeCard icon={b.icon} name={b.name} tier={b.tier} earned={b.earned} progress={b.progress} maxProgress={b.maxProgress} />
              {b.earned && b.earnedBy && b.earnedBy.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                  {b.earnedBy.slice(0, 3).map((mi, i) => (
                    <div key={mi} style={{ width: 14, height: 14, borderRadius: '50%', background: MEMBERS[mi]?.color || T.text3, marginLeft: i > 0 ? -4 : 0, border: '1px solid #fff' }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

// ── Variant B — Personal Progress ────────────────────────────────────────

function PersonalProgress() {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const memberIdx = 2; // Елена
  const m = MEMBERS[memberIdx];

  const inProgress = BADGES.filter(b => !b.earned && b.progress !== undefined && b.maxProgress);
  const earnedBadges = BADGES.filter(b => b.earned);
  const lockedBadges = BADGES.filter(b => !b.earned && !b.progress);

  const tierStats = TIERS.map(t => ({ tier: t, count: earnedBadges.filter(b => b.tier === t).length }));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {selectedBadge && <BadgeDetailSheet badge={selectedBadge} onClose={() => setSelectedBadge(null)} />}

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Nunito, sans-serif', flexShrink: 0 }}>{m.init}</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Значки на {m.name}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Tier stats */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {tierStats.map(({ tier, count }) => (
            <div key={tier} style={{ flex: 1, background: count > 0 ? `${BADGE_TIERS[tier]}15` : T.surf2, borderRadius: 12, padding: '10px 6px', textAlign: 'center', border: `1.5px solid ${count > 0 ? BADGE_TIERS[tier] : T.border}` }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: count > 0 ? BADGE_TIERS[tier] : T.text3, fontFamily: 'Nunito, sans-serif' }}>{count}</div>
              <div style={{ fontSize: 9, color: count > 0 ? BADGE_TIERS[tier] : T.text3, textTransform: 'uppercase', fontWeight: 700 }}>{TIER_LABELS[tier]}</div>
            </div>
          ))}
        </div>

        {/* In progress */}
        {inProgress.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>В прогрес</div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
              {inProgress.map(b => {
                const tierColor = BADGE_TIERS[b.tier];
                return (
                  <div key={b.id} onClick={() => setSelectedBadge(b)} style={{ flexShrink: 0, width: 120, background: '#fff', borderRadius: 14, border: `1px solid ${T.border}`, padding: '12px 10px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${tierColor}20`, border: `2px solid ${tierColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{b.icon}</div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.text }}>{b.name}</div>
                        <div style={{ fontSize: 10, color: tierColor, fontWeight: 600, textTransform: 'uppercase' }}>{b.tier}</div>
                      </div>
                    </div>
                    <div style={{ height: 4, background: T.surf2, borderRadius: 99, marginBottom: 4 }}>
                      <div style={{ height: '100%', width: `${((b.progress || 0) / (b.maxProgress || 1)) * 100}%`, background: tierColor, borderRadius: 99 }} />
                    </div>
                    <div style={{ fontSize: 10, color: T.text3 }}>{b.progress}/{b.maxProgress}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Earned */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Спечелени</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, justifyItems: 'center' }}>
            {earnedBadges.map(b => (
              <div key={b.id} onClick={() => setSelectedBadge(b)} style={{ cursor: 'pointer' }}>
                <BadgeCard icon={b.icon} name={b.name} tier={b.tier} earned={b.earned} />
              </div>
            ))}
          </div>
        </div>

        {/* Locked */}
        {lockedBadges.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Заключени</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, justifyItems: 'center' }}>
              {lockedBadges.map(b => (
                <div key={b.id} onClick={() => setSelectedBadge(b)} style={{ cursor: 'pointer' }}>
                  <BadgeCard icon={b.icon} name={b.name} tier={b.tier} earned={false} />
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function BadgesPage() {
  const [variant, setVariant] = useState(0);

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '8px 16px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <ToggleTabs options={['Семейство', 'Личен']} active={variant} onChange={setVariant} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {variant === 0 ? <FamilyExplorer /> : <PersonalProgress />}
        </div>
        <BottomNav activeIdx={3} />
      </div>
    </MobileShell>
  );
}
