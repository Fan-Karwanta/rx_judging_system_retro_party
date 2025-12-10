import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { eventsApi, contestantsApi, scoresApi } from '../services/api';
import socket from '../services/socket';
import logo from '../assets/groove-logo.png';

const ScoreEntry = () => {
  const { eventId } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(eventId || '');
  const [contestants, setContestants] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState(1);
  const [scores, setScores] = useState({});

  useEffect(() => {
    fetchEvents();
    
    socket.on('score-updated', handleScoreUpdate);
    
    return () => {
      socket.off('score-updated', handleScoreUpdate);
    };
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchContestants();
      fetchRankings();
    }
  }, [selectedEvent]);

  const handleScoreUpdate = ({ eventId: updatedEventId, rankings: newRankings }) => {
    if (updatedEventId === selectedEvent) {
      setRankings(newRankings);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await eventsApi.getAll();
      setEvents(response.data);
      if (!selectedEvent && response.data.length > 0) {
        setSelectedEvent(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContestants = async () => {
    try {
      const response = await contestantsApi.getByEvent(selectedEvent);
      setContestants(response.data);
      
      // Initialize scores object
      const initialScores = {};
      response.data.forEach(c => {
        initialScores[c._id] = '';
      });
      setScores(initialScores);
    } catch (error) {
      console.error('Error fetching contestants:', error);
    }
  };

  const fetchRankings = async () => {
    try {
      const response = await scoresApi.getRankings(selectedEvent);
      setRankings(response.data);
      
      // Pre-fill scores for selected judge
      const existingScores = {};
      response.data.forEach(r => {
        const judgeScore = r.scores[`judge${selectedJudge}`];
        if (judgeScore > 0) {
          existingScores[r.contestant._id] = judgeScore;
        }
      });
      setScores(prev => ({ ...prev, ...existingScores }));
    } catch (error) {
      console.error('Error fetching rankings:', error);
    }
  };

  const handleScoreChange = (contestantId, value) => {
    const numValue = value === '' ? '' : Math.min(100, Math.max(0, parseFloat(value) || 0));
    setScores(prev => ({ ...prev, [contestantId]: numValue }));
  };

  const submitScore = async (contestantId) => {
    const score = scores[contestantId];
    if (score === '' || score === undefined) {
      alert('Please enter a score');
      return;
    }

    setSubmitting(true);
    try {
      await scoresApi.submit({
        contestant: contestantId,
        event: selectedEvent,
        judgeNumber: selectedJudge,
        totalScore: parseFloat(score)
      });
    } catch (error) {
      console.error('Error submitting score:', error);
      alert(error.response?.data?.message || 'Error submitting score');
    } finally {
      setSubmitting(false);
    }
  };

  const submitAllScores = async () => {
    const scoresToSubmit = Object.entries(scores).filter(([_, score]) => score !== '' && score !== undefined);
    
    if (scoresToSubmit.length === 0) {
      alert('No scores to submit');
      return;
    }

    setSubmitting(true);
    try {
      for (const [contestantId, score] of scoresToSubmit) {
        await scoresApi.submit({
          contestant: contestantId,
          event: selectedEvent,
          judgeNumber: selectedJudge,
          totalScore: parseFloat(score)
        });
      }
      alert('All scores submitted successfully!');
    } catch (error) {
      console.error('Error submitting scores:', error);
      alert(error.response?.data?.message || 'Error submitting scores');
    } finally {
      setSubmitting(false);
    }
  };

  const getExistingScore = (contestantId, judgeNum) => {
    const ranking = rankings.find(r => r.contestant._id === contestantId);
    return ranking?.scores[`judge${judgeNum}`] || 0;
  };

  const currentEvent = events.find(e => e._id === selectedEvent);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center">
        <div className="text-2xl text-orange-400 font-['Righteous'] animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-14 w-auto" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-300 font-['Righteous']">
              Score Entry
            </h1>
            <p className="text-gray-400 text-sm">Enter judge scores for contestants</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/admin" 
            className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
          >
            Admin Panel
          </Link>
          <Link 
            to="/live" 
            className="px-4 py-2 bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/30 transition-colors"
          >
            Live Display
          </Link>
        </div>
      </div>

      {/* Event & Judge Selection */}
      <div className="bg-[#2a2a4e]/50 rounded-xl border border-gray-700/50 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-400 text-sm mb-1">Select Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-4 py-2 bg-[#1a1a3e] border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            >
              {events.map(event => (
                <option key={event._id} value={event._id}>{event.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Select Judge</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  onClick={() => {
                    setSelectedJudge(num);
                    // Update scores display for this judge
                    const existingScores = {};
                    rankings.forEach(r => {
                      const judgeScore = r.scores[`judge${num}`];
                      if (judgeScore > 0) {
                        existingScores[r.contestant._id] = judgeScore;
                      } else {
                        existingScores[r.contestant._id] = '';
                      }
                    });
                    setScores(prev => ({ ...prev, ...existingScores }));
                  }}
                  className={`w-12 h-12 rounded-lg font-bold transition-all ${
                    selectedJudge === num
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white scale-110'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  J{num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Criteria Reference */}
      {currentEvent && (
        <div className="bg-[#2a2a4e]/30 rounded-xl border border-gray-700/30 p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">JUDGING CRITERIA REFERENCE</h3>
          <div className="flex flex-wrap gap-4">
            {currentEvent.criteria.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="text-gray-300">{c.name}:</span>
                <span className="text-orange-400 font-bold">{c.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Score Entry Table */}
      <div className="bg-[#2a2a4e]/50 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Contestant</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">J1</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">J2</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">J3</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-400">J4</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-yellow-400">
                  Judge {selectedJudge} Score
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {contestants.map((contestant, idx) => (
                <tr 
                  key={contestant._id} 
                  className={`border-t border-gray-700/30 ${idx % 2 === 0 ? 'bg-[#1a1a3e]/30' : ''}`}
                >
                  <td className="px-4 py-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-orange-500/20 text-orange-400 rounded-full font-bold text-sm">
                      {contestant.number}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{contestant.name}</p>
                      <p className="text-gray-500 text-xs">{contestant.groupName}</p>
                    </div>
                  </td>
                  {[1, 2, 3, 4].map(judgeNum => (
                    <td key={judgeNum} className="px-4 py-3 text-center">
                      <span className={`text-sm ${
                        getExistingScore(contestant._id, judgeNum) > 0 
                          ? 'text-green-400' 
                          : 'text-gray-600'
                      }`}>
                        {getExistingScore(contestant._id, judgeNum) || '-'}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={scores[contestant._id] ?? ''}
                      onChange={(e) => handleScoreChange(contestant._id, e.target.value)}
                      className="w-24 px-3 py-2 bg-[#1a1a3e] border border-yellow-500/50 rounded-lg text-white text-center focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/30"
                      placeholder="0-100"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => submitScore(contestant._id)}
                      disabled={submitting}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit All Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={submitAllScores}
          disabled={submitting}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {submitting ? 'Submitting...' : `Submit All Scores for Judge ${selectedJudge}`}
        </button>
      </div>

      {/* Live Rankings Preview */}
      <div className="mt-8 bg-[#2a2a4e]/50 rounded-xl border border-gray-700/50 p-4">
        <h3 className="text-lg font-bold text-white mb-4 font-['Righteous']">Current Rankings</h3>
        <div className="space-y-2">
          {rankings
            .filter(r => r.grandTotal > 0)
            .map((ranking, idx) => (
              <div 
                key={ranking.contestant._id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  idx === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' :
                  idx === 1 ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400/30' :
                  idx === 2 ? 'bg-gradient-to-r from-orange-700/20 to-orange-800/20 border border-orange-700/30' :
                  'bg-[#1a1a3e]/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                    idx === 0 ? 'bg-yellow-500 text-black' :
                    idx === 1 ? 'bg-gray-400 text-black' :
                    idx === 2 ? 'bg-orange-700 text-white' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {ranking.rank}
                  </span>
                  <div>
                    <p className="text-white font-medium">{ranking.contestant.name}</p>
                    <p className="text-gray-500 text-xs">
                      J1: {ranking.scores.judge1} | J2: {ranking.scores.judge2} | J3: {ranking.scores.judge3} | J4: {ranking.scores.judge4}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-400">{ranking.grandTotal}</p>
                  <p className="text-gray-500 text-xs">Grand Total</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreEntry;
