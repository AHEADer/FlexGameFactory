import { useState, useEffect } from 'react';
import { Play, Search, Gamepad2, Settings, ExternalLink, RefreshCw } from 'lucide-react';

export default function Library() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGame, setSelectedGame] = useState(null);

    const fetchGames = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/games');
            const data = await response.json();
            if (data.success) {
                setGames(data.games);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to connect to backend engine.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, []);

    const filteredGames = games.filter(game =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedGame) {
        return (
            <div style={{ height: 'calc(100vh - 70px)', width: '100%', position: 'relative', background: '#000' }}>
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    zIndex: 100,
                    display: 'flex',
                    gap: '12px'
                }}>
                    <button
                        onClick={() => setSelectedGame(null)}
                        style={{
                            background: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}
                    >
                        Close Game
                    </button>
                </div>
                <iframe
                    src={selectedGame.url}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title={selectedGame.name}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '32px', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>My Library</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Found {games.length} generated games in the factory vault.</p>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search library..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                background: 'var(--bg-dark)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '8px',
                                padding: '10px 12px 10px 40px',
                                color: 'var(--text-bright)',
                                width: '240px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button
                        onClick={fetchGames}
                        style={{
                            background: 'var(--bg-panel)',
                            color: 'var(--text-muted)',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)'
                        }}
                        title="Refresh vault"
                    >
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <RefreshCw size={48} color="var(--accent-primary)" className="spin" style={{ marginBottom: '16px' }} />
                    <p>Scanning Factory Vault...</p>
                </div>
            ) : error ? (
                <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: '#ff7b72' }}>
                    <p>Error: {error}</p>
                    <button onClick={fetchGames} style={{ marginTop: '16px', color: 'var(--accent-primary)' }}>Retry Scan</button>
                </div>
            ) : filteredGames.length === 0 ? (
                <div className="glass-panel" style={{ padding: '80px', textAlign: 'center' }}>
                    <Gamepad2 size={64} style={{ opacity: 0.2, marginBottom: '24px' }} />
                    <h2 style={{ marginBottom: '8px' }}>Vault Empty</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Go to the Factory to Forge your first game from the news.</p>
                    <button
                        onClick={() => window.location.href = '/factory'}
                        style={{
                            background: 'var(--accent-primary)',
                            color: '#fff',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontWeight: 600
                        }}
                    >
                        Go to Factory
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '24px'
                }}>
                    {filteredGames.map(game => (
                        <div key={game.id} className="game-card" style={{
                            background: 'var(--bg-panel)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-subtle)',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <div style={{
                                height: '180px',
                                background: game.imageUrl ? `url(${game.imageUrl})` : 'linear-gradient(135deg, #1f2937, #111827)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                {!game.imageUrl && <Gamepad2 size={60} style={{ opacity: 0.1 }} />}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '12px',
                                    left: '12px',
                                    background: 'rgba(0,0,0,0.5)',
                                    padding: '4px 12px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    color: 'var(--accent-success)',
                                    fontWeight: 700,
                                    textTransform: 'uppercase'
                                }}>
                                    Local Engine
                                </div>
                            </div>

                            <div style={{ padding: '20px' }}>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{game.name}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                                    A custom forged game from the factory. Run it in the local experimental sandbox.
                                </p>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setSelectedGame(game)}
                                        style={{
                                            flex: 1,
                                            background: 'var(--text-bright)',
                                            color: 'var(--bg-darker)',
                                            padding: '10px',
                                            borderRadius: '6px',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Play size={18} fill="currentColor" /> LAUNCH
                                    </button>
                                    <button style={{
                                        padding: '10px',
                                        borderRadius: '6px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-subtle)'
                                    }}>
                                        <Settings size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
                .game-card:hover {
                    border-color: var(--accent-primary) !important;
                    transform: translateY(-4px);
                    transition: all 0.2s ease;
                }
            `}</style>
        </div>
    );
}
