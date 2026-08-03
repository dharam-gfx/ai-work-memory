import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BrainCircuit,
  Sparkles,
  ArrowRight,
  FileText,
  Mail,
  Mic,
  Image as ImageIcon,
  Table,
  Briefcase,
  GraduationCap,
  Scale,
  Stethoscope,
  Building2,
  Home,
  Search,
  GitCommit,
  FolderTree,
  CheckCircle,
  Layers,
  Database,
  Cpu,
  MessageSquare,
  FileCheck,
  Zap,
  ShieldCheck,
  Network,
  Lock,
  Code,
  Github,
  Upload,
  RefreshCw,
  Key,
  Star,
  Users,
  ChevronRight,
} from 'lucide-react';
import { SEED_ROLES } from '../data/seedData';

// rAF-driven smooth scroll — independent of CSS scroll-behavior or browser quirks
const smoothScroll = ( targetId: string ) => {
  const el = document.getElementById( targetId );
  if ( !el ) return;
  const start = window.scrollY;
  const end = el.getBoundingClientRect().top + start - 72;
  const distance = end - start;
  const duration = 600;
  let startTime: number | null = null;
  const ease = ( t: number ) => ( t < 0.5 ? 2 * t * t : -1 + ( 4 - 2 * t ) * t );
  const step = ( now: number ) => {
    if ( !startTime ) startTime = now;
    const elapsed = now - startTime;
    window.scrollTo( 0, start + distance * ease( Math.min( elapsed / duration, 1 ) ) );
    if ( elapsed < duration ) requestAnimationFrame( step );
  };
  requestAnimationFrame( step );
};

interface LandingPageProps {
  onLaunchDashboard: ( tab?: string ) => void;
  onOpenAuth: () => void;
  onOpenPrivacy?: () => void;
  user: { email?: string; fullName?: string } | null;
}

export const LandingPage: React.FC<LandingPageProps> = ( { onLaunchDashboard, onOpenAuth, onOpenPrivacy, user } ) => {
  const [activeRoleKey, setActiveRoleKey] = useState<string>( 'office' );
  const [activeExampleTab, setActiveExampleTab] = useState<'contract' | 'medical' | 'invoice' | 'study'>( 'contract' );
  const [mousePos, setMousePos] = useState( { x: 250, y: 150 } );

  const activeRole = SEED_ROLES.find( ( r ) => r.id === activeRoleKey ) || SEED_ROLES[0];

  const getRoleIcon = ( iconName: string ) => {
    switch ( iconName ) {
      case 'briefcase': return <Briefcase className="w-5 h-5" />;
      case 'graduation-cap': return <GraduationCap className="w-5 h-5" />;
      case 'scale': return <Scale className="w-5 h-5" />;
      case 'stethoscope': return <Stethoscope className="w-5 h-5" />;
      case 'building-2': return <Building2 className="w-5 h-5" />;
      case 'home': return <Home className="w-5 h-5" />;
      default: return <Briefcase className="w-5 h-5" />;
    }
  };

  const exampleDetails = {
    contract: {
      title: 'Legal Contract MSA', type: 'PDF Document',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
      description: 'Acme Corp Master Service Agreement containing termination clause 14.2.',
      query: 'Find every contract mentioning termination clauses.',
      answer: 'Found Acme Corp MSA (Clause 14.2): Either party may terminate without cause upon 30 days written notice.',
      source: 'Acme_Corp_MSA_Final.pdf', matchScore: 94,
    },
    medical: {
      title: 'Patient Medical Lab History', type: 'PDF Record',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Patient John Doe EHR lab report tracking HbA1c improvements.',
      query: 'Show previous lab reports for patient John Doe.',
      answer: 'HbA1c improved from 6.2% (Prediabetic, March 2025) down to 5.8% (November 2025 follow-up).',
      source: 'EHR_Export_Doe_John_4409.pdf', matchScore: 91,
    },
    invoice: {
      title: 'Client ABC Engagement', type: 'Email & Invoice',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Transaction history, change order #1, and cleared milestone payments.',
      query: 'Show every discussion related to Client ABC.',
      answer: 'Initial quote $15,000 + $3,500 change order for custom export module. Total revenue: $18,500.',
      source: 'Client_ABC_Engagement_Summary.eml', matchScore: 88,
    },
    study: {
      title: 'Biology Chapter 5 Study Notes', type: 'Text Note',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description: 'Cellular respiration notes covering glycolysis, Krebs cycle, and ATP synthesis.',
      query: 'Summarize everything about Chapter 5 in Biology.',
      answer: 'Glycolysis yields 2 ATP in cytoplasm; Krebs cycle produces NADH/FADH2 in matrix; ETC generates ~32 ATP.',
      source: 'Bio_Textbook_Ch5_Cellular_Respiration.txt', matchScore: 96,
    },
  };

  const currentExample = exampleDetails[activeExampleTab];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white shrink-0">
                <BrainCircuit className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-base sm:text-xl font-bold tracking-tight bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent truncate">
                AI Work Memory
              </span>
            </div>
            <nav className="hidden lg:flex space-x-8 text-sm font-medium text-slate-400">
              {[
                { id: 'how-it-works', label: 'How It Works' },
                { id: 'examples-gallery', label: 'Gallery' },
                { id: 'use-cases', label: 'For Every Role' },
                { id: 'features', label: 'Features' },
                { id: 'tech-stack', label: 'Tech Stack' },
              ].map( ( { id, label } ) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => smoothScroll( id )}
                  className="hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0"
                >
                  {label}
                </button>
              ) )}
            </nav>
            <div className="flex items-center gap-2 shrink-0">
              {!user && (
                <button onClick={onOpenAuth} className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer">
                  Sign In
                </button>
              )}
              <button onClick={() => onLaunchDashboard( 'chat' )} className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 gap-1.5 sm:gap-2 cursor-pointer">
                <span className="hidden sm:inline">{user ? 'Enter Dashboard' : 'Get Started'}</span>
                <span className="sm:hidden">App</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        onMouseMove={( e ) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos( { x: e.clientX - rect.left, y: e.clientY - rect.top } );
        }}
        className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 md:pt-36 md:pb-36 overflow-hidden border-b border-slate-900 cursor-default bg-slate-950/60"
      >
        {/* Cursor-tracking glow orbs */}
        <div className="absolute w-125 h-125 sm:w-175 sm:h-175 rounded-full bg-linear-to-r from-blue-500/50 via-purple-500/50 to-pink-500/50 blur-[130px] pointer-events-none z-0 -translate-x-1/2 -translate-y-1/2 opacity-80 mix-blend-screen transition-all duration-75"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }} />
        <div className="absolute w-62.5 h-62.5 rounded-full bg-cyan-400/40 blur-[80px] pointer-events-none z-0 -translate-x-1/2 -translate-y-1/2 opacity-70 mix-blend-screen transition-all duration-75"
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }} />

        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0.45, 0.25], x: [0, 80, 0], y: [0, -50, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-137.5 h-137.5 sm:w-187.5 sm:h-187.5 rounded-full bg-blue-600/30 blur-[130px]" />
          <motion.div animate={{ scale: [1.1, 0.85, 1.1], opacity: [0.2, 0.4, 0.2], x: [-60, 60, -60], y: [40, -40, 40] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 right-1/4 w-112.5 h-112.5 rounded-full bg-purple-600/25 blur-[120px]" />
          <motion.div animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.15, 0.35, 0.15], x: [50, -50, 50], y: [-30, 50, -30] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/4 w-100 h-100 rounded-full bg-pink-600/20 blur-[110px]" />
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2], x: [-40, -80, -40], y: [-50, 20, -50] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/3 w-87.5 h-87.5 rounded-full bg-cyan-500/20 blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] sm:text-xs text-blue-400 font-semibold mb-6 sm:mb-8 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span>Universal AI Knowledge Graph & Vector RAG Assistant</span>
          </motion.div>

          <div className="max-w-4xl mx-auto my-2 py-4">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight sm:leading-tight text-white drop-shadow-md">
              Stop searching. <br />
              <span className="bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                Start asking your files.
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm">
              Your private AI colleague that never forgets anything. Upload PDFs, JSON files, emails, voice notes, spreadsheets, or secure credentials — and get instant citations using Gemini RAG.
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button onClick={() => onLaunchDashboard( 'chat' )} className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer">
              <span>Launch Interactive Workspace</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </button>
            <button onClick={() => smoothScroll( 'how-it-works' )}
              className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all text-sm sm:text-base cursor-pointer backdrop-blur-sm">
              How RAG Works & Examples
            </button>
          </motion.div>

          {/* Supported format badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-slate-900/80">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 sm:mb-6">
              Supported formats & secure vaults
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-3xl mx-auto">
              {[
                { icon: <FileText className="w-4 h-4 text-red-400 shrink-0" />, label: 'PDFs & Docs' },
                { icon: <Code className="w-4 h-4 text-purple-400 shrink-0" />, label: 'JSON & API Data' },
                { icon: <Mail className="w-4 h-4 text-amber-400 shrink-0" />, label: 'Email Threads (.eml)' },
                { icon: <Mic className="w-4 h-4 text-emerald-400 shrink-0" />, label: 'Voice Transcripts' },
                { icon: <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />, label: 'Images & OCR' },
                { icon: <Table className="w-4 h-4 text-green-400 shrink-0" />, label: 'Spreadsheets' },
                { icon: <Lock className="w-4 h-4 text-indigo-400 shrink-0" />, label: 'Encrypted Vault' },
              ].map( ( { icon, label } ) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                  {icon} {label}
                </span>
              ) )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <section className="bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: '7+', label: 'File Formats', icon: <FileText className="w-5 h-5 text-blue-400" /> },
              { value: '100%', label: 'Private & Isolated', icon: <ShieldCheck className="w-5 h-5 text-emerald-400" /> },
              { value: '<2s', label: 'Avg. Query Time', icon: <Zap className="w-5 h-5 text-amber-400" /> },
              { value: '6', label: 'Auth Methods', icon: <Key className="w-5 h-5 text-indigo-400" /> },
            ].map( ( { value, label, icon } ) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">{icon}</div>
                <span className="text-2xl font-extrabold text-white">{value}</span>
                <span className="text-xs text-slate-400 font-medium">{label}</span>
              </div>
            ) )}
          </div>
        </div>
      </section>

      {/* ── Mock App Preview ───────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">Live Preview</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4">What the workspace looks like</h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-xl mx-auto">Ask a question, get a grounded answer with exact source citations in under 2 seconds.</p>
          </div>

          {/* Browser chrome wrapper */}
          <div className="rounded-2xl border border-slate-700 overflow-hidden shadow-2xl shadow-blue-500/10 bg-slate-900">
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-3 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex-1 bg-slate-950 rounded-lg px-3 py-1.5 text-[11px] text-slate-400 font-mono">
                localhost:3000/dashboard/chat
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {/* User bubble */}
              <div className="flex flex-col items-end gap-1">
                <p className="text-[10px] text-slate-400">You • 12:43 pm</p>
                <div className="bg-blue-600 text-white text-xs sm:text-sm px-4 py-3 rounded-2xl rounded-tr-none max-w-xs sm:max-w-md shadow-lg shadow-blue-600/20">
                  What were the termination clauses in the Acme contract?
                </div>
              </div>
              {/* AI response bubble */}
              <div className="flex flex-col items-start gap-1">
                <p className="text-[10px] text-slate-400">AI Work Memory • 12:43 pm</p>
                <div className="bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm px-4 py-3 rounded-2xl rounded-tl-none max-w-lg shadow-xl space-y-3">
                  <p>Based on your ingested documents, the <strong className="text-white">Acme Corp MSA (Clause 14.2)</strong> states:</p>
                  <blockquote className="border-l-2 border-blue-500 pl-3 italic text-slate-300 text-xs">
                    "Either party may terminate without cause upon 30 days written notice. Termination for cause takes effect immediately upon material breach."
                  </blockquote>
                  <p className="text-xs text-slate-400">The agreement also requires a <strong className="text-slate-200">$5,000 early termination fee</strong> if cancelled within the first 6 months.</p>
                  <div className="pt-2 border-t border-slate-700 space-y-1.5">
                    <p className="text-[10px] text-blue-400 font-semibold flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-400" /> Retrieved Grounding Sources (2):
                    </p>
                    {[
                      { title: 'Acme_Corp_MSA_Final.pdf', score: 94 },
                      { title: 'Vendor_Onboarding_Brief.pdf', score: 71 },
                    ].map( ( { title, score } ) => (
                      <div key={title} className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[10px]">
                        <span className="text-slate-300 font-mono truncate">{title}</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono shrink-0 ml-2">{score}%</span>
                      </div>
                    ) )}
                  </div>
                </div>
              </div>
              {/* Mock input */}
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 mt-4">
                <input readOnly value="Ask anything about your documents..." className="flex-1 bg-transparent text-xs text-slate-500 outline-none cursor-default" />
                <div className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold shrink-0">Ask</div>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button onClick={() => onLaunchDashboard( 'chat' )} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all cursor-pointer">
              <span>Try it live — no signup needed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-slate-900/30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">Architecture & Workflow</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4">From file upload to AI answer in 3 steps</h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">No manual folders, no forgotten links. Your knowledge base indexes and connects everything automatically.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '1', color: 'bg-blue-600', shadow: 'shadow-blue-600/30',
                icon: <FileText className="w-5 h-5 text-blue-400" />, title: 'Ingest & Chunk',
                desc: 'Upload PDFs, JSON, notes, or emails. Files are staged for review before submission. Gemini AI extracts metadata, tags, and a summary.',
                preview: <><span className="text-slate-300">📁 Project_Phoenix_Sync.pdf</span><br /><span className="text-emerald-400">→ Segmented into 3 vector chunks</span></>,
              },
              {
                num: '2', color: 'bg-indigo-600', shadow: 'shadow-indigo-600/30',
                icon: <Network className="w-5 h-5 text-indigo-400" />, title: 'Vectorize & Map Graph',
                desc: 'Chunks are embedded into 128-D vectors and linked in an interactive D3 knowledge graph connecting semantic tags, categories, and timelines.',
                preview: <><span className="text-slate-300">🔗 Cosine Similarity Index</span><br /><span className="text-indigo-400">→ 34 active nodes mapped in memory</span></>,
              },
              {
                num: '3', color: 'bg-purple-600', shadow: 'shadow-purple-600/30',
                icon: <Sparkles className="w-5 h-5 text-purple-400" />, title: 'Ask & Synthesize (RAG)',
                desc: 'Ask in plain English. Gemini retrieves the most relevant chunks using hybrid keyword + cosine similarity search, then generates a grounded answer.',
                preview: <><span className="text-slate-300">💬 "What tasks did Sarah assign?"</span><br /><span className="text-purple-400">→ Answer with 100% citation proof</span></>,
              },
            ].map( ( { num, color, shadow, icon, title, desc, preview } ) => (
              <div key={num} className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-4">
                <div className={`w-10 h-10 rounded-xl ${color} text-white font-bold flex items-center justify-center text-lg shadow-lg ${shadow}`}>{num}</div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">{icon}{title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{desc}</p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono">{preview}</div>
              </div>
            ) )}
          </div>
        </div>
      </section>

      {/* ── Upload Pipeline Visual ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-slate-800 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">Upload Pipeline</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4">What happens when you upload a file</h2>
            <p className="mt-2 text-slate-400 text-sm">Every file passes through a 4-stage pipeline before it is searchable.</p>
          </div>

          <div className="relative">
            <div className="hidden sm:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-linear-to-r from-blue-500/30 via-emerald-500/30 to-indigo-500/30" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: <Upload className="w-6 h-6 text-blue-400" />, bg: 'bg-blue-600/10 border-blue-500/20', label: 'Stage', desc: 'File is queued. Edit title, category, and attach a context note before uploading.' },
                { icon: <RefreshCw className="w-6 h-6 text-amber-400" />, bg: 'bg-amber-600/10 border-amber-500/20', label: 'AI Parse', desc: 'Gemini extracts text content, summary, category tags, and metadata.' },
                { icon: <Database className="w-6 h-6 text-emerald-400" />, bg: 'bg-emerald-600/10 border-emerald-500/20', label: 'Vector Embed', desc: 'Text is chunked into overlapping segments and converted to 128-D cosine-searchable vectors.' },
                { icon: <ShieldCheck className="w-6 h-6 text-indigo-400" />, bg: 'bg-indigo-600/10 border-indigo-500/20', label: 'Vault Save', desc: 'Saved to Supabase with RLS enforced. Only you can ever read or query this document.' },
              ].map( ( { icon, bg, label, desc } ) => (
                <div key={label} className="flex flex-col items-center text-center gap-3">
                  <div className={`w-16 h-16 rounded-2xl border ${bg} flex items-center justify-center relative z-10 bg-slate-950`}>{icon}</div>
                  <h4 className="text-sm font-bold text-white">{label}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ) )}
            </div>
          </div>

          {/* Staged queue mockup */}
          <div className="mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" /> Staged Files Queue (Ready to Upload)
              </h4>
              <span className="text-[10px] font-mono bg-slate-950 border border-slate-800 px-2 py-1 rounded text-slate-400">2 staged</span>
            </div>
            {[
              { name: 'Acme_Corp_MSA_Final.pdf', size: '248 KB', type: 'PDF', color: 'text-red-400' },
              { name: 'Q3_Marketing_Diwali_Promo.eml', size: '18 KB', type: 'Email', color: 'text-amber-400' },
            ].map( ( { name, size, type, color } ) => (
              <div key={name} className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className={`w-4 h-4 shrink-0 ${color}`} />
                  <span className="text-xs text-white font-medium truncate">{name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-[10px] text-slate-400 font-mono">{size}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">{type}</span>
                </div>
              </div>
            ) )}
            <button onClick={() => onLaunchDashboard( 'upload' )} className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-blue-600/80 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 border border-blue-500/30 cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Upload & Vector Embed All (2)
            </button>
          </div>
        </div>
      </section>

      {/* ── Examples Gallery ───────────────────────────────────────────────── */}
      <section id="examples-gallery" className="py-16 sm:py-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">Interactive Examples Gallery</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4">See what AI Work Memory can do</h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">Click through real-world examples across diverse professions.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
            {( [['contract', 'Legal Contract MSA'], ['medical', 'Medical Lab Report'], ['invoice', 'Client Invoice & Emails'], ['study', 'Academic Study Notes']] as const ).map( ( [key, label] ) => (
              <button key={key} onClick={() => setActiveExampleTab( key )}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${activeExampleTab === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}`}>
                {label}
              </button>
            ) )}
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400"><FileText className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-white font-bold text-base">{currentExample.title}</h3>
                  <p className="text-xs text-slate-400">{currentExample.description}</p>
                </div>
              </div>
              <span className={`text-[11px] font-mono px-3 py-1 rounded-lg border ${currentExample.badgeColor} self-start sm:self-auto`}>{currentExample.type}</span>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">Sample User Query:</span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-sm flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-blue-400 shrink-0" />
                  "{currentExample.query}"
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">AI RAG Synthesis & Citation:</span>
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-slate-200 text-sm space-y-3">
                  <p>{currentExample.answer}</p>
                  <div className="pt-2 border-t border-blue-500/10 flex items-center gap-2 text-xs text-slate-400">
                    <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Source: <strong className="text-white font-mono">{currentExample.source}</strong></span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono ml-auto">{currentExample.matchScore}% match</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => onLaunchDashboard( 'chat' )} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all cursor-pointer">
                <span>Test Query in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Role Explorer ──────────────────────────────────────────────────── */}
      <section id="use-cases" className="py-16 sm:py-24 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Built for every professional workflow</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">Select your role to see how AI Work Memory solves your daily information friction.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 mb-8">
            {SEED_ROLES.map( ( role ) => {
              const isActive = role.id === activeRoleKey;
              return (
                <button key={role.id} onClick={() => setActiveRoleKey( role.id )}
                  className={`p-3 rounded-xl border text-left md:text-center transition-all flex items-center md:flex-col md:justify-center gap-2.5 cursor-pointer ${isActive ? 'bg-blue-600/25 border-blue-500 text-blue-200 font-semibold shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/30' : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80'}`}>
                  <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/80 text-slate-400'}`}>{getRoleIcon( role.iconName )}</div>
                  <span className="text-xs font-semibold leading-tight min-w-0 wrap-break-word">{role.title}</span>
                </button>
              );
            } )}
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-400 flex items-center gap-2"><Zap className="w-4 h-4" /> {activeRole.title} Example</span>
              <span className="text-xs text-slate-500 font-mono">{activeRole.category}</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1.5 font-medium">User Natural Language Query:</p>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium text-base flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-500 shrink-0" />
                "{activeRole.question}"
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1.5 font-medium">AI Work Memory RAG Answer:</p>
              <div className="p-5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-slate-200 text-sm leading-relaxed space-y-3">
                <p>{activeRole.sampleAnswer}</p>
                <div className="pt-3 border-t border-blue-500/10 text-xs text-slate-400 flex flex-wrap items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Grounding Sources:</span>
                  {activeRole.sampleSources.map( ( src ) => (
                    <span key={src} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono border border-slate-800 text-[11px]">{src}</span>
                  ) )}
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => onLaunchDashboard( 'chat' )} className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                <span>Try this query in workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────────────────── */}
      <section id="features" className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Smart capabilities built-in</h2>
            <p className="mt-3 text-slate-400">Zero manual folder sorting. AI creates relationships automatically.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="w-6 h-6" />, iconBg: 'bg-blue-600/10 border-blue-500/20 text-blue-400',
                title: 'Semantic Vector Search',
                desc: "Find information even if you don't remember the exact file name or keywords used.",
                preview: (
                  <div className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-400 border border-slate-800">
                    <span className="text-red-400">Instead of:</span> invoice_2025_final_v2.pdf<br />
                    <span className="text-emerald-400">Ask:</span> "Find the invoice I sent to ABC Co."
                  </div>
                ),
              },
              {
                icon: <GitCommit className="w-6 h-6" />, iconBg: 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400',
                title: 'Interactive D3 Knowledge Map',
                desc: 'Visualize how your work evolved across documents, categories, and semantic tags.',
                preview: (
                  <div className="bg-slate-950 p-3 rounded-lg text-xs text-slate-300 border border-slate-800 flex items-center justify-between">
                    <span>Meeting Notes</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    <span>Proposal</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    <span>Approval</span>
                  </div>
                ),
              },
              {
                icon: <FolderTree className="w-6 h-6" />, iconBg: 'bg-purple-600/10 border-purple-500/20 text-purple-400',
                title: 'Zero-Config Auto Organization',
                desc: 'Upload a note and AI tags categories, urgency, and topics — no manual filing.',
                preview: (
                  <div className="bg-slate-950 p-3 rounded-lg text-xs text-slate-400 border border-slate-800 flex flex-wrap gap-1.5">
                    {['#ClientABC', '#Urgent', '#ManagerTasks'].map( ( t ) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">{t}</span>
                    ) )}
                  </div>
                ),
              },
            ].map( ( { icon, iconBg, title, desc, preview } ) => (
              <div key={title} className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl hover:border-blue-500/50 transition-all space-y-4">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-6 ${iconBg}`}>{icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{desc}</p>
                {preview}
              </div>
            ) )}
          </div>
        </div>
      </section>

      {/* ── Security & Privacy ─────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">Security & Privacy</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4">Your vault. Nobody else's.</h2>
            <p className="mt-2 text-slate-400 text-sm max-w-xl mx-auto">Data isolation is enforced inside PostgreSQL — not in app code. Even a bug cannot leak your data to another user.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, title: 'Row-Level Security (RLS)', desc: 'Every DB query is filtered to your user_id by Supabase PostgreSQL RLS policies enforced at the DB engine level.' },
              { icon: <Lock className="w-5 h-5 text-amber-400" />, title: 'AES-256 Secret Vault', desc: 'Passwords and secrets are envelope-encoded before storage. Plain text never reaches the database.' },
              { icon: <Key className="w-5 h-5 text-indigo-400" />, title: 'Server-side AI Proxy', desc: 'Your Gemini API key lives only in .env on the server. It is never bundled into the browser bundle.' },
              { icon: <Database className="w-5 h-5 text-blue-400" />, title: 'Offline localStorage Cache', desc: 'When Supabase is unreachable, data is cached in browser localStorage — sandboxed from other sites.' },
              { icon: <Users className="w-5 h-5 text-purple-400" />, title: 'Zero Cross-User Leakage', desc: 'RLS is enforced at the DB engine level. Even a misconfigured API endpoint returns zero rows for other users.' },
              { icon: <Star className="w-5 h-5 text-rose-400" />, title: '6 Auth Methods', desc: 'Google, GitHub, Magic Link, Phone OTP, Email+Password — all session-isolated via Supabase Auth JWTs.' },
            ].map( ( { icon, title, desc } ) => (
              <div key={title} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-2 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">{icon}</div>
                  <h4 className="text-sm font-bold text-white">{title}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ) )}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ─────────────────────────────────────────────────────── */}
      <section id="tech-stack" className="py-20 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold mb-4">
                <CheckCircle className="w-4 h-4" /> Production Architecture
              </div>
              <h2 className="text-3xl font-bold text-white leading-tight">
                Build & launch for <span className="text-emerald-400">$0/month</span>
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed">Google Gemini Flash + Supabase free tier + a single Express server — run this for up to 100 users at zero cost.</p>
              <div className="mt-8 space-y-4">
                {[
                  { icon: <Layers className="w-5 h-5" />, title: 'Fullstack Framework', desc: 'React 19 + Express + Vite 6 + Tailwind CSS v4' },
                  { icon: <Database className="w-5 h-5" />, title: 'Vector Engine & Storage', desc: 'Supabase PostgreSQL + client-side cosine similarity fallback' },
                  { icon: <Cpu className="w-5 h-5" />, title: 'AI Engine', desc: 'Google Gemini 2.5 Flash — file parse, RAG query, embedding' },
                ].map( ( { icon, title, desc } ) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-slate-800 text-blue-400 shrink-0">{icon}</div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">{title}</h4>
                      <p className="text-xs text-slate-400">{desc}</p>
                    </div>
                  </div>
                ) )}
              </div>
            </div>
            <div className="md:w-1/2 w-full">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center justify-between">
                  <span>Estimated Monthly Costs</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">Free Tier Friendly</span>
                </h3>
                <div className="space-y-3">
                  {[
                    ['0 – 100 active users', '$0 / mo', 'text-emerald-400'],
                    ['100 – 500 active users', '$0 – $10 / mo', 'text-slate-200'],
                    ['500 – 2,000 active users', '~$20 – $100 / mo', 'text-slate-200'],
                    ['5,000+ users', 'Scale on revenue', 'text-blue-400'],
                  ].map( ( [range, cost, color] ) => (
                    <div key={range} className="flex justify-between items-center py-2.5 border-b last:border-0 border-slate-900 text-sm">
                      <span className="text-slate-400">{range}</span>
                      <span className={`font-semibold ${color}`}>{cost}</span>
                    </div>
                  ) )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-slate-800 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Your documents are waiting to{' '}
            <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">talk back.</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            No setup required. Drop in any file and start asking questions. Your first vault is free, private, and ready in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button onClick={() => onLaunchDashboard( 'chat' )} className="px-8 py-4 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer">
              <span>Launch Workspace — Free</span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>
            {!user && (
              <button onClick={onOpenAuth} className="px-8 py-4 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all text-sm sm:text-base cursor-pointer">
                Create Account for Sync
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">No credit card. No data sharing. Fully isolated vault per user.</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-10 border-t border-slate-900 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-slate-300">AI Work Memory</span>
          </div>
          <div className="flex items-center gap-4">
            <p>© 2026 AI Work Memory.</p>
            <a href="https://github.com/dharam-gfx/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Github className="w-4 h-4 text-slate-300" />
              <span>dharam-gfx</span>
            </a>
          </div>
          {onOpenPrivacy && (
            <button onClick={onOpenPrivacy} className="text-xs text-slate-400 hover:text-blue-400 transition-colors underline cursor-pointer">
              Privacy Policy
            </button>
          )}
        </div>
      </footer>

    </div>
  );
};
