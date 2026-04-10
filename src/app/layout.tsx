import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Contribution Manager',
  description: 'Gerencie contribuições financeiras de forma simples e organizada.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} font-[family-name:var(--font-geist-sans)]`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
