'use client';

import { useState, useEffect } from 'react';
import { T, BADGE_TIERS } from '@/lib/tokens';
import { getBadges, getMembers, getCurrentMember } from '@/lib/actions';
import { MobileShell, BottomNav } from '@/components/layout/Shell';
import { ToggleTabs, BadgeCard } from '@/components/ui';
import type { BadgeTier } from '@/types';

type BadgeRow = Awaited<ReturnType<typeof getBadges>>['badges'][number];
type EarnedRow = Awaited<ReturnType<typeof getBadges>>['earned'][number];
type Member = Awaited<ReturnType<typeof getMembers>>[number];

type DBBadge = BadgeRow & { isEarned: boolean; earnedMembers: Member[] };

const CATEGORIES = ['Всички', 'Стрийк', 'Задачи', 'Точки', 'Семейство', 'Специални'];
const CAT_MAP: Record<string, string> = {
  'Стрийк': 'streak', 'Задачи': 'tasks', 'Точки': 'points', 'Семейство': 'family', 'Специални': 'special',
};
const TIERS: BadgeTier[] = ['bronze', 'silver', 'gold', 'legendary'];
const TIER_LABELS: Record<BadgeTier, string> = { bronze: 'Бронз', silver: 'Сребро', gold: 'Злато', legendary: 'Легенд.' };

// ── Badge detail sheet ────────────────────────────────────────────────────

function BadgeDetailSheet({ badge, onClose }: { badge: DBBadge; onClose: () => void }) {
  const tier = badge.tier as BadgeTier;
  const tierColor = BADGE_TIERS[tier] ?? T.text3;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <div onClick={onClose} style={{ fontSize: 20, color: T.text3, cursor: 'pointer' }}>✕</div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: badge.isEarned ? `${tierColor}20` : T.surf2,
            border: `3px solid ${badge.isEarned ? tierColor : T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 12px',
            boxShadow: badge.isEarned ? `0 0 24px ${tierColor}60` : 'none',
          }}>{badge.emoji ?? '🏅'}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif', marginBottom: 4 }}>{badge.title}</div>
          <div style={{ display: 'inline-block', background: `${tierColor}20`, color: tierColor, borderRadius: 99, padding: '2px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{badge.tier}</div>
        </div>
        {badge.description && (
          <div style={{ fontSize: 13, color: T.text2, textAlign: 'center', marginBottom: 16, lineHeight: 1.6 }}>{badge.description}</div>
        )}
        {badge.earnedMembers.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Спечелен от</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {badge.earnedMembers.map(m => (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Nunito, sans-serif' }}>{m.init}</div>
                  <span style={{ fontSize: 10, color: T.text3 }}>{m.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}

// ── Variant A — Family Explorer ───────────────────────────────────────────

function FamilyExplorer({ badges }: { badges: DBBadge[] }) {
  const [tierFilter, setTierFilter] = useState<BadgeTier | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('Всички');
  const [selectedBadge, setSelectedBadge] = useState<DBBadge | null>(null);

  const filtered = badges.filter(b => {
    if (tierFilter && b.tier !== tierFilter) return false;
    if (categoryFilter !== 'Всички' && b.category !== CAT_MAP[categoryFilter]) return false;
    return true;
  });

  const earnedCount = badges.filter(b => b.isEarned).length;
  const tierCounts = TIERS.map(t => ({ tier: t, count: badges.filter(b => b.isEarned && b.tier === t).length }));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {selectedBadge && <BadgeDetailSheet badge={selectedBadge} onClose={() => setSelectedBadge(null)} />}

      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '12px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Значки</div>
          <div style={{ background: T.challengeBg, borderRadius: 99, padding: '4px 12px' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.challenge }}>{earnedCount}/{badges.length} спечелени</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {tierCounts.map(({ tier, count }) => (
            <div key={tier} style={{ flex: 1, background: T.surf2, borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: BADGE_TIERS[tier], fontFamily: 'Nunito, sans-serif' }}>{count}</div>
              <div style={{ fontSize: 9, color: T.text3, textTransform: 'uppercase', fontWeight: 600 }}>{TIER_LABELS[tier]}</div>
            </div>
          ))}
        </div>

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
        {badges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: T.text3 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏅</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Няма значки за семейството</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, justifyItems: 'center' }}>
            {filtered.map(b => (
              <div key={b.id} onClick={() => setSelectedBadge(b)} style={{ cursor: 'pointer' }}>
                <BadgeCard icon={b.emoji ?? '🏅'} name={b.title} tier={b.tier as BadgeTier} earned={b.isEarned} />
                {b.earnedMembers.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                    {b.earnedMembers.slice(0, 3).map((m, i) => (
                      <div key={m.id} style={{ width: 14, height: 14, borderRadius: '50%', background: m.color, marginLeft: i > 0 ? -4 : 0, border: '1px solid #fff' }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

// ── Variant B — Personal Progress ────────────────────────────────────────

function PersonalProgress({ badges, currentMember }: { badges: DBBadge[]; currentMember: Awaited<ReturnType<typeof getCurrentMember>> }) {
  const [selectedBadge, setSelectedBadge] = useState<DBBadge | null>(null);

  const earnedBadges = badges.filter(b => b.isEarned);
  const unearnedBadges = badges.filter(b => !b.isEarned);
  const tierStats = TIERS.map(t => ({ tier: t, count: earnedBadges.filter(b => b.tier === t).length }));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {selectedBadge && <BadgeDetailSheet badge={selectedBadge} onClose={() => setSelectedBadge(null)} />}

      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {currentMember && (
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: currentMember.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Nunito, sans-serif', flexShrink: 0 }}>{currentMember.init}</div>
        )}
        <div style={{ fontSize: 18, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif' }}>
          {currentMember ? `Значки на ${currentMember.name}` : 'Моите значки'}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {tierStats.map(({ tier, count }) => (
            <div key={tier} style={{ flex: 1, background: count > 0 ? `${BADGE_TIERS[tier]}15` : T.surf2, borderRadius: 12, padding: '10px 6px', textAlign: 'center', border: `1.5px solid ${count > 0 ? BADGE_TIERS[tier] : T.border}` }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: count > 0 ? BADGE_TIERS[tier] : T.text3, fontFamily: 'Nunito, sans-serif' }}>{count}</div>
              <div style={{ fontSize: 9, color: count > 0 ? BADGE_TIERS[tier] : T.text3, textTransform: 'uppercase', fontWeight: 700 }}>{TIER_LABELS[tier]}</div>
            </div>
          ))}
        </div>

        {earnedBadges.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Спечелени</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, justifyItems: 'center' }}>
              {earnedBadges.map(b => (
                <div key={b.id} onClick={() => setSelectedBadge(b)} style={{ cursor: 'pointer' }}>
                  <BadgeCard icon={b.emoji ?? '🏅'} name={b.title} tier={b.tier as BadgeTier} earned={true} />
                </div>
              ))}
            </div>
          </div>
        )}

        {unearnedBadges.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Заключени</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, justifyItems: 'center' }}>
              {unearnedBadges.map(b => (
                <div key={b.id} onClick={() => setSelectedBadge(b)} style={{ cursor: 'pointer' }}>
                  <BadgeCard icon={b.emoji ?? '🏅'} name={b.title} tier={b.tier as BadgeTier} earned={false} />
                </div>
              ))}
            </div>
          </div>
        )}

        {badges.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: T.text3 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏅</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Няма значки все още</div>
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
  const [badges, setBadges] = useState<DBBadge[]>([]);
  const [currentMember, setCurrentMember] = useState<Awaited<ReturnType<typeof getCurrentMember>>>(null);

  useEffect(() => {
    Promise.all([getBadges(), getMembers(), getCurrentMember()]).then(([{ badges: bRows, earned }, members, curr]) => {
      const enriched: DBBadge[] = bRows.map(b => ({
        ...b,
        isEarned: earned.some(e => e.badge_id === b.id),
        earnedMembers: earned
          .filter(e => e.badge_id === b.id)
          .map(e => members.find(m => m.id === e.member_id))
          .filter((m): m is Member => m !== undefined),
      }));
      setBadges(enriched);
      setCurrentMember(curr);
    });
  }, []);

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '8px 16px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <ToggleTabs options={['Семейство', 'Личен']} active={variant} onChange={setVariant} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {variant === 0
            ? <FamilyExplorer badges={badges} />
            : <PersonalProgress badges={badges} currentMember={currentMember} />
          }
        </div>
        <BottomNav activeIdx={3} />
      </div>
    </MobileShell>
  );
}
