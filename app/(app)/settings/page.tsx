'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';
import { MEMBERS } from '@/lib/mock-data';
import { MobileShell, BottomNav } from '@/components/layout/Shell';
import { ToggleTabs, Avatar } from '@/components/ui';

// ── Toggle row ────────────────────────────────────────────────────────────

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
      <span style={{ fontSize: 13, color: T.text }}>{label}</span>
      <div onClick={onChange} style={{ width: 44, height: 24, borderRadius: 99, background: value ? T.mustDo : T.border, position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: value ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, paddingLeft: 4 }}>{title}</div>
      <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ children, last = false }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ padding: '0 14px', borderBottom: last ? 'none' : `1px solid ${T.border}` }}>
      {children}
    </div>
  );
}

// ── Variant A — Parent settings ───────────────────────────────────────────

function ParentSettings() {
  const [avatarColor, setAvatarColor] = useState<string>(T.avatars[0]);
  const [dailyBase, setDailyBase] = useState(10);
  const [autoApprove, setAutoApprove] = useState<string>('Off');
  const [streakExpanded, setStreakExpanded] = useState(false);
  const [notifs, setNotifs] = useState({ approvals: true, badges: true, bonuses: true, deadlines: false });
  const [memberExpanded, setMemberExpanded] = useState(false);

  const toggleNotif = (k: keyof typeof notifs) =>
    setNotifs(n => ({ ...n, [k]: !n[k] }));

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
      {/* Profile card */}
      <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${T.border}`, padding: '16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Nunito, sans-serif', flexShrink: 0 }}>М</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Мама</div>
          <div style={{ fontSize: 11, color: T.text3, marginBottom: 6 }}>mama@family.bg</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {T.avatars.slice(0, 6).map((c, i) => (
              <div key={i} onClick={() => setAvatarColor(c)} style={{
                width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer',
                border: `2px solid ${avatarColor === c ? '#fff' : 'transparent'}`,
                boxShadow: avatarColor === c ? `0 0 0 2px ${c}` : 'none',
                transition: 'all 0.12s',
              }} />
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, color: T.ongoing, fontWeight: 600, cursor: 'pointer' }}>Редактирай</div>
      </div>

      {/* Family section */}
      <SectionCard title="Семейство">
        <Row>
          <div style={{ padding: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: T.text }}>Дневни точки</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.challenge, fontFamily: 'Nunito, sans-serif' }}>⭐ {dailyBase}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[5, 10, 15, 20].map(v => (
                <div key={v} onClick={() => setDailyBase(v)} style={{
                  flex: 1, padding: '6px 4px', borderRadius: 8, textAlign: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  background: dailyBase === v ? T.challenge : T.surf2,
                  color: dailyBase === v ? '#fff' : T.text2,
                  border: `1px solid ${dailyBase === v ? T.challenge : T.border}`,
                }}>{v}</div>
              ))}
            </div>
          </div>
        </Row>
        <Row>
          <div style={{ padding: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: T.text }}>Авто-одобрение</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Off', '24ч', '48ч'].map(v => (
                <div key={v} onClick={() => setAutoApprove(v)} style={{
                  flex: 1, padding: '6px', borderRadius: 8, textAlign: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  background: autoApprove === v ? T.ongoing : T.surf2,
                  color: autoApprove === v ? '#fff' : T.text2,
                  border: `1px solid ${autoApprove === v ? T.ongoing : T.border}`,
                }}>{v}</div>
              ))}
            </div>
          </div>
        </Row>
        <Row last>
          <div onClick={() => setStreakExpanded(!streakExpanded)} style={{ padding: '12px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: T.text }}>🔥 Streak мултипликатори</span>
            <span style={{ fontSize: 12, color: T.text3 }}>{streakExpanded ? '▲' : '▼'}</span>
          </div>
          {streakExpanded && (
            <div style={{ paddingBottom: 12 }}>
              {[['1–6 дни', '×1.0', T.text3], ['7–13 дни', '×1.5', T.challenge], ['14–29 дни', '×2.0', T.mustDo], ['30+ дни', '×3.0', T.event]].map(([days, mult, color]) => (
                <div key={days} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ fontSize: 12, color: T.text2 }}>{days}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'Nunito, sans-serif' }}>{mult}</span>
                </div>
              ))}
            </div>
          )}
        </Row>
      </SectionCard>

      {/* Members section */}
      <SectionCard title="Членове">
        {MEMBERS.map((m, i) => (
          <Row key={m.id} last={i === MEMBERS.length - 1}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Nunito, sans-serif', flexShrink: 0 }}>{m.init}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{m.name}</div>
                <div style={{ fontSize: 10, color: T.text3, textTransform: 'capitalize' }}>{m.role}</div>
              </div>
              <div style={{ fontSize: 12, color: T.ongoing, fontWeight: 600, cursor: 'pointer' }}>Редактирай</div>
            </div>
          </Row>
        ))}
        <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.border}`, cursor: 'pointer' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.mustDo }}>＋ Покани нов член</span>
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Известия">
        {(Object.keys(notifs) as Array<keyof typeof notifs>).map((k, i, arr) => (
          <Row key={k} last={i === arr.length - 1}>
            <ToggleRow label={{ approvals: 'Одобрения', badges: 'Значки', bonuses: 'Бонуси', deadlines: 'Дедлайни' }[k]} value={notifs[k]} onChange={() => toggleNotif(k)} />
          </Row>
        ))}
      </SectionCard>

      {/* Danger zone */}
      <SectionCard title="Опасна зона">
        <Row last>
          <div style={{ padding: '12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.mustDo }}>Изтрий семейния акаунт</div>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>Необратимо действие</div>
            </div>
            <div style={{ background: T.mustDoBg, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', border: `1px solid ${T.mustDo}40` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.mustDo }}>Изтрий</span>
            </div>
          </div>
        </Row>
      </SectionCard>

      <div style={{ height: 24 }} />
    </div>
  );
}

// ── Variant B — Teen/Child settings ──────────────────────────────────────

function ChildSettings() {
  const [avatarColor, setAvatarColor] = useState<string>(T.avatars[2]);
  const [notifs, setNotifs] = useState({ approvals: true, badges: true, bonuses: true, deadlines: false });

  const toggleNotif = (k: keyof typeof notifs) =>
    setNotifs(n => ({ ...n, [k]: !n[k] }));

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
      {/* Profile */}
      <SectionCard title="Профил">
        <Row last>
          <div style={{ padding: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'Nunito, sans-serif', flexShrink: 0 }}>Е</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Елена</div>
                <div style={{ fontSize: 11, color: T.text3 }}>Дете · 8 г.</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text, marginBottom: 8 }}>🎨 Цвят на аватара</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {T.avatars.map((c, i) => (
                <div key={i} onClick={() => setAvatarColor(c)} style={{
                  width: 34, height: 34, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: `3px solid ${avatarColor === c ? '#fff' : 'transparent'}`,
                  boxShadow: avatarColor === c ? `0 0 0 2px ${c}` : 'none',
                  transition: 'all 0.12s',
                }} />
              ))}
            </div>
          </div>
        </Row>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Известия">
        {(Object.keys(notifs) as Array<keyof typeof notifs>).map((k, i, arr) => (
          <Row key={k} last={i === arr.length - 1}>
            <ToggleRow label={{ approvals: 'Одобрения', badges: 'Значки', bonuses: 'Бонуси', deadlines: 'Дедлайни' }[k]} value={notifs[k]} onChange={() => toggleNotif(k)} />
          </Row>
        ))}
      </SectionCard>

      {/* Locked section */}
      <SectionCard title="Семейни настройки">
        <Row last>
          <div style={{ padding: '14px 0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 24 }}>🔒</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text2 }}>Само за родители</div>
              <div style={{ fontSize: 12, color: T.text3, marginTop: 4, lineHeight: 1.5 }}>Само родителите могат да управляват семейните настройки — точки, членове и одобрения.</div>
            </div>
          </div>
        </Row>
      </SectionCard>

      <div style={{ height: 24 }} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [variant, setVariant] = useState(0);

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '12px 16px 10px', flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif', marginBottom: 10 }}>Настройки</div>
          <ToggleTabs options={['Родител', 'Дете']} active={variant} onChange={setVariant} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {variant === 0 ? <ParentSettings /> : <ChildSettings />}
        </div>
        <BottomNav activeIdx={3} />
      </div>
    </MobileShell>
  );
}
