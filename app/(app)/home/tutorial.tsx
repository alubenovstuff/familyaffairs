'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';

const STEPS = [
  {
    emoji: '🏡',
    color: T.mustDo,
    title: 'Добре дошли в FamilyAffairs!',
    body: 'Приложението помага на семейството ви да организира задачи, да награждава добри навици и да проследява напредъка на всеки член.',
    visual: (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', margin: '4px 0 8px' }}>
        {[
          { icon: '📅', label: 'Календар', color: T.ongoing },
          { icon: '✅', label: 'Задачи', color: T.household },
          { icon: '🔥', label: 'Streak', color: T.challenge },
          { icon: '🏅', label: 'Значки', color: '#cd7f32' },
          { icon: '🎁', label: 'Желания', color: T.event },
          { icon: '⭐', label: 'Точки', color: T.challenge },
        ].map(f => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${f.color}15`, border: `1px solid ${f.color}30`, borderRadius: 99, padding: '6px 12px' }}>
            <span style={{ fontSize: 14 }}>{f.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: f.color }}>{f.label}</span>
          </div>
        ))}
      </div>
    ),
    tip: null,
  },
  {
    emoji: '➕',
    color: T.household,
    title: 'Създайте задачи',
    body: 'Натиснете + бутона долу вдясно за нова задача. Изберете тип, добавете описание, задайте точки и изпълнители.',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '4px 0 8px' }}>
        {[
          { icon: '🏠', label: 'Домашно', desc: 'Чисти, готви, реди', color: T.household },
          { icon: '⚠️', label: 'Must-do', desc: 'Задължително', color: T.mustDo },
          { icon: '🔄', label: 'Ежедневно', desc: 'Повтаря се всеки ден', color: T.ongoing },
          { icon: '⚡', label: 'Предизвикателство', desc: 'Бонус точки', color: T.challenge },
        ].map(t => (
          <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${t.color}10`, border: `1px solid ${t.color}25`, borderRadius: 10, padding: '8px 12px' }}>
            <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{t.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.label}</div>
              <div style={{ fontSize: 10, color: T.text3 }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
    tip: '💡 Задайте краен срок и изпълнители — задачата се появява в календара автоматично.',
  },
  {
    emoji: '✅',
    color: T.mustDo,
    title: 'Изпълнение и одобрение',
    body: 'Детето маркира задачата като изпълнена. Родителят я вижда в раздела Одобрения и я потвърждава. Точките се присвояват автоматично!',
    visual: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', margin: '4px 0 8px' }}>
        {[
          { label: 'Активна', color: T.ongoing, icon: '📋' },
          { label: '→', color: T.text3, icon: null },
          { label: 'Изпратена', color: T.challenge, icon: '⏳' },
          { label: '→', color: T.text3, icon: null },
          { label: 'Одобрена', color: T.household, icon: '✅' },
        ].map((s, i) => s.icon ? (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}15`, border: `1.5px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
            <span style={{ fontSize: 9, fontWeight: 600, color: s.color, textAlign: 'center', maxWidth: 44 }}>{s.label}</span>
          </div>
        ) : (
          <span key={i} style={{ fontSize: 16, color: T.text3, marginTop: -16 }}>→</span>
        ))}
      </div>
    ),
    tip: '💡 Активирайте авто-одобрение (24ч/48ч) от Настройки за по-малко стъпки.',
  },
  {
    emoji: '🔥',
    color: T.challenge,
    title: 'Streak, точки и значки',
    body: 'Изпълнявайте задачи всеки ден за да натрупате стрийк. Дневните базови точки се добавят при отваряне на приложението.',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '4px 0 8px' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'].map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < 5 ? T.challenge : T.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                {i < 5 ? '✓' : ''}
              </div>
              <span style={{ fontSize: 9, color: T.text3 }}>{d}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {[
            { range: '1–6 дни', mult: '×1.0', color: T.text3 },
            { range: '7–13 дни', mult: '×1.5', color: T.challenge },
            { range: '30+ дни', mult: '×3.0', color: T.event },
          ].map(m => (
            <div key={m.range} style={{ flex: 1, textAlign: 'center', background: `${m.color}12`, border: `1px solid ${m.color}30`, borderRadius: 8, padding: '6px 4px' }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: m.color, fontFamily: 'Nunito, sans-serif' }}>{m.mult}</div>
              <div style={{ fontSize: 9, color: T.text3 }}>{m.range}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    tip: '🏅 Значки се отключват автоматично — за стрийк, задачи и точки.',
  },
  {
    emoji: '🎁',
    color: T.event,
    title: 'Желания и награди',
    body: 'Децата добавят желания с цена в точки. Когато родителят одобри, точките се приспадат. Перфектна мотивация за редовно изпълнение на задачи!',
    visual: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '4px 0 8px' }}>
        {[
          { emoji: '🎮', title: 'Нова игра', price: 350, color: T.event },
          { emoji: '🍕', title: 'Пица вечер', price: 150, color: T.challenge },
          { emoji: '🎬', title: 'Кино', price: 200, color: T.ongoing },
        ].map(w => (
          <div key={w.title} style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${w.color}10`, border: `1px solid ${w.color}25`, borderRadius: 10, padding: '8px 12px' }}>
            <span style={{ fontSize: 22 }}>{w.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{w.title}</div>
            </div>
            <div style={{ background: `${w.color}20`, borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: w.color }}>
              ⭐ {w.price}
            </div>
          </div>
        ))}
      </div>
    ),
    tip: '🔗 Поканете втория родител от Настройки → Членове → "Покани втори родител".',
  },
];

const STORAGE_KEY = 'fa_tutorial_v1';

export function Tutorial() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 700);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
    setStep(0);
  };

  const next = () => {
    if (animating) return;
    if (step < STEPS.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep(s => s + 1);
        setAnimating(false);
      }, 150);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={dismiss} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />

      <div style={{
        position: 'relative', background: '#fff',
        borderRadius: '24px 24px 0 0',
        padding: '24px 20px 40px',
        zIndex: 1,
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.15s, transform 0.15s',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 99, background: T.border, margin: '0 auto 20px' }} />

        {/* Skip */}
        <div onClick={dismiss} style={{ position: 'absolute', top: 20, right: 20, fontSize: 12, color: T.text3, cursor: 'pointer', fontWeight: 600, padding: '4px 8px' }}>
          Пропусни
        </div>

        {/* Step counter */}
        <div style={{ position: 'absolute', top: 22, left: 20, fontSize: 11, color: T.text3, fontWeight: 600 }}>
          {step + 1} / {STEPS.length}
        </div>

        {/* Emoji */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 52, lineHeight: 1 }}>{s.emoji}</div>
        </div>

        {/* Title */}
        <div style={{ fontSize: 19, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif', textAlign: 'center', marginBottom: 8, lineHeight: 1.25 }}>
          {s.title}
        </div>

        {/* Body */}
        <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.65, textAlign: 'center', marginBottom: 14 }}>
          {s.body}
        </div>

        {/* Visual */}
        {s.visual}

        {/* Tip */}
        {s.tip && (
          <div style={{ background: T.surf2, borderRadius: 12, padding: '10px 14px', fontSize: 12, color: T.text2, lineHeight: 1.55, marginBottom: 0 }}>
            {s.tip}
          </div>
        )}

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, margin: '16px 0' }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{
              height: 6, borderRadius: 99, cursor: 'pointer',
              width: i === step ? 22 : 6,
              background: i === step ? s.color : i < step ? `${s.color}50` : T.border,
              transition: 'all 0.25s',
            }} />
          ))}
        </div>

        {/* CTA */}
        <div onClick={next} style={{
          background: s.color, borderRadius: 14, padding: '14px',
          textAlign: 'center', cursor: 'pointer',
          boxShadow: `0 4px 20px ${s.color}40`,
          transition: 'opacity 0.15s',
        }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Nunito, sans-serif' }}>
            {isLast ? 'Да започваме! →' : 'Напред →'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function resetTutorial() {
  localStorage.removeItem(STORAGE_KEY);
}
