'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { T } from '@/lib/tokens';
import { getMembers, getFamily, getCurrentMember, updateFamily, updateMember, generateInvite } from '@/lib/actions';
import { MobileShell, BottomNav } from '@/components/layout/Shell';
import { ToggleTabs } from '@/components/ui';

type Member = Awaited<ReturnType<typeof getMembers>>[number];
type Family = Awaited<ReturnType<typeof getFamily>>;
type CurrMember = Awaited<ReturnType<typeof getCurrentMember>>;

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

// ── Invite row ────────────────────────────────────────────────────────────

function InviteRow() {
  const [inviteUrl, setInviteUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const token = await generateInvite();
      const url = `${window.location.origin}/join?token=${token}`;
      setInviteUrl(url);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Row last>
      <div style={{ padding: '12px 0' }}>
        {!inviteUrl ? (
          <div onClick={handleGenerate} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: generating ? 'not-allowed' : 'pointer' }}>
            <span style={{ fontSize: 18 }}>🔗</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: generating ? T.text3 : T.mustDo }}>{generating ? 'Генериране...' : 'Покани втори родител'}</span>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text3, marginBottom: 6 }}>Сподели тази връзка:</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, background: T.surf2, borderRadius: 8, padding: '8px 10px', fontSize: 11, color: T.text2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {inviteUrl}
              </div>
              <div onClick={handleCopy} style={{ background: copied ? T.household : T.mustDo, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', flexShrink: 0 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{copied ? '✓' : 'Копирай'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Row>
  );
}

// ── Variant A — Parent settings ───────────────────────────────────────────

function ParentSettings({ members, family, currentMember, onRefresh }: { members: Member[]; family: Family; currentMember: CurrMember; onRefresh: () => void }) {
  const [avatarColor, setAvatarColor] = useState<string>(currentMember?.color ?? T.avatars[0]);
  const [dailyBase, setDailyBase] = useState(family?.daily_base_pts ?? 10);
  const [autoApprove, setAutoApprove] = useState<string>(family?.auto_approve ?? 'Off');
  const [streakExpanded, setStreakExpanded] = useState(false);
  const [notifs, setNotifs] = useState({ approvals: true, badges: true, bonuses: true, deadlines: false });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (family) {
      setDailyBase(family.daily_base_pts ?? 10);
      setAutoApprove(family.auto_approve ?? 'Off');
    }
  }, [family]);

  useEffect(() => {
    if (currentMember) setAvatarColor(currentMember.color ?? T.avatars[0]);
  }, [currentMember]);

  const toggleNotif = (k: keyof typeof notifs) =>
    setNotifs(n => ({ ...n, [k]: !n[k] }));

  const handleSaveFamily = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await updateFamily({ daily_base_pts: dailyBase, auto_approve: autoApprove });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = async (color: string) => {
    setAvatarColor(color);
    if (currentMember?.id) {
      await updateMember(currentMember.id, { color });
      onRefresh();
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
      {/* Profile card */}
      <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${T.border}`, padding: '16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Nunito, sans-serif', flexShrink: 0 }}>{currentMember?.init ?? '?'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>{currentMember?.name ?? 'Родител'}</div>
          <div style={{ fontSize: 11, color: T.text3, textTransform: 'capitalize', marginBottom: 6 }}>{currentMember?.role ?? 'parent'}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {T.avatars.slice(0, 6).map((c, i) => (
              <div key={i} onClick={() => handleColorChange(c)} style={{
                width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer',
                border: `2px solid ${avatarColor === c ? '#fff' : 'transparent'}`,
                boxShadow: avatarColor === c ? `0 0 0 2px ${c}` : 'none',
                transition: 'all 0.12s',
              }} />
            ))}
          </div>
        </div>
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
        <Row>
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
        <Row last>
          <div onClick={handleSaveFamily} style={{ padding: '12px 0', textAlign: 'center', cursor: saving ? 'not-allowed' : 'pointer' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: saved ? T.household : T.mustDo }}>{saving ? 'Запазване...' : saved ? '✓ Запазено' : 'Запази настройките'}</span>
          </div>
        </Row>
      </SectionCard>

      {/* Members section */}
      <SectionCard title="Членове">
        {members.map((m, i) => (
          <Row key={m.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Nunito, sans-serif', flexShrink: 0 }}>{m.init}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{m.name}</div>
                <div style={{ fontSize: 10, color: T.text3, textTransform: 'capitalize' }}>{m.role}</div>
              </div>
            </div>
          </Row>
        ))}
        {members.length === 0 && (
          <Row>
            <div style={{ padding: '12px 0', color: T.text3, fontSize: 13 }}>Зареждане...</div>
          </Row>
        )}
        <InviteRow />
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Известия">
        {(Object.keys(notifs) as Array<keyof typeof notifs>).map((k, i, arr) => (
          <Row key={k} last={i === arr.length - 1}>
            <ToggleRow label={{ approvals: 'Одобрения', badges: 'Значки', bonuses: 'Бонуси', deadlines: 'Дедлайни' }[k]} value={notifs[k]} onChange={() => toggleNotif(k)} />
          </Row>
        ))}
      </SectionCard>

      {/* Logout */}
      <SectionCard title="Акаунт">
        <Row last>
          <div onClick={() => signOut({ callbackUrl: '/login' })} style={{ padding: '12px 0', textAlign: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.mustDo }}>Излез от акаунта</span>
          </div>
        </Row>
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

function ChildSettings({ currentMember, onRefresh }: { currentMember: CurrMember; onRefresh: () => void }) {
  const [avatarColor, setAvatarColor] = useState<string>(currentMember?.color ?? T.avatars[2]);
  const [notifs, setNotifs] = useState({ approvals: true, badges: true, bonuses: true, deadlines: false });

  useEffect(() => {
    if (currentMember) setAvatarColor(currentMember.color ?? T.avatars[2]);
  }, [currentMember]);

  const toggleNotif = (k: keyof typeof notifs) =>
    setNotifs(n => ({ ...n, [k]: !n[k] }));

  const handleColorChange = async (color: string) => {
    setAvatarColor(color);
    if (currentMember?.id) {
      await updateMember(currentMember.id, { color });
      onRefresh();
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
      <SectionCard title="Профил">
        <Row last>
          <div style={{ padding: '12px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', fontFamily: 'Nunito, sans-serif', flexShrink: 0 }}>{currentMember?.init ?? '?'}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>{currentMember?.name ?? 'Дете'}</div>
                <div style={{ fontSize: 11, color: T.text3, textTransform: 'capitalize' }}>{currentMember?.role ?? 'child'}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.text, marginBottom: 8 }}>🎨 Цвят на аватара</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {T.avatars.map((c, i) => (
                <div key={i} onClick={() => handleColorChange(c)} style={{
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

      <SectionCard title="Известия">
        {(Object.keys(notifs) as Array<keyof typeof notifs>).map((k, i, arr) => (
          <Row key={k} last={i === arr.length - 1}>
            <ToggleRow label={{ approvals: 'Одобрения', badges: 'Значки', bonuses: 'Бонуси', deadlines: 'Дедлайни' }[k]} value={notifs[k]} onChange={() => toggleNotif(k)} />
          </Row>
        ))}
      </SectionCard>

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

      <SectionCard title="Акаунт">
        <Row last>
          <div onClick={() => signOut({ callbackUrl: '/login' })} style={{ padding: '12px 0', textAlign: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.mustDo }}>Излез от акаунта</span>
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
  const [members, setMembers] = useState<Member[]>([]);
  const [family, setFamily] = useState<Family>(null);
  const [currentMember, setCurrentMember] = useState<CurrMember>(null);

  const loadData = () => {
    getMembers().then(setMembers);
    getFamily().then(setFamily);
    getCurrentMember().then(setCurrentMember);
  };

  useEffect(() => { loadData(); }, []);

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '12px 16px 10px', flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif', marginBottom: 10 }}>Настройки</div>
          <ToggleTabs options={['Родител', 'Дете']} active={variant} onChange={setVariant} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {variant === 0
            ? <ParentSettings members={members} family={family} currentMember={currentMember} onRefresh={loadData} />
            : <ChildSettings currentMember={currentMember} onRefresh={loadData} />
          }
        </div>
        <BottomNav activeIdx={3} />
      </div>
    </MobileShell>
  );
}
