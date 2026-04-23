'use client';

import { useState, use } from 'react';
import { T, BADGE_TIERS } from '@/lib/tokens';
import { MEMBERS, BADGES, LEDGER } from '@/lib/mock-data';
import { MobileShell, BottomNav } from '@/components/layout/Shell';
import { ToggleTabs, BadgeCard, StreakChip, Confetti } from '@/components/ui';

const TASK_TYPE_BREAKDOWN = [
  { label: 'Домашно', color: T.household, count: 24, total: 30 },
  { label: 'Must-do', color: T.mustDo, count: 18, total: 20 },
  { label: 'Предизвик.', color: T.challenge, count: 12, total: 15 },
  { label: 'Ежедневно', color: T.ongoing, count: 28, total: 30 },
];

const STREAK_DAYS = [true, true, false, true, true, true, true]; // Mon–Sun

// ── Shared: Member avatar + header info ──────────────────────────────────

function HeroHeader({ memberIdx }: { memberIdx: number }) {
  const m = MEMBERS[memberIdx];
  const levelPct = Math.min((m.pointsTotalEarned % 500) / 500, 1);
  const level = Math.floor(m.pointsTotalEarned / 500) + 1;

  return (
    <div style={{
      background: `linear-gradient(160deg, ${m.color} 0%, ${T.mustDo} 100%)`,
      padding: '24px 20px 20px', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.25)',
          border: '3px solid rgba(255,255,255,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'Nunito, sans-serif', flexShrink: 0,
        }}>{m.init}</div>
        <div style={{ flex: 1, paddingTop: 4 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', fontFamily: 'Nunito, sans-serif' }}>{m.name}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 700, textTransform: 'capitalize' }}>{m.role}</span>
            <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', borderRadius: 99, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>Ниво {level}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff', fontFamily: 'Nunito, sans-serif' }}>⭐ {m.pointsBalance}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>баланс</div>
        </div>
      </div>
      {/* Level bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Ниво {level}</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>{m.pointsTotalEarned % 500}/{500} т.</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 99 }}>
          <div style={{ height: '100%', width: `${levelPct * 100}%`, background: '#fff', borderRadius: 99, transition: 'width 0.5s' }} />
        </div>
      </div>
      <StreakChip days={m.currentStreak} />
    </div>
  );
}

// ── Variant A — Own Profile ───────────────────────────────────────────────

function OwnProfile({ memberIdx }: { memberIdx: number }) {
  const [tab, setTab] = useState(0);
  const [tierFilter, setTierFilter] = useState<string | null>(null);

  const filteredBadges = tierFilter
    ? BADGES.filter(b => b.tier === tierFilter)
    : BADGES;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <HeroHeader memberIdx={memberIdx} />

      {/* Tabs */}
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
        {/* Badges tab */}
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
                <BadgeCard key={b.id} icon={b.icon} name={b.name} tier={b.tier} earned={b.earned} progress={b.progress} maxProgress={b.maxProgress} />
              ))}
            </div>
          </div>
        )}

        {/* Ledger tab */}
        {tab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
              {LEDGER.map((entry, i) => (
                <div key={entry.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  borderBottom: i < LEDGER.length - 1 ? `1px solid ${T.border}` : 'none',
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${entry.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{entry.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{entry.label}</div>
                    <div style={{ fontSize: 11, color: T.text3 }}>{entry.date}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Nunito, sans-serif', color: entry.delta > 0 ? '#2d9e5f' : T.mustDo }}>
                    {entry.delta > 0 ? '+' : ''}{entry.delta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks tab */}
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

function ParentView({ memberIdx }: { memberIdx: number }) {
  const m = MEMBERS[memberIdx];
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
        {/* Profile card */}
        <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${T.border}`, padding: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', fontFamily: 'Nunito, sans-serif', flexShrink: 0 }}>{m.init}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif' }}>{m.name}</div>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'capitalize', background: T.surf2, borderRadius: 99, padding: '2px 8px' }}>{m.role}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: T.challenge, fontFamily: 'Nunito, sans-serif' }}>⭐ {m.pointsBalance}</div>
            <div style={{ fontSize: 10, color: T.text3 }}>баланс</div>
            <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{m.pointsTotalEarned} общо</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <StreakChip days={m.currentStreak} />
        </div>

        {/* Badges scroll */}
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Значки</div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
          {BADGES.slice(0, 6).map(b => (
            <div key={b.id} style={{ flexShrink: 0 }}>
              <BadgeCard icon={b.icon} name={b.name} tier={b.tier} earned={b.earned} size="sm" />
            </div>
          ))}
        </div>

        {/* Quick ledger */}
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Последни точки</div>
        <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${T.border}`, overflow: 'hidden', marginBottom: 16 }}>
          {LEDGER.slice(0, 4).map((entry, i) => (
            <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${entry.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{entry.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{entry.label}</div>
                <div style={{ fontSize: 10, color: T.text3 }}>{entry.date}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Nunito, sans-serif', color: entry.delta > 0 ? '#2d9e5f' : T.mustDo }}>{entry.delta > 0 ? '+' : ''}{entry.delta}</div>
            </div>
          ))}
        </div>

        {/* Bonus button */}
        <div onClick={() => setBonusOpen(true)} style={{
          background: T.challenge, borderRadius: 12, padding: '13px', textAlign: 'center',
          cursor: 'pointer', boxShadow: `0 4px 16px ${T.challenge}40`,
        }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>⭐ Добави бонус за {m.name}</span>
        </div>
        <div style={{ height: 16 }} />
      </div>

      {/* Bonus bottom sheet */}
      {bonusOpen && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: 20 }}>
            {bonusSent ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Бонусът е изпратен!</div>
                <div style={{ fontSize: 13, color: T.text2, marginTop: 6 }}>+{bonusAmt} т. за {m.name}</div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>⭐ Бонус за {m.name}</div>
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
  const memberIdx = Math.max(0, MEMBERS.findIndex(m => m.id === id));
  const [variant, setVariant] = useState(0);

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '8px 16px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <ToggleTabs options={['Мой профил', 'Родителски']} active={variant} onChange={setVariant} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {variant === 0 ? <OwnProfile memberIdx={memberIdx} /> : <ParentView memberIdx={memberIdx} />}
        </div>
        <BottomNav activeIdx={3} />
      </div>
    </MobileShell>
  );
}
