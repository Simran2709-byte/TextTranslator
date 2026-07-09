import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center">
      <div className="font-display font-bold mb-4 animate-float" style={{ fontSize: '7rem', lineHeight: 1, color: 'var(--accent)', opacity: 0.15, textShadow: '0 0 60px var(--accent-glow)' }}>404</div>
      <h1 className="font-display font-semibold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Page Not Found</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-display font-semibold text-sm no-underline btn-press" style={{ background: 'var(--gradient)', color: '#fff', boxShadow: '0 4px 20px var(--accent-glow)' }}>
        <i className="fas fa-house text-xs"></i> Back to Home
      </Link>
    </div>
  );
}