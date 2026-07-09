import { useState, useEffect, useRef, useMemo } from 'react';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../hooks/useTheme';

const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' }, { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' }, { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' }, { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' }, { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' }, { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' }, { code: 'sv', name: 'Swedish' },
  { code: 'th', name: 'Thai' }, { code: 'vi', name: 'Vietnamese' },
  { code: 'id', name: 'Indonesian' }, { code: 'uk', name: 'Ukrainian' },
  { code: 'ro', name: 'Romanian' }, { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' }, { code: 'fi', name: 'Finnish' },
  { code: 'el', name: 'Greek' }, { code: 'hu', name: 'Hungarian' },
  { code: 'no', name: 'Norwegian' }, { code: 'ms', name: 'Malay' },
  { code: 'he', name: 'Hebrew' }, { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' }, { code: 'te', name: 'Telugu' },
  { code: 'ur', name: 'Urdu' }, { code: 'sw', name: 'Swahili' },
];

const QUICK_LANGS = [
  { code: 'hi', flag: '🇮🇳', label: 'Hindi' },
  { code: 'es', flag: '🇪🇸', label: 'Spanish' },
  { code: 'fr', flag: '🇫🇷', label: 'French' },
  { code: 'de', flag: '🇩🇪', label: 'German' },
  { code: 'ja', flag: '🇯🇵', label: 'Japanese' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ko', flag: '🇰🇷', label: 'Korean' },
  { code: 'ar', flag: '🇸🇦', label: 'Arabic' },
];

const LANG_NAMES = {
  en:'English',es:'Spanish',fr:'French',de:'German',it:'Italian',
  pt:'Portuguese',ru:'Russian',zh:'Chinese',ja:'Japanese',ko:'Korean',
  ar:'Arabic',hi:'Hindi',tr:'Turkish',pl:'Polish',nl:'Dutch',
  sv:'Swedish',th:'Thai',vi:'Vietnamese',id:'Indonesian',uk:'Ukrainian',
  ro:'Romanian',cs:'Czech',da:'Danish',fi:'Finnish',el:'Greek',
  hu:'Hungarian',no:'Norwegian',ms:'Malay',he:'Hebrew',bn:'Bengali',
  ta:'Tamil',te:'Telugu',ur:'Urdu',sw:'Swahili',
};

const SPEECH_CODES = {
  en:'en-US',es:'es-ES',fr:'fr-FR',de:'de-DE',it:'it-IT',
  pt:'pt-PT',ru:'ru-RU',zh:'zh-CN',ja:'ja-JP',ko:'ko-KR',
  ar:'ar-SA',hi:'hi-IN',tr:'tr-TR',pl:'pl-PL',nl:'nl-NL',
  sv:'sv-SE',th:'th-TH',vi:'vi-VN',id:'id-ID',uk:'uk-UA',
  ro:'ro-RO',cs:'cs-CZ',da:'da-DK',fi:'fi-FI',el:'el-GR',
  hu:'hu-HU',no:'no-NO',ms:'ms-MY',he:'he-IL',bn:'bn-IN',
  ta:'ta-IN',te:'te-IN',ur:'ur-PK',sw:'sw-TZ',
};

const MAX_CHARS = 5000;

export default function Translator() {
  const { mode } = useTheme();
  const toast = useToast();
  const btnRef = useRef(null);
  const inputRef = useRef(null);

  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [displayOutput, setDisplayOutput] = useState('');
  const [targetLang, setTargetLang] = useState('hi');
  const [detectedLang, setDetectedLang] = useState('');
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);
  const [swapSpin, setSwapSpin] = useState(false);
  const [speakingSrc, setSpeakingSrc] = useState(false);
  const [speakingTgt, setSpeakingTgt] = useState(false);
  const [glowOutput, setGlowOutput] = useState(false);
  const [count, setCount] = useState(() =>
    parseInt(localStorage.getItem('tt-count') || '0', 10)
  );
  const [showCopied, setShowCopied] = useState(null);
  const [focusedPanel, setFocusedPanel] = useState(null);
  const isDark = mode === 'dark';

  const isTyping =
    output.length > 0 &&
    output.length <= 400 &&
    displayOutput.length > 0 &&
    displayOutput.length < output.length;

  useEffect(() => {
    if (!output) return;
    let intervalId;
    const timeoutId = setTimeout(() => {
      if (output.length > 400) {
        setDisplayOutput(output);
      } else {
        let i = 0;
        intervalId = setInterval(() => {
          i++;
          if (i <= output.length) setDisplayOutput(output.slice(0, i));
          else clearInterval(intervalId);
        }, 15);
      }
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [output]);

  async function handleTranslate() {
    const text = input.trim();
    if (!text) { toast('Type something to translate', 'error'); return; }
    if (text.length > MAX_CHARS) { toast('Text too long. Max 5000 characters.', 'error'); return; }
    setLoading(true);
    setOutput('');
    setDisplayOutput('');
    setGlowOutput(false);
    try {
      const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
      const cleaned = sentences.map((s) => s.trim()).filter(Boolean);
      let translated = '';
      if (cleaned.length <= 1) {
        const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=autodetect|' + targetLang + '&de=texttranslator@example.com';
        const res = await fetch(url);
        const data = await res.json();
        if (data.responseStatus === 200 && data.responseData) {
          translated = data.responseData.translatedText;
          setDetectedLang(data.responseData.detectedLanguage || '');
        } else { toast('Translation failed. Try different text.', 'error'); setLoading(false); return; }
      } else {
        const results = await Promise.all(
          cleaned.map((s) =>
            fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(s) + '&langpair=autodetect|' + targetLang + '&de=texttranslator@example.com').then((r) => r.json())
          )
        );
        if (results[0]?.responseData?.detectedLanguage) setDetectedLang(results[0].responseData.detectedLanguage);
        translated = results.map((r, i) => r.responseData?.translatedText || cleaned[i]).join(' ');
      }
      setOutput(translated);
      setGlowOutput(true);
      setTimeout(() => setGlowOutput(false), 2500);
      setCount((c) => { const n = c + 1; localStorage.setItem('tt-count', String(n)); return n; });
      setRecent((prev) => [{ id: Date.now(), input: text.slice(0, 120), output: translated.slice(0, 120), from: LANG_NAMES[detectedLang] || 'Detected', to: LANG_NAMES[targetLang] || targetLang }, ...prev].slice(0, 10));
      toast('Translated successfully', 'success');
    } catch { toast('Network error. Check your internet.', 'error'); }
    setLoading(false);
  }

  function handleClickTranslate(e) {
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 2.5;
      ripple.style.width = size + 'px';
      ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      ripple.className = 'ripple-span';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    }
    handleTranslate();
  }

  function handleSwap() {
    setSwapSpin(true);
    setTimeout(() => setSwapSpin(false), 600);
    if (!output) return;
    const fromCode = detectedLang || 'en';
    if (LANGUAGES.find((l) => l.code === fromCode)) setTargetLang(fromCode);
    setInput(output);
    setOutput('');
    setDisplayOutput('');
    setDetectedLang(targetLang);
  }

  function handleCopy(text, id) {
    navigator.clipboard.writeText(text).then(() => {
      toast('Copied to clipboard', 'success');
      setShowCopied(id);
      setTimeout(() => setShowCopied(null), 1500);
    });
  }

  function speak(text, lang, side) {
    if (!text) return;
    if ((side === 'src' && speakingSrc) || (side === 'tgt' && speakingTgt)) {
      speechSynthesis.cancel(); setSpeakingSrc(false); setSpeakingTgt(false); return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = SPEECH_CODES[lang] || 'en-US';
    u.rate = 0.9;
    u.onend = () => { if (side === 'src') setSpeakingSrc(false); if (side === 'tgt') setSpeakingTgt(false); };
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    if (side === 'src') setSpeakingSrc(true);
    if (side === 'tgt') setSpeakingTgt(true);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); handleTranslate(); }
  }

  const charPercent = (input.length / MAX_CHARS) * 100;
  const isOverLimit = input.length > MAX_CHARS;
  const detectedName = useMemo(() => LANG_NAMES[detectedLang] || detectedLang?.toUpperCase() || '', [detectedLang]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* Header */}
      <div className="text-center mb-14 animate-fade-up">
        <div className="inline-flex items-center gap-3 mb-6 px-5 py-2 rounded-full"
          style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-dim)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)', animation: 'glowBreathe 2s ease-in-out infinite' }}></div>
          <span className="text-xs font-display font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Break language barriers</span>
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)', animation: 'glowBreathe 2s ease-in-out infinite', animationDelay: '1s' }}></div>
        </div>
        <h1 className="font-display font-bold leading-tight mb-5" style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)' }}>
          <span className="text-transparent bg-clip-text animated-gradient-text" style={{ backgroundImage: 'var(--gradient-text)' }}>Translate</span>
          <br />
          <span className="font-light" style={{ color: 'var(--text-primary)' }}>Anything, Anywhere</span>
        </h1>
        <p className="text-base sm:text-lg max-w-md mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          35+ languages, auto-detection, text-to-speech — all free.
        </p>
        {count > 0 && (
          <div className="inline-flex items-center gap-3 mt-6 px-5 py-2.5 rounded-2xl animate-pop" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <i className="fas fa-fire text-sm" style={{ color: 'var(--accent)' }}></i>
            <span className="text-sm font-display"><span className="font-bold" style={{ color: 'var(--accent)' }}>{count}</span><span style={{ color: 'var(--text-muted)' }}> translations</span></span>
          </div>
        )}
      </div>

      {/* Main Panel */}
      <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="h-1 rounded-t-2xl" style={{ background: 'var(--gradient)' }}></div>
        <div className="rounded-b-2xl overflow-hidden" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderTop: 'none' }}>

          {/* Language bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 sm:p-5" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-dim)' }}>
                <i className="fas fa-wand-magic-sparkles text-xs"></i>
                <span className="font-display font-medium">{detectedName || 'Auto-detect'}</span>
                {detectedName && (
                  <span className="text-[0.5rem] font-display font-bold px-2 py-0.5 rounded-md uppercase tracking-widest animate-pop" style={{ background: 'var(--accent)', color: isDark ? '#09090b' : '#fff' }}>Detected</span>
                )}
              </div>
            </div>
            <button onClick={handleSwap}
              className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer btn-press"
              style={{ background: 'var(--gradient)', color: '#fff', transform: swapSpin ? 'rotate(180deg)' : 'rotate(0deg)', boxShadow: '0 4px 24px var(--accent-glow)', transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease' }}
              title="Swap" aria-label="Swap">
              <i className="fas fa-arrow-right-arrow-left text-sm"></i>
            </button>
            <div className="flex-1">
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}
                className="c-select w-full px-4 py-2.5 rounded-xl text-sm cursor-pointer focus:outline-none"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', paddingRight: '2.4rem', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                aria-label="Target language">
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
          </div>

          {/* Quick pills */}
          <div className="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-3.5" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            <span className="text-[0.55rem] font-display font-bold uppercase tracking-widest mr-1" style={{ color: 'var(--text-muted)' }}>Quick</span>
            {QUICK_LANGS.map((l) => (
              <button key={l.code} onClick={() => setTargetLang(l.code)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer btn-press"
                style={{ background: targetLang === l.code ? 'var(--accent)' : 'var(--bg-elevated)', color: targetLang === l.code ? (isDark ? '#09090b' : '#fff') : 'var(--text-muted)', border: '1px solid ' + (targetLang === l.code ? 'var(--accent)' : 'var(--border)'), boxShadow: targetLang === l.code ? '0 2px 16px var(--accent-glow)' : 'none', transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)' }}>
                <span className="text-sm leading-none">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>

          {/* Text areas */}
          <div className="grid md:grid-cols-2">
            {/* Input */}
            <div className="relative" style={{ borderRight: '1px solid var(--border)' }}>
              <textarea ref={inputRef}
                className="w-full p-6 text-[0.9rem] leading-relaxed resize-none focus:outline-none font-body textarea-glow"
                style={{ background: 'transparent', color: 'var(--text-primary)', minHeight: '300px', border: 'none', transition: 'box-shadow 0.3s ease' }}
                placeholder="Type or paste anything here..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                onFocus={() => setFocusedPanel('input')} onBlur={() => setFocusedPanel(null)} aria-label="Input text" />
              <div className="absolute bottom-9 left-0 right-0 flex items-center justify-between px-6">
                <span className={'text-xs font-display ' + (isOverLimit ? 'font-semibold' : '')} style={{ color: isOverLimit ? '#ef4444' : 'var(--text-muted)', transition: 'color 0.2s' }}>{input.length} / {MAX_CHARS}</span>
                <div className="flex gap-2">
                  {input && (
                    <button onClick={() => speak(input, detectedLang || 'en', 'src')}
                      className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer btn-press icon-hover-spin"
                      style={{ background: speakingSrc ? 'var(--accent-dim)' : 'var(--bg-elevated)', color: speakingSrc ? 'var(--accent)' : 'var(--text-muted)', border: '1px solid ' + (speakingSrc ? 'var(--accent)' : 'var(--border)'), transition: 'all 0.25s ease' }}
                      title="Listen" aria-label="Listen"><i className={'fas ' + (speakingSrc ? 'fa-stop' : 'fa-volume-high') + ' text-xs'}></i></button>
                  )}
                  {input && (
                    <button onClick={() => { setInput(''); setOutput(''); setDisplayOutput(''); setDetectedLang(''); }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer btn-press icon-hover-spin"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)', transition: 'all 0.25s ease' }}
                      title="Clear" aria-label="Clear"><i className="fas fa-xmark text-xs"></i></button>
                  )}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'var(--border)' }}>
                <div className="h-full transition-all duration-500 ease-out" style={{ width: Math.min(charPercent, 100) + '%', background: isOverLimit ? '#ef4444' : charPercent > 50 ? 'var(--accent)' : 'transparent', boxShadow: charPercent > 50 && !isOverLimit ? '0 0 10px var(--accent-glow)' : 'none' }} />
              </div>
              <div className="absolute top-0 left-0 w-0.5 h-full transition-all duration-300 ease-out" style={{ background: 'var(--accent)', opacity: focusedPanel === 'input' ? 1 : 0, boxShadow: focusedPanel === 'input' ? '0 0 16px var(--accent-glow)' : 'none' }} />
            </div>

            {/* Output */}
            <div className="relative" style={{ border: glowOutput ? '1px solid var(--accent)' : '1px solid transparent', boxShadow: glowOutput ? '0 0 50px var(--accent-glow), inset 0 0 50px var(--accent-dim)' : 'none', transition: 'border-color 0.4s ease, box-shadow 0.4s ease' }}>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-5">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)', animation: 'spinSlow 0.8s linear infinite' }}></div>
                      <div className="absolute inset-2 rounded-full border-2" style={{ borderColor: 'transparent', borderBottomColor: 'var(--accent-light)', animation: 'spinSlow 1.2s linear infinite reverse' }}></div>
                    </div>
                    <span className="text-xs font-display font-medium" style={{ color: 'var(--text-muted)' }}>Translating...</span>
                  </div>
                </div>
              )}
              {!displayOutput && !loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center animate-float" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                      <i className="fas fa-language text-3xl" style={{ color: 'var(--text-muted)', opacity: 0.2 }}></i>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1 h-1 rounded-full" style={{ background: 'var(--accent)', opacity: 0.3, animation: 'dotPulse 1.5s ease-in-out infinite', animationDelay: i * 0.2 + 's' }}></div>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.35 }}>Translation appears here</span>
                </div>
              )}
              <div className="w-full p-6 text-[0.9rem] leading-relaxed font-body" style={{ color: displayOutput ? 'var(--text-primary)' : 'transparent', minHeight: '300px' }}>
                {displayOutput}
                {isTyping && <span className="inline-block w-0.5 h-5 ml-0.5 align-middle cursor-blink rounded-full" style={{ background: 'var(--accent)' }} />}
              </div>
              {displayOutput && !loading && (
                <div className="absolute bottom-9 left-0 right-0 flex items-center justify-between px-6">
                  <span className="text-xs font-display" style={{ color: 'var(--text-muted)' }}>{displayOutput.length} chars</span>
                  <div className="flex gap-2">
                    <button onClick={() => speak(displayOutput, targetLang, 'tgt')}
                      className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer btn-press icon-hover-spin"
                      style={{ background: speakingTgt ? 'var(--accent-dim)' : 'var(--bg-elevated)', color: speakingTgt ? 'var(--accent)' : 'var(--text-muted)', border: '1px solid ' + (speakingTgt ? 'var(--accent)' : 'var(--border)'), transition: 'all 0.25s ease' }}
                      title="Listen" aria-label="Listen"><i className={'fas ' + (speakingTgt ? 'fa-stop' : 'fa-volume-high') + ' text-xs'}></i></button>
                    <button onClick={() => handleCopy(displayOutput, 'output')}
                      className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer btn-press"
                      style={{ background: showCopied === 'output' ? 'var(--accent-dim)' : 'var(--bg-elevated)', color: showCopied === 'output' ? 'var(--accent)' : 'var(--text-muted)', border: '1px solid var(--border)', transition: 'all 0.25s ease' }}
                      title="Copy" aria-label="Copy"><i className={'fas ' + (showCopied === 'output' ? 'fa-check' : 'fa-copy') + ' text-xs'}></i></button>
                  </div>
                </div>
              )}
              <div className="absolute top-0 left-0 w-0.5 h-full transition-all duration-300 ease-out" style={{ background: 'var(--accent)', opacity: focusedPanel === 'output' ? 1 : 0, boxShadow: focusedPanel === 'output' ? '0 0 16px var(--accent-glow)' : 'none' }} />
            </div>
          </div>

          {/* Button */}
          <div className="flex items-center justify-between p-4 sm:p-5" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            <div className="items-center gap-2 hidden sm:flex">
              <kbd className="px-2.5 py-1 rounded-lg text-[0.65rem] font-display font-medium" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Ctrl</kbd>
              <span className="text-[0.65rem]" style={{ color: 'var(--text-muted)' }}>+</span>
              <kbd className="px-2.5 py-1 rounded-lg text-[0.65rem] font-display font-medium" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Enter</kbd>
            </div>
            <button ref={btnRef} onClick={handleClickTranslate}
              disabled={loading || !input.trim() || isOverLimit}
              className="px-14 py-3.5 rounded-2xl font-display font-bold text-sm tracking-wide cursor-pointer btn-press disabled:opacity-20 disabled:cursor-not-allowed disabled:transform-none"
              style={{ background: 'var(--gradient)', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 6px 30px var(--accent-glow)', transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease, opacity 0.2s', letterSpacing: '0.08em' }}>
              <i className={'fas ' + (loading ? 'fa-spinner fa-spin' : 'fa-paper-plane') + ' mr-3'}></i>TRANSLATE
            </button>
            <span className="text-[0.7rem] font-display hidden sm:block" style={{ color: 'var(--text-muted)' }}>35+ langs</span>
          </div>
        </div>
        <div className="h-1 rounded-b-2xl" style={{ background: 'var(--gradient)', opacity: 0.3 }}></div>
      </div>

      {/* Recent */}
      {recent.length > 0 && (
        <div className="mt-14 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-base flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-dim)' }}>
                <i className="fas fa-clock-rotate-left text-xs" style={{ color: 'var(--accent)' }}></i>
              </div>
              Recent Translations
            </h2>
            <button onClick={() => setRecent([])}
              className="text-xs font-medium cursor-pointer bg-transparent border-none"
              style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.target.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}>Clear All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {recent.map((item, idx) => (
              <div key={item.id}
                className="flex-shrink-0 w-72 p-4 rounded-2xl cursor-pointer card-lift animate-slide-right"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', animationDelay: idx * 0.06 + 's' }}
                onClick={() => { setInput(item.input); setOutput(''); setDisplayOutput(''); setDetectedLang(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[0.5rem] font-display font-bold px-2 py-0.5 rounded-md uppercase tracking-widest" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{item.from} → {item.to}</span>
                </div>
                <div className="text-xs mb-1.5 truncate" style={{ color: 'var(--text-primary)' }}>{item.input}</div>
                <div className="flex items-center gap-2 mb-1.5">
                  <i className="fas fa-arrow-down text-[0.4rem]" style={{ color: 'var(--accent)', opacity: 0.5 }}></i>
                </div>
                <div className="text-xs truncate mb-3" style={{ color: 'var(--text-secondary)' }}>{item.output}</div>
                <button onClick={(e) => { e.stopPropagation(); handleCopy(item.output, item.id); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer btn-press"
                  style={{ background: showCopied === item.id ? 'var(--accent-dim)' : 'var(--bg-elevated)', color: showCopied === item.id ? 'var(--accent)' : 'var(--text-muted)', border: '1px solid var(--border)', transition: 'all 0.25s ease' }}
                  aria-label="Copy"><i className={'fas ' + (showCopied === item.id ? 'fa-check' : 'fa-copy')} style={{ fontSize: '0.5rem' }}></i></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}