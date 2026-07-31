import React from 'react';
import {
  Upload,
  MessageSquare,
  FileText,
  GitCommit,
  Users,
  Settings,
  Database,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  documentCount: number;
  chunkCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  documentCount,
  chunkCount,
}) => {
  const navItems = [
    {
      id: 'chat',
      label: 'Ask AI (RAG Chat)',
      icon: MessageSquare,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'upload',
      label: 'Upload Knowledge',
      icon: Upload,
      badge: null,
    },
    {
      id: 'documents',
      label: 'Document Library',
      icon: FileText,
      badge: `${documentCount}`,
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'timeline',
      label: 'AI Knowledge Timeline',
      icon: GitCommit,
      badge: null,
    },
    {
      id: 'personas',
      label: 'Persona Explorer',
      icon: Users,
      badge: '6 Roles',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      id: 'settings',
      label: 'Settings & Status',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 p-4">
      <div className="space-y-6">
        {/* Workspace Title Badge */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Personal Knowledge</p>
              <p className="text-[10px] text-slate-400">{documentCount} files • {chunkCount} vector chunks</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 border border-blue-500/30 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded-md font-semibold border ${
                      item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* RAG Engine Info Card at Bottom */}
      <div className="mt-8 p-3.5 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Gemini 2.5 Flash RAG</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Retrieval-Augmented Generation with 768-dim vector embeddings and source citation cards.
        </p>
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-emerald-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Grounded QA
          </span>
          <span className="font-mono">100% Private</span>
        </div>
      </div>
    </aside>
  );
};
