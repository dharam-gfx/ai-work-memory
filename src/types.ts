/**
 * Core Data Models for AI Work Memory
 */

export type FileType = 'pdf' | 'email' | 'note' | 'image' | 'excel' | 'word' | 'audio';

export type IngestionStatus = 'indexing' | 'embedding' | 'saved' | 'failed';

export interface DocumentItem {
  id: string;
  userId?: string;
  title: string;
  filename: string;
  fileType: FileType;
  rawText: string;
  tags: string[];
  category: string;
  chunkCount: number;
  createdAt: string; // ISO date string
  sizeBytes: number;
  summary: string;
  status: IngestionStatus;
  authorOrRole?: string;
}

export interface VectorChunk {
  id: string;
  docId: string;
  userId?: string;
  docTitle: string;
  fileType: FileType;
  text: string;
  chunkIndex: number;
  embedding?: number[];
  tags: string[];
  createdAt: string;
}

export interface Citation {
  docId: string;
  docTitle: string;
  fileType: FileType;
  snippet: string;
  chunkIndex: number;
  matchScore: number; // 0 to 1
}

export interface ChatMessage {
  id: string;
  userId?: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citations?: Citation[];
  status?: 'thinking' | 'done' | 'error';
  roleTag?: string;
}

export interface RolePreset {
  id: string;
  title: string;
  iconName: string;
  description: string;
  question: string;
  sampleAnswer: string;
  sampleSources: string[];
  category: string;
}

export interface TimelineEvent {
  id: string;
  userId?: string;
  timestamp: string;
  docId: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  fileType: FileType;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
  provider: 'supabase' | 'local';
  deviceSessionsCount?: number;
}

export interface KnowledgeStats {
  totalDocuments: number;
  totalChunks: number;
  totalSizeBytes: number;
  categoriesCount: number;
  lastUpdated: string;
}
