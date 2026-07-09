const WORDS = ['Hola','Bonjour','你好','こんにちは','مرحبا','Привет','Olá','안녕','Ciao','Hallo','Merhaba','नमस्ते','Xin chào','Hej','Cześć','Hello','Sawubona','Aloha'];
const POSITIONS = WORDS.map(() => ({ left: Math.random() * 86 + 4, top: Math.random() * 86 + 4, size: Math.random() * 1.1 + 0.6, dur: 20 + Math.random() * 18, delay: Math.random() * -28, rotate: Math.random() * 24 - 12 }));

export default function BackgroundMesh() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute rounded-full" style={{ width: '500px', height: '500px', top: '-12%', right: '-8%', background: 'radial-gradient(circle, var(--accent-dim), transparent 65%)', filter: 'blur(90px)' }} />
      <div className="absolute rounded-full" style={{ width: '400px', height: '400px', bottom: '-6%', left: '-6%', background: 'radial-gradient(circle, var(--accent-dim), transparent 65%)', filter: 'blur(90px)', opacity: 0.5 }} />
      {WORDS.map((word, i) => (
        <span key={word} className="absolute font-display font-light select-none" style={{ left: POSITIONS[i].left + '%', top: POSITIONS[i].top + '%', fontSize: POSITIONS[i].size + 'rem', color: 'var(--text-muted)', opacity: 0.04, animation: 'floatWord ' + POSITIONS[i].dur + 's ease-in-out infinite', animationDelay: POSITIONS[i].delay + 's', transform: 'rotate(' + POSITIONS[i].rotate + 'deg)' }}>{word}</span>
      ))}
    </div>
  );
}