'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { ChevronDown, Settings, LogOut, User, HandCoins } from 'lucide-react';
import { AccessibilityPanel } from './AccessibilityPanel';

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
  currentCampaignId?: string;
}

export function Header({ userName, userImage, campaigns, currentCampaignId }: HeaderProps) {
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const campaignRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const currentCampaign = campaigns.find((c) => c.id === currentCampaignId);

  const closeAll = useCallback(() => {
    setCampaignOpen(false);
    setProfileOpen(false);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (campaignRef.current && !campaignRef.current.contains(e.target as Node)) {
        setCampaignOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeAll();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeAll]);

  return (
    <header className="sticky top-0 z-40 bg-app/90 backdrop-blur-md border-b border-border">
      <div className="max-w-[1200px] mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/campaigns"
            className="flex items-center gap-2 text-text-primary hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded-md"
          >
            {currentCampaign?.logoUrl ? (
              <img src={currentCampaign.logoUrl} alt="" className="size-7 rounded-md object-contain" />
            ) : (
              <HandCoins size={20} className="text-primary" aria-hidden="true" />
            )}
            <span className="text-sm font-bold hidden md:inline">
              {currentCampaign?.orgName || 'Gestor de Contribuições'}
            </span>
          </Link>

          {/* Seletor de campanha — só aparece se 2+ */}
          {campaigns.length >= 2 && (
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
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <AccessibilityPanel />

          {/* Settings — só se tem campanha atual */}
          {currentCampaignId && (
            <Link
              href={`/campaigns/${currentCampaignId}/settings`}
              className="size-10 inline-flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors duration-200 hidden md:inline-flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Configurações da campanha"
            >
              <Settings size={18} aria-hidden="true" />
            </Link>
          )}

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
                <img src={userImage} alt="" referrerPolicy="no-referrer" className="size-8 rounded-full ring-2 ring-border" />
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
                {currentCampaignId && (
                  <Link
                    href={`/campaigns/${currentCampaignId}/settings`}
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors rounded-lg md:hidden"
                  >
                    <Settings size={16} aria-hidden="true" />
                    Configurações
                  </Link>
                )}
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
