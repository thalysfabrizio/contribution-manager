'use client';

import { useState, useRef } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronDown, LogOut, User, HandCoins, FileText, Shield, UserCog, Plus } from 'lucide-react';
import { AccessibilityPanel } from './AccessibilityPanel';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useEscape } from '@/hooks/useEscape';

interface Campaign {
  id: string;
  name: string;
  orgName?: string | null;
  logoUrl?: string | null;
  accentColor?: string | null;
}

interface HeaderProps {
  userName: string | null;
  userImage: string | null;
  campaigns: Campaign[];
}

export function Header({ userName, userImage, campaigns }: HeaderProps) {
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const campaignRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const currentCampaignId = pathname?.match(/^\/campaigns\/([^/]+)/)?.[1];
  const currentCampaign = campaigns.find((c) => c.id === currentCampaignId);

  const anyOpen = campaignOpen || profileOpen;
  useClickOutside(campaignRef, () => setCampaignOpen(false), campaignOpen);
  useClickOutside(profileRef, () => setProfileOpen(false), profileOpen);
  useEscape(() => {
    setCampaignOpen(false);
    setProfileOpen(false);
  }, anyOpen);

  return (
    <header className="sticky top-0 z-40 bg-app/90 backdrop-blur-md border-b border-border">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/campaigns"
            className="flex items-center gap-2 text-text-primary hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-md"
          >
            {currentCampaign?.logoUrl ? (
              <Image
                src={currentCampaign.logoUrl}
                alt=""
                width={28}
                height={28}
                className="rounded-md object-contain"
                unoptimized
              />
            ) : (
              <HandCoins size={20} className="text-primary" aria-hidden="true" />
            )}
            <span className="text-sm font-bold hidden md:inline">
              {currentCampaign?.orgName || 'Gestor de Contribuições'}
            </span>
          </Link>

          {/* Seletor de campanha — aparece com 1+ para dar acesso a "Nova campanha" */}
          {campaigns.length >= 1 && (
            <div ref={campaignRef} className="relative">
              <button
                onClick={() => {
                  setCampaignOpen(!campaignOpen);
                  setProfileOpen(false);
                }}
                aria-expanded={campaignOpen}
                aria-haspopup="true"
                className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary min-h-[44px] px-3 rounded-lg hover:bg-card-hover transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="max-w-[150px] md:max-w-[200px] truncate">
                  {currentCampaign?.name || 'Selecionar'}
                </span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 transition-transform duration-200 ${campaignOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
              {campaignOpen && (
                <div
                  className="absolute top-full left-0 mt-1.5 w-64 bg-card border border-border rounded-xl shadow-xl p-1.5 animate-slide-down"
                  role="menu"
                >
                  {campaigns.map((c) => (
                    <Link
                      key={c.id}
                      href={`/campaigns/${c.id}`}
                      role="menuitem"
                      onClick={() => setCampaignOpen(false)}
                      className={`block px-3 py-2.5 text-sm transition-colors rounded-lg ${
                        c.id === currentCampaignId
                          ? 'text-primary bg-primary/10 font-medium'
                          : 'text-text-secondary hover:text-text-primary hover:bg-card-hover'
                      }`}
                    >
                      {c.name}
                    </Link>
                  ))}
                  <div className="h-px bg-border my-1" role="separator" />
                  <Link
                    href="/campaigns/new"
                    role="menuitem"
                    onClick={() => setCampaignOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-primary hover:bg-primary/10 transition-colors rounded-lg"
                  >
                    <Plus size={16} aria-hidden="true" />
                    Nova campanha
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <AccessibilityPanel />

          {/* Perfil */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setCampaignOpen(false);
              }}
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label="Menu do usuário"
              className="flex items-center gap-2 min-h-[44px] px-2 rounded-lg hover:bg-card-hover transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {userImage ? (
                <Image
                  src={userImage}
                  alt=""
                  width={32}
                  height={32}
                  referrerPolicy="no-referrer"
                  className="rounded-full ring-2 ring-border"
                  unoptimized
                />
              ) : (
                <div className="size-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <User size={16} className="text-primary" aria-hidden="true" />
                </div>
              )}
              <span className="text-sm text-text-secondary hidden md:block max-w-[120px] truncate">
                {userName || 'Usuário'}
              </span>
            </button>
            {profileOpen && (
              <div
                className="absolute top-full right-0 mt-1.5 w-52 bg-card border border-border rounded-xl shadow-xl p-1.5 animate-slide-down"
                role="menu"
              >
                <div className="px-3 py-2.5 text-xs text-text-muted border-b border-border mb-1">
                  {userName || 'Usuário'}
                </div>
                <Link
                  href="/settings/account"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors rounded-lg"
                >
                  <UserCog size={16} aria-hidden="true" />
                  Minha conta
                </Link>
                <Link
                  href="/legal/privacy"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors rounded-lg"
                >
                  <Shield size={16} aria-hidden="true" />
                  Política de Privacidade
                </Link>
                <Link
                  href="/legal/terms"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors rounded-lg"
                >
                  <FileText size={16} aria-hidden="true" />
                  Termos de Uso
                </Link>
                <div className="h-px bg-border my-1" role="separator" />
                <button
                  role="menuitem"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-danger hover:bg-danger-bg transition-colors rounded-lg cursor-pointer"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
