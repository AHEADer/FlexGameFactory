import { Link, useLocation } from 'react-router-dom';
import { Home, Library, Cpu, Settings } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();

    const navItems = [
        { name: 'Game Factory', path: '/', icon: Cpu },
        { name: 'Library', path: '/library', icon: Library },
    ];

    return (
        <aside className="sidebar">
            <div style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-primary)', display: 'grid', placeItems: 'center' }}>
                    <Cpu size={20} color="var(--bg-darker)" />
                </div>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>G-Factory</h2>
            </div>

            <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                color: isActive ? 'var(--text-bright)' : 'var(--text-muted)',
                                background: isActive ? 'var(--bg-panel-hover)' : 'transparent',
                                fontWeight: isActive ? 600 : 500,
                                transition: 'all var(--transition-fast)'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = 'var(--text-bright)';
                                    e.currentTarget.style.background = 'var(--bg-panel)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <item.icon size={20} style={{ color: isActive ? 'var(--accent-primary)' : 'inherit' }} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div style={{ padding: '24px 16px' }}>
                <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    width: '100%',
                    borderRadius: '8px',
                    color: 'var(--text-muted)',
                    transition: 'color var(--transition-fast)'
                }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-bright)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}>
                    <Settings size={20} />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
}
