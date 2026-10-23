import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import CopySuccessModal from './components/CopySuccessModal';
import { usePredictions } from './context/PredictionsContext';
import { X } from 'lucide-react';

// Pages
import BehaviourMachinePage from './pages/BehaviourMachinePage';
import LadderPage from './pages/LadderPage';
import PredictionsPage from './pages/PredictionsPage';
import MarketsDirectoryPage from './pages/MarketsDirectoryPage';
import MarketDetailPage from './pages/MarketDetailPage';
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
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-6 rounded-2xl bg-[#0E1626] border border-rose-500/50 text-white space-y-3">
          <h2 className="text-lg font-bold text-rose-400">Section Recovery Mode</h2>
          <p className="text-xs font-mono text-slate-300">{String(this.state.error?.message || this.state.error)}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.hash = '#/friday'; }}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Reload View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { copyModal, closeCopyModal } = usePredictions();

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
  const mainRoute = segments[0] || 'friday';
  const param = segments[1] || '';

  useEffect(() => {
    document.title = 'BRYME Bot Lab | Personal Two-Team Behaviour Machine & Pattern Discovery';
  }, [mainRoute, param]);

  // Render Personal Bot Study Lab by default on home & schedule routes
  const renderContent = () => {
    switch (mainRoute) {
      case 'home':
      case '':
      case 'friday':
        return <BehaviourMachinePage initialTab="friday" onNavigate={navigate} />;
      case 'vault':
        return <BehaviourMachinePage initialTab="vault" onNavigate={navigate} />;
      case 'ledger':
        return <BehaviourMachinePage initialTab="ledger" onNavigate={navigate} />;
      case 'thursday':
        return <BehaviourMachinePage initialTab="thursday" onNavigate={navigate} />;
      case 'tuesday':
        return <BehaviourMachinePage initialTab="tuesday" onNavigate={navigate} />;
      case 'whynot':
        return <BehaviourMachinePage initialTab="whynot" onNavigate={navigate} />;
      case 'challenge':
        return <LadderPage onNavigate={navigate} />;
      case 'clubs':
        return <BehaviourMachinePage initialTab="clubs" onNavigate={navigate} />;
      case 'calculator':
        return <BehaviourMachinePage initialTab="calculator" onNavigate={navigate} />;
      case 'machine':
      case 'behaviour':
      case 'bot':
        return <BehaviourMachinePage initialTab={param || 'friday'} onNavigate={navigate} />;
      case 'ladder':
        return <LadderPage onNavigate={navigate} />;
      case 'admin':
        return <AdminPage onNavigate={navigate} />;
      case 'articles':
      case 'academy':
      case 'guides':
        return <ArticlesPage onNavigate={navigate} />;
      case 'article':
        return <ArticleDetailPage slug={param} onNavigate={navigate} />;
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
      case 'weekend-hub':
        return <WeekendHubPage onNavigate={navigate} />;
      case 'editor-picks':
        return <EditorPicksPage onNavigate={navigate} />;
      case 'ticket':
        return <TicketDetailPage ticketId={param} onNavigate={navigate} />;
      case 'results':
        return <ResultsArchivePage initialTab={param} onNavigate={navigate} />;
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
        return <BehaviourMachinePage initialTab="friday" onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070B16] text-slate-100 flex flex-col font-sans transition-colors overflow-x-hidden w-full max-w-full">
      
      {/* 1. Personal Research Lab Header */}
      <Header 
        currentRoute={mainRoute} 
        onNavigate={navigate} 
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      {/* 2. Personal Study Status Ticker */}
      <div className="bg-[#050914] border-b border-blue-900/40 text-xs py-1.5 px-3 text-slate-300 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-[11px] font-mono whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-white uppercase tracking-wider">
              DAY 1 PLACED ON 22BET: 6 PURE OVER LEGS @ 3.036x (₦1,000 &rarr; ₦3,036 TONIGHT!)
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span>UCL Strict: <strong className="text-emerald-400">16/18 (88.9%)</strong></span>
            <span>&bull;</span>
            <span>4-Win Monthly Goal: <strong className="text-amber-300">₦81,972 (+₦51.9K Net Profit)</strong></span>
          </div>
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
            <AppErrorBoundary key={mainRoute}>
              {renderContent()}
            </AppErrorBoundary>
          </div>

        </div>
      </main>

      {/* 4. Slide-in Mobile & Tablet Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            onClick={() => setSidebarOpen(false)} 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full max-w-xs sm:max-w-sm bg-[#0E1626] text-white h-full overflow-y-auto p-4 shadow-2xl flex flex-col justify-between z-10 border-r border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                    B
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm tracking-wide">BRYME BOT LAB</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Personal Study &amp; Pattern Lab</p>
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
          </div>
        </div>
      )}

      {/* 5. Footer */}
      <Footer onNavigate={navigate} />

      {/* 6. Mobile Bottom Navigation Bar */}
      <BottomNav currentRoute={mainRoute} onNavigate={navigate} />

      {/* 7. Global Search Modal */}
      <SearchModal 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
        onNavigate={navigate} 
      />

      {/* 8. Global 1-Tap Copy Success Modal */}
      <CopySuccessModal 
        isOpen={copyModal?.isOpen}
        onClose={closeCopyModal}
        code={copyModal?.code}
        bookmaker={copyModal?.bookmaker}
        title={copyModal?.title}
        odds={copyModal?.odds}
      />

    </div>
  );
}
