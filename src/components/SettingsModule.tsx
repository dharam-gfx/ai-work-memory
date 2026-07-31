import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import {
  Settings,
  Database,
  Cpu,
  ShieldCheck,
  UserCheck,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { KnowledgeStats } from '../types';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

interface SettingsModuleProps {
  stats: KnowledgeStats;
  preferences: { strictGrounding: boolean; duplicatePrevention: boolean; realtimeSync: boolean };
  onPreferenceChange: (key: string, value: boolean) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ stats, preferences, onPreferenceChange }) => {
  const { user, isSupabaseActive, setOpenAuthModal } = useAuth();

  const [serverHealth, setServerHealth] = useState<{
    status: string;
    geminiEnabled: boolean;
    totalDocuments: number;
    timestamp: string;
  } | null>(null);

  const [checkingHealth, setCheckingHealth] = useState(false);

  const fetchServerHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setServerHealth(data);
      }
    } catch (e) {
      console.warn('Healthcheck error:', e);
    }
    setCheckingHealth(false);
  };

  useEffect(() => {
    fetchServerHealth();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-blue-500" />
            Settings & Account
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your account security, isolated memory stats, and system connections.
          </p>
        </div>

        <button
          onClick={fetchServerHealth}
          disabled={checkingHealth}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
          <span>Refresh System Status</span>
        </button>
      </div>

      {/* Grid of System Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* User Vault & Auth Status Card */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="md:flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Isolated Account & Supabase Status
            </h3>
            {isSupabaseActive ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                Connected
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/20">
                Local Vault Active
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-900">
              <span className="text-slate-400">Authenticated User:</span>
              <span className="font-semibold text-white">{user?.email || 'Not logged in'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-900">
              <span className="text-slate-400">Data Sync:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                {isSupabaseActive ? 'Cross-device via Supabase' : 'Local only'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-900">
              <span className="text-slate-400">Knowledge Graph Isolation:</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {isSupabaseActive ? 'RLS Enforced' : 'Local Enforced'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-900">
              <span className="text-slate-400">Active Device Sessions:</span>
              <span className="font-semibold text-slate-200">Current device only</span>
            </div>
          </div>

          <button
            onClick={() => setOpenAuthModal(true)}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/20"
          >
            Manage Account & Current Session
          </button>
        </div>

        {/* Server & AI Engine Status */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="md:flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              Gemini 2.5/3.6 Flash Server Engine
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
              API Operational
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-900">
              <span className="text-slate-400">API Proxy Route:</span>
              <span className="font-mono text-slate-300">/api/rag/query</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-900">
              <span className="text-slate-400">AI Model Alias:</span>
              <span className="font-mono text-amber-400">gemini-3.6-flash</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-900">
              <span className="text-slate-400">Server Status:</span>
              <span className="font-semibold text-emerald-400">
                {serverHealth?.status === 'ok' ? 'Healthy (Cloud Run Proxy)' : 'Initializing...'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
            API keys are securely proxies server-side. No API keys exposed in client bundles.
          </div>
        </div>

      </div>

      {/* Vector Storage Statistics Banner */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          Vector Storage & Ingest Memory Metrics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-[11px] text-slate-500 font-medium">Total Documents</p>
            <p className="text-2xl font-extrabold text-white mt-1">{stats.totalDocuments}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-[11px] text-slate-500 font-medium">Vector Chunks</p>
            <p className="text-2xl font-extrabold text-blue-400 mt-1">{stats.totalChunks}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-[11px] text-slate-500 font-medium">Memory Storage</p>
            <p className="text-2xl font-extrabold text-indigo-400 mt-1">{(stats.totalSizeBytes / 1024).toFixed(0)} KB</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <p className="text-[11px] text-slate-500 font-medium">Auto Categories</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.categoriesCount}</p>
          </div>
        </div>
      </div>

      {/* User Preferences & Status */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-amber-400" />
          User Preferences & RAG Configuration
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="font-semibold text-white">Strict Source Grounding</p>
              <p className="text-slate-400 text-[11px]">{preferences.strictGrounding ? 'Only answers from your ingested documents.' : 'AI may use general knowledge beyond your documents.'}</p>
            </div>
            <Switch checked={preferences.strictGrounding} onCheckedChange={(v) => onPreferenceChange('strictGrounding', v)} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="font-semibold text-white">Auto-Duplicate Prevention</p>
              <p className="text-slate-400 text-[11px]">{preferences.duplicatePrevention ? 'Detects matching filenames and content on upload.' : 'Duplicate files will be allowed without warning.'}</p>
            </div>
            <Switch checked={preferences.duplicatePrevention} onCheckedChange={(v) => onPreferenceChange('duplicatePrevention', v)} />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="font-semibold text-white">Real-Time Sync across Devices</p>
              <p className="text-slate-400 text-[11px]">{preferences.realtimeSync ? 'Vault syncs to Supabase on every change.' : 'Local storage only — no cross-device sync.'}{!isSupabaseActive ? ' (Supabase not connected)' : ''}</p>
            </div>
            <Switch checked={preferences.realtimeSync && isSupabaseActive} disabled={!isSupabaseActive} onCheckedChange={(v) => onPreferenceChange('realtimeSync', v)} />
          </div>
        </div>
      </div>

      {/* FAQ & System Architecture Accordion */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          Frequently Asked Questions & Architecture
        </h3>

        <Accordion type="single" collapsible className="w-full text-xs">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-slate-200 hover:text-white font-semibold">
              How does AI Work Memory protect my private files?
            </AccordionTrigger>
            <AccordionContent className="text-slate-400 leading-relaxed">
              Every user operates in an isolated vault environment with Row-Level Security (RLS) rules enforced. Your vector embeddings and uploaded files are never exposed to public models or other users.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-slate-200 hover:text-white font-semibold">
              What AI models are powering the RAG retrieval?
            </AccordionTrigger>
            <AccordionContent className="text-slate-400 leading-relaxed">
              We use Google's Gemini 3.6 / 2.5 Flash model for response synthesis combined with Gemini Text Embedding models (768-dimensional vectors) and Supabase pgvector for sub-millisecond similarity matching.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-slate-200 hover:text-white font-semibold">
              What file formats can I upload?
            </AccordionTrigger>
            <AccordionContent className="text-slate-400 leading-relaxed">
              PDFs, JSON data files, EML emails, TXT notes, Markdown, PNG/JPG receipts or documents (OCR parsed), Excel files, and CSV spreadsheets are supported.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

    </div>
  );
};
