import type { Metadata } from 'next';
import { Nunito, DM_Sans } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FamilyAffairs — Семейният организатор',
  description: 'Семеен календар, задачи и точки за цялото семейство',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg" className={`${nunito.variable} ${dmSans.variable}`}>
      <body style={{ fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)' }}>
        {children}
      </body>
    </html>
  );
}
