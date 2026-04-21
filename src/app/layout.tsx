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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('a11y-theme');if(t==='light')document.documentElement.classList.add('light');var f=localStorage.getItem('a11y-fontsize');if(f==='large')document.documentElement.classList.add('font-large');if(f==='xl')document.documentElement.classList.add('font-xl');}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} font-[family-name:var(--font-geist-sans)]`}>
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-[100] focus-visible:bg-primary focus-visible:text-primary-fg focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-lg focus-visible:font-medium"
        >
          Pular para o conteúdo
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
