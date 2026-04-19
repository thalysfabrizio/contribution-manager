'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const campaignId = pathname?.match(/^\/campaigns\/([^/]+)/)?.[1];

  if (!campaignId || campaignId === 'new') return null;

  const items = [
    {
      label: 'Dashboard',
      href: `/campaigns/${campaignId}`,
      icon: LayoutDashboard,
      active: pathname === `/campaigns/${campaignId}`,
    },
    {
      label: 'Config',
      href: `/campaigns/${campaignId}/settings`,
      icon: Settings,
      active: pathname === `/campaigns/${campaignId}/settings`,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-center gap-16 h-16">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] rounded-xl px-4 py-1.5 transition-all duration-200 ${
              item.active
                ? 'text-primary bg-primary/10'
                : 'text-text-muted hover:text-text-primary'
            }`}
            aria-current={item.active ? 'page' : undefined}
          >
            <item.icon size={22} aria-hidden="true" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
