import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LadderBanner from './components/LadderBanner';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import SportyBetslipDrawer from './components/SportyBetslipDrawer';

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

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');
  const [searchOpen, setSearchOpen] = useState(false);
  const [betslipOpen, setBetslipOpen] = useState(false);
  const [selectedBets, setSelectedBets] = useState([
    {
      id: 'ng1-1',
      match: { match: 'Enyimba FC vs Remo Stars', league: 'Nigeria NPFL' },
      pickKey: '1 (Home Win)',
      oddsValue: '1.85'
    },
    {
      id: 'ke1-1X',
      match: { match: 'Gor Mahia vs AFC Leopards', league: 'Kenya FKF' },
      pickKey: '1X (Gor Mahia or Draw)',
      oddsValue: '1.32'
    }
  ]);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path) => {
    const cleanPath = path.startsWith('#') ? path : `#/${path.replace(/^\//, '')}`;
    window.location.hash = cleanPath;
  };

  // Toggle selection in betslip
  const handleSelectOdd = (match, pickKey, oddsValue) => {
    const betId = `${match.id}-${pickKey}`;
    const exists = selectedBets.find(b => b.id === betId);
    if (exists) {
      setSelectedBets(prev => prev.filter(b => b.id !== betId));
    } else {
      setSelectedBets(prev => [...prev, { id: betId, match, pickKey, oddsValue }]);
    }
  };

  const handleRemoveBet = (id) => {
    setSelectedBets(prev => prev.filter(b => b.id !== id));
  };

  const handleClearAll = () => {
    setSelectedBets([]);
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
        return (
          <HomePage 
            onNavigate={navigate} 
            onSelectOdd={handleSelectOdd}
            selectedOdds={selectedBets.map(b => b.id)}
          />
        );
      case 'predictions':
        return <PredictionsPage onNavigate={navigate} />;
      case 'markets':
        if (param) {
          return <MarketDetailPage slug={param} onNavigate={navigate} />;
        }
        return <MarketsDirectoryPage onNavigate={navigate} />;
      case 'ladder':
        return <LadderPage onNavigate={navigate} />;
      case 'punters':
        if (param) {
          return <PunterProfilePage punterId={param} onNavigate={navigate} />;
        }
        return <PuntersPage onNavigate={navigate} />;
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
        return <HomePage onNavigate={navigate} onSelectOdd={handleSelectOdd} selectedOdds={selectedBets.map(b => b.id)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#111418] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* 1. Header with SportyBet Red, Search, Theme Toggle, Betslip */}
      <Header 
        currentRoute={mainRoute} 
        onNavigate={navigate} 
        onOpenSearch={() => setSearchOpen(true)}
        betCount={selectedBets.length}
        onOpenBetslip={() => setBetslipOpen(true)}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-5">
        {renderContent()}
      </main>

      {/* 3. Footer */}
      <Footer onNavigate={navigate} />

      {/* 4. Mobile Bottom Navigation Bar */}
      <BottomNav 
        currentRoute={mainRoute} 
        onNavigate={navigate} 
      />

      {/* 5. Instant Search Modal */}
      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
        onNavigate={navigate} 
      />

      {/* 6. SportyBet Interactive Betslip Drawer */}
      <SportyBetslipDrawer
        isOpen={betslipOpen}
        onClose={() => setBetslipOpen(false)}
        selectedBets={selectedBets}
        onRemoveBet={handleRemoveBet}
        onClearAll={handleClearAll}
      />

    </div>
  );
}
