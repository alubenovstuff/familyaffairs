'use client';

import { useState, use, useEffect } from 'react';
import { T, BADGE_TIERS } from '@/lib/tokens';
import { getMember, getBadges, getLedger } from '@/lib/actions';
import { MobileShell, BottomNav } from '@/components/layout/Shell';
import { ToggleTabs, BadgeCard, StreakChip, Confetti } from '@/components/ui';

type Member = NonNullable<Awaited<ReturnType<typeof getMember>>>;
type BadgeRow = Awaited<ReturnType<typeof getBadges>>['badges'][number];
type EarnedRow = Awaited<ReturnType<typeof getBadges>>['earned'][number];
type LedgerRow = Awaited<ReturnType<typeof getLedger>>[number];

const TASK_TYPE_BREAKDOWN = [
  { label: 'Домашно', color: T.household, count: 24, total: 30 },
  { label: 'Must-do', color: T.mustDo, count: 18, total: 20 },
  { label: 'Предизвик.', color: T.challenge, count: 12, total: 15 },
  { label: 'Ежедневно', color: T.ongoing, count: 28, total: 30 },
];

const STREAK_DAYS = [true, true, false, true, true, true, true];

function ledgerIcon(type: string) {
  if (type === 'earned') return '⭐';
  if (type === 'spent') return '🎁';
  return '✨';
}
function ledgerColor(type: string) {
  if (type === 'earned') return T.challenge;
  if (type === 'spent') return T.mustDo;
  return T.ongoing;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' });
}

// ── Shared: Member avatar + header info ──────────────────────────────────

function HeroHeader({ member }: { member: Member }) {
  const levelPct = Math.min(((member.points_total_earned ?? 0) % 500) / 500, 1);
  const level = Math.floor((member.points_total_earned ?? 0) / 500) + 1;

  return (
    <div style={{
      background: `linear-gradient(160deg, ${member.color} 0%, ${T.mustDo} 100%)`,
      padding: '24px 20px 20px', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.25)',
          border: '3px solid rgba(255,255,255,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'Nunito, sans-serif', flexShrink: 0,
        }}>{member.init}</div>
        <div style={{ flex: 1, paddingTop: 4 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'Nunito, sans-serif' }}>{member.name}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'capitalize' }}>{member.role}</span>
            <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>Ниво {level}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'Nunito, sans-serif' }}>⭐ {member.points_balance ?? 0}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>баланс</div>
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Ниво {level}</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>{(member.points_total_earned ?? 0) % 500}/{500} т.</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 99 }}>
          <div style={{ height: '100%', width: `${levelPct * 100}%`, background: '#fff', borderRadius: 99, transition: 'width 0.5s' }} />
        </div>
      </div>
      <StreakChip days={member.current_streak ?? 0} />
    </div>
  );
}

// ── Variant A — Own Profile ───────────────────────────────────────────────

function OwnProfile({ member, badges, earned, ledger }: { member: Member; badges: BadgeRow[]; earned: EarnedRow[]; ledger: LedgerRow[] }) {
  const [tab, setTab] = useState(0);
  const [tierFilter, setTierFilter] = useState<string | null>(null);

  const filteredBadges = tierFilter
    ? badges.filter(b => b.tier === tierFilter)
    : badges;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <HeroHeader member={member} />

      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex' }}>
          {['Значки', 'Точки', 'Задачи'].map((t, i) => (
            <div key={t} onClick={() => setTab(i)} style={{
              flex: 1, padding: '12px 0', textAlign: 'center', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              color: tab === i ? T.mustDo : T.text3,
              borderBottom: `2px solid ${tab === i ? T.mustDo : 'transparent'}`,
              transition: 'all 0.15s',
            }}>{t}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {tab === 0 && (
          <div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {[null, 'bronze', 'silver', 'gold', 'legendary'].map(t => (
                <div key={String(t)} onClick={() => setTierFilter(t)} style={{
                  padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: tierFilter === t ? T.mustDo : T.surf2,
                  color: tierFilter === t ? '#fff' : T.text2,
                  border: `1px solid ${tierFilter === t ? T.mustDo : T.border}`,
                }}>
                  {t === null ? 'Всички' : t === 'bronze' ? 'Бронз' : t === 'silver' ? 'Сребро' : t === 'gold' ? 'Злато' : 'Легенд.'}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, justifyItems: 'center' }}>
              {filteredBadges.map(b => (
                <BadgeCard
                  key={b.id}
                  icon={b.emoji ?? '🏅'}
                  name={b.title}
                  tier={b.tier as keyof typeof BADGE_TIERS}
                  earned={earned.some(e => e.badge_id === b.id)}
                />
              ))}
            </div>
          </div>
        )}

        {tab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
              {ledger.map((entry, i) => (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  borderBottom: i < ledger.length - 1 ? `1px solid ${T.border}` : 'none',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${ledgerColor(entry.type)}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{ledgerIcon(entry.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{entry.description ?? ''}</div>
                    <div style={{ fontSize: 11, color: T.text3 }}>{entry.created_at ? formatDate(entry.created_at) : ''}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Nunito, sans-serif', color: (entry.amount ?? 0) > 0 ? '#2d9e5f' : T.mustDo }}>
                    {(entry.amount ?? 0) > 0 ? '+' : ''}{entry.amount ?? 0}
                  </div>
                </div>
              ))}
              {ledger.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: T.text3, fontSize: 13 }}>Няма записи</div>
              )}
            </div>
          </div>
        )}

        {tab === 2 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Streak тази седмица</div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between', marginBottom: 20 }}>
              {['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'].map((d, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: STREAK_DAYS[i] ? T.mustDo : T.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                    {STREAK_DAYS[i] ? '✓' : ''}
                  </div>
                  <span style={{ fontSize: 10, color: T.text3 }}>{d}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>По тип задача</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TASK_TYPE_BREAKDOWN.map(t => (
                <div key={t.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{t.label}</span>
                    <span style={{ fontSize: 12, color: T.text3 }}>{t.count}/{t.total}</span>
                  </div>
                  <div style={{ height: 6, background: T.surf2, borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${(t.count / t.total) * 100}%`, background: t.color, borderRadius: 99 }} />
                  </div>
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

// ── Variant B — Parent View ───────────────────────────────────────────────

function ParentView({ member, badges, earned, ledger }: { member: Member; badges: BadgeRow[]; earned: EarnedRow[]; ledger: LedgerRow[] }) {
  const [bonusOpen, setBonusOpen] = useState(false);
  const [bonusAmt, setBonusAmt] = useState(20);
  const [bonusNote, setBonusNote] = useState('');
  const [bonusSent, setBonusSent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const sendBonus = () => {
    setShowConfetti(true);
    setBonusSent(true);
    setTimeout(() => setBonusOpen(false), 1800);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {showConfetti && <Confetti />}

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${T.border}`, padding: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: 'Nunito, sans-serif', flexShrink: 0 }}>{member.init}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif' }}>{member.name}</div>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'capitalize', background: T.surf2, borderRadius: 99, padding: '2px 8px' }}>{member.role}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: T.challenge, fontFamily: 'Nunito, sans-serif' }}>⭐ {member.points_balance ?? 0}</div>
            <div style={{ fontSize: 10, color: T.text3 }}>баланс</div>
            <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{member.points_total_earned ?? 0} общо</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <StreakChip days={member.current_streak ?? 0} />
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Значки</div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
          {badges.slice(0, 6).map(b => (
            <div key={b.id} style={{ flexShrink: 0 }}>
              <BadgeCard icon={b.emoji ?? '🏅'} name={b.title} tier={b.tier as keyof typeof BADGE_TIERS} earned={earned.some(e => e.badge_id === b.id)} size="sm" />
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Последни точки</div>
        <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${T.border}`, overflow: 'hidden', marginBottom: 16 }}>
          {ledger.slice(0, 4).map((entry, i) => (
            <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < Math.min(ledger.length, 4) - 1 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${ledgerColor(entry.type)}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{ledgerIcon(entry.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{entry.description ?? ''}</div>
                <div style={{ fontSize: 10, color: T.text3 }}>{entry.created_at ? formatDate(entry.created_at) : ''}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Nunito, sans-serif', color: (entry.amount ?? 0) > 0 ? '#2d9e5f' : T.mustDo }}>{(entry.amount ?? 0) > 0 ? '+' : ''}{entry.amount ?? 0}</div>
            </div>
          ))}
          {ledger.length === 0 && (
            <div style={{ padding: '16px', textAlign: 'center', color: T.text3, fontSize: 12 }}>Няма записи</div>
          )}
        </div>

        <div onClick={() => setBonusOpen(true)} style={{
          background: T.challenge, borderRadius: 12, padding: '13px', textAlign: 'center',
          cursor: 'pointer', boxShadow: `0 4px 16px ${T.challenge}40`,
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>⭐ Добави бонус за {member.name}</span>
        </div>
        <div style={{ height: 16 }} />
      </div>

      {bonusOpen && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: 20 }}>
            {bonusSent ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Бонусът е изпратен!</div>
                <div style={{ fontSize: 13, color: T.text2, marginTop: 6 }}>+{bonusAmt} т. за {member.name}</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>⭐ Бонус за {member.name}</div>
                  <div onClick={() => setBonusOpen(false)} style={{ fontSize: 20, color: T.text3, cursor: 'pointer' }}>✕</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8 }}>Количество точки</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[10, 20, 50, 100].map(v => (
                      <div key={v} onClick={() => setBonusAmt(v)} style={{
                        flex: 1, padding: '10px 4px', borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                        background: bonusAmt === v ? T.challenge : T.surf2,
                        border: `1.5px solid ${bonusAmt === v ? T.challenge : T.border}`,
                      }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: bonusAmt === v ? '#fff' : T.text, fontFamily: 'Nunito, sans-serif' }}>{v}</div>
                        <div style={{ fontSize: 9, color: bonusAmt === v ? 'rgba(255,255,255,0.8)' : T.text3 }}>т.</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 5 }}>Бележка (незадължително)</div>
                  <input value={bonusNote} onChange={e => setBonusNote(e.target.value)} placeholder="напр. За отличен резултат!" style={{ width: '100%', borderRadius: 10, padding: '10px 14px', fontSize: 13, border: `1.5px solid ${T.border}`, background: '#fff', color: T.text, fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
                </div>
                <div onClick={sendBonus} style={{ background: T.challenge, borderRadius: 12, padding: 14, textAlign: 'center', cursor: 'pointer', boxShadow: `0 4px 16px ${T.challenge}40` }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Изпрати +{bonusAmt} т.</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [variant, setVariant] = useState(0);
  const [member, setMember] = useState<Member | null>(null);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [earned, setEarned] = useState<EarnedRow[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);

  useEffect(() => {
    getMember(id).then(m => { if (m) setMember(m); });
    getBadges().then(({ badges: b, earned: e }) => { setBadges(b); setEarned(e); });
    getLedger(id).then(setLedger);
  }, [id]);

  if (!member) {
    return (
      <MobileShell>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: T.text3, fontSize: 14 }}>Зареждане...</div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '8px 16px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <ToggleTabs options={['Мой профил', 'Родителски']} active={variant} onChange={setVariant} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {variant === 0
            ? <OwnProfile member={member} badges={badges} earned={earned} ledger={ledger} />
            : <ParentView member={member} badges={badges} earned={earned} ledger={ledger} />
          }
        </div>
        <BottomNav activeIdx={3} />
      </div>
    </MobileShell>
  );
}
