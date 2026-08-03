import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  FileCheck,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Zap,
  Tag,
  RefreshCw,
  AlertTriangle,
  Trash2,
  Briefcase,
  GraduationCap,
  Scale,
  Stethoscope,
  Building2,
  Home
} from 'lucide-react';
import { ChatMessage, DocumentItem, RolePreset } from '../types';
import { SEED_ROLES } from '../data/seedData';
import { retrieveRelevantChunks } from '../utils/vectorEngine';
import Markdown from 'react-markdown';

interface ChatModuleProps {
  documents: DocumentItem[];
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  strictGrounding?: boolean;
}

export const ChatModule: React.FC<ChatModuleProps> = ({
  documents,
  messages,
  setMessages,
  strictGrounding = true,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RolePreset | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendQuery = async (queryText?: string, rolePreset?: RolePreset) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isThinking) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roleTag: rolePreset?.title || selectedRole?.title,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsThinking(true);

    try {
      // Perform server RAG query endpoint
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          documents: documents,
          roleContext: rolePreset?.title || selectedRole?.title,
          strictGrounding,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const aiMessage: ChatMessage = {
            id: `msg-ai-${Date.now()}`,
            sender: 'ai',
            text: data.answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            citations: data.citations || [],
            status: 'done',
          };
          setMessages((prev) => [...prev, aiMessage]);
          setIsThinking(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Falling back to client RAG engine:', err);
    }

    // Client fallback RAG engine
    const { citations } = retrieveRelevantChunks(textToSend, documents, 4);

    let synthesizedAnswer = '';
    if (citations.length > 0) {
      synthesizedAnswer = `Based on your ingested files (${citations.map((c) => c.docTitle).join(', ')}):\n\nKey details found in your knowledge base:\n• ${citations[0].snippet.replace(/\n+/g, ' ')}\n\n${
        citations[1] ? `• Additional context from ${citations[1].docTitle}: ${citations[1].snippet.substring(0, 150)}...` : ''
      }`;
    } else {
      synthesizedAnswer = `I searched your ${documents.length} ingested documents for "${textToSend}", but didn't find exact keyword or vector matches. Try uploading relevant files in the Upload Knowledge module!`;
    }

    const aiFallbackMessage: ChatMessage = {
      id: `msg-ai-${Date.now()}`,
      sender: 'ai',
      text: synthesizedAnswer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: citations,
      status: 'done',
    };

    setMessages((prev) => [...prev, aiFallbackMessage]);
    setIsThinking(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-115 w-full max-w-5xl mx-auto bg-slate-950 border border-slate-800/80 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Header Bar */}
      <div className="p-3 sm:p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="truncate">Ask AI Assistant</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] sm:text-[10px] font-semibold border border-emerald-500/20 shrink-0">
                Connected
              </span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
              Searching from {documents.length} saved documents
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (messages.length > 0) {
              setShowResetConfirm(true);
            }
          }}
          disabled={messages.length === 0}
          title="Clear Conversation History"
          className="p-1.5 sm:p-2 rounded-lg bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-slate-400 hover:text-white border border-slate-800 transition-all text-xs flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Preset Role Prompts Bar */}
      <div className="relative w-full max-w-full bg-slate-900/80 border-b border-slate-800/80 shrink-0 z-10">
        {/* Subtle Fade Indicators for Scrollable Presets Bar */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-linear-to-r from-slate-900 to-transparent z-10 pointer-events-none sm:hidden" />
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-linear-to-l from-slate-900 to-transparent z-10 pointer-events-none sm:hidden" />

        <div className="px-2.5 sm:px-3 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none touch-pan-x flex-nowrap w-full">
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1 bg-slate-950/90 px-2 py-1 rounded-md border border-slate-800/80">
            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Presets:</span>
          </span>
          {SEED_ROLES.map((role) => {
            const renderIcon = () => {
              switch (role.id) {
                case 'office': return <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
                case 'student': return <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
                case 'lawyer': return <Scale className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
                case 'doctor': return <Stethoscope className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
                case 'business': return <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
                case 'family': return <Home className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
                default: return <Tag className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
              }
            };
            const isSelected = selectedRole?.id === role.id;
            return (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role);
                  handleSendQuery(role.question, role);
                }}
                title={`Prompt: "${role.question}"`}
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600/30 border-blue-500/60 text-blue-200 font-semibold shadow-sm shadow-blue-500/20'
                    : 'bg-slate-950/90 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {renderIcon()}
                <span className="font-semibold text-slate-100">{role.title}</span>
                <span className="hidden sm:inline text-slate-400 italic font-mono text-[10px] sm:text-[11px]">
                  "{role.question.substring(0, 22)}..."
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {messages.length === 0 ? (
          <div className="h-full min-h-55 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Stop searching. Start asking.</h3>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Ask anything across your PDFs, JSON files, emails, receipts, or notes. Tap any preset prompt above to see instant grounding.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-1.5 mb-1 text-[10px] sm:text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">
                  {msg.sender === 'user' ? 'You' : 'AI Work Memory'}
                </span>
                {msg.roleTag && (
                  <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px]">
                    {msg.roleTag}
                  </span>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[92%] sm:max-w-2xl p-3 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
                }`}
              >
                {msg.sender === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                ) : (
                  <div className="markdown-body text-slate-200 leading-relaxed space-y-2 [&>h1]:text-base [&>h1]:font-bold [&>h1]:text-white [&>h2]:text-sm [&>h2]:font-bold [&>h2]:text-white [&>h3]:text-xs [&>h3]:font-bold [&>h3]:text-white [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>li]:my-1 [&>p]:my-1.5 [&>strong]:text-white [&>code]:bg-slate-950 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-blue-400 [&>code]:font-mono [&>code]:text-xs [&>pre]:bg-slate-950 [&>pre]:p-3 [&>pre]:rounded-xl [&>pre]:my-2 [&>blockquote]:border-l-2 [&>blockquote]:border-blue-500 [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-slate-400">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                )}

                {/* Grounding Source Citation Cards */}
                {msg.sender === 'ai' && msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
                      <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        Retrieved Grounding Sources ({msg.citations.length}):
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.citations.map((cite, idx) => {
                        const citeKey = `${msg.id}-cite-${idx}`;
                        const isExpanded = expandedCitationId === citeKey;

                        return (
                          <div
                            key={citeKey}
                            className="p-2 sm:p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all"
                          >
                            <button
                              type="button"
                              onClick={() => setExpandedCitationId(isExpanded ? null : citeKey)}
                              className="w-full flex items-center justify-between cursor-pointer text-[11px] sm:text-xs gap-2 text-left"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[9px] font-mono border border-blue-500/20 shrink-0">
                                  {Math.round(cite.matchScore * 100)}%
                                </span>
                                <span className="font-semibold text-slate-200 truncate">{cite.docTitle}</span>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                            </button>

                            {/* Snippet Drawer */}
                            {isExpanded && (() => {
                              const isImageSnippet = cite.snippet.trimStart().startsWith('data:image');
                              const isBinarySnippet = !isImageSnippet && cite.snippet.trimStart().startsWith('data:');
                              return (
                                <div className="mt-2 pt-2 border-t border-slate-800 bg-slate-900/80 p-2 rounded-lg">
                                  <p className="text-[9px] text-slate-500 font-sans mb-1.5 font-semibold uppercase">
                                    {isImageSnippet ? 'Image Preview:' : 'Exact Chunk Snippet:'}
                                  </p>
                                  {isImageSnippet ? (
                                    <div className="flex items-center justify-center bg-slate-950 rounded-lg p-1.5">
                                      <img
                                        src={cite.snippet}
                                        alt={cite.docTitle}
                                        className="max-h-48 max-w-full object-contain rounded"
                                      />
                                    </div>
                                  ) : isBinarySnippet ? (
                                    <p className="text-[10px] sm:text-[11px] text-slate-400 italic">
                                      [Binary file data — content is not displayable as text]
                                    </p>
                                  ) : (
                                    <p className="text-[10px] sm:text-[11px] text-slate-300 font-mono leading-relaxed">
                                      "{cite.snippet}"
                                    </p>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Thinking State Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2.5 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl w-fit animate-pulse">
            <BrainCircuit className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
            <span>Scanning vectors & generating response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Box */}
      <div className="p-2.5 sm:p-4 bg-slate-900/90 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about your documents..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isThinking}
            className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />

          <button
            type="submit"
            disabled={isThinking || !inputQuery.trim()}
            className="px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-lg shadow-blue-600/20 text-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs">Ask</span>
          </button>
        </form>
      </div>

      {/* Reset Chat Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in">
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Conversation History</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to clear all messages in this active chat session?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              This will clear <strong>{messages.length} messages</strong> from the conversation view. Ingested documents in your vault will remain safe and available for future queries.
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setMessages([]);
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Clear Messages</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
