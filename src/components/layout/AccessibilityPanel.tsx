'use client';

import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Type, Eye } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useEscape } from '@/hooks/useEscape';

type FontSize = 'normal' | 'large' | 'xl';
type Theme = 'dark' | 'light';

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const val = localStorage.getItem(key);
  return val ? (val as T) : fallback;
}

export function AccessibilityPanel() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage on mount; lazy init would break SSR hydration
    setTheme(getStored<Theme>('a11y-theme', 'dark'));
    setFontSize(getStored<FontSize>('a11y-fontsize', 'normal'));
    setReducedMotion(localStorage.getItem('a11y-motion') === 'true');
    setHydrated(true);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('light', theme === 'light');
    if (hydrated) localStorage.setItem('a11y-theme', theme);
  }, [theme, hydrated]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('font-large', 'font-xl');
    if (fontSize === 'large') html.classList.add('font-large');
    if (fontSize === 'xl') html.classList.add('font-xl');
    if (hydrated) localStorage.setItem('a11y-fontsize', fontSize);
  }, [fontSize, hydrated]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--user-reduced-motion',
      reducedMotion ? 'reduce' : 'no-preference',
    );
    if (hydrated) localStorage.setItem('a11y-motion', String(reducedMotion));
  }, [reducedMotion, hydrated]);

  useClickOutside(wrapperRef, () => setOpen(false), open);
  useEscape(() => setOpen(false), open);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="size-10 inline-flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-card-hover transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label="Opcoes de acessibilidade"
        aria-expanded={open}
      >
        <Eye size={18} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-64 bg-card border border-border rounded-xl shadow-xl p-4 z-50 animate-slide-down space-y-4">
          <p className="text-sm font-semibold text-text-primary">Acessibilidade</p>

          {/* Tema */}
          <div className="space-y-1.5">
            <label className="text-sm text-text-secondary">Tema</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-1.5 min-h-[40px] rounded-lg text-sm font-medium transition-all ${
                  theme === 'dark' ? 'bg-primary text-primary-fg' : 'bg-card-hover text-text-secondary hover:text-text-primary'
                }`}
              >
                <Moon size={14} aria-hidden="true" />
                Escuro
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-1.5 min-h-[40px] rounded-lg text-sm font-medium transition-all ${
                  theme === 'light' ? 'bg-primary text-primary-fg' : 'bg-card-hover text-text-secondary hover:text-text-primary'
                }`}
              >
                <Sun size={14} aria-hidden="true" />
                Claro
              </button>
            </div>
          </div>

          {/* Tamanho da fonte */}
          <div className="space-y-1.5">
            <label className="text-sm text-text-secondary flex items-center gap-1.5">
              <Type size={14} aria-hidden="true" />
              Tamanho da fonte
            </label>
            <div className="flex gap-1.5">
              {([
                { key: 'normal', label: 'A', title: 'Normal' },
                { key: 'large', label: 'A', title: 'Grande' },
                { key: 'xl', label: 'A', title: 'Extra Grande' },
              ] as const).map((opt, i) => (
                <button
                  key={opt.key}
                  onClick={() => setFontSize(opt.key)}
                  title={opt.title}
                  className={`flex-1 min-h-[40px] rounded-lg font-medium transition-all ${
                    fontSize === opt.key ? 'bg-primary text-primary-fg' : 'bg-card-hover text-text-secondary hover:text-text-primary'
                  }`}
                  style={{ fontSize: `${14 + i * 3}px` }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reduzir animações */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-text-secondary">Reduzir animacoes</span>
            <button
              role="switch"
              aria-checked={reducedMotion}
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                reducedMotion ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform duration-200 ${
                  reducedMotion ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </label>
        </div>
      )}
    </div>
  );
}
