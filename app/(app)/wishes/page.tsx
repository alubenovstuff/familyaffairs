'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';
import { WISHES, TASKS, MEMBERS } from '@/lib/mock-data';
import { MobileShell, BottomNav, FAB } from '@/components/layout/Shell';
import { ToggleTabs, Pill, Btn, Confetti } from '@/components/ui';
import type { WishItem } from '@/types';

// ── WishCard ──────────────────────────────────────────────────────────────

function WishCard({ wish, locked, onClaim }: { wish: WishItem; locked: boolean; onClaim: () => void }) {
  const statusStyle = {
    available: { bg: '#fff', border: T.border },
    pending: { bg: '#fffbf0', border: `${T.challenge}60` },
    redeemed: { bg: '#f0fdf6', border: `${T.household}60` },
  }[wish.status] || { bg: '#fff', border: T.border };

  return (
    <div style={{
      background: statusStyle.bg, borderRadius: 14,
      border: `1px solid ${statusStyle.border}`,
      overflow: 'hidden', opacity: locked ? 0.65 : 1,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
        background: wish.mystery
          ? 'linear-gradient(135deg, #667eea, #764ba2)'
          : `${T.challenge}18`,
      }}>{wish.mystery ? '🎁' : '🎮'}</div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>
          {wish.mystery ? '??? Изненада' : wish.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.challenge, fontFamily: 'Nunito, sans-serif', display: 'flex', alignItems: 'center', gap: 3 }}>
            ⭐ {wish.mystery ? '??' : wish.pts}
          </div>
          {wish.status === 'available' && !locked && (
            <div onClick={onClaim} style={{ background: T.mustDo, borderRadius: 99, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Заяви</div>
          )}
          {wish.status === 'pending' && <Pill color={T.challenge} small>Чака</Pill>}
          {wish.status === 'redeemed' && <Pill color={T.household} small>✓</Pill>}
        </div>
        {locked && <div style={{ fontSize: 10, color: T.mustDo, marginTop: 4, fontWeight: 600 }}>Заверши must-do задачи</div>}
      </div>
    </div>
  );
}

// ── Mystery reveal overlay ────────────────────────────────────────────────

function MysteryReveal({ onClose }: { onClose: () => void }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Confetti />
      <div style={{ background: '#fff', borderRadius: 24, padding: 32, textAlign: 'center', width: '100%', maxWidth: 320, position: 'relative' }}>
        {!revealed ? (
          <>
            <div style={{ fontSize: 72, marginBottom: 16, animation: 'float 2s infinite' }}>🎁</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif', marginBottom: 8 }}>Твоята тайна награда!</div>
            <div style={{ fontSize: 13, color: T.text2, marginBottom: 24 }}>Тапни за да разкриеш</div>
            <div onClick={() => setRevealed(true)} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 12, padding: '13px', cursor: 'pointer' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>✨ Разкрий наградата</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 72, marginBottom: 16 }} className="animate-pop">🎮</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif', marginBottom: 4 }}>Видеоигри 1ч!</div>
            <div style={{ fontSize: 13, color: T.text2, marginBottom: 8 }}>Заявката е изпратена за одобрение</div>
            <div style={{ background: T.challengeBg, borderRadius: 99, padding: '4px 14px', display: 'inline-block', marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.challenge, fontFamily: 'Nunito, sans-serif' }}>⭐ 80 т.</span>
            </div>
            <br />
            <div onClick={onClose} style={{ background: T.mustDo, borderRadius: 12, padding: '13px 24px', cursor: 'pointer', display: 'inline-block', boxShadow: `0 4px 16px ${T.mustDo}40` }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Супер! 🎉</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Variant A — Child view ────────────────────────────────────────────────

function ChildView() {
  const mustDoTasks = TASKS.filter(t => t.type === 'must_do' && t.status === 'active');
  const [completedMustDo, setCompletedMustDo] = useState<number[]>([]);
  const [showMystery, setShowMystery] = useState(false);
  const [claimedIds, setClaimedIds] = useState<number[]>([]);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newWishTitle, setNewWishTitle] = useState('');

  const allMustDoDone = completedMustDo.length >= mustDoTasks.length;
  const toggleMustDo = (id: number) =>
    setClaimedIds(prev => prev.includes(id) ? prev : prev); // keep claimed
  const toggleDone = (id: number) =>
    setCompletedMustDo(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {showMystery && <MysteryReveal onClose={() => setShowMystery(false)} />}

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Желания</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.challengeBg, borderRadius: 99, padding: '4px 12px' }}>
          <span style={{ fontSize: 16 }}>⭐</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.challenge, fontFamily: 'Nunito, sans-serif' }}>95</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Must-do gate */}
        {!allMustDoDone && (
          <div style={{ background: T.mustDoBg, borderRadius: 14, padding: '12px 14px', marginBottom: 16, border: `1px solid ${T.mustDo}30` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.mustDo, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              🔒 Заверши must-do задачите за достъп до наградите
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
              {mustDoTasks.map(t => {
                const done = completedMustDo.includes(t.id);
                return (
                  <div key={t.id} onClick={() => toggleDone(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: done ? T.householdBg : '#fff', borderRadius: 10, cursor: 'pointer', border: `1px solid ${done ? T.household : T.border}`, transition: 'all 0.15s' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: done ? T.household : '#fff', border: `2px solid ${done ? T.household : T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', flexShrink: 0 }}>{done && '✓'}</div>
                    <span style={{ fontSize: 12, fontWeight: done ? 700 : 400, color: done ? T.household : T.text, flex: 1, textDecoration: done ? 'line-through' : 'none' }}>{t.title}</span>
                    <span style={{ fontSize: 11, color: T.challenge, fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>+{t.pts}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: T.text3 }}>{completedMustDo.length}/{mustDoTasks.length} завършени</div>
          </div>
        )}

        {allMustDoDone && (
          <div style={{ background: T.householdBg, borderRadius: 12, padding: '10px 14px', marginBottom: 16, border: `1px solid ${T.household}30`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.household }}>Готов да заявиш награди!</span>
          </div>
        )}

        {/* Rewards grid */}
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Налични награди</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {WISHES.map(w => (
            <WishCard key={w.id} wish={w} locked={!allMustDoDone && w.status === 'available'} onClaim={() => { if (w.mystery) setShowMystery(true); }} />
          ))}
        </div>
      </div>

      <FAB onClick={() => setShowAddSheet(true)} />

      {/* Add wish sheet */}
      {showAddSheet && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Ново желание</div>
              <div onClick={() => setShowAddSheet(false)} style={{ fontSize: 20, color: T.text3, cursor: 'pointer' }}>✕</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {['🎮', '🎬', '🍕', '📚', '🎨', '🌟'].map(e => (
                <div key={e} style={{ fontSize: 28, cursor: 'pointer', padding: 6, borderRadius: 8, background: T.surf2 }}>{e}</div>
              ))}
            </div>
            <input value={newWishTitle} onChange={e => setNewWishTitle(e.target.value)} placeholder="Какво желаеш?" style={{ width: '100%', borderRadius: 10, padding: '12px 14px', fontSize: 14, border: `1.5px solid ${T.border}`, background: '#fff', color: T.text, fontFamily: 'DM Sans, sans-serif', outline: 'none', marginBottom: 12 }} />
            <div onClick={() => setShowAddSheet(false)} style={{ background: newWishTitle.trim() ? T.mustDo : T.border, borderRadius: 12, padding: 14, textAlign: 'center', cursor: newWishTitle.trim() ? 'pointer' : 'not-allowed' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Добави желанието</span>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeIdx={2} />
    </div>
  );
}

// ── Variant B — Parent view ───────────────────────────────────────────────

function ParentView() {
  const [tab, setTab] = useState(0);
  const [pricedFor, setPricedFor] = useState<number | null>(null);
  const [prices, setPrices] = useState<Record<number, number>>({});
  const [approvedIds, setApprovedIds] = useState<number[]>([]);

  const pendingWishes = WISHES.filter(w => w.status === 'pending');
  const availableWishes = WISHES.filter(w => w.status === 'available');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '12px 16px 0', flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif', marginBottom: 12 }}>Желания</div>
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.border}` }}>
          {['Заявки', 'Каталог'].map((t, i) => (
            <div key={t} onClick={() => setTab(i)} style={{
              flex: 1, padding: '10px', textAlign: 'center', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              color: tab === i ? T.mustDo : T.text3,
              borderBottom: `2px solid ${tab === i ? T.mustDo : 'transparent'}`,
            }}>{t}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {tab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingWishes.map((w, wi) => {
              const priced = prices[w.id] !== undefined;
              const approved = approvedIds.includes(w.id);
              const member = MEMBERS[wi % MEMBERS.length];
              return (
                <div key={w.id} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'Nunito, sans-serif' }}>{member.init}</div>
                      <div>
                        <div style={{ fontSize: 11, color: T.text3 }}>Заявено от {member.name}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{w.title}</div>
                      </div>
                    </div>

                    {!priced ? (
                      <>
                        {pricedFor === w.id ? (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: T.text, marginBottom: 6 }}>Задай цена</div>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                              {[20, 50, 80, 100, 150].map(v => (
                                <div key={v} onClick={() => setPrices(p => ({ ...p, [w.id]: v }))} style={{
                                  flex: 1, padding: '6px 4px', borderRadius: 8, textAlign: 'center', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                                  background: prices[w.id] === v ? T.challenge : T.surf2,
                                  color: prices[w.id] === v ? '#fff' : T.text2,
                                  border: `1px solid ${prices[w.id] === v ? T.challenge : T.border}`,
                                }}>{v}</div>
                              ))}
                            </div>
                            <div onClick={() => setPricedFor(null)} style={{ background: prices[w.id] ? T.mustDo : T.border, borderRadius: 10, padding: '8px', textAlign: 'center', cursor: prices[w.id] ? 'pointer' : 'not-allowed' }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Потвърди цена</span>
                            </div>
                          </div>
                        ) : (
                          <div onClick={() => setPricedFor(w.id)} style={{ background: T.challengeBg, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', textAlign: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.challenge }}>⭐ Задай цена</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ background: T.challengeBg, borderRadius: 99, padding: '4px 12px' }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: T.challenge, fontFamily: 'Nunito, sans-serif' }}>⭐ {prices[w.id]} т.</span>
                        </div>
                        {!approved ? (
                          <>
                            <div onClick={() => setApprovedIds(p => [...p, w.id])} style={{ flex: 1, background: T.householdBg, borderRadius: 10, padding: '8px', textAlign: 'center', cursor: 'pointer', border: `1.5px solid ${T.household}` }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: T.household }}>✓ Одобри</span>
                            </div>
                            <div style={{ flex: 1, background: T.mustDoBg, borderRadius: 10, padding: '8px', textAlign: 'center', cursor: 'pointer', border: `1.5px solid ${T.mustDo}` }}>
                              <span style={{ fontSize: 12, fontWeight: 700, color: T.mustDo }}>✕ Откажи</span>
                            </div>
                          </>
                        ) : (
                          <div style={{ background: T.householdBg, borderRadius: 99, padding: '4px 12px', border: `1px solid ${T.household}30` }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.household }}>✓ Одобрено</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {pendingWishes.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: T.text3 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Няма чакащи заявки</div>
              </div>
            )}
          </div>
        )}

        {tab === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {availableWishes.map(w => (
              <WishCard key={w.id} wish={w} locked={false} onClaim={() => {}} />
            ))}
            <div style={{ borderRadius: 14, border: `1.5px dashed ${T.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 140, cursor: 'pointer', gap: 6, color: T.text3 }}>
              <span style={{ fontSize: 28 }}>＋</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Добави награда</span>
            </div>
          </div>
        )}
        <div style={{ height: 80 }} />
      </div>

      <BottomNav activeIdx={2} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function WishesPage() {
  const [variant, setVariant] = useState(0);

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '8px 16px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <ToggleTabs options={['Дете', 'Родител']} active={variant} onChange={setVariant} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {variant === 0 ? <ChildView /> : <ParentView />}
        </div>
      </div>
    </MobileShell>
  );
}
