import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import { usePredictions } from './context/PredictionsContext';
import { Sparkles, Clock, Flame, ShieldCheck, X } from 'lucide-react';

// Pages
import HomePage from './pages/HomePage';
import PredictionsPage from './pages/PredictionsPage';
import MarketsDirectoryPage from './pages/MarketsDirectoryPage';
import MarketDetailPage from './pages/MarketDetailPage';
import LadderPage from './pages/LadderPage';
import PuntersPage from './pages/PuntersPage';
import PunterProfilePage from './pages/PunterProfilePage';
import WeekendHubPage from './pages/WeekendHubPage';
import EditorPicksPage from './pages/EditorPicksPage';
import TicketDetailPage from './pages/TicketDetailPage';
import ResultsArchivePage from './pages/ResultsArchivePage';
import BookmakersPage from './pages/BookmakersPage';
import AboutPage from './pages/AboutPage';
import EditorialPolicyPage from './pages/EditorialPolicyPage';
import ResponsibleGamblingPage from './pages/ResponsibleGamblingPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import ConvertCodesPage from './pages/ConvertCodesPage';

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { ladder, announcements } = usePredictions();

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
      setSidebarOpen(false);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path) => {
    setSidebarOpen(false);
    const cleanPath = path.startsWith('#') ? path : `#/${path.replace(/^\//, '')}`;
    window.location.hash = cleanPath;
  };

  // Parse route and parameter from hash
  const rawRoute = currentHash.replace(/^#\/?/, '').trim();
  const segments = rawRoute.split('/');
  const mainRoute = segments[0] || 'home';
  const param = segments[1] || '';

  // Render appropriate view based on route
  const renderContent = () => {
    switch (mainRoute) {
      case 'home':
      case '':
        return <HomePage onNavigate={navigate} />;
      case 'admin':
        return <AdminPage onNavigate={navigate} />;
      case 'convert':
      case 'converter':
      case 'catalogue':
        return <ConvertCodesPage onNavigate={navigate} />;
      case 'predictions':
        return <PredictionsPage onNavigate={navigate} />;
      case 'markets':
        return <MarketsDirectoryPage onNavigate={navigate} />;
      case 'market':
        return <MarketDetailPage marketId={param} onNavigate={navigate} />;
      case 'ladder':
        return <LadderPage onNavigate={navigate} />;
      case 'punters':
        return <PuntersPage onNavigate={navigate} />;
      case 'punter':
        return <PunterProfilePage punterId={param} onNavigate={navigate} />;
      case 'weekend-hub':
        return <WeekendHubPage onNavigate={navigate} />;
      case 'editor-picks':
        return <EditorPicksPage onNavigate={navigate} />;
      case 'ticket':
        return <TicketDetailPage ticketId={param} onNavigate={navigate} />;
      case 'results':
        return <ResultsArchivePage onNavigate={navigate} />;
      case 'bookmakers':
        return <BookmakersPage onNavigate={navigate} />;
      case 'about':
        return <AboutPage onNavigate={navigate} />;
      case 'editorial-policy':
        return <EditorialPolicyPage onNavigate={navigate} />;
      case 'responsible-gambling':
        return <ResponsibleGamblingPage onNavigate={navigate} />;
      case 'contact':
        return <ContactPage onNavigate={navigate} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#070B16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* 1. Top Header with Midnight Navy & Navigation */}
      <Header 
        currentRoute={mainRoute} 
        onNavigate={navigate} 
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      {/* 2. Live Drop Marquee Ticker */}
      <div className="bg-[#050914] border-b border-blue-900/40 text-xs py-1.5 px-3 text-slate-300 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-[11px] font-mono whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-bold text-white uppercase tracking-wider">{announcements?.tickerText || '★ TUESDAY UCL SPECIAL: Real Madrid vs Dortmund • 2.45x Banker Live'}</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span>Ladder: <strong className="text-white">Day {ladder.currentDay} (₦{ladder.currentBalance?.toLocaleString()})</strong></span>
            <span>&bull;</span>
            <span>Sporty: <strong className="text-white">{ladder.sportyCode}</strong></span>
            <span>&bull;</span>
            <span>Bet9ja: <strong className="text-white">{ladder.todaysCode}</strong></span>
          </div>

          <button 
            onClick={() => navigate('admin')} 
            className="text-cyan-400 hover:text-cyan-300 font-display font-bold uppercase text-[10px] underline ml-auto sm:ml-0"
          >
            Admin Panel &rarr;
          </button>
        </div>
      </div>

      {/* 3. Main Layout Container with Desktop Sidebar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Desktop Sticky Sidebar */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4">
            <div className="sticky top-20">
              <Sidebar currentRoute={mainRoute} onNavigate={navigate} />
            </div>
          </div>

          {/* Main Content Workspace */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {renderContent()}
          </div>

        </div>
      </main>

      {/* 4. Slide-in Mobile & Tablet Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setSidebarOpen(false)} 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-[#0E1626] text-white h-full overflow-y-auto p-4 shadow-2xl flex flex-col justify-between z-10 border-r border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#E41B13] text-white flex items-center justify-center font-black">
                    B
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm tracking-wide">BRYME PREDICTIONS</h3>
                    <p className="text-[10px] text-slate-400 font-mono">18-Step Rollover Suite</p>
                  </div>
                </div>

                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <Sidebar currentRoute={mainRoute} onNavigate={(path) => { setSidebarOpen(false); navigate(path); }} />
            </div>

            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
              Strictly 18+ Only &bull; Play Responsibly
            </div>
          </div>
        </div>
      )}

      {/* 5. Footer */}
      <Footer onNavigate={navigate} />

      {/* 6. Mobile Bottom Navigation Bar */}
      <BottomNav 
        currentRoute={mainRoute} 
        onNavigate={navigate} 
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      {/* 6. Instant Search Modal */}
      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
        onNavigate={navigate} 
      />

    </div>
  );
}
