import React, { useState } from 'react';
import {
  FileText,
  Mail,
  File,
  Image as ImageIcon,
  Search,
  Filter,
  Trash2,
  Eye,
  Tag,
  Clock,
  Database,
  X,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { DocumentItem, FileType } from '../types';

interface DocumentLibraryModuleProps {
  documents: DocumentItem[];
  onDeleteDocument: (docId: string) => void;
  searchQuery: string;
}

export const DocumentLibraryModule: React.FC<DocumentLibraryModuleProps> = ({
  documents,
  onDeleteDocument,
  searchQuery,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedFileType, setSelectedFileType] = useState<string>('all');
  const [inspectDoc, setInspectDoc] = useState<DocumentItem | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);

  const handleDeleteConfirm = () => {
    if (!docToDelete) return;
    onDeleteDocument(docToDelete.id);
    if (inspectDoc?.id === docToDelete.id) {
      setInspectDoc(null);
    }
    setDocToDelete(null);
  };

  // Extract unique tags across all documents
  const allTags = Array.from(
    new Set(documents.flatMap((doc) => doc.tags))
  );

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.rawText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag === 'all' || doc.tags.includes(selectedTag);
    const matchesFileType = selectedFileType === 'all' || doc.fileType === selectedFileType;

    return matchesSearch && matchesTag && matchesFileType;
  });

  const getFileTypeBadge = (fileType: FileType) => {
    switch (fileType) {
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-semibold">
            <FileText className="w-3 h-3" /> PDF
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
            <Mail className="w-3 h-3" /> Email
          </span>
        );
      case 'note':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
            <File className="w-3 h-3" /> Note
          </span>
        );
      case 'image':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold">
            <ImageIcon className="w-3 h-3" /> Image
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-semibold">
            <FileText className="w-3 h-3" /> File
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-blue-500" />
            My Document Vault
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, and inspect all your saved documents, notes, and emails in one place.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
          Total Documents: <strong className="text-white">{documents.length}</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        
        {/* File Type Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          {['all', 'pdf', 'email', 'note', 'image'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFileType(type)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedFileType === type
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Tag Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 max-w-md overflow-x-auto">
          <span className="text-xs text-slate-400 font-semibold mr-1">Tags:</span>
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
              selectedTag === 'all'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            All Tags
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                selectedTag === tag
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

      </div>

      {/* Documents Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-500 bg-slate-900/30 border border-slate-800 rounded-2xl">
            No documents found matching your filter criteria.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 group shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  {getFileTypeBadge(doc.fileType)}
                  <span className="text-[10px] text-slate-500 font-mono">
                    {(doc.sizeBytes / 1024).toFixed(0)} KB
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {doc.summary || doc.rawText.substring(0, 120)}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/60">
                {/* Auto Tags */}
                <div className="flex flex-wrap gap-1">
                  {doc.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Layers className="w-3 h-3 text-blue-400" /> {doc.chunkCount} vector chunks
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectDoc(doc)}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all"
                      title="Inspect Raw Text & Chunks"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDocToDelete(doc)}
                      className="p-1.5 rounded-lg bg-slate-950 hover:bg-red-500/20 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Text Preview Modal Drawer */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                {getFileTypeBadge(inspectDoc.fileType)}
                <div>
                  <h3 className="text-sm font-bold text-white">{inspectDoc.title}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{inspectDoc.filename}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectDoc(null)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-1">AI Generated Summary:</h4>
                <p className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-slate-200 leading-relaxed">
                  {inspectDoc.summary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-1">Extracted Text Content:</h4>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
                  {inspectDoc.rawText}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400">
              <span>Category: {inspectDoc.category}</span>
              <button
                onClick={() => setInspectDoc(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in">
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Document Deletion</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Are you sure you want to permanently delete this document from your vault?
                </p>
              </div>
            </div>

            {/* Document Info Card */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <p className="font-bold text-white">{docToDelete.title}</p>
              <p className="text-[11px] text-slate-400 font-mono">{docToDelete.filename} • {docToDelete.chunkCount} vector chunks</p>
            </div>

            <p className="text-[11px] text-red-400 bg-red-950/30 border border-red-500/20 p-2.5 rounded-xl leading-relaxed">
              ⚠️ Warning: Deleting this file will remove its extracted text, vector embeddings, and knowledge graph node link. This action cannot be undone.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
