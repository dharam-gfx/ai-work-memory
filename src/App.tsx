import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useMatch, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Upload,
  Database,
  Network,
  GitCommit,
  Settings,
  BrainCircuit,
  Search,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Home,
  X
} from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './components/LandingPage';
import { ChatModule } from './components/ChatModule';
import { UploadModule } from './components/UploadModule';
import { DocumentLibraryModule } from './components/DocumentLibraryModule';
import { KnowledgeGraphModule } from './components/KnowledgeGraphModule';
import { TimelineModule } from './components/TimelineModule';
import { SettingsModule } from './components/SettingsModule';
import { PrivacyPolicyModule } from './components/PrivacyPolicyModule';
import { LoadingScreen } from './components/LoadingScreen';
import { loadVaultData, saveVaultData } from './utils/vaultStorage';

import { DocumentItem, ChatMessage, TimelineEvent, KnowledgeStats } from './types';
import { SEED_DOCUMENTS, SEED_CHAT_MESSAGES, SEED_TIMELINE_EVENTS } from './data/seedData';

type ActiveTab = 'chat' | 'graph' | 'upload' | 'library' | 'timeline' | 'settings';

const AppContent: React.FC = () => {
  const { user, loading, openAuthModal, setOpenAuthModal, isSupabaseActive } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const dashboardMatch = useMatch( '/dashboard/:tab' );
  const dashboardBaseMatch = useMatch( '/dashboard' );
  const isDashboard = !!( dashboardMatch || dashboardBaseMatch );
  const isPrivacy = location.pathname === '/privacy';
  const activeTab = ( dashboardMatch?.params?.tab as ActiveTab ) || 'chat';
  const [searchQuery, setSearchQuery] = useState<string>( '' );
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>( false );

  // Strip any bare or token-filled hash Supabase leaves after OAuth (e.g. /dashboard/chat#)
  useEffect( () => {
    if ( location.hash ) {
      window.history.replaceState( null, '', location.pathname + location.search );
    }
  }, [location.hash] );

  // Per-user isolated storage keys
  const userIdKey = user?.id || 'usr-demo-default';
  const onboardedKey = `ai_work_memory_onboarded_${userIdKey}`;
  const [showSampleBanner, setShowSampleBanner] = useState<boolean>( false );

  const [documents, setDocuments] = useState<DocumentItem[]>( [] );
  const [messages, setMessages] = useState<ChatMessage[]>( [] );
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>( [] );

  // Reload isolated user state whenever `user?.id` changes (localStorage cache)
  useEffect( () => {
    if ( loading ) return; // Wait for auth to resolve before loading data

    const firstTime = !localStorage.getItem( `ai_work_memory_onboarded_${userIdKey}` );

    const savedDocs = localStorage.getItem( `ai_work_memory_docs_${userIdKey}` );
    if ( savedDocs ) {
      try { setDocuments( JSON.parse( savedDocs ) ); } catch { setDocuments( [] ); }
    } else {
      setDocuments( firstTime ? SEED_DOCUMENTS.map( doc => ( { ...doc, userId: userIdKey } ) ) : [] );
    }

    const savedChat = localStorage.getItem( `ai_work_memory_chat_${userIdKey}` );
    if ( savedChat ) {
      try { setMessages( JSON.parse( savedChat ) ); } catch { setMessages( [] ); }
    } else {
      setMessages( firstTime ? SEED_CHAT_MESSAGES.map( msg => ( { ...msg, userId: userIdKey } ) ) : [] );
    }

    const savedTimeline = localStorage.getItem( `ai_work_memory_timeline_${userIdKey}` );
    if ( savedTimeline ) {
      try { setTimelineEvents( JSON.parse( savedTimeline ) ); } catch { setTimelineEvents( [] ); }
    } else {
      setTimelineEvents( firstTime ? SEED_TIMELINE_EVENTS.map( evt => ( { ...evt, userId: userIdKey } ) ) : [] );
    }

    // Show sample banner only if this user has never been onboarded
    setShowSampleBanner( firstTime );
  }, [userIdKey, loading] );
  // Sync from Supabase on login — overwrites localStorage cache with server data (cross-device)
  useEffect( () => {
    if ( !user || !isSupabaseActive ) return;
    async function syncFromSupabase() {
      const [remoteDocs, remoteMsgs, remoteTimeline] = await Promise.all( [
        loadVaultData<DocumentItem>( 'documents', [] ),
        loadVaultData<ChatMessage>( 'messages', [] ),
        loadVaultData<TimelineEvent>( 'timeline', [] ),
      ] );
      if ( remoteDocs.length > 0 ) {
        setDocuments( remoteDocs );
        // User has real data in Supabase — mark as onboarded and hide banner
        localStorage.setItem( `ai_work_memory_onboarded_${userIdKey}`, 'true' );
        setShowSampleBanner( false );
      }
      if ( remoteMsgs.length > 0 ) setMessages( remoteMsgs );
      if ( remoteTimeline.length > 0 ) setTimelineEvents( remoteTimeline );
    }
    syncFromSupabase();
  }, [user?.id] );

  // Persist documents — localStorage (fast) + Supabase (cross-device)
  useEffect( () => {
    localStorage.setItem( `ai_work_memory_docs_${userIdKey}`, JSON.stringify( documents ) );
    if ( isSupabaseActive && user && preferences.realtimeSync ) saveVaultData( 'documents', documents );
  }, [documents, userIdKey] );

  // Persist messages — localStorage (fast) + Supabase (cross-device)
  useEffect( () => {
    localStorage.setItem( `ai_work_memory_chat_${userIdKey}`, JSON.stringify( messages ) );
    if ( isSupabaseActive && user && preferences.realtimeSync ) saveVaultData( 'messages', messages );
  }, [messages, userIdKey] );

  // Persist timeline — localStorage (fast) + Supabase (cross-device)
  useEffect( () => {
    localStorage.setItem( `ai_work_memory_timeline_${userIdKey}`, JSON.stringify( timelineEvents ) );
    if ( isSupabaseActive && user && preferences.realtimeSync ) saveVaultData( 'timeline', timelineEvents );
  }, [timelineEvents, userIdKey] );

  // Mark user as onboarded and clear sample data
  const handleClearSamples = () => {
    localStorage.setItem( onboardedKey, 'true' );
    setDocuments( [] );
    setMessages( [] );
    setTimelineEvents( [] );
    setShowSampleBanner( false );
  };

  // Mark as onboarded when user uploads their first real document
  const handleAddDocument = ( newDoc: DocumentItem ) => {
    localStorage.setItem( onboardedKey, 'true' );
    setShowSampleBanner( false );
    const docWithUser = { ...newDoc, userId: userIdKey };
    setDocuments( prev => [docWithUser, ...prev] );

    // Create corresponding timeline event
    const newEvt: TimelineEvent = {
      id: `evt-${Date.now()}`,
      userId: userIdKey,
      timestamp: newDoc.createdAt,
      docId: newDoc.id,
      title: newDoc.title,
      category: newDoc.category,
      summary: newDoc.summary,
      tags: newDoc.tags,
      fileType: newDoc.fileType,
    };
    setTimelineEvents( prev => [newEvt, ...prev] );
  };

  const handleOverwriteDocument = ( updatedDoc: DocumentItem ) => {
    const docWithUser = { ...updatedDoc, userId: userIdKey };
    setDocuments( prev => prev.map( d => d.id === updatedDoc.id ? docWithUser : d ) );
    setTimelineEvents( prev => prev.map( evt => evt.docId === updatedDoc.id ? {
      ...evt,
      timestamp: updatedDoc.createdAt,
      title: updatedDoc.title,
      summary: updatedDoc.summary,
      tags: updatedDoc.tags,
      category: updatedDoc.category,
    } : evt ) );
  };

  const handleDeleteDocument = ( docId: string ) => {
    setDocuments( prev => prev.filter( d => d.id !== docId ) );
    setTimelineEvents( prev => prev.filter( e => e.docId !== docId ) );
  };

  // Compute knowledge stats
  const totalChunks = documents.reduce( ( acc, d ) => acc + d.chunkCount, 0 );
  const totalSizeBytes = documents.reduce( ( acc, d ) => acc + d.sizeBytes, 0 );
  const uniqueCategories = new Set( documents.map( d => d.category ) ).size;

  const stats: KnowledgeStats = {
    totalDocuments: documents.length,
    totalChunks,
    totalSizeBytes,
    categoriesCount: uniqueCategories,
    lastUpdated: new Date().toLocaleTimeString(),
  };

  // User preferences — persisted per user in localStorage
  const prefsKey = `ai_work_memory_prefs_${userIdKey}`;
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem(prefsKey);
      if (saved) return JSON.parse(saved);
    } catch { /* fallback */ }
    return { strictGrounding: true, duplicatePrevention: true, realtimeSync: true };
  });

  const updatePreference = (key: string, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem(prefsKey, JSON.stringify(updated));
  };

  // Guard dashboard access if signed out — wait for auth to finish loading first
  useEffect( () => {
    if ( !loading && !user && isDashboard ) {
      navigate( '/' );
      setOpenAuthModal( true );
    }
  }, [loading, user, isDashboard] );

  // Show full-screen loader while auth state is being restored (prevents landing page flash)
  if ( loading ) {
    return <LoadingScreen />;
  }

  if ( isPrivacy ) {
    return <PrivacyPolicyModule onBack={() => navigate( '/' )} />;
  }

  if ( !isDashboard || !user ) {
    return (
      <>
        <LandingPage
          user={user}
          onOpenAuth={() => setOpenAuthModal( true )}
          onOpenPrivacy={() => navigate( '/privacy' )}
          onLaunchDashboard={( tab ) => {
            if ( !user ) {
              setOpenAuthModal( true );
            } else {
              navigate( `/dashboard/${tab || 'chat'}` );
            }
          }}
        />
        <AuthModal
          isOpen={openAuthModal}
          onClose={() => setOpenAuthModal( false )}
          onSuccessfulLogin={() => {
            setOpenAuthModal( false );
            navigate( '/dashboard/chat' );
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">

      {/* Top Navigation & Workspace Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">

        {/* Brand & Identity */}
        <div
          onClick={() => navigate( '/' )}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          title="Return to Homepage"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform shrink-0">
            <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>AI Work Memory</span>
              <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/20">
                Supabase & Gemini Flash
              </span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
              Isolated Personal Knowledge Graph & Context RAG Engine
            </p>
          </div>
        </div>

        {/* Global Search Field */}
        <div className="hidden lg:block flex-1 max-w-xs md:max-w-md relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={( e ) => {
              setSearchQuery( e.target.value );
              if ( e.target.value.trim().length > 0 && activeTab !== 'library' ) {
                navigate( '/dashboard/library' );
              }
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-full py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* Right User & Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setShowMobileSearch( !showMobileSearch )}
            className={`p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border ${showMobileSearch ? 'border-blue-500 text-blue-400' : 'border-slate-800 text-slate-300 hover:text-white'} lg:hidden transition-all`}
            title="Toggle Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate( '/' )}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] sm:text-xs font-semibold text-slate-300 transition-all hover:text-white"
            title="Go to Homepage / Landing Page"
          >
            <Home className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <button
            onClick={() => setOpenAuthModal( true )}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] sm:text-xs transition-all"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName || user.email} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user ? ( user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase() ) : 'G'
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[11px] font-semibold text-white leading-tight">
                {user ? ( user.fullName || user.email.split( '@' )[0] ) : 'Sign In'}
              </p>
              <p className="text-[9px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                <span>Isolated Vault</span>
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

      </header>

      {/* Expandable Mobile & Tablet Search Bar */}
      {showMobileSearch && (
        <div className="bg-slate-950/95 border-b border-slate-800/80 px-4 py-3 lg:hidden transition-all z-30 shadow-2xl flex items-center gap-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across documents, notes..."
              value={searchQuery}
              onChange={( e ) => {
                setSearchQuery( e.target.value );
                if ( e.target.value.trim().length > 0 && activeTab !== 'library' ) {
                  navigate( '/dashboard/library' );
                }
              }}
              className="w-full bg-slate-900 border border-blue-500/50 rounded-xl py-2 pl-10 pr-10 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery( '' )}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setShowMobileSearch( false );
              setSearchQuery( '' );
            }}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white text-xs shrink-0"
            title="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation Switcher Bar */}
      <div className="relative w-full bg-slate-950/90 border-b border-slate-800/80 shrink-0 z-30">
        {/* Left & Right Fade Shadows for Scroll Indicators on Mobile */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none sm:hidden" />
        <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none sm:hidden" />

        <nav className="px-2 sm:px-6 py-2 sm:py-0 w-full overflow-x-auto scrollbar-none touch-pan-x">
          <div className="flex items-center gap-1.5 sm:gap-2 w-max min-w-full py-0.5">
            {[
              { id: 'chat', icon: MessageSquare, label: 'Ask AI Chat', short: 'Ask AI' },
              { id: 'graph', icon: Network, label: 'Visual Knowledge Map', short: 'Graph' },
              { id: 'upload', icon: Upload, label: 'Upload Files & Notes', short: 'Upload' },
              { id: 'library', icon: Database, label: `My Document Vault`, short: 'Vault', count: documents.length },
              { id: 'timeline', icon: GitCommit, label: 'Activity Timeline', short: 'Timeline' },
              { id: 'settings', icon: Settings, label: 'Settings & Account', short: 'Settings' },
            ].map( ( tab ) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate( '/dashboard/' + tab.id )}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-3 text-[11px] sm:text-xs font-bold transition-all shrink-0 rounded-lg sm:rounded-none sm:border-b-2 cursor-pointer ${isActive
                    ? 'bg-blue-600/25 text-blue-300 border border-blue-500/50 sm:border-b-blue-500 sm:border-x-0 sm:border-t-0 sm:bg-blue-500/10 shadow-sm shadow-blue-500/20'
                    : 'bg-slate-900/80 sm:bg-transparent border border-slate-800/80 sm:border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.short}</span>
                  </span>
                  {tab.count !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono border shrink-0 ${isActive ? 'bg-blue-500/30 border-blue-400/50 text-blue-200' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            } )}
          </div>
        </nav>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 flex flex-col min-h-0">

        {/* First-time user sample data banner */}
        {showSampleBanner && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-300">Welcome! These are sample documents to explore the app.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Upload your own files to replace them, or clear samples to start fresh.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate( '/dashboard/upload' )}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-all"
              >
                Upload Files
              </button>
              <button
                onClick={handleClearSamples}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-all border border-slate-700"
              >
                Clear Samples
              </button>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <ChatModule
            documents={documents}
            messages={messages}
            setMessages={setMessages}
            strictGrounding={preferences.strictGrounding}
          />
        )}

        {activeTab === 'graph' && (
          <KnowledgeGraphModule
            documents={documents}
            onSelectDoc={( docId ) => {
              navigate( '/dashboard/library' );
            }}
          />
        )}

        {activeTab === 'upload' && (
          <UploadModule
            onDocumentAdded={handleAddDocument}
            onDocumentOverwrite={handleOverwriteDocument}
            ingestionQueue={documents}
            duplicatePrevention={preferences.duplicatePrevention}
          />
        )}

        {activeTab === 'library' && (
          <DocumentLibraryModule
            documents={documents}
            onDeleteDocument={handleDeleteDocument}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineModule
            events={timelineEvents}
            onSelectEvent={( docId ) => {
              navigate( '/dashboard/library' );
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModule
            stats={stats}
            preferences={preferences}
            onPreferenceChange={updatePreference}
          />
        )}
      </main>

      {/* Auth Modal Modal */}
      <AuthModal isOpen={openAuthModal} onClose={() => setOpenAuthModal( false )} />

    </div>
  );
};

import { TooltipProvider } from '@/components/ui/tooltip';

export function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <Routes>
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
