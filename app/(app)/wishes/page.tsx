'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';
import { getWishes, getTasks, getMembers, getCurrentMember, createWish, approveWish } from '@/lib/actions';
import { MobileShell, BottomNav, FAB } from '@/components/layout/Shell';
import { ToggleTabs, Pill, Confetti } from '@/components/ui';

type WishRow = Awaited<ReturnType<typeof getWishes>>[number];
type TaskRow = Awaited<ReturnType<typeof getTasks>>[number];
type Member = Awaited<ReturnType<typeof getMembers>>[number];
type CurrentMember = Awaited<ReturnType<typeof getCurrentMember>>;

const WISH_EMOJIS = ['🎮', '🎬', '🍕', '📚', '🎨', '🌟'];

// ── WishCard ──────────────────────────────────────────────────────────────

function WishCard({ wish, locked, onClaim }: { wish: WishRow; locked: boolean; onClaim?: () => void }) {
  const isPending = wish.status === 'pending';
  const isApproved = wish.status === 'approved';
  const borderColor = isPending ? `${T.challenge}60` : isApproved ? `${T.household}60` : T.border;
  const bg = isPending ? '#fffbf0' : isApproved ? '#f0fdf6' : '#fff';

  return (
    <div style={{
      background: bg, borderRadius: 14,
      border: `1px solid ${borderColor}`,
      overflow: 'hidden', opacity: locked ? 0.65 : 1,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
        background: `${T.challenge}18`,
      }}>{wish.emoji ?? '🎁'}</div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>{wish.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: T.challenge, fontFamily: 'Nunito, sans-serif', display: 'flex', alignItems: 'center', gap: 3 }}>
            ⭐ {wish.price}
          </div>
          {!isPending && !isApproved && !locked && onClaim && (
            <div onClick={onClaim} style={{ background: T.mustDo, borderRadius: 99, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer' }}>Заяви</div>
          )}
          {isPending && <Pill color={T.challenge} small>Чака</Pill>}
          {isApproved && <Pill color={T.household} small>✓</Pill>}
        </div>
        {locked && <div style={{ fontSize: 10, color: T.mustDo, marginTop: 4, fontWeight: 600 }}>Заверши must-do задачи</div>}
      </div>
    </div>
  );
}

// ── Variant A — Child view ────────────────────────────────────────────────

function ChildView({ wishes, tasks, currentMember, onRefresh }: { wishes: WishRow[]; tasks: TaskRow[]; currentMember: CurrentMember; onRefresh: () => void }) {
  const mustDoTasks = tasks.filter(t => t.type === 'must_do' && t.status === 'active');
  const [completedMustDo, setCompletedMustDo] = useState<string[]>([]);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newWishTitle, setNewWishTitle] = useState('');
  const [newWishEmoji, setNewWishEmoji] = useState('🎁');
  const [newWishPrice, setNewWishPrice] = useState(50);
  const [saving, setSaving] = useState(false);

  const allMustDoDone = mustDoTasks.length === 0 || completedMustDo.length >= mustDoTasks.length;

  const toggleDone = (id: string) =>
    setCompletedMustDo(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleAddWish = async () => {
    if (!newWishTitle.trim() || saving) return;
    setSaving(true);
    try {
      await createWish(newWishTitle.trim(), newWishEmoji, newWishPrice);
      setNewWishTitle('');
      setNewWishEmoji('🎁');
      setShowAddSheet(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Желания</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.challengeBg, borderRadius: 99, padding: '4px 12px' }}>
          <span style={{ fontSize: 16 }}>⭐</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.challenge, fontFamily: 'Nunito, sans-serif' }}>{currentMember?.points_balance ?? 0}</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
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

        {allMustDoDone && mustDoTasks.length > 0 && (
          <div style={{ background: T.householdBg, borderRadius: 12, padding: '10px 14px', marginBottom: 16, border: `1px solid ${T.household}30`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.household }}>Готов да заявиш награди!</span>
          </div>
        )}

        <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Желания</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {wishes.map(w => (
            <WishCard key={w.id} wish={w} locked={!allMustDoDone && w.status !== 'pending' && w.status !== 'approved'} />
          ))}
          {wishes.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 20px', color: T.text3 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Добави своето първо желание!</div>
            </div>
          )}
        </div>
      </div>

      <FAB onClick={() => setShowAddSheet(true)} />

      {showAddSheet && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Ново желание</div>
              <div onClick={() => setShowAddSheet(false)} style={{ fontSize: 20, color: T.text3, cursor: 'pointer' }}>✕</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {WISH_EMOJIS.map(e => (
                <div key={e} onClick={() => setNewWishEmoji(e)} style={{ fontSize: 28, cursor: 'pointer', padding: 6, borderRadius: 8, background: newWishEmoji === e ? T.challengeBg : T.surf2, border: `2px solid ${newWishEmoji === e ? T.challenge : 'transparent'}` }}>{e}</div>
              ))}
            </div>
            <input value={newWishTitle} onChange={e => setNewWishTitle(e.target.value)} placeholder="Какво желаеш?" style={{ width: '100%', borderRadius: 10, padding: '12px 14px', fontSize: 14, border: `1.5px solid ${T.border}`, background: '#fff', color: T.text, fontFamily: 'DM Sans, sans-serif', outline: 'none', marginBottom: 12 }} />
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 6 }}>Цена (точки)</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[20, 50, 80, 100, 150].map(v => (
                  <div key={v} onClick={() => setNewWishPrice(v)} style={{ flex: 1, padding: '6px 4px', borderRadius: 8, textAlign: 'center', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: newWishPrice === v ? T.challenge : T.surf2, color: newWishPrice === v ? '#fff' : T.text2, border: `1px solid ${newWishPrice === v ? T.challenge : T.border}` }}>{v}</div>
                ))}
              </div>
            </div>
            <div onClick={handleAddWish} style={{ background: newWishTitle.trim() && !saving ? T.mustDo : T.border, borderRadius: 12, padding: 14, textAlign: 'center', cursor: newWishTitle.trim() && !saving ? 'pointer' : 'not-allowed' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{saving ? 'Запазване...' : 'Добави желанието'}</span>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeIdx={2} />
    </div>
  );
}

// ── Variant B — Parent view ───────────────────────────────────────────────

function ParentView({ wishes, members, onRefresh }: { wishes: WishRow[]; members: Member[]; onRefresh: () => void }) {
  const [tab, setTab] = useState(0);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const pendingWishes = wishes.filter(w => w.status === 'pending');
  const catalogWishes = wishes.filter(w => w.status !== 'pending');

  const getMemberById = (id: string) => members.find(m => m.id === id);

  const handleApprove = async (wishId: string) => {
    setApprovingId(wishId);
    try {
      await approveWish(wishId);
      onRefresh();
    } finally {
      setApprovingId(null);
    }
  };

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
            {pendingWishes.map(w => {
              const member = getMemberById(w.member_id);
              const isApproving = approvingId === w.id;
              return (
                <div key={w.id} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      {member && (
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: 'Nunito, sans-serif' }}>{member.init}</div>
                      )}
                      <div>
                        <div style={{ fontSize: 11, color: T.text3 }}>Заявено от {member?.name ?? '...'}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{w.title}</div>
                      </div>
                      <div style={{ marginLeft: 'auto', background: T.challengeBg, borderRadius: 99, padding: '4px 10px' }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: T.challenge, fontFamily: 'Nunito, sans-serif' }}>⭐ {w.price}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div onClick={() => !isApproving && handleApprove(w.id)} style={{ flex: 1, background: T.householdBg, borderRadius: 10, padding: '8px', textAlign: 'center', cursor: isApproving ? 'not-allowed' : 'pointer', border: `1.5px solid ${T.household}`, opacity: isApproving ? 0.6 : 1 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.household }}>{isApproving ? '...' : '✓ Одобри'}</span>
                      </div>
                    </div>
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
            {catalogWishes.map(w => (
              <WishCard key={w.id} wish={w} locked={false} />
            ))}
            {catalogWishes.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 20px', color: T.text3, fontSize: 13 }}>Няма одобрени желания</div>
            )}
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
  const [wishes, setWishes] = useState<WishRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<CurrentMember>(null);

  const loadData = () => {
    getWishes().then(setWishes);
    getTasks().then(setTasks);
    getMembers().then(setMembers);
    getCurrentMember().then(setCurrentMember);
  };

  useEffect(() => { loadData(); }, []);

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '8px 16px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <ToggleTabs options={['Дете', 'Родител']} active={variant} onChange={setVariant} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {variant === 0
            ? <ChildView wishes={wishes} tasks={tasks} currentMember={currentMember} onRefresh={loadData} />
            : <ParentView wishes={wishes} members={members} onRefresh={loadData} />
          }
        </div>
      </div>
    </MobileShell>
  );
}
