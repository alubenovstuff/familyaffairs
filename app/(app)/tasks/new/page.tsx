'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { T, TASK_TYPES } from '@/lib/tokens';
import { getMembers, createTask } from '@/lib/actions';
import { MobileShell, BottomNav } from '@/components/layout/Shell';
import { ToggleTabs, Input, Confetti } from '@/components/ui';

type Member = Awaited<ReturnType<typeof getMembers>>[number];

const TYPE_KEYS = Object.keys(TASK_TYPES) as (keyof typeof TASK_TYPES)[];
const TYPE_ICONS: Record<string, string> = {
  household: '🏠', must_do: '⚠️', ongoing: '🔄', challenge: '⚡', baseline: '📋', event: '📅',
};
const TYPE_DESCS: Record<string, string> = {
  household: 'Домашни задачи', must_do: 'Задължително', ongoing: 'Ежедневно', challenge: 'Предизвикателство', baseline: 'Само отчет', event: 'Фиксиран час',
};
const DURATIONS = [10, 15, 20, 30, 45, 60];
const RECURRENCE_OPTS = ['Без повторение', 'Ежедневно', 'Седмично', 'Месечно'];
const REWARD_OPTS = [
  { id: 'none', icon: '—', label: 'Без награда', desc: 'Само точки' },
  { id: 'fixed', icon: '🎯', label: 'Фиксирана', desc: 'Точки са наградата' },
  { id: 'choice', icon: '🎲', label: 'Избор', desc: '2–3 опции при одобрение' },
  { id: 'mystery', icon: '🎁', label: 'Мистерия', desc: 'Скрита до одобрение' },
];

// ── Wizard (Step-by-step) ─────────────────────────────────────────────────

const WizardVariant = ({ members }: { members: Member[] }) => {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [entityType, setEntityType] = useState<'task' | 'event'>('task');
  const [taskType, setTaskType] = useState<string>('household');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [duration, setDuration] = useState(30);
  const [pts, setPts] = useState(15);
  const [recurrence, setRecurrence] = useState('Без повторение');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [splitType, setSplitType] = useState('equal');
  const [rewardType, setRewardType] = useState('none');
  const [due, setDue] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const toggleAssignee = (id: string) =>
    setAssignees(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);

  const handleCreate = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await createTask({
        title,
        type: taskType,
        pts,
        due: due || null,
        description: desc || null,
        reward: rewardType,
        reward_label: null,
        assignee_ids: assignees,
      });
      setDone(true);
    } finally {
      setSaving(false);
    }
  };

  if (done) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', position: 'relative', background: T.bg }}>
      <Confetti />
      <div style={{ fontSize: 72, marginBottom: 16 }} className="animate-float">🎉</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif', marginBottom: 8 }}>Задачата е създадена!</div>
      <div style={{ fontSize: 13, color: T.text2, marginBottom: 28 }}>"{title}" е добавена в календара.</div>
      <div onClick={() => router.push('/tasks')} style={{ background: T.mustDo, borderRadius: 12, padding: '13px 28px', cursor: 'pointer', boxShadow: `0 4px 16px ${T.mustDo}40` }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>→ Към задачите</span>
      </div>
    </div>
  );

  const tp = TASK_TYPES[taskType as keyof typeof TASK_TYPES] || TASK_TYPES.household;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', overflow: 'hidden' }}>
      {/* Progress */}
      <div style={{ padding: '10px 16px 12px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          {step > 0 && (
            <div onClick={() => setStep(s => s - 1)} style={{ width: 32, height: 32, borderRadius: 8, background: T.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'pointer', color: T.text2 }}>‹</div>
          )}
          <div style={{ flex: 1, display: 'flex', gap: 4 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= step ? T.mustDo : T.border, transition: 'background 0.2s' }} />
            ))}
          </div>
          <span style={{ fontSize: 11, color: T.text3 }}>{step + 1}/4</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 2, background: T.surf2, borderRadius: 99, padding: 2 }}>
          {(['Задача', 'Събитие'] as const).map((t, i) => (
            <div key={t} onClick={() => setEntityType(i === 0 ? 'task' : 'event')} style={{
              flex: 1, padding: '5px', borderRadius: 99, textAlign: 'center', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: (entityType === 'task') === (i === 0) ? '#fff' : 'transparent',
              color: (entityType === 'task') === (i === 0) ? T.text : T.text2,
              boxShadow: (entityType === 'task') === (i === 0) ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}>{t}</div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        {/* Step 1: Type */}
        {step === 0 && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif', marginBottom: 16 }}>Избери тип</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TYPE_KEYS.map(k => {
                const t = TASK_TYPES[k];
                const active = taskType === k;
                return (
                  <div key={k} onClick={() => setTaskType(k)} style={{
                    padding: '12px', borderRadius: 12, cursor: 'pointer',
                    background: active ? `${t.color}15` : T.surf2,
                    border: `2px solid ${active ? t.color : T.border}`,
                    transition: 'all 0.12s', position: 'relative',
                  }}>
                    {active && <div style={{ position: 'absolute', top: 6, right: 8, fontSize: 12, color: t.color }}>✓</div>}
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{TYPE_ICONS[k]}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: active ? t.color : T.text }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{TYPE_DESCS[k]}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Детайли</div>
            <Input label="Заглавие" placeholder="напр. Изчисти кухнята" value={title} onChange={setTitle} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 5 }}>Описание</div>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Детайли за задачата..." style={{ width: '100%', borderRadius: 10, padding: '10px 14px', fontSize: 13, border: `1.5px solid ${T.border}`, background: '#fff', color: T.text, fontFamily: 'DM Sans, sans-serif', outline: 'none', resize: 'none', minHeight: 80 }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8 }}>Продължителност</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DURATIONS.map(d => (
                  <div key={d} onClick={() => setDuration(d)} style={{
                    padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: duration === d ? T.mustDo : T.surf2,
                    color: duration === d ? '#fff' : T.text2,
                    border: `1px solid ${duration === d ? T.mustDo : T.border}`,
                    transition: 'all 0.12s',
                  }}>{d} мин</div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 5 }}>Точки</div>
              <input type="number" value={pts} onChange={e => setPts(Number(e.target.value))} style={{ width: 80, borderRadius: 8, padding: '8px 12px', fontSize: 14, fontWeight: 700, border: `1.5px solid ${T.border}`, background: '#fff', color: T.challenge, fontFamily: 'Nunito, sans-serif', outline: 'none' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8 }}>Повторение</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {RECURRENCE_OPTS.map(r => (
                  <div key={r} onClick={() => setRecurrence(r)} style={{
                    padding: '6px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    background: recurrence === r ? T.ongoing : T.surf2,
                    color: recurrence === r ? '#fff' : T.text2,
                    border: `1px solid ${recurrence === r ? T.ongoing : T.border}`,
                    transition: 'all 0.12s',
                  }}>{r}</div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 5 }}>Краен срок</div>
              <input type="date" value={due} onChange={e => setDue(e.target.value)} style={{ borderRadius: 10, padding: '9px 14px', fontSize: 13, border: `1.5px solid ${due ? T.mustDo : T.border}`, background: '#fff', color: due ? T.text : T.text3, fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%' }} />
            </div>
          </div>
        )}

        {/* Step 3: Assignees */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif', marginBottom: 4 }}>Изпълнители</div>
            <div style={{ fontSize: 13, color: T.text2, marginBottom: 16 }}>Избери кой изпълнява задачата.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {members.map(m => {
                const active = assignees.includes(m.id);
                return (
                  <div key={m.id} onClick={() => toggleAssignee(m.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 12, cursor: 'pointer',
                    background: active ? `${m.color}12` : '#fff',
                    border: `2px solid ${active ? m.color : T.border}`,
                    transition: 'all 0.12s',
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'Nunito, sans-serif', flexShrink: 0 }}>{m.init}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: active ? m.color : T.text }}>{m.name}</div>
                      <div style={{ fontSize: 10, color: T.text3, textTransform: 'capitalize' }}>{m.role}</div>
                    </div>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${active ? m.color : T.border}`, background: active ? m.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff' }}>{active && '✓'}</div>
                  </div>
                );
              })}
            </div>
            {assignees.length > 1 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8 }}>Разпределение</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[['equal', 'Равно'], ['full', 'Пълно'], ['custom', 'По избор']].map(([v, l]) => (
                    <div key={v} onClick={() => setSplitType(v)} style={{
                      flex: 1, padding: '8px', borderRadius: 10, textAlign: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      background: splitType === v ? T.mustDoBg : T.surf2,
                      color: splitType === v ? T.mustDo : T.text2,
                      border: `1.5px solid ${splitType === v ? T.mustDo : T.border}`,
                    }}>{l}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Reward */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif', marginBottom: 4 }}>Вид награда</div>
            <div style={{ fontSize: 13, color: T.text2, marginBottom: 16 }}>Какво получава изпълнителят освен точки?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {REWARD_OPTS.map(r => {
                const active = rewardType === r.id;
                return (
                  <div key={r.id} onClick={() => setRewardType(r.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                    borderRadius: 12, cursor: 'pointer',
                    background: active ? `${T.mustDo}10` : '#fff',
                    border: `2px solid ${active ? T.mustDo : T.border}`,
                    transition: 'all 0.12s',
                  }}>
                    <span style={{ fontSize: 28 }}>{r.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: active ? T.mustDo : T.text }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: T.text3 }}>{r.desc}</div>
                    </div>
                    {active && <div style={{ width: 20, height: 20, borderRadius: '50%', background: T.mustDo, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff' }}>✓</div>}
                  </div>
                );
              })}
            </div>
            {rewardType === 'mystery' && (
              <div style={{ marginTop: 16, padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg, #667eea, #764ba2)', backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#fff' }}>
                <span style={{ fontSize: 24 }}>🎁</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Наградата ще бъде изненада!</span>
              </div>
            )}
          </div>
        )}
        <div style={{ height: 16 }} />
      </div>

      {/* Bottom action */}
      <div style={{ background: '#fff', borderTop: `1px solid ${T.border}`, padding: '12px 16px', flexShrink: 0 }}>
        {step < 3 ? (
          <div onClick={() => setStep(s => s + 1)} style={{
            background: (step === 1 && !title.trim()) ? T.border : T.mustDo,
            borderRadius: 12, padding: 14, textAlign: 'center',
            cursor: (step === 1 && !title.trim()) ? 'not-allowed' : 'pointer',
            boxShadow: (step === 1 && !title.trim()) ? 'none' : `0 4px 16px ${T.mustDo}40`,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Напред →</span>
          </div>
        ) : (
          <div onClick={handleCreate} style={{ background: saving ? T.border : T.household, borderRadius: 12, padding: 14, textAlign: 'center', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : `0 4px 16px ${T.household}40` }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{saving ? 'Запазване...' : '✓ Създай задача'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Single Scroll variant ─────────────────────────────────────────────────

const ScrollVariant = ({ members }: { members: Member[] }) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [taskType, setTaskType] = useState<string>('household');
  const [duration, setDuration] = useState(30);
  const [pts, setPts] = useState(15);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [recurrence, setRecurrence] = useState('Без повторение');
  const [rewardType, setRewardType] = useState('none');
  const [due, setDue] = useState('');
  const [saving, setSaving] = useState(false);

  const tp = TASK_TYPES[taskType as keyof typeof TASK_TYPES] || TASK_TYPES.household;
  const toggleAssignee = (id: string) =>
    setAssignees(a => a.includes(id) ? a.filter(x => x !== id) : [...a, id]);

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      await createTask({
        title,
        type: taskType,
        pts,
        due: due || null,
        description: desc || null,
        reward: rewardType,
        reward_label: null,
        assignee_ids: assignees,
      });
      router.push('/tasks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, overflow: 'hidden' }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div onClick={() => router.back()} style={{ fontSize: 20, color: T.text2, cursor: 'pointer' }}>‹</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: 'Nunito, sans-serif' }}>Нова задача</div>
        <div onClick={handleSave} style={{
          background: title.trim() && !saving ? T.mustDo : T.border,
          borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#fff',
          cursor: title.trim() && !saving ? 'pointer' : 'not-allowed', transition: 'all 0.15s',
        }}>{saving ? '...' : 'Запази'}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Type picker */}
        <div style={{ fontSize: 11, fontWeight: 700, color: T.text3, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Тип</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
          {TYPE_KEYS.map(k => {
            const t = TASK_TYPES[k];
            const active = taskType === k;
            return (
              <div key={k} onClick={() => setTaskType(k)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0,
                padding: '10px 12px', borderRadius: 12, cursor: 'pointer', minWidth: 64,
                background: active ? `${t.color}18` : '#fff',
                border: `2px solid ${active ? t.color : T.border}`,
              }}>
                <span style={{ fontSize: 20 }}>{TYPE_ICONS[k]}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: active ? t.color : T.text2 }}>{t.label}</span>
              </div>
            );
          })}
        </div>

        {/* Title */}
        <div style={{ marginBottom: 12 }}>
          <Input label="Заглавие" placeholder="напр. Изчисти кухнята" value={title} onChange={setTitle} />
        </div>

        {/* Live preview */}
        {title.trim() && (
          <div style={{ marginBottom: 16, padding: '10px 14px', background: tp.bg, borderLeft: `3px solid ${tp.color}`, borderRadius: '0 12px 12px 0' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{title}</div>
            <div style={{ fontSize: 11, color: tp.color, marginTop: 3 }}>{tp.label} · {duration} мин · {pts} т.</div>
          </div>
        )}

        {/* Description */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 5 }}>Описание</div>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Детайли..." style={{ width: '100%', borderRadius: 10, padding: '10px 14px', fontSize: 13, border: `1.5px solid ${T.border}`, background: '#fff', color: T.text, fontFamily: 'DM Sans, sans-serif', outline: 'none', resize: 'none', minHeight: 72 }} />
        </div>

        {/* Duration + pts */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 6 }}>Продължителност</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {DURATIONS.map(d => (
                <div key={d} onClick={() => setDuration(d)} style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: duration === d ? T.mustDo : T.surf2, color: duration === d ? '#fff' : T.text2, border: `1px solid ${duration === d ? T.mustDo : T.border}` }}>{d}м</div>
              ))}
            </div>
          </div>
          <div style={{ width: 70 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 6 }}>Точки</div>
            <input type="number" value={pts} onChange={e => setPts(Number(e.target.value))} style={{ width: '100%', borderRadius: 8, padding: '6px 10px', fontSize: 14, fontWeight: 700, border: `1.5px solid ${T.border}`, background: '#fff', color: T.challenge, fontFamily: 'Nunito, sans-serif', outline: 'none' }} />
          </div>
        </div>

        {/* Assignees */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8 }}>Изпълнители</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {members.map(m => {
              const active = assignees.includes(m.id);
              return (
                <div key={m.id} onClick={() => toggleAssignee(m.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'Nunito, sans-serif', border: `3px solid ${active ? '#fff' : 'transparent'}`, boxShadow: active ? `0 0 0 2px ${m.color}` : 'none', transition: 'all 0.12s' }}>{m.init}</div>
                  <span style={{ fontSize: 9, color: active ? m.color : T.text3, fontWeight: active ? 700 : 400 }}>{m.name.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recurrence */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 6 }}>Повторение</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {RECURRENCE_OPTS.map(r => (
              <div key={r} onClick={() => setRecurrence(r)} style={{ padding: '6px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: recurrence === r ? T.ongoing : T.surf2, color: recurrence === r ? '#fff' : T.text2, border: `1px solid ${recurrence === r ? T.ongoing : T.border}` }}>{r}</div>
            ))}
          </div>
        </div>

        {/* Due date */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 6 }}>Краен срок</div>
          <input type="date" value={due} onChange={e => setDue(e.target.value)} style={{ borderRadius: 10, padding: '8px 12px', fontSize: 13, border: `1.5px solid ${due ? T.mustDo : T.border}`, background: '#fff', color: due ? T.text : T.text3, fontFamily: 'DM Sans, sans-serif', outline: 'none', width: '100%' }} />
        </div>

        {/* Reward */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 8 }}>Вид награда</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {REWARD_OPTS.map(r => (
              <div key={r.id} onClick={() => setRewardType(r.id)} style={{ flex: 1, padding: '8px 4px', borderRadius: 10, textAlign: 'center', cursor: 'pointer', background: rewardType === r.id ? `${T.mustDo}12` : '#fff', border: `2px solid ${rewardType === r.id ? T.mustDo : T.border}`, transition: 'all 0.12s' }}>
                <div style={{ fontSize: 20 }}>{r.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: rewardType === r.id ? T.mustDo : T.text2, marginTop: 3 }}>{r.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────

export default function NewTaskPage() {
  const [variant, setVariant] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    getMembers().then(setMembers);
  }, []);

  return (
    <MobileShell>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: T.bg, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderBottom: `1px solid ${T.border}`, padding: '8px 16px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
          <ToggleTabs options={['Стъпки', 'Скрол']} active={variant} onChange={setVariant} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {variant === 0 ? <WizardVariant members={members} /> : <ScrollVariant members={members} />}
        </div>
        <BottomNav activeIdx={1} />
      </div>
    </MobileShell>
  );
}
