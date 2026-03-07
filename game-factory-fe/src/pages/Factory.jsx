import { useState, useEffect } from 'react';
import { Cpu, Terminal, ArrowRight, CheckCircle2, Gamepad2, Search, RefreshCw } from 'lucide-react';

export default function Factory() {
    const [news, setNews] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isFallback, setIsFallback] = useState(false);
    const [errorLog, setErrorLog] = useState('');
    const [searchError, setSearchError] = useState('');
    const [status, setStatus] = useState('idle'); // idle -> building -> complete
    const [progress, setProgress] = useState(0);
    const abortRef = useState(null);

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

        const startTime = performance.now();
        const controller = new AbortController();
        abortRef[0] = controller;
        // Auto-cancel after 90s to never leave user stuck
        const timer = setTimeout(() => controller.abort(), 90000);

        setIsSearching(true);
        setIsFallback(false);
        setErrorLog('');
        setSearchError('');
        setSearchResult('');
        try {
            const apiPath = `/api/news_search?query=${encodeURIComponent(queryToUse)}`;
            const response = await fetch(apiPath, { signal: controller.signal });
            const markdown = await response.text();
            clearTimeout(timer);

            const duration = ((performance.now() - startTime) / 1000).toFixed(2);
            console.log(`[NewsSearch] Done in ${duration}s`);

            if (markdown.includes('[NLP Fallback]') || markdown.includes('news_search_gemini_failure')) {
                setIsFallback(true);
                const errorMatch = markdown.match(/\*\*CRITICAL ERROR:\*\* (.*)/);
                if (errorMatch) setErrorLog(errorMatch[1]);
            } else {
                setIsFallback(false);
            }
            setSearchResult(markdown);
        } catch (err) {
            clearTimeout(timer);
            if (err.name === 'AbortError') {
                setSearchError('The search timed out. The AI is busy — please try again in a moment.');
            } else {
                setSearchError('Could not reach the news server. Make sure the backend is running.');
            }
            console.error('[NewsSearch] Error:', err);
        } finally {
            setIsSearching(false);
            abortRef[0] = null;
        }
    };

    const cancelSearch = () => {
        if (abortRef[0]) abortRef[0].abort();
    };


    const handleGenerate = (e, incomingNews = null) => {
        if (e) e.preventDefault();
        const newsToUse = incomingNews || news;
        if (!newsToUse.trim()) return;

        if (incomingNews) setNews(incomingNews);
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

    const SCAN_LINES = [
        'Connecting to global intel feeds...',
        'Scraping live news sources...',
        'Running Gemini synthesis engine...',
        'Distilling key events and themes...',
        'Compiling intelligence report...',
        'Finalizing AI analysis...',
    ];
    const [scanLine, setScanLine] = useState(0);
    useEffect(() => {
        if (!isSearching) return;
        const t = setInterval(() => setScanLine(s => (s + 1) % SCAN_LINES.length), 1400);
        return () => clearInterval(t);
    }, [isSearching]);

    return (
        <div style={{ padding: '48px', width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}><span className="text-gradient">Play</span> the World's News</h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Search for any global event. Our AI will synthesize the intel and generate a fully playable desktop game that lets you experience the news firsthand.</p>
            </div>

            {/* ── Beautiful Loading Screen ── */}
            {isSearching && (
                <div className="glass-panel" style={{
                    padding: '64px 32px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(88,166,255,0.2)'
                }}>
                    {/* ambient glow */}
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '300px', height: '300px', background: 'var(--accent-primary)', filter: 'blur(120px)', opacity: 0.08, borderRadius: '50%', pointerEvents: 'none' }} />
                    {/* scan-line overlay */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(88,166,255,0.025) 3px, rgba(88,166,255,0.025) 4px)', pointerEvents: 'none' }} />

                    {/* Orbiting rings */}
                    <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 32px' }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(88,166,255,0.15)' }} />
                        <div style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '2px solid rgba(88,166,255,0.3)', animation: 'spin 3s linear infinite' }} />
                        <div style={{ position: 'absolute', inset: '20px', borderRadius: '50%', border: '2px solid rgba(88,166,255,0.5)', animation: 'spin 2s linear infinite reverse' }} />
                        <div style={{ position: 'absolute', inset: '32px', borderRadius: '50%', background: 'rgba(88,166,255,0.12)', display: 'grid', placeItems: 'center' }}>
                            <Search size={20} color="var(--accent-primary)" />
                        </div>
                    </div>

                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.05em' }}>Scanning Global Intelligence</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>Topic: <strong style={{ color: 'var(--accent-primary)' }}>{searchQuery}</strong></p>

                    {/* animated status line */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '10px',
                        background: 'rgba(88,166,255,0.06)', border: '1px solid rgba(88,166,255,0.15)',
                        borderRadius: '999px', padding: '8px 20px',
                        fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-primary)',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-primary)', animation: 'pulse 1.2s ease-in-out infinite', display: 'inline-block', flexShrink: 0 }} />
                        <span key={scanLine} style={{ animation: 'fadeIn 0.4s ease-out' }}>{SCAN_LINES[scanLine]}</span>
                    </div>

                    {/* progress dots */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: 'var(--accent-primary)',
                                animation: `bounce 1.4s ease-in-out infinite ${i * 0.18}s`
                            }} />
                        ))}
                    </div>
                </div>
            )}

            {!isSearching && status === 'idle' && (
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

            {!isSearching && status === 'idle' && searchResult && (
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', animation: 'fadeIn 0.5s ease-out' }}>
                    {/* Subtle fallback badge - low key, doesn't alarm the user */}
                    {isFallback && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', opacity: 0.55 }}>
                            <span style={{ fontSize: '0.7rem', background: 'rgba(255,180,0,0.12)', border: '1px solid rgba(255,180,0,0.2)', color: '#ffb400', borderRadius: '999px', padding: '2px 10px', fontWeight: 600, letterSpacing: '0.04em' }}>FALLBACK MODE</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Results sourced from alternative pipeline</span>
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
                                    handleGenerate(null, searchResult);
                                    setSearchResult('');
                                }}
                                style={{
                                    background: 'var(--accent-primary)',
                                    color: '#fff',
                                    padding: '10px 24px',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 15px rgba(88, 166, 255, 0.3)'
                                }}
                            >
                                <Cpu size={18} /> INITIALIZE GENERATION
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

            {status !== 'idle' && (
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

                    {status === 'building' && (
                        <div style={{ textAlign: 'center', padding: '48px 0', animation: 'pulse 2s infinite' }}>
                            <Cpu size={64} color="var(--accent-primary)" style={{ marginBottom: '24px', animation: 'spin 4s linear infinite' }} />
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Synthesizing News Intel...</h2>
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
            )}

            <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>

        </div>
    );
}
