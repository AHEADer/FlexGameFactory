import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Factory from './pages/Factory';
import Library from './pages/Library';
import Agents from './pages/Agents';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <TopNav />
          <Routes>
            <Route path="/" element={<Factory />} />
            <Route path="/library" element={<Library />} />
            <Route path="/agents" element={<Agents />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
