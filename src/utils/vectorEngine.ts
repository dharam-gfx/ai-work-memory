import { Citation, DocumentItem, VectorChunk } from '../types';

/**
 * Computes cosine similarity between two numeric vectors.
 */
export function cosineSimilarity( vecA: number[], vecB: number[] ): number {
  if ( !vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0 ) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for ( let i = 0; i < vecA.length; i++ ) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if ( normA === 0 || normB === 0 ) return 0;
  return dotProduct / ( Math.sqrt( normA ) * Math.sqrt( normB ) );
}

/**
 * Generates a simple 128-dimensional pseudo-semantic embedding for text fallback.
 */
export function generateLocalEmbedding( text: string ): number[] {
  const dim = 128;
  const vector = new Array( dim ).fill( 0 );
  const words = text.toLowerCase().replace( /[^a-z0-9]/g, ' ' ).split( /\s+/ ).filter( Boolean );

  for ( let i = 0; i < words.length; i++ ) {
    const word = words[i];
    let hash = 0;
    for ( let j = 0; j < word.length; j++ ) {
      hash = ( hash << 5 ) - hash + word.charCodeAt( j );
      hash |= 0;
    }
    const idx = Math.abs( hash ) % dim;
    vector[idx] += 1;
  }

  // Normalize vector
  let sumSq = 0;
  for ( let i = 0; i < dim; i++ ) {
    sumSq += vector[i] * vector[i];
  }
  const mag = Math.sqrt( sumSq ) || 1;
  return vector.map( v => v / mag );
}

/**
 * Chunks a long document into overlapping text blocks.
 */
export function chunkText( rawText: string, maxWordsPerChunk = 120, overlapWords = 30 ): string[] {
  const paragraphs = rawText.split( /\n\s*\n/ ).map( p => p.trim() ).filter( Boolean );
  const chunks: string[] = [];

  let currentWords: string[] = [];

  for ( const para of paragraphs ) {
    const paraWords = para.split( /\s+/ );
    if ( currentWords.length + paraWords.length <= maxWordsPerChunk ) {
      currentWords.push( ...paraWords );
    } else {
      if ( currentWords.length > 0 ) {
        chunks.push( currentWords.join( ' ' ) );
      }
      // Start next chunk with overlap
      const overlap = currentWords.slice( -overlapWords );
      currentWords = [...overlap, ...paraWords];
    }
  }

  if ( currentWords.length > 0 ) {
    chunks.push( currentWords.join( ' ' ) );
  }

  return chunks.length > 0 ? chunks : [rawText];
}

/**
 * Extracts auto-tags from text based on keywords and patterns.
 */
export function generateAutoTags( text: string, title: string ): string[] {
  const tags = new Set<string>();
  const lower = ( text + ' ' + title ).toLowerCase();

  if ( lower.includes( 'task' ) || lower.includes( 'assign' ) || lower.includes( 'manager' ) || lower.includes( 'todo' ) ) {
    tags.add( '#ManagerTasks' );
  }
  if ( lower.includes( 'meeting' ) || lower.includes( 'sync' ) || lower.includes( 'agenda' ) ) {
    tags.add( '#Meeting' );
  }
  if ( lower.includes( 'invoice' ) || lower.includes( 'receipt' ) || lower.includes( 'paid' ) || lower.includes( 'billing' ) ) {
    tags.add( '#Invoice' );
  }
  if ( lower.includes( 'client' ) || lower.includes( 'customer' ) || lower.includes( 'contract' ) || lower.includes( 'agreement' ) ) {
    tags.add( '#Client' );
  }
  if ( lower.includes( 'urgent' ) || lower.includes( 'asap' ) || lower.includes( 'deadline' ) || lower.includes( 'important' ) ) {
    tags.add( '#Urgent' );
  }
  if ( lower.includes( 'legal' ) || lower.includes( 'clause' ) || lower.includes( 'termination' ) || lower.includes( 'msa' ) ) {
    tags.add( '#Legal' );
  }
  if ( lower.includes( 'patient' ) || lower.includes( 'lab' ) || lower.includes( 'hba1c' ) || lower.includes( 'doctor' ) || lower.includes( 'health' ) ) {
    tags.add( '#Medical' );
  }
  if ( lower.includes( 'chapter' ) || lower.includes( 'exam' ) || lower.includes( 'biology' ) || lower.includes( 'lecture' ) ) {
    tags.add( '#Academic' );
  }
  if ( lower.includes( 'warranty' ) || lower.includes( 'macbook' ) || lower.includes( 'apple' ) || lower.includes( 'passport' ) ) {
    tags.add( '#Personal' );
  }

  if ( tags.size === 0 ) {
    tags.add( '#Document' );
    tags.add( '#Ingested' );
  }

  return Array.from( tags );
}

/**
 * Searches chunks using hybrid keyword + embedding scoring.
 */
export function retrieveRelevantChunks(
  query: string,
  allDocuments: DocumentItem[],
  topK = 4
): { citations: Citation[]; contextSnippet: string } {
  const queryLower = query.toLowerCase();
  const queryKeywords = queryLower.replace( /[^a-z0-9]/g, ' ' ).split( /\s+/ ).filter( w => w.length > 2 );
  const queryVector = generateLocalEmbedding( query );

  const scoredChunks: {
    docId: string;
    docTitle: string;
    fileType: DocumentItem['fileType'];
    text: string;
    chunkIndex: number;
    score: number;
  }[] = [];

  allDocuments.forEach( doc => {
    const textChunks = chunkText( doc.rawText );
    textChunks.forEach( ( chunkTextStr, idx ) => {
      const chunkVector = generateLocalEmbedding( chunkTextStr );
      const vecScore = cosineSimilarity( queryVector, chunkVector );

      // Keyword match score
      const chunkLower = chunkTextStr.toLowerCase();
      let kwHits = 0;
      queryKeywords.forEach( kw => {
        if ( chunkLower.includes( kw ) ) kwHits += 1;
        if ( doc.title.toLowerCase().includes( kw ) ) kwHits += 1.5;
        if ( doc.tags.some( t => t.toLowerCase().includes( kw ) ) ) kwHits += 2;
      } );

      const kwScore = queryKeywords.length > 0 ? ( kwHits / ( queryKeywords.length * 2 ) ) : 0;
      const combinedScore = vecScore * 0.4 + Math.min( kwScore, 1.0 ) * 0.6;

      scoredChunks.push( {
        docId: doc.id,
        docTitle: doc.title,
        fileType: doc.fileType,
        text: chunkTextStr,
        chunkIndex: idx,
        score: Math.round( combinedScore * 100 ) / 100
      } );
    } );
  } );

  // Sort descending by score
  scoredChunks.sort( ( a, b ) => b.score - a.score );
  const topMatches = scoredChunks.slice( 0, topK ).filter( c => c.score > 0.1 );

  // If no match score > 0.1, fallback to top 2
  const finalMatches = topMatches.length > 0 ? topMatches : scoredChunks.slice( 0, 2 );

  const citations: Citation[] = finalMatches.map( m => ( {
    docId: m.docId,
    docTitle: m.docTitle,
    fileType: m.fileType,
    snippet: m.text,
    chunkIndex: m.chunkIndex,
    matchScore: Math.min( Math.max( m.score, 0.45 ), 0.98 )
  } ) );

  const contextSnippet = finalMatches
    .map( ( m, i ) => `[Source ${i + 1}: ${m.docTitle}]\n${m.text}` )
    .join( '\n\n' );

  return { citations, contextSnippet };
}
