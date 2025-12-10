import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsApi, scoresApi } from '../services/api';
import socket from '../services/socket';
import logo from '../assets/groove-logo.png';

const LiveDisplay = () => {
  const { eventId } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(eventId || '');
  const [currentEvent, setCurrentEvent] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchEvents();
    
    socket.on('score-updated', handleScoreUpdate);
    socket.on('event-live-toggled', handleEventUpdate);
    socket.on('rankings-toggled', handleEventUpdate);
    socket.on('reveal-top-updated', handleEventUpdate);
    socket.on('scores-cleared', handleScoresCleared);
    
    return () => {
      socket.off('score-updated', handleScoreUpdate);
      socket.off('event-live-toggled', handleEventUpdate);
      socket.off('rankings-toggled', handleEventUpdate);
      socket.off('reveal-top-updated', handleEventUpdate);
      socket.off('scores-cleared', handleScoresCleared);
    };
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventDetails();
      fetchRankings();
    }
  }, [selectedEvent]);

  const handleScoreUpdate = ({ eventId: updatedEventId, rankings: newRankings }) => {
    if (updatedEventId === selectedEvent) {
      setRankings(newRankings);
    }
  };

  const handleEventUpdate = (event) => {
    if (event._id === selectedEvent) {
      setCurrentEvent(event);
    }
    setEvents(prev => prev.map(e => e._id === event._id ? event : e));
  };

  const handleScoresCleared = (clearedEventId) => {
    if (clearedEventId === selectedEvent) {
      fetchRankings();
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await eventsApi.getAll();
      setEvents(response.data);
      
      // Auto-select first live event or first event
      const liveEvent = response.data.find(e => e.isLive);
      if (!selectedEvent) {
        setSelectedEvent(liveEvent?._id || response.data[0]?._id || '');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async () => {
    try {
      const response = await eventsApi.getById(selectedEvent);
      setCurrentEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const fetchRankings = async () => {
    try {
      const response = await scoresApi.getRankings(selectedEvent);
      setRankings(response.data);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getDisplayRankings = () => {
    if (!currentEvent?.showRankings) {
      return rankings.map(r => ({ ...r, hidden: true }));
    }
    
    if (currentEvent?.revealTop > 0) {
      return rankings.map((r, idx) => ({
        ...r,
        hidden: idx >= currentEvent.revealTop
      }));
    }
    
    return rankings.map(r => ({ ...r, hidden: false }));
  };

  const displayRankings = getDisplayRankings();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex items-center justify-center">
        <div className="text-2xl text-orange-400 font-['Righteous'] animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-20 w-auto" />
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Event Selector */}
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-2 bg-[#2a2a4e]/80 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
          >
            {events.map(event => (
              <option key={event._id} value={event._id}>
                {event.name} {event.isLive ? '(LIVE)' : ''}
              </option>
            ))}
          </select>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-[#2a2a4e]/80 border border-gray-700 rounded-lg text-white hover:bg-[#3a3a5e] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Event Title */}
      <div className="relative z-10 text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-2">
          {currentEvent?.isLive && (
            <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
              LIVE
            </span>
          )}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 font-['Righteous'] retro-text-shadow">
          {currentEvent?.name || 'Select an Event'}
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          {currentEvent?.type === 'dance' ? 'RX DANCE TROUPE' : 'RX GRAND MENTORS'}
        </p>
      </div>

      {/* Scoreboard */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Scoreboard Header */}
        <div className="bg-gradient-to-r from-[#2a2a4e] to-[#3a3a5e] rounded-t-2xl border border-gray-700/50 border-b-0">
          <div className="p-4 text-center">
            <h2 className="text-3xl font-bold text-white font-['Righteous'] tracking-wider">
              SCOREBOARD
            </h2>
          </div>
        </div>

        {/* Table Header */}
        <div className="bg-[#2a2a4e]/80 border-x border-gray-700/50">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm font-semibold text-gray-400 uppercase">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-3">Contestant</div>
            <div className="col-span-1 text-center">J1</div>
            <div className="col-span-1 text-center">J2</div>
            <div className="col-span-1 text-center">J3</div>
            <div className="col-span-1 text-center">J4</div>
            <div className="col-span-2 text-center">Grand Total</div>
            <div className="col-span-2 text-center">Status</div>
          </div>
        </div>

        {/* Rankings */}
        <div className="bg-[#1a1a3e]/80 rounded-b-2xl border border-gray-700/50 border-t-0 overflow-hidden">
          {displayRankings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-xl">No scores submitted yet</p>
              <p className="text-sm mt-2">Waiting for judges to submit scores...</p>
            </div>
          ) : (
            displayRankings.map((ranking, idx) => (
              <div 
                key={ranking.contestant._id}
                className={`grid grid-cols-12 gap-2 px-4 py-4 items-center border-b border-gray-700/30 last:border-b-0 transition-all duration-500 ${
                  !ranking.hidden && idx === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20' :
                  !ranking.hidden && idx === 1 ? 'bg-gradient-to-r from-gray-400/10 to-gray-500/10' :
                  !ranking.hidden && idx === 2 ? 'bg-gradient-to-r from-orange-700/10 to-orange-800/10' :
                  idx % 2 === 0 ? 'bg-[#2a2a4e]/30' : ''
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 flex justify-center">
                  {ranking.hidden ? (
                    <span className="w-12 h-12 flex items-center justify-center bg-gray-700/50 rounded-full text-gray-500 font-bold text-xl">
                      ?
                    </span>
                  ) : (
                    <span className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-xl ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/30' :
                      idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black shadow-lg shadow-gray-400/30' :
                      idx === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-800 text-white shadow-lg shadow-orange-600/30' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {ranking.rank}
                    </span>
                  )}
                </div>

                {/* Contestant Name */}
                <div className="col-span-3">
                  <p className={`font-bold text-lg ${ranking.hidden ? 'text-gray-500' : 'text-white'}`}>
                    {ranking.hidden ? '???' : ranking.contestant.name}
                  </p>
                  <p className="text-gray-500 text-xs">{ranking.contestant.groupName}</p>
                </div>

                {/* Judge Scores */}
                {[1, 2, 3, 4].map(judgeNum => (
                  <div key={judgeNum} className="col-span-1 text-center">
                    <span className={`text-lg font-medium ${
                      ranking.hidden ? 'text-gray-600' : 
                      ranking.scores[`judge${judgeNum}`] > 0 ? 'text-green-400' : 'text-gray-600'
                    }`}>
                      {ranking.hidden ? '-' : (ranking.scores[`judge${judgeNum}`] || '-')}
                    </span>
                  </div>
                ))}

                {/* Grand Total */}
                <div className="col-span-2 text-center">
                  <span className={`text-2xl font-bold ${
                    ranking.hidden ? 'text-gray-600' : 'text-orange-400'
                  }`}>
                    {ranking.hidden ? '???' : ranking.grandTotal}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2 flex justify-center">
                  {ranking.hidden ? (
                    <span className="px-3 py-1 bg-gray-700/50 text-gray-500 text-sm rounded-full">
                      Hidden
                    </span>
                  ) : ranking.grandTotal > 0 ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                      Complete
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full animate-pulse">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Criteria Display */}
      {currentEvent && (
        <div className="relative z-10 max-w-4xl mx-auto mt-8">
          <div className="bg-[#2a2a4e]/50 rounded-xl border border-gray-700/30 p-4">
            <h3 className="text-center text-sm font-semibold text-gray-400 mb-3">JUDGING CRITERIA</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {currentEvent.criteria.map((c, idx) => (
                <div key={idx} className="text-center">
                  <span className="text-orange-400 font-bold text-2xl">{c.percentage}%</span>
                  <p className="text-gray-300 text-sm mt-1">{c.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 text-center mt-8 text-gray-500 text-sm">
        <a 
          href="https://fan-port.vercel.app" 
          className="text-blue-500 hover:text-blue-600" 
          target="_blank"
        >
          Made By Fan Karwanta
        </a>
      </div>
    </div>
  );
};

export default LiveDisplay;
