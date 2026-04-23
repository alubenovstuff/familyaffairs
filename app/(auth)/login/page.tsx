'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';
import { Input, Btn, Confetti } from '@/components/ui';
import { MobileShell } from '@/components/layout/Shell';

type Mode = 'login' | 'register' | 'forgot';

const CHILD_PROFILES = [
  { name: 'Елена', color: T.avatars[0], init: 'Е' },
  { name: 'Иван', color: T.avatars[3], init: 'И' },
];

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1400);
  };

  const handleChildLogin = (_childName: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 900);
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <MobileShell>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: T.bg, position: 'relative', overflow: 'hidden',
          padding: '40px 24px',
        }}>
          <Confetti />
          <div className="animate-pop" style={{ fontSize: 96, marginBottom: 24, display: 'block', lineHeight: 1 }}>
            🏠
          </div>
          <div style={{
            fontFamily: 'Nunito, sans-serif', fontSize: 28, fontWeight: 800,
            color: T.text, marginBottom: 8, textAlign: 'center',
          }}>
            Добре дошъл!
          </div>
          <div style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 15,
            color: T.text2, textAlign: 'center', marginBottom: 40,
          }}>
            Влизаш в семейния организатор
          </div>
          <div
            onClick={() => window.location.href = '/home'}
            style={{
              background: T.mustDo, color: '#fff',
              borderRadius: 16, padding: '16px 0',
              fontSize: 16, fontWeight: 700,
              fontFamily: 'DM Sans, sans-serif',
              cursor: 'pointer', width: '100%', maxWidth: 340,
              textAlign: 'center',
              boxShadow: `0 6px 20px ${T.mustDo}50`,
              letterSpacing: '0.01em',
            }}
          >
            Продължи →
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* ── Hero gradient section ── */}
        <div style={{
          background: `linear-gradient(145deg, ${T.mustDo} 0%, ${T.challenge} 100%)`,
          padding: '52px 24px 44px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          position: 'relative', overflow: 'hidden',
          flexShrink: 0,
        }}>
          {/* decorative blobs */}
          <div style={{
            position: 'absolute', top: -50, right: -50,
            width: 160, height: 160, borderRadius: '50%',
            background: 'rgba(255,255,255,0.10)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, left: -30,
            width: 110, height: 110, borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: 20, left: '15%',
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }} />

          {/* Floating logo */}
          <div className="animate-float" style={{
            width: 76, height: 76, borderRadius: 24,
            background: 'rgba(255,255,255,0.24)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, marginBottom: 18,
            boxShadow: '0 10px 32px rgba(0,0,0,0.18)',
            border: '1.5px solid rgba(255,255,255,0.30)',
          }}>
            🏠
          </div>

          <div style={{
            fontFamily: 'Nunito, sans-serif', fontSize: 30, fontWeight: 900,
            color: '#fff', letterSpacing: '-0.02em', marginBottom: 6,
            textShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}>
            FamilyAffairs
          </div>
          <div style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 400,
            color: 'rgba(255,255,255,0.88)',
            letterSpacing: '0.01em',
          }}>
            Семейният ви организатор
          </div>
        </div>

        {/* ── Content card ── */}
        <div style={{
          flex: 1,
          background: T.surface,
          borderRadius: '24px 24px 0 0',
          marginTop: -16,
          padding: '28px 24px 40px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -2px 16px rgba(0,0,0,0.06)',
        }}>

          {/* Tab toggle */}
          {mode !== 'forgot' && (
            <div style={{
              display: 'flex', background: T.surf2,
              borderRadius: 14, padding: 4, marginBottom: 26, gap: 2,
            }}>
              {(['login', 'register'] as Mode[]).map((m) => (
                <div
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1, textAlign: 'center',
                    padding: '10px 0', borderRadius: 11,
                    background: mode === m ? T.surface : 'transparent',
                    color: mode === m ? T.text : T.text2,
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: 14, fontWeight: mode === m ? 700 : 500,
                    cursor: 'pointer',
                    boxShadow: mode === m ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.18s',
                  }}
                >
                  {m === 'login' ? 'Вход' : 'Регистрация'}
                </div>
              ))}
            </div>
          )}

          {/* Forgot password header */}
          {mode === 'forgot' && (
            <div className="animate-fade-up" style={{ marginBottom: 26 }}>
              <div
                onClick={() => setMode('login')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: T.text2, fontSize: 13, fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer', marginBottom: 18, fontWeight: 500,
                }}
              >
                ← Назад
              </div>
              <div style={{
                fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800,
                color: T.text, marginBottom: 6,
              }}>
                Забравена парола
              </div>
              <div style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: T.text2, lineHeight: 1.5,
              }}>
                Въведете имейла си и ще ви изпратим линк за смяна на паролата.
              </div>
            </div>
          )}

          {/* Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <Input
                label="Вашето име"
                placeholder="Иван Иванов"
                value={name}
                onChange={setName}
              />
            )}
            <Input
              label="Имейл адрес"
              placeholder="email@example.com"
              type="email"
              value={email}
              onChange={setEmail}
            />
            {mode !== 'forgot' && (
              <Input
                label="Парола"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={setPassword}
              />
            )}
          </div>

          {/* Forgot password link */}
          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: 10, marginBottom: 2 }}>
              <span
                onClick={() => setMode('forgot')}
                style={{
                  fontSize: 12, color: T.mustDo,
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer', fontWeight: 600,
                  textDecoration: 'underline',
                  textUnderlineOffset: 2,
                }}
              >
                Забравена парола?
              </span>
            </div>
          )}

          {/* Primary CTA */}
          <div
            onClick={!loading ? handleSubmit : undefined}
            style={{
              background: loading ? `${T.mustDo}bb` : T.mustDo,
              color: '#fff',
              borderRadius: 14, padding: '15px 0',
              textAlign: 'center', width: '100%',
              fontSize: 15, fontWeight: 700,
              fontFamily: 'DM Sans, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : `0 6px 20px ${T.mustDo}45`,
              transition: 'all 0.18s',
              marginTop: 22,
              letterSpacing: '0.01em',
            }}
          >
            {loading
              ? '...'
              : mode === 'login'
                ? 'Влез в профила'
                : mode === 'register'
                  ? 'Създай профил'
                  : 'Изпрати линк за смяна'}
          </div>

          {/* Divider + social + child switcher — hidden in forgot mode */}
          {mode !== 'forgot' && (
            <>
              {/* Divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                margin: '22px 0',
              }}>
                <div style={{ flex: 1, height: 1, background: T.border }} />
                <span style={{ fontSize: 12, color: T.text3, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>или</span>
                <div style={{ flex: 1, height: 1, background: T.border }} />
              </div>

              {/* Social buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Google */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 10, border: `1.5px solid ${T.border}`,
                  borderRadius: 12, padding: '12px 0',
                  cursor: 'pointer', background: T.surface,
                  fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, color: T.text,
                  transition: 'background 0.15s',
                }}>
                  <span style={{ fontSize: 18 }}>🔵</span>
                  Продължи с Google
                </div>
                {/* Apple */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 10, border: `1.5px solid ${T.border}`,
                  borderRadius: 12, padding: '12px 0',
                  cursor: 'pointer', background: T.surface,
                  fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, color: T.text,
                  transition: 'background 0.15s',
                }}>
                  <span style={{ fontSize: 18 }}>⚫</span>
                  Продължи с Apple
                </div>
              </div>

              {/* Child profile switcher */}
              <div style={{ marginTop: 30 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
                }}>
                  <div style={{ flex: 1, height: 1, background: T.border }} />
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: T.text3,
                    fontFamily: 'DM Sans, sans-serif',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    whiteSpace: 'nowrap',
                  }}>
                    Вход за деца
                  </span>
                  <div style={{ flex: 1, height: 1, background: T.border }} />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  {CHILD_PROFILES.map((child) => (
                    <div
                      key={child.name}
                      onClick={() => handleChildLogin(child.name)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 8, cursor: 'pointer',
                        padding: '14px 24px', borderRadius: 16,
                        border: `1.5px solid ${T.border}`,
                        background: T.surf2,
                        transition: 'all 0.15s',
                        flex: 1,
                      }}
                    >
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: child.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 800, color: '#fff',
                        fontFamily: 'Nunito, sans-serif',
                        boxShadow: `0 4px 12px ${child.color}55`,
                      }}>
                        {child.init}
                      </div>
                      <div style={{
                        fontSize: 14, fontWeight: 700, color: T.text,
                        fontFamily: 'DM Sans, sans-serif',
                      }}>
                        {child.name}
                      </div>
                      <div style={{
                        fontSize: 10, color: T.text3,
                        fontFamily: 'DM Sans, sans-serif',
                        background: T.border,
                        borderRadius: 99, padding: '2px 8px',
                        fontWeight: 500,
                      }}>
                        Без парола
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MobileShell>
  );
}
