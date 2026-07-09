import { useState, useCallback } from 'react';
import { ThemeContext } from './useTheme';

const ACCENTS = {
  ember: { accent: '#f97316', accentLight: '#fb923c', accentDim: 'rgba(249,115,22,0.12)', accentGlow: 'rgba(249,115,22,0.3)', gradient: 'linear-gradient(135deg, #f97316, #e11d48)', gradientText: 'linear-gradient(135deg, #fbbf24, #f97316, #e11d48)' },
  ocean: { accent: '#06b6d4', accentLight: '#22d3ee', accentDim: 'rgba(6,182,212,0.12)', accentGlow: 'rgba(6,182,212,0.3)', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)', gradientText: 'linear-gradient(135deg, #67e8f9, #06b6d4, #3b82f6)' },
  sakura: { accent: '#f43f5e', accentLight: '#fb7185', accentDim: 'rgba(244,63,94,0.12)', accentGlow: 'rgba(244,63,94,0.3)', gradient: 'linear-gradient(135deg, #f43f5e, #a855f7)', gradientText: 'linear-gradient(135deg, #fda4af, #f43f5e, #a855f7)' },
};
const DARK = { bgPrimary: '#09090b', bgSecondary: '#0f0f14', bgTertiary: '#141419', bgElevated: '#1a1a22', border: '#23232e', borderLight: '#2d2d3a', textPrimary: '#e2e8f0', textSecondary: '#94a3b8', textMuted: '#64748b' };
const LIGHT = { bgPrimary: '#f8fafc', bgSecondary: '#ffffff', bgTertiary: '#ffffff', bgElevated: '#f1f5f9', border: '#e2e8f0', borderLight: '#cbd5e1', textPrimary: '#0f172a', textSecondary: '#475569', textMuted: '#94a3b8' };

function apply(name, mode) {
  const root = document.documentElement;
  const a = ACCENTS[name];
  const c = mode === 'dark' ? DARK : LIGHT;
  root.style.setProperty('--accent', a.accent);
  root.style.setProperty('--accent-light', a.accentLight);
  root.style.setProperty('--accent-dim', a.accentDim);
  root.style.setProperty('--accent-glow', a.accentGlow);
  root.style.setProperty('--gradient', a.gradient);
  root.style.setProperty('--gradient-text', a.gradientText);
  root.style.setProperty('--bg-primary', c.bgPrimary);
  root.style.setProperty('--bg-secondary', c.bgSecondary);
  root.style.setProperty('--bg-tertiary', c.bgTertiary);
  root.style.setProperty('--bg-elevated', c.bgElevated);
  root.style.setProperty('--border', c.border);
  root.style.setProperty('--border-light', c.borderLight);
  root.style.setProperty('--text-primary', c.textPrimary);
  root.style.setProperty('--text-secondary', c.textSecondary);
  root.style.setProperty('--text-muted', c.textMuted);
  root.setAttribute('data-mode', mode);
}

const savedAccent = localStorage.getItem('tt-accent') || 'ember';
const savedMode = localStorage.getItem('tt-mode') || 'dark';
apply(savedAccent, savedMode);

export default function ThemeProvider({ children }) {
  const [accent, setAccent] = useState(savedAccent);
  const [mode, setMode] = useState(savedMode);
  const changeAccent = useCallback((n) => { setAccent(n); localStorage.setItem('tt-accent', n); apply(n, mode); }, [mode]);
  const toggleMode = useCallback(() => { const next = mode === 'dark' ? 'light' : 'dark'; setMode(next); localStorage.setItem('tt-mode', next); apply(accent, next); }, [accent, mode]);
  return (
    <ThemeContext.Provider value={{ accent, mode, changeAccent, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}