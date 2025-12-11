import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import LiveDisplay from './pages/LiveDisplay';
import ScoreEntry from './pages/ScoreEntry';
import PasswordProtect from './components/PasswordProtect';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<PasswordProtect><AdminPanel /></PasswordProtect>} />
        <Route path="/live" element={<LiveDisplay />} />
        <Route path="/live/:eventId" element={<LiveDisplay />} />
        <Route path="/score-entry" element={<PasswordProtect><ScoreEntry /></PasswordProtect>} />
        <Route path="/score-entry/:eventId" element={<PasswordProtect><ScoreEntry /></PasswordProtect>} />
      </Routes>
    </Router>
  );
};

export default App;
