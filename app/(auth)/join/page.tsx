'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { T } from '@/lib/tokens';
import { getInviteInfo, joinFamily } from '@/lib/actions';

function JoinContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const { data: session, status } = useSession();

  const [info, setInfo] = useState<{ valid: boolean; familyName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    getInviteInfo(token).then(res => { setInfo(res); setLoading(false); });
  }, [token]);

  const handleJoin = async () => {
    if (joining) return;
    setJoining(true);
    setError('');
    try {
      await joinFamily(token);
      router.push('/home');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Грешка при присъединяване');
      setJoining(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: '24px 20px',
    background: T.bg, fontFamily: 'DM Sans, sans-serif',
  };

  if (loading) return (
    <div style={containerStyle}>
      <div style={{ fontSize: 14, color: T.text3 }}>Зареждане...</div>
    </div>
  );

  if (!token || !info) return (
    <div style={containerStyle}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔗</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>Невалидна покана</div>
      <div style={{ fontSize: 13, color: T.text3 }}>Поканата не беше намерена или е изтекла.</div>
    </div>
  );

  if (!info.valid) return (
    <div style={containerStyle}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>⌛</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>Поканата е използвана</div>
      <div style={{ fontSize: 13, color: T.text3 }}>Тази покана вече е приета.</div>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>👨‍👩‍👧</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: T.text, fontFamily: 'Nunito, sans-serif', marginBottom: 6 }}>Покана към семейство</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.mustDo, marginBottom: 8 }}>{info.familyName}</div>
          <div style={{ fontSize: 13, color: T.text2 }}>Ще се присъединиш като родител в тялото.</div>
        </div>

        {status === 'unauthenticated' ? (
          <div>
            <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${T.border}`, padding: 20, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: T.text2, marginBottom: 16 }}>Трябва да имаш акаунт, за да приемеш поканата.</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent('/join?token=' + token)}`)} style={{ flex: 1, background: T.mustDo, borderRadius: 12, padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Влез</span>
                </div>
                <div onClick={() => router.push(`/register?callbackUrl=${encodeURIComponent('/join?token=' + token)}`)} style={{ flex: 1, background: T.surf2, borderRadius: 12, padding: '12px', textAlign: 'center', cursor: 'pointer', border: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Регистрация</span>
                </div>
              </div>
            </div>
          </div>
        ) : status === 'loading' ? (
          <div style={{ textAlign: 'center', color: T.text3 }}>Зареждане...</div>
        ) : (
          <div>
            {session?.user && (
              <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${T.border}`, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.mustDo, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                  {(session.user.name ?? session.user.email ?? '?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{session.user.name ?? session.user.email}</div>
                  <div style={{ fontSize: 11, color: T.text3 }}>Влязъл като</div>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: `${T.mustDo}15`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: T.mustDo }}>{error}</div>
            )}

            <div onClick={handleJoin} style={{
              background: joining ? T.border : T.mustDo, borderRadius: 14, padding: 16,
              textAlign: 'center', cursor: joining ? 'not-allowed' : 'pointer',
              boxShadow: joining ? 'none' : `0 4px 20px ${T.mustDo}40`,
            }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Nunito, sans-serif' }}>
                {joining ? 'Присъединяване...' : `Приеми поканата →`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontFamily: 'DM Sans, sans-serif' }}>Зареждане...</div>}>
      <JoinContent />
    </Suspense>
  );
}
