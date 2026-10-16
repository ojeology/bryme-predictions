import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';

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
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* 1. Header with Midnight Navy & 02:00 AM Midnight Drop Indicator */}
      <Header 
        currentRoute={mainRoute} 
        onNavigate={navigate} 
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-5">
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

    </div>
  );
}
