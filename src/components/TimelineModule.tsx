import React from 'react';
import { GitCommit, Calendar, Tag, FileText, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { TimelineEvent } from '../types';

interface TimelineModuleProps {
  events: TimelineEvent[];
  onSelectEvent: (docId: string) => void;
}

export const TimelineModule: React.FC<TimelineModuleProps> = ({ events, onSelectEvent }) => {
  // Sort events descending by timestamp
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-slate-800 pb-4 sm:pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <GitCommit className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 shrink-0" />
            <span>Activity Timeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Chronological history of your added documents, notes, and memory updates over time.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono shrink-0">
          Timeline Nodes: <strong className="text-white">{events.length}</strong>
        </div>
      </div>

      {/* Vertical Timeline Tree */}
      <div className="relative pl-10 sm:pl-14 space-y-6 sm:space-y-8 before:absolute before:left-4 sm:before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-blue-500 before:via-indigo-500 before:to-slate-800">
        {sortedEvents.map((evt) => {
          const formattedDate = new Date(evt.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div key={evt.id} className="relative group">
              {/* Timeline Marker Dot - Centered on Line outside the card */}
              <div className="absolute -left-6 sm:-left-8 -translate-x-1/2 top-6 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:border-blue-400 transition-all shrink-0 z-10">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-indigo-400 group-hover:bg-blue-400 transition-colors"></div>
              </div>

              {/* Event Card */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 min-w-0">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-semibold w-fit shrink-0">
                      {evt.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug break-words">
                      {evt.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {evt.summary}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap gap-1 max-w-full">
                    {evt.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => onSelectEvent(evt.docId)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors shrink-0 self-end sm:self-auto cursor-pointer"
                  >
                    <span>Inspect Document</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
