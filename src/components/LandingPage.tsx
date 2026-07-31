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
  File,
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
  Terminal,
  Lock,
  Code,
  Github
} from 'lucide-react';
import { SEED_ROLES } from '../data/seedData';

interface LandingPageProps {
  onLaunchDashboard: (tab?: string) => void;
  onOpenAuth: () => void;
  onOpenPrivacy?: () => void;
  user: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchDashboard, onOpenAuth, onOpenPrivacy, user }) => {
  const [activeRoleKey, setActiveRoleKey] = useState<string>('office');
  const [activeExampleTab, setActiveExampleTab] = useState<'contract' | 'medical' | 'invoice' | 'study'>('contract');
  const [mousePos, setMousePos] = useState({ x: 250, y: 150 });
  const [isHovered, setIsHovered] = useState(false);

  const activeRole = SEED_ROLES.find((r) => r.id === activeRoleKey) || SEED_ROLES[0];

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'briefcase':
        return <Briefcase className="w-5 h-5" />;
      case 'graduation-cap':
        return <GraduationCap className="w-5 h-5" />;
      case 'scale':
        return <Scale className="w-5 h-5" />;
      case 'stethoscope':
        return <Stethoscope className="w-5 h-5" />;
      case 'building-2':
        return <Building2 className="w-5 h-5" />;
      case 'home':
        return <Home className="w-5 h-5" />;
      default:
        return <Briefcase className="w-5 h-5" />;
    }
  };

  const exampleDetails = {
    contract: {
      title: 'Legal Contract MSA',
      type: 'PDF Document',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
      description: 'Acme Corp Master Service Agreement containing termination clause 14.2.',
      query: 'Find every contract mentioning termination clauses.',
      answer: 'Found Acme Corp MSA (Clause 14.2): Either party may terminate without cause upon 30 days written notice.',
      source: 'Acme_Corp_MSA_Final.pdf'
    },
    medical: {
      title: 'Patient Medical Lab History',
      type: 'PDF Record',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Patient John Doe EHR lab report tracking HbA1c improvements.',
      query: 'Show previous lab reports for patient John Doe.',
      answer: 'HbA1c improved from 6.2% (Prediabetic, March 2025) down to 5.8% (November 2025 follow-up).',
      source: 'EHR_Export_Doe_John_4409.pdf'
    },
    invoice: {
      title: 'Client ABC Engagement',
      type: 'Email & Invoice',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Transaction history, change order #1, and cleared milestone payments.',
      query: 'Show every discussion related to Client ABC.',
      answer: 'Initial quote $15,000 + $3,500 change order for custom export module. Total revenue: $18,500.',
      source: 'Client_ABC_Engagement_Summary.eml'
    },
    study: {
      title: 'Biology Chapter 5 Study Notes',
      type: 'Text Note',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description: 'Cellular respiration notes covering glycolysis, Krebs cycle, and ATP synthesis.',
      query: 'Summarize everything about Chapter 5 in Biology.',
      answer: 'Glycolysis yields 2 ATP in cytoplasm; Krebs cycle produces NADH/FADH2 in matrix; ETC generates ~32 ATP.',
      source: 'Bio_Textbook_Ch5_Cellular_Respiration.txt'
    }
  };

  const currentExample = exampleDetails[activeExampleTab];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white shrink-0">
                <BrainCircuit className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-base sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent truncate">
                AI Work Memory
              </span>
            </div>

            {/* Nav Links */}
            <nav className="hidden lg:flex space-x-8 text-sm font-medium text-slate-400">
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                How It Works
              </a>
              <a
                href="#examples-gallery"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('examples-gallery')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Examples Gallery
              </a>
              <a
                href="#use-cases"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('use-cases')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                For Every Role
              </a>
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Features
              </a>
              <a
                href="#tech-stack"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('tech-stack')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Tech Stack
              </a>
            </nav>

            {/* CTA Button & Auth Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {!user && (
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
                >
                  Sign In
                </button>
              )}
              <button
                onClick={() => onLaunchDashboard('chat')}
                className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 gap-1.5 sm:gap-2 cursor-pointer"
              >
                <span>
                  <span className="hidden sm:inline">{user ? 'Enter Dashboard' : 'Get Started'}</span>
                  <span className="sm:hidden">App</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Gemini AI Style Animated Background & Full-Width Cursor Tracking */}
      <section
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 md:pt-36 md:pb-36 overflow-hidden border-b border-slate-900 cursor-default bg-slate-950/60"
      >
        {/* Cursor-Following Vivid Colorful Glowing Orb across full hero section */}
        <div
          className="absolute w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-gradient-to-r from-blue-500/50 via-indigo-500/50 via-purple-500/50 to-pink-500/50 blur-[130px] pointer-events-none transition-opacity duration-300 z-0 transform -translate-x-1/2 -translate-y-1/2 opacity-80 mix-blend-screen"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
          }}
        />

        {/* Secondary Cursor Glow Ring for extra brilliance */}
        <div
          className="absolute w-[250px] h-[250px] rounded-full bg-cyan-400/40 blur-[80px] pointer-events-none transition-opacity duration-300 z-0 transform -translate-x-1/2 -translate-y-1/2 opacity-70 mix-blend-screen"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
          }}
        />

        {/* Gemini AI Style Animated Colorful Glowing Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Primary Blue Orb */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.25, 0.45, 0.25],
              x: [0, 80, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] sm:w-[750px] sm:h-[750px] rounded-full bg-blue-600/30 blur-[130px]"
          />
          {/* Purple / Magenta Orb */}
          <motion.div
            animate={{
              scale: [1.1, 0.85, 1.1],
              opacity: [0.2, 0.4, 0.2],
              x: [-60, 60, -60],
              y: [40, -40, 40],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-purple-600/25 blur-[120px]"
          />
          {/* Pink / Rose Orb */}
          <motion.div
            animate={{
              scale: [0.9, 1.2, 0.9],
              opacity: [0.15, 0.35, 0.15],
              x: [50, -50, 50],
              y: [-30, 50, -30],
            }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-pink-600/20 blur-[110px]"
          />
          {/* Cyan / Teal Accent Orb */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [-40, -80, -40],
              y: [-50, 20, -50],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/3 w-[350px] h-[350px] rounded-full bg-cyan-500/20 blur-[100px]"
          />
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Universal Tag */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] sm:text-xs text-blue-400 font-semibold mb-6 sm:mb-8 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span>Universal AI Knowledge Graph & Vector RAG Assistant</span>
          </motion.div>

          {/* Main Headline without box container */}
          <div className="max-w-4xl mx-auto my-2 py-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight sm:leading-tight text-white drop-shadow-md"
            >
              Stop searching. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                Start asking your files.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-4 sm:mt-6 text-sm sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm"
            >
              Your private AI colleague that never forgets anything. Upload PDFs, JSON files, emails, voice notes, spreadsheets, or secure credentials—and get instant citations and answers using Gemini RAG.
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
          >
            <button
              onClick={() => onLaunchDashboard('chat')}
              className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer"
            >
              <span>Launch Interactive Workspace</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all text-sm sm:text-base cursor-pointer backdrop-blur-sm"
            >
              How RAG Works & Examples
            </button>
          </motion.div>

          {/* Upload Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-slate-900/80"
          >
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 sm:mb-6">
              Supported formats & secure vaults
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-3xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <FileText className="w-4 h-4 text-red-400 shrink-0" /> PDFs & Docs
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <Code className="w-4 h-4 text-purple-400 shrink-0" /> JSON Files & API Data
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" /> Email Threads (.eml)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <Mic className="w-4 h-4 text-emerald-400 shrink-0" /> Voice Transcripts
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" /> Images & OCR
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <Table className="w-4 h-4 text-green-400 shrink-0" /> Spreadsheets
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <Lock className="w-4 h-4 text-indigo-400 shrink-0" /> Encrypted Vault & Secrets
              </span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* How It Works - 3 Step Guide */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-slate-900/30 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              Architecture & Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4">
              How AI Work Memory Transforms Your Files in 3 Steps
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              No manual folders, no forgotten links. Your personal knowledge base indexes and connects everything automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl relative shadow-xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-blue-600/30">
                1
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Ingest & Chunk
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Upload PDFs, JSON data files, notes, emails, or paste text directly. The app automatically segments your documents into intelligent vector chunks with metadata tags.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                📁 Project_Phoenix_Sync.pdf <br />
                <span className="text-emerald-400">→ Segmented into 3 vector chunks</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl relative shadow-xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-indigo-600/30">
                2
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-400" />
                Vectorize & Map Graph
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Documents are embedded and linked in an interactive D3 knowledge graph, connecting semantic tags, categories, and timelines instantly.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                🔗 Cosine Similarity Index <br />
                <span className="text-indigo-400">→ 34 active nodes mapped in memory</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl relative shadow-xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-purple-600/30">
                3
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Ask & Synthesize (RAG)
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Ask questions in plain natural language. Google Gemini Flash retrieves exact source snippets and synthesizes precise answers with inline citations.
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                💬 "What tasks did Sarah assign?" <br />
                <span className="text-purple-400">→ Answer generated with 100% citation proof</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Examples Gallery Section */}
      <section id="examples-gallery" className="py-16 sm:py-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Interactive Examples Gallery
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4">
              See What AI Work Memory Can Do
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Click through real-world document examples to test how RAG extracts answers across diverse professions.
            </p>
          </div>

          {/* Example Tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
            <button
              onClick={() => setActiveExampleTab('contract')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeExampleTab === 'contract'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Legal Contract MSA
            </button>
            <button
              onClick={() => setActiveExampleTab('medical')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeExampleTab === 'medical'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Medical Lab Report
            </button>
            <button
              onClick={() => setActiveExampleTab('invoice')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeExampleTab === 'invoice'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Client Invoice & Emails
            </button>
            <button
              onClick={() => setActiveExampleTab('study')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeExampleTab === 'study'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Academic Study Notes
            </button>
          </div>

          {/* Example Showcase Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">{currentExample.title}</h3>
                  <p className="text-xs text-slate-400">{currentExample.description}</p>
                </div>
              </div>
              <span className={`text-[11px] font-mono px-3 py-1 rounded-lg border ${currentExample.badgeColor} self-start sm:self-auto`}>
                {currentExample.type}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                  Sample User Query:
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium text-sm flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-blue-400 shrink-0" />
                  "{currentExample.query}"
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-2">
                  AI RAG Synthesis & Citation:
                </span>
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-slate-200 text-sm space-y-3">
                  <p>{currentExample.answer}</p>
                  <div className="pt-2 border-t border-blue-500/10 flex items-center gap-2 text-xs text-slate-400">
                    <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Source Document: <strong className="text-white font-mono">{currentExample.source}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onLaunchDashboard('chat')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <span>Test Query in Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Role Explorer Section */}
      <section id="use-cases" className="py-16 sm:py-24 bg-slate-900/40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Built for every professional and personal workflow</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">Select your role to see how AI Work Memory solves your daily information friction.</p>
          </div>

          {/* Role Tabs Grid on Mobile & Desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 mb-8">
            {SEED_ROLES.map((role) => {
              const isActive = role.id === activeRoleKey;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRoleKey(role.id)}
                  className={`p-3 rounded-xl border text-left md:text-center transition-all flex items-center md:flex-col md:justify-center gap-2.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/25 border-blue-500 text-blue-200 font-semibold shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/30'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800/80 text-slate-400'}`}>
                    {getRoleIcon(role.iconName)}
                  </div>
                  <span className="text-xs font-semibold leading-tight min-w-0 break-words">
                    {role.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Role Content Display Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-blue-400 flex items-center gap-2">
                <Zap className="w-4 h-4" /> {activeRole.title} Example
              </span>
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
                  <span>Grounding Sources Retrieved:</span>
                  {activeRole.sampleSources.map((src, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono border border-slate-800 text-[11px]">
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onLaunchDashboard('chat')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                <span>Try this query in workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section id="features" className="py-20 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Smart capabilities built-in</h2>
            <p className="mt-3 text-slate-400">Zero manual folder sorting. AI creates relationships automatically.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-blue-600/10 rounded-xl border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Semantic Vector Search</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Find information even if you don't remember the exact file name or keywords used.
              </p>
              <div className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-400 border border-slate-800">
                <span className="text-red-400">Instead of:</span> invoice_2025_final_v2.pdf<br />
                <span className="text-emerald-400">Ask:</span> "Find the invoice I sent to ABC Co."
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-indigo-600/10 rounded-xl border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <GitCommit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Interactive D3 Knowledge Map</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Visualize how your work evolved chronologically across different documents and semantic tags.
              </p>
              <div className="bg-slate-950 p-3 rounded-lg text-xs text-slate-300 border border-slate-800 flex items-center justify-between">
                <span>Meeting Notes</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span>Proposal</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span>Approval</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-purple-600/10 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                <FolderTree className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Zero-Config Auto Organization</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Zero manual folder management. Upload a note and AI tags categories, urgency, and topics.
              </p>
              <div className="bg-slate-950 p-3 rounded-lg text-xs text-slate-400 border border-slate-800 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">#ClientABC</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">#Urgent</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">#ManagerTasks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Breakdown */}
      <section id="tech-stack" className="py-20 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-semibold mb-4">
                <CheckCircle className="w-4 h-4" /> Production Architecture
              </div>
              <h2 className="text-3xl font-bold text-white leading-tight">
                Build & Launch This RAG Product for <span className="text-emerald-400">$0/month</span>
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Using modern serverless architectures, Google Gemini Flash, and vector similarity search, you can deploy a full-featured personal knowledge graph for up to 100 users at zero cost.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-slate-800 text-blue-400 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Fullstack Framework</h4>
                    <p className="text-xs text-slate-400">React 19 + Express Server + Vite + Tailwind CSS for ultra-fast rendering.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-slate-800 text-blue-400 shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Vector Engine & Storage</h4>
                    <p className="text-xs text-slate-400">Supabase pgvector / Local vector database simulator with cosine similarity search.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-slate-800 text-blue-400 shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">AI Engine</h4>
                    <p className="text-xs text-slate-400">Google Gemini 2.5/3.6 Flash for synthesis + Gemini Embeddings for vector creation.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Table Card */}
            <div className="md:w-1/2 w-full">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center justify-between">
                  <span>Estimated Monthly Costs</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                    Free Tier Friendly
                  </span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-900 text-sm">
                    <span className="text-slate-400">0 – 100 active users</span>
                    <span className="font-semibold text-emerald-400">$0 / mo</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-900 text-sm">
                    <span className="text-slate-400">100 – 500 active users</span>
                    <span className="font-semibold text-slate-200">$0 – $10 / mo</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-900 text-sm">
                    <span className="text-slate-400">500 – 2,000 active users</span>
                    <span className="font-semibold text-slate-200">~$20 – $100 / mo</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 text-sm">
                    <span className="text-slate-400">5,000+ users</span>
                    <span className="font-semibold text-blue-400">Scale on revenue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-slate-300">AI Work Memory</span>
          </div>
          <div className="flex items-center gap-4">
            <p>© 2026 AI Work Memory.</p>
            <a
              href="https://github.com/dharam-gfx/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
            >
              <Github className="w-4 h-4 text-slate-300" />
              <span>dharam-gfx</span>
            </a>
          </div>
          {onOpenPrivacy && (
            <button
              onClick={onOpenPrivacy}
              className="text-xs text-slate-400 hover:text-blue-400 transition-colors underline cursor-pointer"
            >
              Privacy Policy
            </button>
          )}
        </div>
      </footer>

    </div>
  );
};

