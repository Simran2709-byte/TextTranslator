import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const ACCENT_OPTS = [
  { name: 'ember', color: '#f97316', glow: 'rgba(249,115,22,0.5)' },
  { name: 'ocean', color: '#06b6d4', glow: 'rgba(6,182,212,0.5)' },
  { name: 'sakura', color: '#f43f5e', glow: 'rgba(244,63,94,0.5)' },
];

export default function Navbar() {
  const { accent, mode, changeAccent, toggleMode } = useTheme();
  const [labelShow, setLabelShow] = useState(null);
  const isDark = mode === 'dark';

  return (
    <nav className="sticky top-0 z-50" style={{ borderBottom: '1px solid var(--border)', background: isDark ? 'rgba(9,9,11,0.75)' : 'rgba(248,250,252,0.75)', backdropFilter: 'blur(20px) saturate(1.4)', WebkitBackdropFilter: 'blur(20px) saturate(1.4)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={import.meta.env.BASE_URL + 'logo.png'} alt="Logo" className="h-9 w-auto object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}><span style={{ color: 'var(--accent)' }}>TRANSLIFY</span></span>
            <span className="text-[0.55rem] font-display tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>By Simran</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            {ACCENT_OPTS.map((opt) => (
              <div key={opt.name} className="relative">
                <button
                  onClick={() => changeAccent(opt.name)}
                  onMouseEnter={() => setLabelShow(opt.name)}
                  onMouseLeave={() => setLabelShow(null)}
                  className="w-5 h-5 rounded-full cursor-pointer btn-press"
                  style={{ background: opt.color, outline: accent === opt.name ? '2px solid var(--text-primary)' : '2px solid transparent', outlineOffset: '2px', transform: accent === opt.name ? 'scale(1.3)' : 'scale(1)', boxShadow: accent === opt.name ? '0 0 14px ' + opt.glow : 'none', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
                  aria-label={opt.name}
                />
                {labelShow === opt.name && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-[0.6rem] font-display font-bold uppercase tracking-wider whitespace-nowrap" style={{ background: 'var(--bg-primary)', color: 'var(--accent)', border: '1px solid var(--border)', animation: 'popIn 0.2s ease-out', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                    {opt.name}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="w-px h-6" style={{ background: 'var(--border)' }}></div>
          <button onClick={toggleMode} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer btn-press icon-hover-spin" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }} aria-label="Toggle theme">
            <i className={'fas ' + (mode === 'dark' ? 'fa-sun' : 'fa-moon') + ' text-sm'}></i>
          </button>
        </div>
      </div>
    </nav>
  );
}