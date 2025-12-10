import { Link } from 'react-router-dom';
import logo from '../assets/groove-logo.png';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] flex flex-col items-center justify-center p-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl animate-float"></div>
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8 animate-slide-up">
        <img 
          src={logo} 
          alt="RX Thanksgiving Retro Party" 
          className="w-full max-w-2xl h-auto drop-shadow-2xl"
        />
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 font-['Righteous'] text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 animate-fade-in">
        LIVE TABULATION SYSTEM
      </h1>
      
      <p className="text-gray-400 text-lg mb-12 text-center max-w-xl animate-fade-in">
        Real-time judging and scoring for Retro Dance Contest & Retro Outfit Competition
      </p>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl animate-slide-up">
        {/* Admin Panel */}
        <Link 
          to="/admin" 
          className="group relative bg-gradient-to-br from-[#2a2a4e] to-[#1a1a3e] p-8 rounded-2xl border border-orange-500/30 hover:border-orange-500/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-['Righteous']">Admin Panel</h2>
            <p className="text-gray-400 text-sm">Manage events, contestants, and control live display</p>
          </div>
        </Link>

        {/* Score Entry */}
        <Link 
          to="/score-entry" 
          className="group relative bg-gradient-to-br from-[#2a2a4e] to-[#1a1a3e] p-8 rounded-2xl border border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-['Righteous']">Score Entry</h2>
            <p className="text-gray-400 text-sm">Enter judge scores for contestants in real-time</p>
          </div>
        </Link>

        {/* Live Display */}
        <Link 
          to="/live" 
          className="group relative bg-gradient-to-br from-[#2a2a4e] to-[#1a1a3e] p-8 rounded-2xl border border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-['Righteous']">Live Display</h2>
            <p className="text-gray-400 text-sm">Projector view for live rankings and results</p>
          </div>
        </Link>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-gray-500 text-sm animate-fade-in">
        <p>RX Thanksgiving Retro Party 2025</p>
        <p className="mt-1">Made By Fan Karwanta</p>
      </div>
    </div>
  );
};

export default Home;
