import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Store from './pages/Store';
import Factory from './pages/Factory';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <TopNav />
          <Routes>
            <Route path="/" element={<Store />} />
            <Route path="/factory" element={<Factory />} />
            {/* Library placeholder */}
            <Route path="/library" element={
              <div style={{ padding: '32px' }}>
                <h1>Library</h1>
                <p style={{ color: 'var(--text-muted)' }}>Games you generated.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
