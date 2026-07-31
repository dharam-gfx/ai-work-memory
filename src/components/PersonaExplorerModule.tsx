import React from 'react';
import {
  Users,
  Briefcase,
  GraduationCap,
  Scale,
  Stethoscope,
  Building2,
  Home,
  ArrowRight,
  MessageSquare,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { RolePreset } from '../types';
import { SEED_ROLES } from '../data/seedData';

interface PersonaExplorerModuleProps {
  onSelectRolePrompt: (role: RolePreset) => void;
}

export const PersonaExplorerModule: React.FC<PersonaExplorerModuleProps> = ({
  onSelectRolePrompt,
}) => {
  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'briefcase':
        return <Briefcase className="w-5 h-5 text-blue-400" />;
      case 'graduation-cap':
        return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      case 'scale':
        return <Scale className="w-5 h-5 text-amber-400" />;
      case 'stethoscope':
        return <Stethoscope className="w-5 h-5 text-emerald-400" />;
      case 'building-2':
        return <Building2 className="w-5 h-5 text-purple-400" />;
      case 'home':
        return <Home className="w-5 h-5 text-pink-400" />;
      default:
        return <Briefcase className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Users className="w-6 h-6 text-blue-500" />
          Persona Explorer: Universal Use Cases
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          AI Work Memory adapts to every profession and personal scenario. Click "Test in Chat" to query your knowledge graph under any persona.
        </p>
      </div>

      {/* Grid of 6 Role Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SEED_ROLES.map((role) => (
          <div
            key={role.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xl group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  {getRoleIcon(role.iconName)}
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono">
                  {role.category}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  {role.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {role.description}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Example Natural Query:</p>
                <p className="text-xs font-medium text-slate-200 italic">
                  "{role.question}"
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectRolePrompt(role)}
              className="w-full py-2.5 rounded-xl bg-blue-600/15 hover:bg-blue-600 border border-blue-500/30 text-blue-400 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-600/20"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Query in RAG Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
