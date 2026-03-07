import { useState, useEffect } from 'react';
import { Cpu, Terminal, ArrowRight, CheckCircle2, Gamepad2, Search, RefreshCw } from 'lucide-react';

export default function Factory() {
    const [news, setNews] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isFallback, setIsFallback] = useState(false);
    const [errorLog, setErrorLog] = useState('');
    const [status, setStatus] = useState('idle'); // idle -> building -> complete
    const [progress, setProgress] = useState(0);

    const SUGGESTED_TOPICS = [
        // Sports
        { label: '🏀 NBA 2026', query: 'NBA 2026 regular season', color: '#ff9a16' },
        { label: '🏎️ Formula 1', query: 'Formula 1 technical updates 2026', color: '#ff1e1e' },
        { label: '⚽ Champions League', query: 'UEFA Champions League 2026 results', color: '#58a6ff' },
        { label: '🏆 World Cup 2026', query: '2026 FIFA World Cup host cities and prep', color: '#2ea043' },
        { label: '🎾 Wimbledon', query: 'Wimbledon tennis championships 2026', color: '#f5e050' },
        { label: '🏈 NFL Draft', query: 'NFL Draft 2026 major picks', color: '#fbbf24' },
        { label: '⚾ MLB Season', query: 'MLB 2026 schedule and highlights', color: '#3b82f6' },
        { label: '🏒 NHL Playoffs', query: 'NHL Stanley Cup Playoffs 2026', color: '#6366f1' },
        { label: '⛳ The Masters', query: 'Masters Golf Tournament 2026', color: '#10b981' },
        { label: '🥊 Boxing News', query: 'Heavyweight boxing championships 2026', color: '#ef4444' },

        // Technology
        { label: '🤖 AI Evolution', query: 'OpenAI GPT-5 and Sora 2026 release', color: '#8b5cf6' },
        { label: '💻 Quantum Computing', query: 'Quantum supremacy milestones 2026', color: '#06b6d4' },
        { label: '📱 iPhone 18', query: 'Apple iPhone 18 rumors and design', color: '#64748b' },
        { label: '🕶️ Vision Pro', query: 'Apple Vision Pro 3 and spatial computing', color: '#ec4899' },
        { label: '🔒 Cyber Security', query: 'Zero-trust security trends 2026', color: '#f43f5e' },
        { label: '🔋 Battery Tech', query: 'Solid state battery breakthrough 2026', color: '#a855f7' },
        { label: '🌐 Web4.0', query: 'Decentralized internet developments 2026', color: '#312e81' },

        // Science & Space
        { label: '🚀 Mars Colony', query: 'SpaceX Starship Mars mission 2026', color: '#f97316' },
        { label: '🌙 Moon Base', query: 'NASA Artemis moon landing 2026', color: '#94a3b8' },
        { label: '🔭 Webb Discoveries', query: 'James Webb Telescope newest images 2026', color: '#fcd34d' },
        { label: '🧬 Gene Editing', query: 'CRISPR health breakthroughs 2026', color: '#22c55e' },
        { label: '☢️ Fusion Energy', query: 'Commercial nuclear fusion progress 2026', color: '#0ea5e9' },
        { label: '🌍 Climate Tech', query: 'Carbon capture innovation news 2026', color: '#059669' },

        // World & Lifestyle
        { label: '📉 Global Economy', query: 'Global market outlook 2026', color: '#d946ef' },
        { label: '🏦 Crypto Market', query: 'Bitcoin halving aftermath 2026', color: '#eab308' },
        { label: '🏙️ Smart Cities', query: 'AI driven urban planning 2026', color: '#4ade80' },
        { label: '🍣 Food Tech', query: 'Lab grown meat commercialization 2026', color: '#fb7185' },
        { label: '🎨 Digital Art', query: 'Generative AI art movement 2026', color: '#818cf8' },
        { label: '🎬 Movie Industry', query: 'Hollywood VR cinema trends 2026', color: '#f87171' },
        { label: '🎮 GTA VI', query: 'GTA VI game updates and leaks 2026', color: '#a78bfa' }
    ];

    const handleTopicClick = (query) => {
        setSearchQuery(query);
        // We create a temporary mock event to reuse handleSearch logic
        handleSearch({ preventDefault: () => { } }, query);
    };

    const handleSearch = async (e, overrideQuery = null) => {
        if (e) e.preventDefault();
        const queryToUse = overrideQuery || searchQuery;
        if (!queryToUse.trim()) return;

        console.log(`[NewsSearch] Initializing search for: "${queryToUse}"`);
        const startTime = performance.now();

        setIsSearching(true);
        setIsFallback(false);
        setErrorLog('');
        setSearchResult('');
        try {
            const apiPath = `/api/news_search?query=${encodeURIComponent(queryToUse)}`;
            console.log(`[NewsSearch] Requesting: ${apiPath}`);

            const response = await fetch(apiPath);
            const markdown = await response.text();

            const duration = ((performance.now() - startTime) / 1000).toFixed(2);
            console.log(`[NewsSearch] Response received in ${duration}s. Length: ${markdown.length} chars.`);

            if (markdown.includes('[NLP Fallback]') || markdown.includes('news_search_gemini_failure')) {
                console.warn('[NewsSearch] Warning: Result contains Fallback or Failure markers.');
                setIsFallback(true);

                // Extract specific error if present
                const errorMatch = markdown.match(/\*\*CRITICAL ERROR:\*\* (.*)/);
                if (errorMatch) {
                    setErrorLog(errorMatch[1]);
                } else if (markdown.includes('(Error:')) {
                    const inlineMatch = markdown.match(/\(Error: (.*?)\.\.\.\)/);
                    if (inlineMatch) setErrorLog(inlineMatch[1]);
                }
            } else {
                console.log('[NewsSearch] Success: Received AI synthesized report.');
                setIsFallback(false);
            }

            setSearchResult(markdown);
        } catch (err) {
            console.error('[NewsSearch] API Error:', err);
            alert('Failed to reach news search server. Make sure the Python server is running in /news_search.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        if (!news.trim()) return;

        setStatus('building');
        setProgress(0);

        // Simulate building steps
        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setStatus('complete'), 500);
                    return 100;
                }
                return p + Math.floor(Math.random() * 10) + 5;
            });
        }, 400);
    };

    const resetForm = () => {
        setNews('');
        setStatus('idle');
        setProgress(0);
    };

    return (
        <div style={{ padding: '48px', width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}><span className="text-gradient">Forge</span> a New Reality</h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Search for real-world news or input your own concept. Our quantum engine will generate a fully playable desktop game based on it.</p>
            </div>

            {status === 'idle' && (
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--accent-primary)', background: 'rgba(88, 166, 255, 0.05)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={18} color="var(--accent-primary)" /> News Intel Search
                    </h3>

                    {/* Trending Sports Bubbles - Enhanced Floating & Colorful */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '8px' }}>
                            TRENDING:
                        </span>
                        {SUGGESTED_TOPICS.map((topic, index) => (
                            <button
                                key={topic.label}
                                onClick={() => handleTopicClick(topic.query)}
                                className="glass-pill"
                                style={{
                                    padding: '8px 18px',
                                    fontSize: '0.85rem',
                                    color: searchQuery === topic.query ? '#fff' : 'var(--text-main)',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    background: searchQuery === topic.query ? topic.color : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${searchQuery === topic.query ? topic.color : 'rgba(255,255,255,0.1)'}`,
                                    boxShadow: searchQuery === topic.query ? `0 0 20px ${topic.color}44` : 'none',
                                    fontWeight: 600,
                                    animation: `float 3s ease-in-out infinite ${index * 0.2}s`,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)';
                                    e.currentTarget.style.boxShadow = `0 10px 20px ${topic.color}33`;
                                    e.currentTarget.style.borderColor = topic.color;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                    if (searchQuery !== topic.query) {
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                    }
                                }}
                            >
                                {topic.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Enter a topic (e.g. AI advancements, Mars exploration)..."
                            style={{
                                flex: 1,
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '8px',
                                padding: '12px 16px',
                                color: 'var(--text-bright)',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={isSearching || !searchQuery.trim()}
                            style={{
                                background: 'var(--bg-panel)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-bright)',
                                padding: '0 24px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                opacity: isSearching ? 0.6 : 1
                            }}
                        >
                            {isSearching ? <RefreshCw size={18} className="spin" /> : <Search size={18} />}
                            {isSearching ? 'Searching...' : 'Search News'}
                        </button>
                    </form>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                        Powered by Google Gemini & Real-time Web Search
                    </p>
                </div>
            )}

            {status === 'idle' && searchResult && (
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', animation: 'fadeIn 0.5s ease-out', border: isFallback ? '1px solid #ff4444' : 'none' }}>
                    {isFallback && (
                        <div style={{
                            background: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid rgba(255, 68, 68, 0.2)',
                            borderRadius: '8px',
                            padding: '10px 16px',
                            marginBottom: '16px',
                            color: '#ff6b6b',
                            fontSize: '0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            fontWeight: 600
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                ⚠️ Gemini API Failed: Switched to [NLP Fallback]
                            </div>
                            {errorLog && (
                                <div style={{
                                    fontFamily: 'monospace',
                                    background: 'rgba(0,0,0,0.3)',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    color: '#ff8888',
                                    wordBreak: 'break-all'
                                }}>
                                    DEBUG_LOG: {errorLog}
                                </div>
                            )}
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '1rem', color: isFallback ? '#ffb86c' : 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isFallback ? <Terminal size={18} /> : <CheckCircle2 size={18} />}
                            {isFallback ? 'Intelligence Report (Fallback Mode)' : 'Gemini AI Synthesis Received'}
                        </h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    setSearchResult('');
                                    setIsFallback(false);
                                }}
                                style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => {
                                    setNews(searchResult);
                                    setSearchResult('');
                                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                }}
                                style={{
                                    background: 'var(--accent-success)',
                                    color: '#fff',
                                    padding: '6px 16px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}
                            >
                                Use This Intel
                            </button>
                        </div>
                    </div>
                    <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        padding: '16px',
                        borderRadius: '8px',
                        maxHeight: '300px',
                        overflowY: 'auto',
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        color: 'var(--text-main)',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        {searchResult}
                    </div>
                </div>
            )}

            <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>

                {/* Glow Effects */}
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'var(--accent-primary)',
                    filter: 'blur(100px)',
                    opacity: 0.15,
                    borderRadius: '50%'
                }} />

                {status === 'idle' && (
                    <form onSubmit={handleGenerate} style={{ position: 'relative', zIndex: 10 }}>
                        <label style={{ marginBottom: '12px', fontWeight: 500, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Terminal size={18} /> Direct Input Stream
                        </label>
                        <textarea
                            value={news}
                            onChange={(e) => setNews(e.target.value)}
                            placeholder="E.g., NASA discovers a new exoplanet with signs of biological life, sparking a new space race..."
                            style={{
                                width: '100%',
                                height: '180px',
                                background: 'rgba(13, 17, 23, 0.5)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '12px',
                                padding: '20px',
                                color: 'var(--text-bright)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '1.05rem',
                                resize: 'none',
                                outline: 'none',
                                transition: 'border-color var(--transition-fast)',
                                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.2)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button
                                type="submit"
                                disabled={!news.trim()}
                                style={{
                                    background: 'linear-gradient(135deg, var(--accent-primary), #3b82f6)',
                                    color: '#fff',
                                    padding: '16px 32px',
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    opacity: news.trim() ? 1 : 0.5,
                                    cursor: news.trim() ? 'pointer' : 'not-allowed',
                                    transition: 'transform var(--transition-bounce), box-shadow var(--transition-fast)',
                                    boxShadow: news.trim() ? '0 8px 20px rgba(88, 166, 255, 0.4)' : 'none'
                                }}
                                onMouseEnter={(e) => news.trim() && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                onMouseLeave={(e) => news.trim() && (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                <Cpu size={24} /> INITIALIZE GENERATION
                            </button>
                        </div>
                    </form>
                )}

                {status === 'building' && (
                    <div style={{ textAlign: 'center', padding: '48px 0', animation: 'pulse 2s infinite' }}>
                        <Cpu size={64} color="var(--accent-primary)" style={{ marginBottom: '24px', animation: 'spin 4s linear infinite' }} />
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Synthesizing Reality...</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Analyzing semantics, compiling ruleset, rendering engine...</p>

                        {/* Progress Bar Container */}
                        <div style={{
                            width: '100%',
                            height: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '999px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${progress}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-success))',
                                transition: 'width 0.4s ease-out',
                                boxShadow: '0 0 10px var(--accent-primary)'
                            }} />
                        </div>
                        <div style={{ marginTop: '12px', fontFamily: 'monospace', color: 'var(--accent-primary)' }}>
                            {Math.min(progress, 100)}% COMPLETE
                        </div>
                    </div>
                )}

                {status === 'complete' && (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                        <CheckCircle2 size={64} color="var(--accent-success)" style={{ marginBottom: '24px' }} />
                        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Game Compiled Successfully</h2>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
                            <button style={{
                                background: 'var(--text-bright)',
                                color: 'var(--bg-darker)',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Gamepad2 size={20} /> Play Now
                            </button>

                            <button onClick={resetForm} style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'var(--text-bright)',
                                border: '1px solid var(--border-subtle)',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                Forge Another
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

        </div>
    );
}
