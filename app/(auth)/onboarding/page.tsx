'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';
import { Input, Confetti } from '@/components/ui';
import { MobileShell } from '@/components/layout/Shell';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────────

type Role = 'teen' | 'child' | 'toddler' | 'extended';
interface Member {
  name: string;
  role: Role;
  color: string;
}

const ROLES: { key: Role; label: string; emoji: string }[] = [
  { key: 'teen',     label: 'Тийн',       emoji: '🧑' },
  { key: 'child',    label: 'Дете',        emoji: '👦' },
  { key: 'toddler',  label: 'Малко дете',  emoji: '👶' },
  { key: 'extended', label: 'Разширен',    emoji: '👴' },
];

const TIMEZONES = [
  { value: 'Europe/Sofia',    label: 'София (UTC+2/3)' },
  { value: 'Europe/London',   label: 'Лондон (UTC+0/1)' },
  { value: 'America/New_York', label: 'Ню Йорк (UTC−5/4)' },
  { value: 'America/Los_Angeles', label: 'Лос Анджелис (UTC−8/7)' },
];

const DAILY_BASE_OPTIONS = [5, 10, 15, 20, 25];

const STREAK_MULTIPLIERS = [
  { range: '1–6 дни',   mult: '×1.0', color: T.text3 },
  { range: '7–13 дни',  mult: '×1.5', color: T.challenge },
  { range: '14–29 дни', mult: '×2.0', color: T.mustDo },
  { range: '30+ дни',   mult: '×3.0', color: T.event },
];

const FEATURE_PILLS = [
  { icon: '📅', label: 'Календар',  color: T.ongoing },
  { icon: '✅', label: 'Задачи',    color: T.household },
  { icon: '🔥', label: 'Streak',    color: T.challenge },
  { icon: '🎁', label: 'Wishlist',  color: T.event },
];

function initials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── Step components ────────────────────────────────────────────────────────

function StepWelcome() {
  return (
    <div className="animate-fade-up" style={{ textAlign: 'center', padding: '8px 0 16px' }}>
      <div className="animate-float" style={{ fontSize: 80, marginBottom: 24, display: 'inline-block' }}>
        🏠
      </div>
      <div style={{
        fontFamily: 'Nunito, sans-serif', fontSize: 24, fontWeight: 900,
        color: T.text, marginBottom: 10, lineHeight: 1.25,
      }}>
        Добре дошъл в<br />FamilyAffairs!
      </div>
      <div style={{
        fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: T.text2,
        marginBottom: 32, lineHeight: 1.6, maxWidth: 280, margin: '0 auto 32px',
      }}>
        Нека настроим семейния ви организатор. Ще отнеме само 2 минути.
      </div>

      {/* Feature pills */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10,
        justifyContent: 'center',
      }}>
        {FEATURE_PILLS.map(f => (
          <div key={f.label} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: `${f.color}15`,
            border: `1.5px solid ${f.color}30`,
            borderRadius: 99, padding: '8px 14px',
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
            color: f.color,
          }}>
            <span>{f.icon}</span>
            {f.label}
          </div>
        ))}
      </div>
    </div>
  );
}

interface StepFamilyProps {
  familyName: string;
  setFamilyName: (v: string) => void;
  timezone: string;
  setTimezone: (v: string) => void;
}
function StepFamily({ familyName, setFamilyName, timezone, setTimezone }: StepFamilyProps) {
  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{
          fontFamily: 'Nunito, sans-serif', fontSize: 20, fontWeight: 800,
          color: T.text, marginBottom: 4,
        }}>
          Как се казва вашето семейство?
        </div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.text2 }}>
          Това ще се показва навсякъде в приложението.
        </div>
      </div>

      <Input
        label="Името на семейството"
        placeholder="Семейство Иванови"
        value={familyName}
        onChange={setFamilyName}
      />

      {/* Timezone picker */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 6, fontFamily: 'DM Sans, sans-serif' }}>
          Часова зона
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TIMEZONES.map(tz => (
            <div
              key={tz.value}
              onClick={() => setTimezone(tz.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 12,
                border: `2px solid ${timezone === tz.value ? T.mustDo : T.border}`,
                background: timezone === tz.value ? `${T.mustDo}08` : T.surface,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2px solid ${timezone === tz.value ? T.mustDo : T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {timezone === tz.value && (
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: T.mustDo,
                  }} />
                )}
              </div>
              <span style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                color: timezone === tz.value ? T.text : T.text2,
                fontWeight: timezone === tz.value ? 600 : 400,
              }}>
                {tz.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StepMembersProps {
  members: Member[];
  setMembers: (m: Member[]) => void;
}
function StepMembers({ members, setMembers }: StepMembersProps) {
  const [newName, setNewName]     = useState('');
  const [newRole, setNewRole]     = useState<Role>('child');
  const [newColor, setNewColor]   = useState<string>(T.avatars[0]);

  const addMember = () => {
    if (!newName.trim()) return;
    setMembers([...members, { name: newName.trim(), role: newRole, color: newColor }]);
    setNewName('');
    setNewRole('child');
    setNewColor(T.avatars[(members.length + 1) % T.avatars.length]);
  };

  const removeMember = (idx: number) => {
    setMembers(members.filter((_, i) => i !== idx));
  };

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{
          fontFamily: 'Nunito, sans-serif', fontSize: 20, fontWeight: 800,
          color: T.text, marginBottom: 4,
        }}>
          Добавете членовете
        </div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.text2 }}>
          Добавете децата и другите членове на семейството.
        </div>
      </div>

      {/* Add form */}
      <div style={{
        background: T.surf2, borderRadius: 16, padding: '16px',
        border: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <Input
          label="Имe"
          placeholder="Елена"
          value={newName}
          onChange={setNewName}
        />

        {/* Role picker — 2×2 grid */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8, fontFamily: 'DM Sans, sans-serif' }}>
            Роля
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {ROLES.map(r => (
              <div
                key={r.key}
                onClick={() => setNewRole(r.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', borderRadius: 10,
                  border: `2px solid ${newRole === r.key ? T.mustDo : T.border}`,
                  background: newRole === r.key ? `${T.mustDo}10` : T.surface,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 16 }}>{r.emoji}</span>
                <span style={{
                  fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                  fontWeight: newRole === r.key ? 700 : 500,
                  color: newRole === r.key ? T.mustDo : T.text,
                }}>
                  {r.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Avatar color swatches */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8, fontFamily: 'DM Sans, sans-serif' }}>
            Цвят на аватар
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {T.avatars.slice(0, 6).map(c => (
              <div
                key={c}
                onClick={() => setNewColor(c)}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: c,
                  border: newColor === c ? `3px solid ${T.text}` : '3px solid transparent',
                  cursor: 'pointer',
                  boxShadow: newColor === c ? `0 0 0 2px ${T.surface}, 0 0 0 4px ${c}` : 'none',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Preview + add button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: newName ? newColor : T.border,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800, color: '#fff',
            fontFamily: 'Nunito, sans-serif',
            flexShrink: 0,
          }}>
            {newName ? initials(newName) : '?'}
          </div>
          <div
            onClick={addMember}
            style={{
              flex: 1, background: newName.trim() ? T.mustDo : T.border,
              color: '#fff', borderRadius: 12, padding: '11px 0',
              textAlign: 'center', fontSize: 14, fontWeight: 700,
              fontFamily: 'DM Sans, sans-serif', cursor: newName.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
              boxShadow: newName.trim() ? `0 4px 14px ${T.mustDo}40` : 'none',
            }}
          >
            + Добави члена
          </div>
        </div>
      </div>

      {/* Added members list */}
      {members.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {members.map((m, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: T.surface, borderRadius: 12,
              padding: '12px 14px',
              border: `1px solid ${T.border}`,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: m.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: '#fff',
                fontFamily: 'Nunito, sans-serif', flexShrink: 0,
              }}>
                {initials(m.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, color: T.text }}>
                  {m.name}
                </div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: T.text3 }}>
                  {ROLES.find(r => r.key === m.role)?.label}
                </div>
              </div>
              <div
                onClick={() => removeMember(i)}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: T.surf2, border: `1px solid ${T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 14, color: T.text3,
                  flexShrink: 0,
                }}
              >
                ×
              </div>
            </div>
          ))}
        </div>
      )}

      {members.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '16px',
          fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.text3,
        }}>
          Все още няма добавени членове.
        </div>
      )}
    </div>
  );
}

interface StepPointsProps {
  dailyBase: number;
  setDailyBase: (v: number) => void;
  members: Member[];
}
function StepPoints({ dailyBase, setDailyBase, members }: StepPointsProps) {
  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{
          fontFamily: 'Nunito, sans-serif', fontSize: 20, fontWeight: 800,
          color: T.text, marginBottom: 4,
        }}>
          Настройте точките
        </div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.text2 }}>
          Колко точки да получава всеки за изпълнена задача?
        </div>
      </div>

      {/* Daily base chips */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 10, fontFamily: 'DM Sans, sans-serif' }}>
          Базови точки на ден
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {DAILY_BASE_OPTIONS.map(pts => (
            <div
              key={pts}
              onClick={() => setDailyBase(pts)}
              style={{
                flex: 1, textAlign: 'center',
                padding: '10px 0', borderRadius: 12,
                border: `2px solid ${dailyBase === pts ? T.challenge : T.border}`,
                background: dailyBase === pts ? `${T.challenge}15` : T.surface,
                fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 800,
                color: dailyBase === pts ? T.challenge : T.text2,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {pts}
            </div>
          ))}
        </div>
      </div>

      {/* Streak multipliers info card */}
      <div style={{
        background: `linear-gradient(135deg, ${T.event}10, ${T.challenge}10)`,
        border: `1.5px solid ${T.event}30`,
        borderRadius: 16, padding: '16px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 12,
        }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <span style={{
            fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 800, color: T.text,
          }}>
            Streak множители
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {STREAK_MULTIPLIERS.map(m => (
            <div key={m.range} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0,
                }} />
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.text2 }}>
                  {m.range}
                </span>
              </div>
              <span style={{
                fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800,
                color: m.color,
                background: `${m.color}15`, borderRadius: 99,
                padding: '2px 10px',
              }}>
                {m.mult}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Preview per member */}
      {members.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 10, fontFamily: 'DM Sans, sans-serif' }}>
            Преглед — точки на член
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members.map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: T.surface, borderRadius: 10,
                padding: '10px 12px', border: `1px solid ${T.border}`,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: m.color, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: '#fff', fontFamily: 'Nunito, sans-serif',
                }}>
                  {initials(m.name)}
                </div>
                <div style={{ flex: 1, fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: T.text }}>
                  {m.name}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: T.challengeBg, borderRadius: 99, padding: '3px 10px',
                  fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, color: T.challenge,
                }}>
                  <span style={{ fontSize: 12 }}>⭐</span>
                  {dailyBase} / ден
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {members.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '12px',
          fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.text3,
          background: T.surf2, borderRadius: 10,
        }}>
          Добавете членове в предишната стъпка за преглед.
        </div>
      )}
    </div>
  );
}

interface StepDoneProps {
  familyName: string;
  members: Member[];
  dailyBase: number;
}
function StepDone({ familyName, members, dailyBase }: StepDoneProps) {
  return (
    <div className="animate-fade-up" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ position: 'relative' }}>
        <Confetti />
        <div style={{ fontSize: 72, marginBottom: 12, display: 'inline-block' }}>🎉</div>
        <div style={{
          fontFamily: 'Nunito, sans-serif', fontSize: 24, fontWeight: 900, color: T.text, marginBottom: 6,
        }}>
          Готово!
        </div>
        <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: T.text2 }}>
          Семейството ви е настроено и готово за действие.
        </div>
      </div>

      {/* Summary card */}
      <div style={{
        background: T.surface, borderRadius: 18,
        border: `1px solid ${T.border}`,
        padding: '18px 20px', textAlign: 'left',
        boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
      }}>
        <div style={{
          fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800,
          color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 14,
        }}>
          Обобщение
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Family name */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🏡</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.text2 }}>Семейство</span>
            </div>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, color: T.text }}>
              {familyName || 'Семейство'}
            </span>
          </div>

          <div style={{ height: 1, background: T.border }} />

          {/* Members */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>👨‍👩‍👧‍👦</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.text2 }}>Членове</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {members.slice(0, 4).map((m, i) => (
                <div key={i} style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: m.color, border: '2px solid #fff',
                  marginLeft: i > 0 ? -8 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, color: '#fff', fontFamily: 'Nunito, sans-serif',
                }}>
                  {initials(m.name)}
                </div>
              ))}
              {members.length === 0 && (
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.text3 }}>Няма</span>
              )}
              {members.length > 0 && (
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: T.text, marginLeft: 4 }}>
                  {members.length}
                </span>
              )}
            </div>
          </div>

          <div style={{ height: 1, background: T.border }} />

          {/* Points */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⭐</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.text2 }}>Точки на ден</span>
            </div>
            <span style={{
              fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800,
              color: T.challenge,
              background: T.challengeBg, borderRadius: 99, padding: '3px 10px',
            }}>
              {dailyBase} точки
            </span>
          </div>
        </div>
      </div>

      {/* Invite hint */}
      <div style={{
        background: `${T.household}12`,
        border: `1.5px dashed ${T.household}50`,
        borderRadius: 14, padding: '14px 16px',
        display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left',
      }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>💌</span>
        <div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: T.household, marginBottom: 2 }}>
            Поканете другите родители
          </div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: T.text2, lineHeight: 1.5 }}>
            Изпратете покана линк от настройките, за да добавите другите родители към семейния акаунт.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

const STEP_LABELS = ['Добре дошъл', 'Семейство', 'Членове', 'Точки', 'Готово'];

export default function OnboardingPage() {
  const [step, setStep]             = useState(0);
  const [direction, setDirection]   = useState<'forward' | 'back'>('forward');
  const [familyName, setFamilyName] = useState('');
  const [timezone, setTimezone]     = useState('Europe/Sofia');
  const [members, setMembers]       = useState<Member[]>([]);
  const [dailyBase, setDailyBase]   = useState(10);

  const totalSteps = 5;

  const goNext = () => {
    if (step >= totalSteps - 1) return;
    setDirection('forward');
    setStep(s => s + 1);
  };

  const goBack = () => {
    if (step <= 0) return;
    setDirection('back');
    setStep(s => s - 1);
  };

  const animClass = direction === 'forward' ? 'animate-slide-in' : 'animate-slide-back';

  const primaryLabel =
    step === 0 ? 'Да започнем!' :
    step === 1 ? 'Напред' :
    step === 2 ? 'Продължи' :
    step === 3 ? 'Потвърди' :
    undefined;

  return (
    <MobileShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* ── Progress bar ── */}
        <div style={{
          background: T.surface,
          padding: '16px 20px 14px',
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}>
          {/* Top row: back button + step counter */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
            {step > 0 && step < totalSteps - 1 ? (
              <div
                onClick={goBack}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  color: T.text2, fontFamily: 'DM Sans, sans-serif',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  marginRight: 12,
                }}
              >
                ← Назад
              </div>
            ) : (
              <div style={{ width: 52 }} />
            )}
            <div style={{ flex: 1 }} />
            <div style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: T.text3,
            }}>
              {step + 1}/{totalSteps}
            </div>
          </div>

          {/* Step label */}
          <div style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600,
            color: T.mustDo, textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 10,
          }}>
            {STEP_LABELS[step]}
          </div>

          {/* Dot/segment progress */}
          <div style={{ display: 'flex', gap: 5 }}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                style={{
                  height: 4, borderRadius: 99,
                  flex: i === step ? 2 : 1,
                  background: i <= step ? T.mustDo : T.border,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Step content ── */}
        <div
          key={step}
          className={animClass}
          style={{ flex: 1, padding: '24px 20px 120px', overflowY: 'auto' }}
        >
          {step === 0 && <StepWelcome />}
          {step === 1 && (
            <StepFamily
              familyName={familyName}
              setFamilyName={setFamilyName}
              timezone={timezone}
              setTimezone={setTimezone}
            />
          )}
          {step === 2 && (
            <StepMembers members={members} setMembers={setMembers} />
          )}
          {step === 3 && (
            <StepPoints
              dailyBase={dailyBase}
              setDailyBase={setDailyBase}
              members={members}
            />
          )}
          {step === 4 && (
            <StepDone
              familyName={familyName}
              members={members}
              dailyBase={dailyBase}
            />
          )}
        </div>

        {/* ── Sticky primary button ── */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 430,
          padding: '14px 20px 24px',
          background: `linear-gradient(to top, ${T.bg} 60%, transparent)`,
          zIndex: 20,
        }}>
          {step < totalSteps - 1 ? (
            <div
              onClick={goNext}
              style={{
                width: '100%', background: T.mustDo, color: '#fff',
                borderRadius: 16, padding: '16px 0',
                textAlign: 'center', fontSize: 16, fontWeight: 700,
                fontFamily: 'DM Sans, sans-serif',
                cursor: 'pointer',
                boxShadow: `0 6px 22px ${T.mustDo}50`,
                letterSpacing: '0.01em',
                transition: 'all 0.15s',
              }}
            >
              {primaryLabel}
            </div>
          ) : (
            <Link href="/home" style={{ textDecoration: 'none' }}>
              <div style={{
                width: '100%', background: T.mustDo, color: '#fff',
                borderRadius: 16, padding: '16px 0',
                textAlign: 'center', fontSize: 16, fontWeight: 700,
                fontFamily: 'DM Sans, sans-serif',
                cursor: 'pointer',
                boxShadow: `0 6px 22px ${T.mustDo}50`,
                letterSpacing: '0.01em',
              }}>
                Отвори семейния календар →
              </div>
            </Link>
          )}
        </div>
      </div>
    </MobileShell>
  );
}
