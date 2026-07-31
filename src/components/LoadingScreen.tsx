import React from 'react';
import { BrainCircuit } from 'lucide-react';

export const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-600/30 animate-pulse">
        <BrainCircuit className="w-7 h-7 text-white" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-sm font-bold text-white tracking-tight">AI Work Memory</p>
        <p className="text-xs text-slate-400">Restoring your secure vault...</p>
      </div>
      <div className="flex gap-1.5 mt-1">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);
