import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi, contestantsApi, scoresApi } from '../services/api';
import socket from '../services/socket';
import logo from '../assets/groove-logo.png';

const AdminPanel = () => {
  const [events, setEvents] = useState([]);
  const [contestants, setContestants] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddContestant, setShowAddContestant] = useState(false);
  const [newContestant, setNewContestant] = useState({ name: '', number: '', groupName: '' });

  useEffect(() => {
    fetchEvents();
    
    // Socket listeners
    socket.on('event-updated', handleEventUpdate);
    socket.on('event-live-toggled', handleEventUpdate);
    socket.on('rankings-toggled', handleEventUpdate);
    socket.on('contestant-added', handleContestantUpdate);
    socket.on('contestant-deleted', handleContestantDelete);
    
    return () => {
      socket.off('event-updated', handleEventUpdate);
      socket.off('event-live-toggled', handleEventUpdate);
      socket.off('rankings-toggled', handleEventUpdate);
      socket.off('contestant-added', handleContestantUpdate);
      socket.off('contestant-deleted', handleContestantDelete);
    };
  }, []);

  const handleEventUpdate = (event) => {
    setEvents(prev => prev.map(e => e._id === event._id ? event : e));
  };

  const handleContestantUpdate = (contestant) => {
    if (contestant.event) {
      const eventId = contestant.event._id || contestant.event;
      setContestants(prev => ({
        ...prev,
        [eventId]: [...(prev[eventId] || []), contestant]
      }));
    }
  };

  const handleContestantDelete = (contestantId) => {
    setContestants(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(eventId => {
        updated[eventId] = updated[eventId].filter(c => c._id !== contestantId);
      });
      return updated;
    });
  };

  const fetchEvents = async () => {
    try {
      const response = await eventsApi.getAll();
      setEvents(response.data);
      
      // Fetch contestants for each event
      for (const event of response.data) {
        const contestantsRes = await contestantsApi.getByEvent(event._id);
        setContestants(prev => ({ ...prev, [event._id]: contestantsRes.data }));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsApi.seed();
      setEvents(response.data);
      
      // Seed contestants for each event
      for (const event of response.data) {
        await contestantsApi.seed(event._id, event.type);
        const contestantsRes = await contestantsApi.getByEvent(event._id);
        setContestants(prev => ({ ...prev, [event._id]: contestantsRes.data }));
      }
    } catch (error) {
      console.error('Error seeding events:', error);
      alert(error.response?.data?.message || 'Error seeding events');
    } finally {
      setLoading(false);
    }
  };

  const toggleLive = async (eventId) => {
    try {
      await eventsApi.toggleLive(eventId);
    } catch (error) {
      console.error('Error toggling live:', error);
    }
  };

  const toggleRankings = async (eventId) => {
    try {
      await eventsApi.toggleRankings(eventId);
    } catch (error) {
      console.error('Error toggling rankings:', error);
    }
  };

  const setRevealTop = async (eventId, value) => {
    try {
      await eventsApi.setRevealTop(eventId, value);
      fetchEvents();
    } catch (error) {
      console.error('Error setting reveal top:', error);
    }
  };

  const clearScores = async (eventId) => {
    if (window.confirm('Are you sure you want to clear all scores for this event?')) {
      try {
        await scoresApi.clearEvent(eventId);
        alert('Scores cleared successfully');
      } catch (error) {
        console.error('Error clearing scores:', error);
      }
    }
  };

  const addContestant = async () => {
    if (!selectedEvent || !newContestant.name || !newContestant.number) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      await contestantsApi.create({
        ...newContestant,
        number: parseInt(newContestant.number),
        event: selectedEvent
      });
      setNewContestant({ name: '', number: '', groupName: '' });
      setShowAddContestant(false);
      
      // Refresh contestants
      const contestantsRes = await contestantsApi.getByEvent(selectedEvent);
      setContestants(prev => ({ ...prev, [selectedEvent]: contestantsRes.data }));
    } catch (error) {
      console.error('Error adding contestant:', error);
      alert(error.response?.data?.message || 'Error adding contestant');
    }
  };

  const deleteContestant = async (contestantId, eventId) => {
    if (window.confirm('Are you sure you want to delete this contestant?')) {
      try {
        await contestantsApi.delete(contestantId);
        const contestantsRes = await contestantsApi.getByEvent(eventId);
        setContestants(prev => ({ ...prev, [eventId]: contestantsRes.data }));
      } catch (error) {
        console.error('Error deleting contestant:', error);
      }
    }
  };

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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-16 w-auto" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 font-['Righteous']">
              Admin Panel
            </h1>
            <p className="text-gray-400 text-sm">Manage events and control live display</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/score-entry" 
            className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
          >
            Score Entry
          </Link>
          <Link 
            to="/live" 
            className="px-4 py-2 bg-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/30 transition-colors"
          >
            Live Display
          </Link>
        </div>
      </div>

      {/* Seed Button */}
      {events.length === 0 && (
        <div className="mb-8 p-6 bg-[#2a2a4e]/50 rounded-xl border border-orange-500/30 text-center">
          <p className="text-gray-300 mb-4">No events found. Click below to create default events and contestants.</p>
          <button
            onClick={seedEvents}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all"
          >
            Initialize Default Events
          </button>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map(event => (
          <div 
            key={event._id} 
            className="bg-[#2a2a4e]/50 rounded-xl border border-gray-700/50 overflow-hidden"
          >
            {/* Event Header */}
            <div className="p-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white font-['Righteous']">{event.name}</h2>
                  <span className="text-xs text-gray-400 uppercase">{event.type} Competition</span>
                </div>
                <div className="flex items-center gap-2">
                  {event.isLive && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
                      LIVE
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleLive(event._id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    event.isLive 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  {event.isLive ? 'Stop Live' : 'Go Live'}
                </button>
                <button
                  onClick={() => toggleRankings(event._id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    event.showRankings 
                      ? 'bg-purple-500 text-white hover:bg-purple-600' 
                      : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                  }`}
                >
                  {event.showRankings ? 'Hide Rankings' : 'Show Rankings'}
                </button>
                <button
                  onClick={() => clearScores(event._id)}
                  className="px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-all"
                >
                  Clear Scores
                </button>
              </div>

              {/* Reveal Top N */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-gray-400 text-sm">Reveal Top:</span>
                {[0, 2, 3, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRevealTop(event._id, n)}
                    className={`px-3 py-1 rounded text-sm transition-all ${
                      event.revealTop === n 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {n === 0 ? 'All' : `Top ${n}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Criteria */}
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">JUDGING CRITERIA</h3>
              <div className="grid grid-cols-2 gap-2">
                {event.criteria.map((c, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-300">{c.name}</span>
                    <span className="text-orange-400 font-bold">{c.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contestants */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-400">CONTESTANTS</h3>
                <button
                  onClick={() => {
                    setSelectedEvent(event._id);
                    setNewContestant({ 
                      name: '', 
                      number: (contestants[event._id]?.length || 0) + 1, 
                      groupName: event.type === 'dance' ? 'RX DANCE TROUPE' : 'RX GRAND MENTORS' 
                    });
                    setShowAddContestant(true);
                  }}
                  className="text-xs px-3 py-1 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {contestants[event._id]?.map(contestant => (
                  <div 
                    key={contestant._id} 
                    className="flex items-center justify-between p-2 bg-[#1a1a3e]/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 flex items-center justify-center bg-orange-500/20 text-orange-400 rounded-full font-bold text-sm">
                        {contestant.number}
                      </span>
                      <div>
                        <p className="text-white font-medium text-sm">{contestant.name}</p>
                        <p className="text-gray-500 text-xs">{contestant.groupName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteContestant(contestant._id, event._id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contestant Modal */}
      {showAddContestant && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#2a2a4e] p-6 rounded-xl border border-gray-700 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4 font-['Righteous']">Add Contestant</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Contestant Number</label>
                <input
                  type="number"
                  value={newContestant.number}
                  onChange={(e) => setNewContestant({ ...newContestant, number: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1a1a3e] border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={newContestant.name}
                  onChange={(e) => setNewContestant({ ...newContestant, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1a1a3e] border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="e.g., HAPPY FEET MOVERS"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Group Name</label>
                <input
                  type="text"
                  value={newContestant.groupName}
                  onChange={(e) => setNewContestant({ ...newContestant, groupName: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1a1a3e] border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddContestant(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addContestant}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
