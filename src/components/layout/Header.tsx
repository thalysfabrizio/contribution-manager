'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { ChevronDown, Settings, LogOut, User } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (campaignRef.current && !campaignRef.current.contains(e.target as Node)) {
        setCampaignOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-app/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/campaigns" className="text-base font-bold text-text-primary hover:text-primary transition-colors">
            Contribution Manager
          </Link>

          {/* Seletor de campanha — só aparece se 2+ */}
          {campaigns.length >= 2 && (
            <div ref={campaignRef} className="relative">
              <button
                onClick={() => setCampaignOpen(!campaignOpen)}
                className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary px-2 py-1 rounded-md hover:bg-card-hover transition-all duration-200"
              >
                {currentCampaign?.name || 'Selecionar'}
                <ChevronDown size={14} className={`transition-transform ${campaignOpen ? 'rotate-180' : ''}`} />
              </button>
              {campaignOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-lg py-1 animate-in">
                  {campaigns.map((c) => (
                    <Link
                      key={c.id}
                      href={`/campaigns/${c.id}`}
                      onClick={() => setCampaignOpen(false)}
                      className={`block px-3 py-2 text-sm transition-colors ${
                        c.id === currentCampaignId
                          ? 'text-primary bg-primary/5'
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

        <div className="flex items-center gap-2">
          {/* Settings — só se tem campanha atual */}
          {currentCampaignId && (
            <Link
              href={`/campaigns/${currentCampaignId}/settings`}
              className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-card-hover transition-all duration-200 hidden md:flex"
              aria-label="Configurações da campanha"
            >
              <Settings size={18} />
            </Link>
          )}

          {/* Perfil */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 rounded-md hover:bg-card-hover transition-all duration-200"
            >
              {userImage ? (
                <img src={userImage} alt="" className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <User size={14} className="text-primary" />
                </div>
              )}
              <span className="text-sm text-text-secondary hidden md:block">
                {userName || 'Usuário'}
              </span>
            </button>
            {profileOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg py-1 animate-in">
                <div className="px-3 py-2 text-xs text-text-muted border-b border-border">
                  {userName || 'Usuário'}
                </div>
                {currentCampaignId && (
                  <Link
                    href={`/campaigns/${currentCampaignId}/settings`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors md:hidden"
                  >
                    <Settings size={14} />
                    Configurações
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger-bg transition-colors"
                >
                  <LogOut size={14} />
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
