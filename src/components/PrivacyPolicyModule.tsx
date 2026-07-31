import React from 'react';
import { ShieldCheck, BrainCircuit, ArrowLeft, Lock, Database, Cpu, Eye, FileText, CheckCircle, Mail, Github } from 'lucide-react';

interface PrivacyPolicyModuleProps {
  onBack: () => void;
}

export const PrivacyPolicyModule: React.FC<PrivacyPolicyModuleProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-400">
              Last updated: July 30, 2026
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return</span>
        </button>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 space-y-10">
        
        {/* Intro Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-semibold mb-6">
            <ShieldCheck className="w-4 h-4" /> Commitment to Absolute Data Privacy
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Your Knowledge. Your Private Workspace.
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            At AI Work Memory ("we", "our", or "us"), we believe that your personal and professional knowledge graph is entirely your property. This Privacy Policy outlines how we collect, use, protect, and handle your data when you use our web platform, AI RAG engine, document library, and vector search tools.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">1. Information We Collect</h3>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              To provide a fully functioning personal knowledge graph and AI search assistant, we collect specific categories of information based on your direct interactions:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li><strong className="text-slate-200">Account Credentials:</strong> Email addresses and names provided during registration or authentication (via Supabase Auth or secure local fallback sessions).</li>
              <li><strong className="text-slate-200">Uploaded Documents & Text Notes:</strong> Files (PDFs, JSON files, spreadsheets, text documents), markdown notes, secure secrets, and API credentials that you explicitly ingest into your knowledge base.</li>
              <li><strong className="text-slate-200">Chat & Query History:</strong> Prompts, questions, and synthesized RAG answers generated during your sessions to maintain conversation context.</li>
              <li><strong className="text-slate-200">Vector Embeddings:</strong> Mathematical vector representations computed from your documents to enable semantic similarity search and knowledge graph linking.</li>
            </ul>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">2. How Google Gemini AI Processes Your Data</h3>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              Our application integrates with the Google Gemini API to perform retrieval-augmented generation (RAG) and answer your queries:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li><strong className="text-slate-200">Server-Side Proxy:</strong> All Gemini API calls are executed securely via our server-side backend. Your API keys and sensitive prompts are never exposed directly to the client browser.</li>
              <li><strong className="text-slate-200">Strict Data Isolation:</strong> Data sent to Gemini is used solely for the duration of your query to synthesize accurate answers and citations. Google does not use your API-submitted enterprise data to train its public base models.</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">3. Data Storage, Isolation & Security</h3>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li><strong className="text-slate-200">Supabase & Local Isolation:</strong> User records and knowledge items are stored in isolated encrypted database tables with Row Level Security (RLS) or secure per-user local storage partitions.</li>
              <li><strong className="text-slate-200">Zero Third-Party Sharing:</strong> We never sell, rent, or trade your documents, personal notes, or API keys to any advertisers or data brokers.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">4. Your Rights and Data Control</h3>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              You maintain total autonomy over your data at all times:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li><strong className="text-slate-200">Deletion:</strong> You can delete individual documents, clear chat histories, or completely purge your account data instantly. Once deleted, data is permanently removed from both local storage and the Supabase database.</li>
              <li><strong className="text-slate-200">Sign Out:</strong> Signing out immediately ends your session. Your data remains securely stored in Supabase under your account and is only accessible upon re-authentication.</li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">5. Contact Us</h3>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please reach out via GitHub:
            </p>
            <a
              href="https://github.com/dharam-gfx/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 font-semibold hover:underline"
            >
              github.com/dharam-gfx
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 text-center text-slate-500 text-xs flex flex-col sm:flex-row justify-center items-center gap-4 px-4">
        <p>© 2026 AI Work Memory. All rights reserved. Built with secure serverless architecture.</p>
        <a
          href="https://github.com/dharam-gfx/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
        >
          <Github className="w-4 h-4 text-slate-300" />
          <span>dharam-gfx</span>
        </a>
      </footer>
    </div>
  );
};
