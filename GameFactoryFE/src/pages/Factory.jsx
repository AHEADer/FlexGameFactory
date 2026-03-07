import { useState, useEffect } from 'react';
import { Cpu, Terminal, ArrowRight, CheckCircle2, Gamepad2 } from 'lucide-react';

export default function Factory() {
    const [news, setNews] = useState('');
    const [status, setStatus] = useState('idle'); // idle -> building -> complete
    const [progress, setProgress] = useState(0);

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
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Input real-world news or a concept. Our quantum engine will generate a fully playable desktop game base on it.</p>
            </div>

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
      `}</style>

        </div>
    );
}
