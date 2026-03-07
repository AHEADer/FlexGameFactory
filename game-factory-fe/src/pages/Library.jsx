import { useState, useEffect } from 'react';
import { Play, Search, Gamepad2, Settings, ExternalLink, RefreshCw } from 'lucide-react';

export default function Library() {
    const [games, setGames] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(null);
    const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
    const [syncInterval, setSyncInterval] = useState(30000); // Default 30s
    const [workerRunning, setWorkerRunning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGame, setSelectedGame] = useState(null);

    const fetchWorkerStatus = async () => {
        try {
            const res = await fetch('/api/sync/status');
            const data = await res.json();
            setWorkerRunning(data.running);
        } catch (e) {
            console.error('Failed to get worker status', e);
        }
    };

    const toggleWorker = async () => {
        try {
            const endpoint = workerRunning ? '/api/sync/stop' : '/api/sync/start';
            const res = await fetch(endpoint, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setWorkerRunning(data.running);
            }
        } catch (e) {
            console.error('Failed to toggle worker', e);
        }
    };

    const fetchGames = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await fetch('/api/games');
            const data = await response.json();
            if (data.success) {
                setGames(data.games);
            } else {
                if (!silent) setError(data.error);
            }
        } catch (err) {
            if (!silent) setError('Failed to connect to backend engine.');
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const syncWithCloud = async () => {
        setIsSyncing(true);
        try {
            console.log(`[Library] Auto-syncing with cloud at ${new Date().toLocaleTimeString()}...`);
            const response = await fetch('/api/sync');
            const data = await response.json();
            if (data.success) {
                setLastSyncTime(new Date().toLocaleTimeString());
                await fetchGames(true); // Refetch games silently
            }
        } catch (err) {
            console.error('[Library] Sync failed:', err);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        fetchGames();
        fetchWorkerStatus();
    }, []);

    useEffect(() => {
        if (!autoSyncEnabled) return;

        // Initial sync on enable
        syncWithCloud();

        const intervalId = setInterval(() => {
            syncWithCloud();
        }, syncInterval);

        return () => clearInterval(intervalId);
    }, [autoSyncEnabled, syncInterval]);

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
                    <p style={{ color: 'var(--text-muted)' }}>Found {games.length} generated games in the HowToPlayNews vault.</p>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {/* Auto Sync Controls */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '6px 16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-subtle)',
                    }}>
                        {/* 1. Background Push Worker Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '16px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                            <div
                                onClick={toggleWorker}
                                style={{
                                    width: '36px', height: '20px',
                                    background: workerRunning ? '#2ea043' : 'rgba(255,255,255,0.1)',
                                    borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    width: '14px', height: '14px', background: '#fff', borderRadius: '50%',
                                    position: 'absolute', top: '3px', left: workerRunning ? '19px' : '3px',
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: workerRunning ? '#2ea043' : 'var(--text-muted)' }}>
                                {workerRunning ? 'PUSH WORKER ON' : 'PUSH WORKER OFF'}
                            </span>
                        </div>

                        {/* 2. Client Auto-Pull Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                                onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                                style={{
                                    width: '36px',
                                    height: '20px',
                                    background: autoSyncEnabled ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{
                                    width: '14px',
                                    height: '14px',
                                    background: '#fff',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    top: '3px',
                                    left: autoSyncEnabled ? '19px' : '3px',
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: autoSyncEnabled ? 'var(--text-bright)' : 'var(--text-muted)' }}>
                                {autoSyncEnabled ? 'AUTO PULL' : 'MANUAL'}
                            </span>
                        </div>

                        {autoSyncEnabled && (
                            <div style={{ display: 'flex', gap: '4px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px', marginLeft: '4px' }}>
                                {[5000, 30000, 60000].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setSyncInterval(val)}
                                        style={{
                                            fontSize: '0.7rem',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: syncInterval === val ? 'rgba(255,255,255,0.1)' : 'transparent',
                                            color: syncInterval === val ? 'var(--accent-primary)' : 'var(--text-muted)',
                                            border: 'none',
                                            fontWeight: 700
                                        }}
                                    >
                                        {val / 1000}s
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Status Indicator */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        background: autoSyncEnabled ? 'rgba(56, 139, 253, 0.1)' : 'rgba(255,255,255,0.05)',
                        borderRadius: '20px',
                        border: autoSyncEnabled ? '1px solid rgba(56, 139, 253, 0.2)' : '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.8rem',
                        color: autoSyncEnabled ? 'var(--accent-primary)' : 'var(--text-muted)'
                    }}>
                        <div className={(autoSyncEnabled && isSyncing) ? 'spin' : (autoSyncEnabled ? 'pulse-dot' : '')} style={{
                            width: '8px',
                            height: '8px',
                            background: autoSyncEnabled ? 'var(--accent-primary)' : 'var(--text-muted)',
                            borderRadius: '50%'
                        }} />
                        {isSyncing ? 'Pulling...' : autoSyncEnabled ? `Next sync in ${syncInterval / 1000}s` : 'Sync Disabled'}
                    </div>

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
                                width: '180px',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button
                        onClick={() => fetchGames(false)}
                        disabled={loading}
                        style={{
                            background: 'var(--bg-panel)',
                            color: 'var(--text-muted)',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                            opacity: loading ? 0.5 : 1
                        }}
                        title="Force refresh"
                    >
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <RefreshCw size={48} color="var(--accent-primary)" className="spin" style={{ marginBottom: '16px' }} />
                    <p>Scanning HowToPlayNews Vault...</p>
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
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Play some news now and Forge your first game.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        style={{
                            background: 'var(--accent-primary)',
                            color: '#fff',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            fontWeight: 600
                        }}
                    >
                        Go Play News
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
                                    A custom forged game from the news. Run it in the local experimental sandbox.
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
                .pulse-dot {
                    animation: pulse-dot 2s infinite;
                }
                @keyframes pulse-dot {
                    0% { opacity: 0.4; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.1); }
                    100% { opacity: 0.4; transform: scale(0.8); }
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
