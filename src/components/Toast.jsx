import { useState, useCallback } from 'react';
import { ToastContext } from '../hooks/useToast';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type) => {
    type = type || 'success';
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id: id, msg: msg, type: type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, []);
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const colors = { success: '#10b981', error: '#ef4444', info: 'var(--accent)' };
  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-4 right-4 z-100 flex flex-col gap-2" style={{ pointerEvents: 'none' }}>
        {toasts.map((t) => (
          <div key={t.id} className="rounded-xl px-4 py-3 flex items-center gap-3 min-w-72 shadow-2xl" style={{ pointerEvents: 'auto', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderLeft: '3px solid ' + colors[t.type], animation: 'toastIn 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
            <i className={'fas ' + icons[t.type]} style={{ color: colors[t.type], fontSize: '1rem' }}></i>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}