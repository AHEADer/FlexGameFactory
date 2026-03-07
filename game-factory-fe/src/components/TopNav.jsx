import { Search, Bell, User } from 'lucide-react';

export default function TopNav() {
    return (
        <header className="top-nav">
            <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '999px',
                padding: '8px 16px',
                width: '300px',
                backdropFilter: 'blur(10px)'
            }}>
                <Search size={18} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                <input
                    type="text"
                    placeholder="Search games, tags..."
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-bright)',
                        outline: 'none',
                        width: '100%',
                        fontFamily: 'var(--font-sans)'
                    }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button style={{ color: 'var(--text-muted)', transition: 'color var(--transition-fast)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-bright)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                    <Bell size={20} />
                </button>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    padding: '4px 12px 4px 4px',
                    borderRadius: '999px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)'
                }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-success))', display: 'grid', placeItems: 'center' }}>
                        <User size={16} color="var(--bg-darker)" />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Hayden</span>
                </div>
            </div>
        </header>
    );
}
