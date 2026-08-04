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

  // Track paragraphs (not words) so newlines within each paragraph are preserved
  let currentParas: string[] = [];
  let currentWordCount = 0;

  for ( const para of paragraphs ) {
    const paraWordCount = para.split( /\s+/ ).length;
    if ( currentWordCount + paraWordCount <= maxWordsPerChunk ) {
      currentParas.push( para );
      currentWordCount += paraWordCount;
    } else {
      if ( currentParas.length > 0 ) {
        chunks.push( currentParas.join( '\n\n' ) );
      }
      // Overlap: carry last paragraph(s) whose total words fit within overlapWords
      const overlapParas: string[] = [];
      let overlapCount = 0;
      for ( let i = currentParas.length - 1; i >= 0 && overlapCount < overlapWords; i-- ) {
        const wc = currentParas[i].split( /\s+/ ).length;
        overlapParas.unshift( currentParas[i] );
        overlapCount += wc;
      }
      currentParas = [...overlapParas, para];
      currentWordCount = overlapCount + paraWordCount;
    }
  }

  if ( currentParas.length > 0 ) {
    chunks.push( currentParas.join( '\n\n' ) );
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
  // Words that describe the request intent, not the content being searched for
  const STOP_WORDS = new Set( ['provide','show','give','find','list','tell','what','how','when','where','which','who','get','more','details','detail','summary','overview','all','every','complete','full','regarding','about','related','from','the','for','with','and','but','not','this','that','these','those','can','please','pdf','doc','txt','csv','json','note','email','image','file','document','vault'] );
  const queryKeywords = queryLower.replace( /[^a-z0-9]/g, ' ' ).split( /\s+/ ).filter( w => w.length > 2 );
  const contentKeywords = queryKeywords.filter( w => !STOP_WORDS.has( w ) );
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
    // Replace binary data URLs with a searchable label based on actual file type
    const isBinaryDataUrl = doc.rawText.trimStart().startsWith( 'data:' );
    const binaryLabel = isBinaryDataUrl
      ? ( doc.fileType === 'image'
        ? `[Image: ${doc.title}] ${doc.summary || ''}`
        : doc.fileType === 'pdf'
          ? `[PDF: ${doc.title}] ${doc.summary || ''}`
          : doc.fileType === 'excel'
            ? `[Spreadsheet: ${doc.title}] ${doc.summary || ''}`
            : `[${doc.fileType} file: ${doc.title}] ${doc.summary || ''}` ).trim()
      : null;
    const rawForChunking = binaryLabel ?? doc.rawText;
    const textChunks = chunkText( rawForChunking );
    textChunks.forEach( ( chunkTextStr, idx ) => {
      const chunkVector = generateLocalEmbedding( chunkTextStr );
      const vecScore = cosineSimilarity( queryVector, chunkVector );

      // Keyword match score using content-only keywords to avoid false positives
      const chunkLower = chunkTextStr.toLowerCase();
      let kwHits = 0;
      contentKeywords.forEach( kw => {
        if ( chunkLower.includes( kw ) ) kwHits += 1;
        if ( doc.title.toLowerCase().includes( kw ) ) kwHits += 1.5;
        if ( doc.tags.some( t => t.toLowerCase().includes( kw ) ) ) kwHits += 2;
      } );

      const kwScore = contentKeywords.length > 0 ? ( kwHits / ( contentKeywords.length * 2 ) ) : 0;
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

  // Allow up to 4 chunks per document for detail-rich queries
  const perDocCount = new Map<string, number>();
  const dedupedChunks = scoredChunks.filter( c => {
    const count = perDocCount.get( c.docId ) ?? 0;
    if ( count >= 4 ) return false;
    perDocCount.set( c.docId, count + 1 );
    return true;
  } );

  const topMatches = dedupedChunks.slice( 0, topK ).filter( c => c.score > 0.05 );

  // If no match score > 0.05, fallback to top 2
  const finalMatches = topMatches.length > 0 ? topMatches : dedupedChunks.slice( 0, 2 );

  const docMap = new Map( allDocuments.map( d => [d.id, d] ) );

  const citations: Citation[] = finalMatches.map( m => ( {
    docId: m.docId,
    docTitle: m.docTitle,
    fileType: m.fileType,
    snippet: m.text,
    chunkIndex: m.chunkIndex,
    matchScore: Math.min( Math.max( m.score, 0.05 ), 0.98 )
  } ) );

  const contextSnippet = finalMatches
    .map( ( m, i ) => {
      const doc = docMap.get( m.docId );
      const meta = [
        doc?.summary ? `Summary: ${doc.summary}` : '',
        doc?.tags?.length ? `Tags: ${doc.tags.join( ', ' )}` : '',
      ].filter( Boolean ).join( ' | ' );
      const metaSuffix = meta ? ' (' + meta + ')' : '';
      return `[Source ${i + 1}: ${m.docTitle}]${metaSuffix}\n${m.text}`;
    } )
    .join( '\n\n' );

  return { citations, contextSnippet };
}
