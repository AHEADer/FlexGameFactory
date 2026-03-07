import { Play, Plus } from 'lucide-react';
import { useState } from 'react';

const FEATURED_GAMES = [
    {
        id: 1,
        title: "Cyber Surge: The AI Awakening",
        description: "A fast-paced neon shooter generated from tech news about unprecedented AI advancements. Survive the rogue mainframe.",
        image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2070&auto=format&fit=crop",
        tags: ["Action", "Sci-Fi", "Shooter"]
    },
    {
        id: 2,
        title: "Mars Colony: Red Dust",
        description: "Build and manage the first sustainable Mars colony. A strategy game born from the recent SpaceX Starship launch news.",
        image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1974&auto=format&fit=crop",
        tags: ["Strategy", "Simulation", "Space"]
    }
];

const RECENT_GAMES = [
    { id: 3, title: "Wall Street Rogue", genre: "Trading Sim", price: "Free", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop" },
    { id: 4, title: "Deep Sea Echoes", genre: "Horror Adventure", price: "Free", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop" },
    { id: 5, title: "Quantum Rift", genre: "Puzzle Platformer", price: "Free", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" },
    { id: 6, title: "Velocity 2050", genre: "Racing", price: "Free", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop" },
];

export default function Store() {
    const [activeHero, setActiveHero] = useState(0);

    return (
        <div style={{ padding: '32px', width: '100%', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>

            {/* Featured Hero Section */}
            <section>
                <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: 600 }}>Featured & Recommended</h2>

                <div style={{
                    position: 'relative',
                    height: '400px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}>
                    {/* Background Image */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: `url(${FEATURED_GAMES[activeHero].image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'background-image var(--transition-bounce)'
                    }} />

                    {/* Gradient Overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to right, rgba(13, 17, 23, 1) 0%, rgba(13, 17, 23, 0.6) 50%, rgba(13, 17, 23, 0) 100%)'
                    }} />

                    {/* Content */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        padding: '48px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        width: '60%'
                    }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            {FEATURED_GAMES[activeHero].tags.map(tag => (
                                <span key={tag} style={{
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    padding: '4px 12px',
                                    borderRadius: '999px',
                                    fontSize: '0.8rem',
                                    backdropFilter: 'blur(4px)',
                                    border: '1px solid var(--border-subtle)'
                                }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 style={{ fontSize: '3rem', marginBottom: '16px', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                            {FEATURED_GAMES[activeHero].title}
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', marginBottom: '32px', lineHeight: 1.6 }}>
                            {FEATURED_GAMES[activeHero].description}
                        </p>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button style={{
                                background: 'var(--text-bright)',
                                color: 'var(--bg-darker)',
                                padding: '12px 32px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'transform var(--transition-fast)'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                <Play size={20} fill="currentColor" /> Play Now
                            </button>
                            <button style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'var(--text-bright)',
                                border: '1px solid var(--border-subtle)',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                backdropFilter: 'blur(10px)',
                                transition: 'background var(--transition-fast)'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}>
                                <Plus size={20} /> Add to Library
                            </button>
                        </div>
                    </div>

                    {/* Carousel Indicators (Right side) */}
                    <div style={{
                        position: 'absolute',
                        right: '32px',
                        bottom: '32px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        {FEATURED_GAMES.map((_, idx) => (
                            <button key={idx}
                                onClick={() => setActiveHero(idx)}
                                style={{
                                    width: activeHero === idx ? '8px' : '4px',
                                    height: activeHero === idx ? '32px' : '16px',
                                    background: activeHero === idx ? 'var(--input-bright, #fff)' : 'rgba(255,255,255,0.3)',
                                    borderRadius: '4px',
                                    transition: 'all 0.3s ease'
                                }} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Grid Section */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Newly Minted Games</h2>
                    <a href="#" style={{ fontSize: '0.9rem' }}>See all</a>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px'
                }}>
                    {RECENT_GAMES.map(game => (
                        <div key={game.id} style={{
                            background: 'var(--bg-panel)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid var(--border-subtle)',
                            transition: 'transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal)',
                            cursor: 'pointer'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.5)';
                                e.currentTarget.style.borderColor = 'var(--border-focus)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            }}>
                            <div style={{
                                height: '160px',
                                backgroundImage: `url(${game.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }} />
                            <div style={{ padding: '16px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{game.title}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{game.genre}</span>
                                    <span style={{
                                        fontSize: '0.85rem',
                                        background: 'var(--bg-dark)',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        color: 'var(--accent-success)'
                                    }}>{game.price}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}
