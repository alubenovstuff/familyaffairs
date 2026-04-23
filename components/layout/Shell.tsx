'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { T } from '@/lib/tokens';

const NAV_TABS = [
  { icon: '📅', label: 'Календар', href: '/home' },
  { icon: '✅', label: 'Задачи', href: '/tasks' },
  { icon: '🎁', label: 'Желания', href: '/wishes' },
  { icon: '👤', label: 'Профил', href: '/profile/mama' },
];

export const BottomNav = ({ activeIdx }: { activeIdx?: number }) => {
  const pathname = usePathname();
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around',
      padding: '8px 0 2px', borderTop: `1px solid ${T.border}`,
      background: '#fff', flexShrink: 0,
    }}>
      {NAV_TABS.map((t, i) => {
        const isActive = activeIdx !== undefined ? i === activeIdx
          : pathname?.startsWith(t.href.replace('/mama', ''));
        return (
          <Link key={t.label} href={t.href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '4px 12px', borderRadius: 12,
              background: isActive ? `${T.mustDo}12` : 'transparent', minWidth: 56,
            }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, color: isActive ? T.mustDo : T.text3 }}>{t.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export const FAB = ({ onClick, icon = '＋' }: { onClick?: () => void; icon?: string }) => (
  <div
    onClick={onClick}
    style={{
      position: 'absolute', bottom: 72, right: 16,
      width: 48, height: 48, borderRadius: '50%',
      background: T.mustDo,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: 24, fontWeight: 300,
      boxShadow: `0 4px 16px ${T.mustDo}60`,
      cursor: 'pointer', zIndex: 10,
    }}
  >{icon}</div>
);

// Mobile shell wrapper — simulates the 375px phone frame
export const MobileShell = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    minHeight: '100vh',
    background: '#1a1612',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '0',
  }}>
    <div style={{
      width: '100%',
      maxWidth: 430,
      minHeight: '100vh',
      background: T.bg,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {children}
    </div>
  </div>
);
