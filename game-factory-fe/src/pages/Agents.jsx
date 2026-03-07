import { useState, useEffect } from 'react';
import { Users, Plus, Brain, MessageSquare, Star, Play, Cpu, RefreshCw } from 'lucide-react';

export default function Agents() {
    const [agents, setAgents] = useState([]);
    const [games, setGames] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);

    // New Agent State
    const [newName, setNewName] = useState('');
    const [newPrompt, setNewPrompt] = useState('');
    const [newBalance, setNewBalance] = useState('1000'); // Mock initial balance

    // Funding State
    const [funding, setFunding] = useState({});

    // Review State
    const [selectedGame, setSelectedGame] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [agentsRes, gamesRes, reviewsRes, fundingRes] = await Promise.all([
                fetch('/api/agents'),
                fetch('/api/games'),
                fetch('/api/reviews'),
                fetch('/api/funding')
            ]);

            const agentsData = await agentsRes.json();
            const gamesData = await gamesRes.json();
            const reviewsData = await reviewsRes.json();
            const fundingData = await fundingRes.json();

            if (agentsData.success) {
                setAgents(agentsData.agents);
                if (agentsData.agents.length > 0) setSelectedAgent(agentsData.agents[0].id);
            }
            if (gamesData.success) {
                setGames(gamesData.games);
                if (gamesData.games.length > 0) setSelectedGame(gamesData.games[0].id);
            }
            if (reviewsData.success) setReviews(reviewsData.reviews);
            if (fundingData.success) setFunding(fundingData.funding);

        } catch (err) {
            console.error('Failed to fetch agent data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateAgent = async (e) => {
        e.preventDefault();
        if (!newName || !newPrompt) return;

        try {
            const res = await fetch('/api/agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    prompt: newPrompt,
                    balance: parseFloat(newBalance) || 0
                })
            });
            const data = await res.json();
            if (data.success) {
                setAgents([...agents, data.agent]);
                setIsCreating(false);
                setNewName('');
                setNewPrompt('');
                setNewBalance('1000');
                if (!selectedAgent) setSelectedAgent(data.agent.id);
            }
        } catch (err) {
            alert('Failed to create agent');
        }
    };

    const handleRunReview = async () => {
        if (!selectedGame || !selectedAgent) return;

        setIsEvaluating(true);
        try {
            const res = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agent_id: selectedAgent, game_id: selectedGame })
            });
            const data = await res.json();
            if (data.success) {
                setReviews([data.review, ...reviews]);
                // Update local balances and funding
                setAgents(agents.map(a => a.id === selectedAgent ? { ...a, balance: data.agent_balance } : a));
                setFunding({ ...funding, [selectedGame]: data.funding });
            } else {
                alert('Review failed: ' + data.error);
            }
        } catch (err) {
            alert('Evaluation failed to connect');
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <div style={{ padding: '32px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

            <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ maxWidth: '800px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
                        Agent <span className="text-gradient">Judges</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        As a gaming enthusiast, you know there are endless titles in the world. This Agent acts as your avatar, playtesting generated realities based on your unique taste (your Prompt).
                        <br /><br />
                        If a game matches your criteria, the Agent will automatically tip and invest in the game to show support based on your rules. Every generated game begins with a crowdfunding goal. The more an Agent invests, the more popular the game becomes, ultimately earning massive global promotion!
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    style={{
                        background: 'var(--accent-primary)',
                        color: '#fff',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 8px 20px rgba(88, 166, 255, 0.3)'
                    }}
                >
                    <Plus size={20} /> Create New Agent
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Review Panel */}
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Play size={20} color="var(--accent-primary)" /> Initialize Review
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'flex-start' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>TARGET GAME</label>
                                <select
                                    value={selectedGame}
                                    onChange={(e) => setSelectedGame(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--border-subtle)',
                                        color: '#fff',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        outline: 'none'
                                    }}
                                >
                                    {games.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                    {games.length === 0 && <option>No games in library</option>}
                                </select>

                                {selectedGame && (
                                    <div style={{ marginTop: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                            <span>FUNDING PROGRESS</span>
                                            <span>${(funding[selectedGame] || { total: 0 }).total} / ${(funding[selectedGame] || { goal: 1000 }).goal}</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${Math.min(100, ((funding[selectedGame] || { total: 0 }).total / (funding[selectedGame] || { goal: 1000 }).goal) * 100)}%`,
                                                background: (funding[selectedGame] || { total: 0 }).total >= (funding[selectedGame] || { goal: 1000 }).goal ? 'var(--accent-success)' : 'var(--accent-primary)',
                                                transition: 'width 0.5s ease-out'
                                            }} />
                                        </div>
                                        {(funding[selectedGame] || { total: 0 }).total >= (funding[selectedGame] || { goal: 1000 }).goal && (
                                            <div style={{ marginTop: '4px', fontSize: '0.65rem', color: 'var(--accent-success)', fontWeight: 700 }}>
                                                🚀 READY FOR GLOBAL PROMOTION
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>ASSIGN AGENT</label>
                                <select
                                    value={selectedAgent}
                                    onChange={(e) => setSelectedAgent(e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--border-subtle)',
                                        color: '#fff',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        outline: 'none'
                                    }}
                                >
                                    {agents.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                    {agents.length === 0 && <option>Create an agent first</option>}
                                </select>
                            </div>

                            <button
                                onClick={handleRunReview}
                                disabled={isEvaluating || games.length === 0 || agents.length === 0}
                                style={{
                                    height: '46px',
                                    padding: '0 24px',
                                    background: 'var(--accent-success)',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    marginTop: '25px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {isEvaluating ? <RefreshCw className="spin" size={18} /> : <Brain size={18} />}
                                {isEvaluating ? 'PLAYING...' : 'RUN REVIEW'}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Review History</h2>
                        {reviews.length === 0 ? (
                            <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', opacity: 0.5 }}>
                                <MessageSquare size={48} style={{ marginBottom: '16px', margin: '0 auto' }} />
                                <p>No reviews yet. Select an agent and a game to begin.</p>
                            </div>
                        ) : (
                            reviews.map(rev => (
                                <div key={rev.id} className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--accent-primary)', animation: 'fadeIn 0.5s ease-out' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div>
                                            <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{rev.game_id.replace(/_/g, ' ').toUpperCase()}</span>
                                            <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>evaluated by</span>
                                            <span style={{ fontWeight: 600 }}>{rev.agent_name}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {rev.tip_amount > 0 && (
                                                <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', fontWeight: 600 }}>
                                                    +${rev.tip_amount} Invested
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(88, 166, 255, 0.1)', padding: '4px 12px', borderRadius: '12px' }}>
                                                <Star size={14} fill="var(--accent-primary)" color="var(--accent-primary)" />
                                                <span style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{rev.score}/100</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-main)', fontStyle: 'italic' }}>
                                        "{rev.feedback}"
                                    </p>
                                    <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                                        {new Date(rev.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={20} /> Active Agents
                    </h2>
                    {agents.map(agent => (
                        <div key={agent.id} className="glass-panel" style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent-primary), #3b82f6)', display: 'grid', placeItems: 'center' }}>
                                    <Cpu size={20} color="#fff" />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{agent.name}</h4>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--accent-success)', fontWeight: 600 }}>
                                        Wallet: ${agent.balance?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                {agent.prompt}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isCreating && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 1000,
                    display: 'grid',
                    placeItems: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                        <h2 style={{ marginBottom: '24px' }}>Deploy New Agent Judge</h2>
                        <form onSubmit={handleCreateAgent}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Agent Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. Rough Game Critic"
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--border-subtle)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Initial Balance ($)</label>
                                <input
                                    type="number"
                                    value={newBalance}
                                    onChange={(e) => setNewBalance(e.target.value)}
                                    placeholder="1000"
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--border-subtle)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Persona Prompt & Criteria</label>
                                <textarea
                                    value={newPrompt}
                                    onChange={(e) => setNewPrompt(e.target.value)}
                                    placeholder="Define how this agent should view the game..."
                                    style={{
                                        width: '100%',
                                        height: '150px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--border-subtle)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        resize: 'none'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsCreating(false)} style={{ padding: '10px 20px', color: 'var(--text-muted)' }}>Cancel</button>
                                <button
                                    type="submit"
                                    style={{
                                        background: 'var(--accent-primary)',
                                        color: '#fff',
                                        padding: '10px 24px',
                                        borderRadius: '8px',
                                        fontWeight: 600
                                    }}
                                >
                                    Deploy Agent
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
