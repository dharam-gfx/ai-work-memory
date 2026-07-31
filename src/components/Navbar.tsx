import React from 'react';
import { BrainCircuit, Upload, Search, Sparkles, LayoutDashboard, Home, BookOpen } from 'lucide-react';
import { KnowledgeStats } from '../types';

interface NavbarProps {
  currentView: 'landing' | 'dashboard';
  setCurrentView: (view: 'landing' | 'dashboard') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  stats: KnowledgeStats;
  onQuickUploadClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  stats,
  onQuickUploadClick,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/85 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                AI Work Memory
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                RAG v2.5
              </span>
            </div>
          </div>

          {/* Navigation Mode Switcher */}
          <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setCurrentView('landing')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'landing'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Overview
            </button>
            <button
              onClick={() => {
                setCurrentView('dashboard');
                if (activeTab === 'landing') setActiveTab('chat');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Workspace Dashboard
            </button>
          </div>

          {/* Global Search Bar (In Dashboard Mode) */}
          {currentView === 'dashboard' && (
            <div className="hidden lg:flex flex-1 max-w-md relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documents, tags, or memory chunks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-all"
              />
            </div>
          )}

          {/* Right Action Group */}
          <div className="flex items-center gap-3">
            {currentView === 'dashboard' ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    <strong className="text-white">{stats.totalDocuments}</strong> Docs ({stats.totalChunks} Chunks)
                  </span>
                </div>

                <button
                  onClick={onQuickUploadClick}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Quick Upload</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  setActiveTab('chat');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all"
              >
                <span>Launch Workspace</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
