import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import LiveDisplay from './pages/LiveDisplay';
import ScoreEntry from './pages/ScoreEntry';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/live" element={<LiveDisplay />} />
        <Route path="/live/:eventId" element={<LiveDisplay />} />
        <Route path="/score-entry" element={<ScoreEntry />} />
        <Route path="/score-entry/:eventId" element={<ScoreEntry />} />
      </Routes>
    </Router>
  );
};

export default App;
