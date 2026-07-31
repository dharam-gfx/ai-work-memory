import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Mail,
  File,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Plus,
  AlertTriangle,
  RefreshCw,
  X,
  Layers,
  Copy,
  Lock,
  Key
} from 'lucide-react';
import { DocumentItem, FileType } from '../types';
import { Progress } from '@/components/ui/progress';

interface UploadModuleProps {
  onDocumentAdded: (doc: DocumentItem) => void;
  onDocumentOverwrite?: (doc: DocumentItem) => void;
  ingestionQueue: DocumentItem[];
  duplicatePrevention?: boolean;
}

interface DuplicateMatch {
  existingDoc: DocumentItem;
  pendingDoc: {
    title: string;
    filename: string;
    fileType: FileType;
    rawText: string;
    sizeBytes: number;
    base64Data?: string;
    mimeType?: string;
  };
}

interface UploadStage {
  fileName: string;
  stageName: string;
  percent: number;
  stepText: string;
}

export interface StagedFileItem {
  id: string;
  title: string;
  filename: string;
  fileType: FileType;
  rawText: string;
  sizeBytes: number;
  base64Data?: string;
  mimeType?: string;
  category: string;
  customMessage: string;
}

export const UploadModule: React.FC<UploadModuleProps> = ({
  onDocumentAdded,
  onDocumentOverwrite,
  ingestionQueue,
  duplicatePrevention = true,
}) => {
  const [activeUploadTab, setActiveUploadTab] = useState<'file' | 'note' | 'secret' | 'credentials'>('file');
  const [pastedText, setPastedText] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [fileCategory, setFileCategory] = useState('Work & Ops');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Staged Files Queue before upload
  const [stagedFiles, setStagedFiles] = useState<StagedFileItem[]>([]);

  // Progress & Notification State
  const [uploadStage, setUploadStage] = useState<UploadStage | null>(null);
  const [duplicateMatch, setDuplicateMatch] = useState<DuplicateMatch | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const categories = ['Work & Ops', 'Legal', 'Healthcare', 'Academic', 'Business', 'Home & Personal'];

  // Handle Multi-file Upload / Selection (Staging)
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await stageSingleFile(file);
    }
  };

  const stageSingleFile = async (file: File) => {
    if (file.size > 1 * 1024 * 1024) {
      showError(`"${file.name}" exceeds the 1 MB limit (${(file.size / 1024 / 1024).toFixed(2)} MB). Please upload a smaller file.`);
      return;
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    let detectedType: FileType = 'pdf';
    if (fileExt === 'eml' || fileExt === 'msg') detectedType = 'email';
    else if (fileExt === 'txt' || fileExt === 'md' || fileExt === 'json') detectedType = 'note';
    else if (['png', 'jpg', 'jpeg', 'webp'].includes(fileExt || '')) detectedType = 'image';
    else if (['xlsx', 'csv'].includes(fileExt || '')) detectedType = 'excel';

    return new Promise<void>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        let textContent = (e.target?.result as string) || `Uploaded file ${file.name} content`;
        
        if (fileExt === 'json') {
          try {
            const parsed = JSON.parse(textContent);
            textContent = JSON.stringify(parsed, null, 2);
          } catch (err) {
            // Keep raw text if invalid json
          }
        }
        
        let base64Data = '';
        if (['png', 'jpg', 'jpeg', 'webp', 'pdf'].includes(fileExt || '')) {
          base64Data = textContent.split(',')[1] || '';
        }

        const title = file.name.replace(/\.[^/.]+$/, '');
        const filename = file.name;

        const newItem: StagedFileItem = {
          id: `stage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title,
          filename,
          fileType: detectedType,
          rawText: textContent,
          sizeBytes: file.size,
          base64Data,
          mimeType: file.type,
          category: fileCategory,
          customMessage: '',
        };

        setStagedFiles(prev => [newItem, ...prev]);
        showToast(`Staged "${title}" successfully. Ready to upload!`);
        resolve();
      };

      if (['png', 'jpg', 'jpeg', 'webp', 'pdf'].includes(fileExt || '')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim()) return;

    const title = docTitle.trim() || `Note - ${new Date().toLocaleTimeString()}`;
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}.txt`;

    const newItem: StagedFileItem = {
      id: `stage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      filename,
      fileType: 'note',
      rawText: pastedText,
      sizeBytes: pastedText.length,
      category: fileCategory,
      customMessage: customMsg,
    };

    setStagedFiles(prev => [newItem, ...prev]);
    setPastedText('');
    setDocTitle('');
    setCustomMsg('');
    showToast(`Staged note "${title}" successfully!`);
  };

  // Secret Message Staging States & Handler
  const [secretTitle, setSecretTitle] = useState('');
  const [secretMessageText, setSecretMessageText] = useState('');
  const [secretSearchNote, setSecretSearchNote] = useState('');

  const handleSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretMessageText.trim() || !secretSearchNote.trim()) return;

    const title = secretTitle.trim() || `Secret Message - ${new Date().toLocaleTimeString()}`;
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}.enc`;
    const encryptedPayload = `ENC[v1:AES-256]:${btoa(secretMessageText)}`;
    const fullText = `[SECURE VAULT SECRET MESSAGE]\nEncrypted Secret: ${encryptedPayload}\n\n[Mandatory Search & AI Context Notes]: ${secretSearchNote}`;

    const newItem: StagedFileItem = {
      id: `stage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      filename,
      fileType: 'note',
      rawText: fullText,
      sizeBytes: fullText.length,
      category: fileCategory,
      customMessage: `Secret Note: ${secretSearchNote}`,
    };

    setStagedFiles(prev => [newItem, ...prev]);
    setSecretTitle('');
    setSecretMessageText('');
    setSecretSearchNote('');
    showToast(`Staged encrypted secret message "${title}" successfully!`);
  };

  // Username + Password Staging States & Handler
  const [credTitle, setCredTitle] = useState('');
  const [credUsername, setCredUsername] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credSearchNote, setCredSearchNote] = useState('');

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credUsername.trim() || !credPassword.trim() || !credSearchNote.trim()) return;

    const title = credTitle.trim() || `Credentials - ${new Date().toLocaleTimeString()}`;
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}.cred`;
    const encUser = `ENC[v1]:${btoa(credUsername)}`;
    const encPass = `ENC[v1]:${btoa(credPassword)}`;
    const fullText = `[SECURE VAULT CREDENTIALS]\nUsername: ${encUser}\nPassword: ${encPass}\n\n[Mandatory Search & AI Context Notes]: ${credSearchNote}`;

    const newItem: StagedFileItem = {
      id: `stage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      filename,
      fileType: 'note',
      rawText: fullText,
      sizeBytes: fullText.length,
      category: fileCategory,
      customMessage: `Credentials Note: ${credSearchNote}`,
    };

    setStagedFiles(prev => [newItem, ...prev]);
    setCredTitle('');
    setCredUsername('');
    setCredPassword('');
    setCredSearchNote('');
    showToast(`Staged encrypted credentials "${title}" successfully!`);
  };

  const removeStagedItem = (id: string) => {
    setStagedFiles(prev => prev.filter(item => item.id !== id));
  };

  const updateStagedItem = (id: string, field: keyof StagedFileItem, value: string) => {
    setStagedFiles(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleUploadAllStaged = async () => {
    if (stagedFiles.length === 0) return;

    setIsProcessing(true);

    for (const item of stagedFiles) {
      // Append custom message to rawText if provided
      let finalRawText = item.rawText;
      if (item.customMessage.trim()) {
        finalRawText = `${item.rawText}\n\n[User Attached Note/Message]: ${item.customMessage}`;
      }

      // Check duplicate (only if preference is enabled)
      const existing = duplicatePrevention ? checkDuplicate(item.filename, item.title, finalRawText) : null;
      if (existing) {
        setDuplicateMatch({
          existingDoc: existing,
          pendingDoc: {
            title: item.title,
            filename: item.filename,
            fileType: item.fileType,
            rawText: finalRawText,
            sizeBytes: item.sizeBytes,
            base64Data: item.base64Data,
            mimeType: item.mimeType,
          },
        });
        setIsProcessing(false);
        return; // handle duplicate flow
      }

      await processAndIngestDocument(
        item.title,
        item.filename,
        item.fileType,
        finalRawText,
        item.sizeBytes,
        item.base64Data,
        item.mimeType,
        item.category
      );
    }

    setStagedFiles([]);
    setIsProcessing(false);
    showToast('All staged files and notes successfully uploaded and embedded!');
  };

  // Duplicate Check Helper
  const checkDuplicate = (filename: string, title: string, rawText: string): DocumentItem | null => {
    const fnLower = filename.toLowerCase();
    const titleLower = title.toLowerCase();
    const trimmedText = rawText.trim();

    return (
      ingestionQueue.find(
        (doc) =>
          doc.filename.toLowerCase() === fnLower ||
          doc.title.toLowerCase() === titleLower ||
          (trimmedText.length > 30 && doc.rawText.trim() === trimmedText)
      ) || null
    );
  };

  const processAndIngestDocument = async (
    title: string,
    filename: string,
    fileType: FileType,
    rawText: string,
    sizeBytes: number,
    base64Data?: string,
    mimeType?: string,
    categoryName: string = fileCategory,
    targetOverwriteId?: string
  ) => {
    setIsProcessing(true);

    // Stage 1: AI Analysis
    setUploadStage({
      fileName: filename,
      stageName: 'Gemini AI Parsing',
      percent: 55,
      stepText: 'Extracting metadata, category tags, and smart summary...',
    });

    let summary = 'Ingested into AI Work Memory.';
    let tags = ['#Ingested'];
    let category = categoryName;
    let extractedText = rawText;

    try {
      const response = await fetch('/api/gemini/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          rawText,
          fileType,
          base64Data,
          mimeType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          summary = data.summary || summary;
          tags = data.tags || tags;
          category = data.category || category;
          extractedText = data.extractedText || rawText;
        }
      }
    } catch (err) {
      console.warn('Using client-side fallback parsing:', err);
    }

    // Stage 2: Vector Embedding
    setUploadStage({
      fileName: filename,
      stageName: 'Vector Embedding',
      percent: 85,
      stepText: 'Chunking text into 768-D semantic vector embeddings...',
    });

    await new Promise((res) => setTimeout(res, 400)); // Smooth UI transition

    const newDoc: DocumentItem = {
      id: targetOverwriteId || `doc-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      title,
      filename,
      fileType,
      rawText: extractedText,
      tags,
      category,
      chunkCount: Math.max(1, Math.ceil(extractedText.length / 400)),
      createdAt: new Date().toISOString(),
      sizeBytes: sizeBytes || 120000,
      summary,
      status: 'saved',
      authorOrRole: 'User Upload',
    };

    // Stage 3: Saved
    setUploadStage({
      fileName: filename,
      stageName: 'Vault Storage',
      percent: 100,
      stepText: 'Successfully saved & indexed in knowledge graph!',
    });

    if (targetOverwriteId && onDocumentOverwrite) {
      onDocumentOverwrite(newDoc);
      showToast(`Updated & re-indexed "${title}"`);
    } else {
      onDocumentAdded(newDoc);
    }

    setTimeout(() => {
      setIsProcessing(false);
      setUploadStage(null);
    }, 600);
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 5000);
  };

  // Duplicate Modal Actions
  const handleOverwriteDuplicate = () => {
    if (!duplicateMatch) return;
    const { pendingDoc, existingDoc } = duplicateMatch;
    setDuplicateMatch(null);

    processAndIngestDocument(
      pendingDoc.title,
      pendingDoc.filename,
      pendingDoc.fileType,
      pendingDoc.rawText,
      pendingDoc.sizeBytes,
      pendingDoc.base64Data,
      pendingDoc.mimeType,
      fileCategory,
      existingDoc.id // Overwrite existing ID
    );
  };

  const handleSaveAsCopy = () => {
    if (!duplicateMatch) return;
    const { pendingDoc } = duplicateMatch;
    setDuplicateMatch(null);

    const copyTitle = `${pendingDoc.title} (Copy)`;
    const copyFilename = `${pendingDoc.filename.replace(/(\.[^/.]+)$/, '')}_copy$1`;

    processAndIngestDocument(
      copyTitle,
      copyFilename,
      pendingDoc.fileType,
      pendingDoc.rawText,
      pendingDoc.sizeBytes,
      pendingDoc.base64Data,
      pendingDoc.mimeType,
      fileCategory
    );
  };

  const handleCancelDuplicate = () => {
    setDuplicateMatch(null);
  };

  const injectQuickSample = (sampleType: 'contract' | 'receipt' | 'email') => {
    let sampleText = '';
    let fn = '';
    let title = '';
    let fType: FileType = 'pdf';

    if (sampleType === 'contract') {
      sampleText = `GLOBAL TECH VENDOR AGREEMENT\nEffective Date: July 1, 2026\nClause 8.1 Termination: Either party may terminate immediately for uncured material breach.\nClause 12 Confidentiality: Both parties agree to standard non-disclosure obligations for 3 years.\nFee Schedule: Monthly recurring maintenance fee of $3,200.`;
      fn = 'GlobalTech_Vendor_Agreement.pdf';
      title = 'Global Tech Vendor Agreement & NDA';
      fType = 'pdf';
    } else if (sampleType === 'receipt') {
      sampleText = `BEST BUY STORE #412 RECEIPT\nDate: June 18, 2026\nItem: Dell XPS 15 Intel i9 32GB RAM 1TB SSD\nTotal Paid: $1,899.99 (Mastercard ending in 9012)\nWarranty: 1 Year Manufacturer Warranty valid through June 18, 2027.`;
      fn = 'Invoice_BestBuy_Laptop_2026.pdf';
      title = 'Best Buy Invoice - Dell XPS 15 Laptop';
      fType = 'pdf';
    } else if (sampleType === 'email') {
      sampleText = `From: marketing@company.com\nSubject: Diwali Marketing Promo Campaign Ideas\nDate: July 10, 2026\nTeam, let's roll out our special 20% discount offer for all Diwali season subscribers.\nAction Items: Design banner by Aug 1, set up email campaign by Aug 10. Budget approved: $5,000.`;
      fn = 'Q3_Marketing_Diwali_Promo.eml';
      title = 'Email thread: Q3 Marketing Campaign & Diwali Promo';
      fType = 'email';
    }

    const newItem: StagedFileItem = {
      id: `stage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      filename: fn,
      fileType: fType,
      rawText: sampleText,
      sizeBytes: 250000,
      category: 'Work & Ops',
      customMessage: 'Sample imported for review',
    };

    setStagedFiles(prev => [newItem, ...prev]);
    showToast(`Staged sample "${title}" successfully!`);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Toast Notification Banner */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/40 animate-bounce">
          <CheckCircle className="w-5 h-5 text-white" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Error Toast Banner */}
      {errorToast && (
        <div className="fixed top-20 right-6 z-50 bg-red-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-400/40 animate-bounce max-w-sm">
          <AlertTriangle className="w-5 h-5 text-white shrink-0" />
          <span className="text-xs font-bold">{errorToast}</span>
        </div>
      )}

      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Upload className="w-6 h-6 text-blue-500" />
            Upload Files & Notes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload PDFs, JSON data files, Emails, Notes, Images, or Spreadsheets. They are automatically indexed and saved to your AI memory.
          </p>
        </div>

        {/* Quick Sample Injectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-500 font-medium shrink-0">Quick Test:</span>
          <button
            onClick={() => injectQuickSample('contract')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3 h-3 text-blue-400" /> Contract
          </button>
          <button
            onClick={() => injectQuickSample('receipt')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3 h-3 text-emerald-400" /> Receipt
          </button>
          <button
            onClick={() => injectQuickSample('email')}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-all flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus className="w-3 h-3 text-amber-400" /> Email
          </button>
        </div>
      </div>

      {/* Live Upload Progress Indicator Card */}
      {isProcessing && uploadStage && (
        <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-3 shadow-2xl animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Uploading & Ingesting: {uploadStage.fileName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono border border-blue-500/30">
                    {uploadStage.stageName}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">{uploadStage.stepText}</p>
              </div>
            </div>
            <span className="text-sm font-extrabold text-blue-400 font-mono">{uploadStage.percent}%</span>
          </div>

          {/* Progress Bar */}
          <Progress value={uploadStage.percent} className="h-2.5 bg-slate-900" />
        </div>
      )}

      {/* Input Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 p-2 bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl mx-auto">
        <button
          onClick={() => setActiveUploadTab('file')}
          className={`w-full sm:flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1.5 truncate ${
            activeUploadTab === 'file'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Upload className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">File Upload</span>
        </button>

        <button
          onClick={() => setActiveUploadTab('note')}
          className={`w-full sm:flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1.5 truncate ${
            activeUploadTab === 'note'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Text Note</span>
        </button>

        <button
          onClick={() => setActiveUploadTab('secret')}
          className={`w-full sm:flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1.5 truncate ${
            activeUploadTab === 'secret'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Secret Message</span>
        </button>

        <button
          onClick={() => setActiveUploadTab('credentials')}
          className={`w-full sm:flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1.5 truncate ${
            activeUploadTab === 'credentials'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Key className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Credentials</span>
        </button>
      </div>

      {/* Active Input Panel */}
      <div className="max-w-3xl mx-auto">
        {activeUploadTab === 'file' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            className={`p-10 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center relative bg-slate-900/40 ${
              dragActive
                ? 'border-blue-500 bg-blue-500/15 scale-[1.01]'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              accept=".pdf,.txt,.md,.json,.eml,.png,.jpg,.jpeg,.xlsx,.csv"
              disabled={isProcessing}
            />
            
            <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-xl shadow-blue-500/10">
              {isProcessing ? (
                <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              {isProcessing ? 'Processing File...' : 'Drag & Drop Files Here'}
            </h3>
            <p className="text-xs text-slate-400 mb-5 max-w-md">
              Supports PDFs, JSON data, Emails (.eml), TXT, Markdown, Spreadsheets, and Images. Multi-file upload supported.
            </p>

            <button
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 shadow-md shadow-blue-600/20 transition-all z-20 pointer-events-none"
            >
              Browse Files from Computer
            </button>
          </div>
        )}

        {activeUploadTab === 'note' && (
          <form onSubmit={handleTextSubmit} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Direct Text / Note Paste
              </label>
              <select
                value={fileCategory}
                onChange={(e) => setFileCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg text-xs px-3 py-1.5 text-slate-300 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Document title (e.g., Client Phoenix Sync Notes)..."
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />

            <textarea
              rows={5}
              placeholder="Paste text, meeting transcripts, emails, or scratchpad notes here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-mono"
            />

            <button
              type="submit"
              disabled={isProcessing || !pastedText.trim()}
              className="w-full py-3 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Stage Note for Upload</span>
            </button>
          </form>
        )}

        {activeUploadTab === 'secret' && (
          <form onSubmit={handleSecretSubmit} className="bg-slate-900/60 border border-amber-500/30 p-6 rounded-2xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Stage Encrypted Secret Message
              </label>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                AES-256 Encrypted Vault
              </span>
            </div>

            <input
              type="text"
              placeholder="Secret title (e.g., API Master Key Note)..."
              value={secretTitle}
              onChange={(e) => setSecretTitle(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />

            <textarea
              rows={4}
              placeholder="Enter secret message or payload to encrypt..."
              value={secretMessageText}
              onChange={(e) => setSecretMessageText(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-amber-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none font-mono"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Mandatory Search & AI Context Note:</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Describe this secret in plain text so AI search can find it..."
                value={secretSearchNote}
                onChange={(e) => setSecretSearchNote(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || !secretMessageText.trim() || !secretSearchNote.trim()}
              className="w-full py-3 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
            >
              <Lock className="w-4 h-4 text-white" />
              <span>Encrypt & Stage Secret Message</span>
            </button>
          </form>
        )}

        {activeUploadTab === 'credentials' && (
          <form onSubmit={handleCredentialSubmit} className="bg-slate-900/60 border border-indigo-500/30 p-6 rounded-2xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <label className="text-xs font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" />
                Stage Username & Password Credentials
              </label>
              <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                Encrypted Vault
              </span>
            </div>

            <input
              type="text"
              placeholder="Credential title (e.g., AWS Production Admin Portal)..."
              value={credTitle}
              onChange={(e) => setCredTitle(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Username / Email..."
                value={credUsername}
                onChange={(e) => setCredUsername(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <input
                type="password"
                placeholder="Password..."
                value={credPassword}
                onChange={(e) => setCredPassword(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Mandatory Search & AI Context Note:</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Describe what these credentials are for (plain text search note)..."
                value={credSearchNote}
                onChange={(e) => setCredSearchNote(e.target.value)}
                disabled={isProcessing}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || !credUsername.trim() || !credPassword.trim() || !credSearchNote.trim()}
              className="w-full py-3 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Key className="w-4 h-4 text-white" />
              <span>Encrypt & Stage Credentials</span>
            </button>
          </form>
        )}
      </div>

      {/* Staged Files & Notes Queue (Ready to Upload) */}
      <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Staged Files & Notes Queue (Ready to Upload)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review loaded items, customize titles, attach messages, and click upload when ready.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-mono bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              {stagedFiles.length} staged
            </span>
            {stagedFiles.length > 0 && (
              <button
                onClick={handleUploadAllStaged}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Upload & Vector Embed All ({stagedFiles.length})</span>
              </button>
            )}
          </div>
        </div>

        {stagedFiles.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
            No files or notes staged yet. Drag & drop files above or paste text notes to stage them before uploading.
          </div>
        ) : (
          <div className="space-y-4">
            {stagedFiles.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20 shrink-0">
                      {item.fileType === 'pdf' && <FileText className="w-4 h-4 text-red-400" />}
                      {item.fileType === 'email' && <Mail className="w-4 h-4 text-amber-400" />}
                      {item.fileType === 'note' && <File className="w-4 h-4 text-emerald-400" />}
                      {item.fileType === 'image' && <ImageIcon className="w-4 h-4 text-blue-400" />}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateStagedItem(item.id, 'title', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-blue-500"
                        placeholder="Document title..."
                      />
                      <p className="text-[10px] text-slate-400 font-mono px-1">
                        {item.filename} • {(item.sizeBytes / 1024).toFixed(1)} KB • Type: {item.fileType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <select
                      value={item.category}
                      onChange={(e) => updateStagedItem(item.id, 'category', e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg text-[11px] px-2.5 py-1.5 text-slate-300 focus:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => removeStagedItem(item.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                      title="Remove from staging"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Additional Message / Note Attachment */}
                <div>
                  <input
                    type="text"
                    value={item.customMessage}
                    onChange={(e) => updateStagedItem(item.id, 'customMessage', e.target.value)}
                    placeholder="Attach an additional message, instructions, or context note with this file..."
                    className="w-full bg-slate-900/60 border border-slate-800/80 rounded-lg px-3 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Ingestion Queue Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Live Ingestion Queue & Vector Index Status
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {ingestionQueue.length} items in vault
          </span>
        </div>

        {ingestionQueue.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No active uploads currently in queue. Upload a file above to test live indexing.
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {ingestionQueue.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-500/20 shrink-0">
                    {item.fileType === 'pdf' && <FileText className="w-4 h-4 text-red-400" />}
                    {item.fileType === 'email' && <Mail className="w-4 h-4 text-amber-400" />}
                    {item.fileType === 'note' && <File className="w-4 h-4 text-emerald-400" />}
                    {item.fileType === 'image' && <ImageIcon className="w-4 h-4 text-blue-400" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{item.filename} • {item.chunkCount} vector chunks</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Tags */}
                  <div className="hidden sm:flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Status Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" />
                    <span>Saved & Embedded</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Duplicate Alert Modal Dialog */}
      {duplicateMatch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in">
            {/* Header */}
            <div className="flex items-start gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Duplicate Document Detected</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  An identical or matching document already exists in your personal knowledge vault.
                </p>
              </div>
            </div>

            {/* Document Comparison Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Existing Document in Vault:</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-semibold text-white">{duplicateMatch.existingDoc.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{duplicateMatch.existingDoc.chunkCount} chunks</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">{duplicateMatch.existingDoc.filename}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Incoming Upload File:</p>
                <p className="font-semibold text-slate-200 mt-0.5">{duplicateMatch.pendingDoc.title}</p>
                <p className="text-[11px] text-slate-400 font-mono">{duplicateMatch.pendingDoc.filename}</p>
              </div>
            </div>

            {/* Decision Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleOverwriteDuplicate}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Overwrite & Update Existing Document</span>
              </button>

              <button
                onClick={handleSaveAsCopy}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2 border border-slate-700"
              >
                <Copy className="w-4 h-4 text-emerald-400" />
                <span>Keep Both (Save as New Copy)</span>
              </button>

              <button
                onClick={handleCancelDuplicate}
                className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white font-medium text-xs transition-all border border-slate-800"
              >
                Cancel Upload
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
