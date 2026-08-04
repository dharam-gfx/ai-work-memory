import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

const app = express();
app.disable( 'x-powered-by' );
const PORT = 3000;

app.use( express.json( { limit: '50mb' } ) );
app.use( express.urlencoded( { extended: true, limit: '50mb' } ) );

// Retry generateContent with exponential backoff on 429 rate limits only
async function generateWithRetry(
  client: GoogleGenAI,
  params: Parameters<GoogleGenAI['models']['generateContent']>[0],
  maxRetries = 4
): Promise<Awaited<ReturnType<GoogleGenAI['models']['generateContent']>>> {
  let delay = 5000;
  for ( let attempt = 0; attempt <= maxRetries; attempt++ ) {
    try {
      return await client.models.generateContent( params );
    } catch ( err: any ) {
      const is429 = err?.status === 429 || err?.message?.includes( '429' );
      if ( !is429 || attempt === maxRetries ) throw err;
      // Daily quota exhaustion cannot recover within the retry window — bail immediately
      const isDailyQuota = err?.message?.includes( 'PerDay' ) || err?.message?.includes( 'per_day' );
      if ( isDailyQuota ) throw err;
      // honour retryDelay from the API response when available
      const retryMatch = err?.message?.match( /retryDelay":"(\d+)s/ );
      const apiDelay = retryMatch ? Number.parseInt( retryMatch[1] ) * 1000 : delay;
      // Cap at 30 s — longer delays indicate daily limits, not per-minute throttling
      if ( apiDelay > 30_000 ) throw err;
      console.warn( `Gemini 429 – retrying in ${apiDelay / 1000}s (attempt ${attempt + 1}/${maxRetries})` );
      await new Promise( resolve => setTimeout( resolve, apiDelay ) );
      delay *= 2;
    }
  }
  throw new Error( 'generateWithRetry: unreachable' );
}

// Initialize Google GenAI Server Client
let ai: GoogleGenAI | null = null;
if ( process.env.GEMINI_API_KEY ) {
  ai = new GoogleGenAI( {
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  } );
} else {
  console.warn( 'GEMINI_API_KEY not detected in process.env. Using smart fallback RAG engine.' );
}

// In-Memory Document Store & Vector Storage
let serverDocuments: any[] = [];

// Decode ENC[v1]:base64 tokens so the AI sees plain-text values
function decodeVaultText( text: string ): string {
  const decode = ( b64: string, fallback: string ) => { try { return Buffer.from( b64, 'base64' ).toString( 'utf8' ); } catch { return fallback; } };

  // Decrypt AES-256-GCM v2 tokens when key is configured
  const keyHex = process.env.VAULT_ENCRYPTION_KEY;
  let result = text;
  if ( keyHex?.length === 64 ) {
    const key = Buffer.from( keyHex, 'hex' );
    result = result.replace( /ENC\[v2\]:([0-9a-f]+)\.([0-9a-f]+)\.([0-9a-f]*)/gi, ( m, ivHex, tagHex, ctHex ) => {
      try {
        const decipher = createDecipheriv( 'aes-256-gcm', key, Buffer.from( ivHex, 'hex' ) );
        decipher.setAuthTag( Buffer.from( tagHex, 'hex' ) );
        const pt = decipher.update( Buffer.from( ctHex, 'hex' ) );
        return Buffer.concat( [pt, decipher.final()] ).toString( 'utf8' );
      } catch { return m; }
    } );
  }

  // Decode legacy v1 Base64 tokens (backward compatible)
  const out = result.replace( /ENC\[v1:[^\]]+\]:([A-Za-z0-9+/=]+)/g, ( m, b ) => decode( b, m ) );
  return out.replace( /ENC\[v1\]:([A-Za-z0-9+/=]+)/g, ( m, b ) => decode( b, m ) );
}

// Strip internal vault metadata markers from a retrieved snippet
function cleanSnippet( raw: string ): string {
  return raw
    .replace( /\[SECURE VAULT CREDENTIALS\]\s*/gi, '' )
    .replace( /\[SECURE VAULT SECRET MESSAGE\]\s*/gi, '' )
    .replace( /\[Mandatory Search[^\]]*\]:[^\n]*/gi, '' )
    .replace( /\[User Attached Note[^\]]*\]:[^\n]*/gi, '' )
    .replace( /Ingested into AI Work Memory\.?/gi, '' )
    .replace( /\n{3,}/g, '\n\n' )
    .trim();
}

// Build a clean Markdown fallback answer from retrieved citations
function buildFallbackAnswer( query: string, citations: any[] ): string {
  if ( citations.length === 0 ) {
    return `I couldn't find documents matching "${query}". Try uploading relevant PDFs, notes, or emails first!`;
  }
  const isBinary = ( text: string ) => text.trimStart().startsWith( 'data:' );

  // Group chunks by document so all detail from one doc appears together
  const byDoc = new Map<string, string[]>();
  citations.forEach( ( cite: any ) => {
    const clean = cleanSnippet( cite.snippet || '' );
    if ( !clean || isBinary( clean ) ) return;
    if ( !byDoc.has( cite.docTitle ) ) byDoc.set( cite.docTitle, [] );
    byDoc.get( cite.docTitle )!.push( clean );
  } );

  if ( byDoc.size === 0 ) {
    return `I couldn't find documents matching "${query}". Try uploading relevant PDFs, notes, or emails first!`;
  }

  const srcList = [...byDoc.keys()].join( ', ' );
  const lines: string[] = [ `**Sources:** ${srcList}`, '' ];
  let isFirst = true;
  byDoc.forEach( ( chunks, docTitle ) => {
    if ( isFirst ) {
      lines.push( `**From ${docTitle}:**` );
      chunks.forEach( chunk => {
        chunk.split( '\n' ).map( ( l: string ) => l.trim().replace( /^[•·▸-]\s*/, '' ) ).filter( Boolean ).forEach( ( l: string ) => lines.push( `- ${l}` ) );
      } );
      isFirst = false;
    } else {
      lines.push( '', `**Also from ${docTitle}:**` );
      chunks.forEach( chunk => {
        const preview = chunk.length > 300 ? chunk.substring( 0, 300 ) + '...' : chunk;
        lines.push( preview );
      } );
    }
  } );
  return lines.join( '\n' );
}

// API Route: Healthcheck
app.get( '/api/health', ( req, res ) => {
  res.json( {
    status: 'ok',
    geminiEnabled: !!ai,
    totalDocuments: serverDocuments.length,
    timestamp: new Date().toISOString(),
  } );
} );

// API Route: AES-256-GCM vault encryption (falls back to Base64 if key not configured)
app.post( '/api/vault/encrypt', ( req, res ) => {
  const { plaintext } = req.body;
  if ( !plaintext || typeof plaintext !== 'string' ) {
    return res.status( 400 ).json( { error: 'plaintext string required' } );
  }
  const keyHex = process.env.VAULT_ENCRYPTION_KEY;
  if ( keyHex?.length !== 64 ) {
    // No key configured — fall back to Base64 encoding (v1)
    return res.json( { encrypted: `ENC[v1]:${Buffer.from( plaintext ).toString( 'base64' )}`, strength: 'base64' } );
  }
  const key = Buffer.from( keyHex, 'hex' );
  const iv = randomBytes( 12 );
  const cipher = createCipheriv( 'aes-256-gcm', key, iv );
  const ct = Buffer.concat( [cipher.update( plaintext, 'utf8' ), cipher.final()] );
  const tag = cipher.getAuthTag();
  const encrypted = `ENC[v2]:${iv.toString( 'hex' )}.${tag.toString( 'hex' )}.${ct.toString( 'hex' )}`;
  return res.json( { encrypted, strength: 'aes-256-gcm' } );
} );

// API Route: Ingest & Parse Document with Gemini 2.5/3.6 Flash
app.post( '/api/gemini/parse', async ( req, res ) => {
  try {
    const { filename, rawText, fileType, base64Data, mimeType } = req.body;

    let extractedText = rawText || '';
    let summary = 'Document ingested successfully.';
    let tags: string[] = ['#Ingested'];
    let category = 'General';

    if ( ai ) {
      const prompt = `Analyze this uploaded document (${filename || 'Document'} of type ${fileType || 'text'}):
1. Extract all legible text completely.
2. Provide a 2-3 sentence summary.
3. Suggest 3-5 auto-tags starting with # (e.g. #Meeting, #Invoice, #Client, #Urgent, #Legal, #Medical, #Academic).
4. Assign 1 primary category from: ["Work & Ops", "Legal", "Healthcare", "Academic", "Business", "Home & Personal"].

Return valid JSON strictly matching this schema:
{
  "extractedText": "full plain text content",
  "summary": "concise 2 sentence summary",
  "tags": ["#Tag1", "#Tag2"],
  "category": "Category Name"
}`;

      let contentParts: any[] = [{ text: prompt }];

      if ( base64Data && mimeType ) {
        contentParts.unshift( {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        } );
      } else if ( rawText ) {
        contentParts.push( { text: `DOCUMENT CONTENT:\n${rawText}` } );
      }

      const response = await generateWithRetry( ai, {
        model: 'gemini-2.0-flash',
        contents: { parts: contentParts },
        config: {
          responseMimeType: 'application/json',
        },
      } );

      if ( response.text ) {
        try {
          const parsed = JSON.parse( response.text.trim() );
          extractedText = parsed.extractedText || extractedText;
          summary = parsed.summary || summary;
          tags = parsed.tags && Array.isArray( parsed.tags ) ? parsed.tags : tags;
          category = parsed.category || category;
        } catch ( err ) {
          console.error( 'Failed to parse Gemini JSON output:', err );
        }
      }
    } else {
      // Fallback keyword tagging
      const lower = ( rawText || filename || '' ).toLowerCase();
      if ( lower.includes( 'invoice' ) || lower.includes( 'receipt' ) ) {
        tags = ['#Invoice', '#Receipt', '#Financial'];
        category = 'Home & Personal';
      } else if ( lower.includes( 'meeting' ) || lower.includes( 'sync' ) || lower.includes( 'task' ) ) {
        tags = ['#Meeting', '#ManagerTasks', '#Work'];
        category = 'Work & Ops';
      } else if ( lower.includes( 'contract' ) || lower.includes( 'clause' ) || lower.includes( 'legal' ) ) {
        tags = ['#Legal', '#Contract', '#Termination'];
        category = 'Legal';
      } else if ( lower.includes( 'patient' ) || lower.includes( 'lab' ) || lower.includes( 'doctor' ) ) {
        tags = ['#Medical', '#PatientHistory'];
        category = 'Healthcare';
      } else if ( lower.includes( 'chapter' ) || lower.includes( 'exam' ) || lower.includes( 'lecture' ) ) {
        tags = ['#Academic', '#StudyNotes'];
        category = 'Academic';
      }
      summary = `Extracted ${extractedText.length} characters from ${filename || 'document'}.`;
    }

    res.json( {
      success: true,
      extractedText,
      summary,
      tags,
      category,
    } );
  } catch ( error: any ) {
    console.error( 'Error in /api/gemini/parse:', error );
    res.status( 500 ).json( {
      success: false,
      error: error?.message || 'Failed to parse document with Gemini',
    } );
  }
} );

// API Route: Context-Injected RAG Query
app.post( '/api/rag/query', async ( req, res ) => {
  try {
    const { query, documents, roleContext, strictGrounding = true } = req.body;

    if ( !query ) {
      return res.status( 400 ).json( { error: 'Query string is required' } );
    }

    // Retrieve active documents provided from client or server state
    const docsToSearch = documents && Array.isArray( documents ) && documents.length > 0 ? documents : serverDocuments;

    // Perform vector/chunk retrieval
    const { citations, contextSnippet } = performRetrieval( query, docsToSearch );

    let aiResponseText = '';

    if ( ai ) {
      const roleLine = roleContext ? `\nSelected Role Perspective: ${roleContext}` : '';
      const systemInstruction = `You are "AI Work Memory" - a universal personal knowledge assistant.
Your job is to answer user queries based on their uploaded documents, notes, emails, and receipts.

CRITICAL INSTRUCTIONS:
1. Base your answer directly on the provided Grounding Context below.
2. If the user asks about specific tasks, dates, amounts, contracts, labs, or receipts, synthesize the details clearly in structured bullet points.
3. Be professional, friendly, and precise.
4. CREDENTIALS RULE: If the context contains usernames, passwords, or credential values (already in plain text), display them exactly as they appear. Never refuse to show values that are present in the user's own grounding context.
${strictGrounding
  ? '5. STRICT MODE: Only use information from the provided context. If the information is not present, explicitly say so — do not invent or infer beyond the documents.'
  : '5. You may supplement with general knowledge if the context is insufficient, but always prioritize the provided documents.'}${roleLine}`;

      const userPrompt = `GROUNDING CONTEXT FROM RETRIEVED KNOWLEDGE BASE:
${contextSnippet || 'No relevant document chunks found.'}

USER QUESTION:
"${query}"

Please provide a clear, accurate, and structured answer:`;

      let geminiOk = false;
      try {
        const response = await generateWithRetry( ai, {
          model: 'gemini-2.0-flash-lite',
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        } );
        aiResponseText = response.text || 'I analyzed your documents but could not format a response.';
        // Strip any raw binary data URLs Gemini may have echoed from context
        aiResponseText = aiResponseText.replace( /data:[a-z/+]+;base64,[A-Za-z0-9+/=\s]{20,}/g, '[binary data omitted]' );
        geminiOk = true;
      } catch ( geminiErr: any ) {
        const isQuota = geminiErr?.status === 429 || geminiErr?.message?.includes( '429' );
        console.warn( isQuota ? 'Gemini quota exhausted – serving retrieval fallback.' : 'Gemini error – serving retrieval fallback.', geminiErr?.message );
      }

      // Serve retrieval-based fallback when Gemini is unavailable
      if ( !geminiOk ) {
        aiResponseText = buildFallbackAnswer( query, citations );
      }
    } else if ( citations.length > 0 ) {
      aiResponseText = buildFallbackAnswer( query, citations );
    } else {
      aiResponseText = `I couldn't find specific documents matching "${query}". Try uploading relevant PDFs, notes, or emails first!`;
    }

    res.json( {
      success: true,
      answer: aiResponseText,
      citations: citations,
      retrievedCount: citations.length,
    } );
  } catch ( error: any ) {
    console.error( 'Error in /api/rag/query:', error );
    res.status( 500 ).json( {
      success: false,
      error: error?.message || 'RAG query processing failed',
    } );
  }
} );

// Helper for performRetrieval
function performRetrieval( query: string, docs: any[] ) {
  const queryLower = query.toLowerCase();
  // Words that describe the request intent, not the content being searched for
  const STOP_WORDS = new Set( ['provide','show','give','find','list','tell','what','how','when','where','which','who','get','more','details','detail','summary','overview','all','every','complete','full','regarding','about','related','from','the','for','with','and','but','not','this','that','these','those','can','please','pdf','doc','txt','csv','json','note','email','image','file','document','vault'] );
  const keywords = queryLower.replace( /[^a-z0-9]/g, ' ' ).split( /\s+/ ).filter( w => w.length > 2 );
  const contentKeywords = keywords.filter( w => !STOP_WORDS.has( w ) );

  const matchedChunks: any[] = [];

  docs.forEach( ( doc: any ) => {
    const decoded = decodeVaultText( doc.rawText || '' );
    const isBinaryDataUrl = decoded.trimStart().startsWith( 'data:' );
    let binaryLabel = 'File';
    if ( doc.fileType === 'image' ) binaryLabel = 'Image';
    else if ( doc.fileType === 'pdf' ) binaryLabel = 'PDF';
    const raw = isBinaryDataUrl
      ? `[${binaryLabel}: ${doc.title}] ${doc.summary || ''}`.trim()
      : decoded;
    const paragraphs = raw.split( /\n\s*\n/ ).filter( ( p: string ) => p.trim().length > 0 );

    paragraphs.forEach( ( p: string, idx: number ) => {
      const pLower = p.toLowerCase();
      let score = 0;

      contentKeywords.forEach( kw => {
        if ( pLower.includes( kw ) ) score += 1;
        if ( doc.title?.toLowerCase().includes( kw ) ) score += 1.5;
        if ( doc.tags?.some( ( t: string ) => t.toLowerCase().includes( kw ) ) ) score += 2;
      } );

      if ( score > 0 || keywords.length <= 1 ) {
        // Proportional score: fraction of content keywords matched, no artificial base
        const kwRatio = contentKeywords.length > 0 ? score / ( contentKeywords.length * 4.5 ) : 0.1;
        matchedChunks.push( {
          docId: doc.id,
          docTitle: doc.title,
          fileType: doc.fileType || 'pdf',
          snippet: p.trim(),
          chunkIndex: idx,
          matchScore: Math.min( Math.max( kwRatio, 0.05 ), 0.98 ),
        } );
      }
    } );
  } );

  matchedChunks.sort( ( a, b ) => b.matchScore - a.matchScore );

  // Allow up to 4 chunks per document for detail-rich queries
  const perDocCount = new Map<string, number>();
  const topCitations = matchedChunks.filter( c => {
    const count = perDocCount.get( c.docId ) ?? 0;
    if ( count >= 4 ) return false;
    perDocCount.set( c.docId, count + 1 );
    return true;
  } ).slice( 0, 8 );

  // If the top document is short and text-based, send its full text to Gemini for complete answers
  const topDocId = topCitations[0]?.docId;
  const topDoc = topDocId ? docs.find( ( d: any ) => d.id === topDocId ) : null;
  const topDocText = topDoc ? decodeVaultText( topDoc.rawText || '' ) : '';
  const useFullDoc = topDoc && !topDocText.startsWith( 'data:' ) && topDocText.length > 0 && topDocText.length <= 5000;

  let contextSnippet: string;
  if ( useFullDoc ) {
    const meta = [
      topDoc.summary ? `Summary: ${topDoc.summary}` : '',
      topDoc.tags?.length ? `Tags: ${topDoc.tags.join( ', ' )}` : '',
    ].filter( Boolean ).join( ' | ' );
    const metaSuffix = meta ? ' (' + meta + ')' : '';
    const otherCitations = topCitations.filter( ( c: any ) => c.docId !== topDocId );
    const otherSnippets = otherCitations.map( ( c: any, i: number ) => `[Source ${i + 2}: ${c.docTitle}]\n${c.snippet}` ).join( '\n\n' );
    contextSnippet = `[Full Document: ${topDoc.title}]${metaSuffix}\n${topDocText}${otherSnippets ? '\n\n' + otherSnippets : ''}`;
  } else {
    contextSnippet = topCitations
      .map( ( c: any, i: number ) => {
        const doc = docs.find( ( d: any ) => d.id === c.docId );
        const meta = [
          doc?.summary ? `Summary: ${doc.summary}` : '',
          doc?.tags?.length ? `Tags: ${doc.tags.join( ', ' )}` : '',
        ].filter( Boolean ).join( ' | ' );
        const metaSuffix = meta ? ' (' + meta + ')' : '';
        return `[Source ${i + 1}: ${c.docTitle}]${metaSuffix}\n${c.snippet}`;
      } )
      .join( '\n\n' );
  }

  return { citations: topCitations, contextSnippet };
}

// Start Server and Mount Vite Middleware
if ( process.env.NODE_ENV !== 'production' ) {
  const { createServer: createViteServer } = await import( 'vite' );
  const vite = await createViteServer( {
    server: { middlewareMode: true },
    appType: 'spa',
  } );
  app.use( vite.middlewares );
} else if ( !process.env.VERCEL ) {
  // Standalone production server — Vercel handles static files via outputDirectory
  const distPath = path.join( process.cwd(), 'dist' );
  app.use( express.static( distPath ) );
  app.get( '*', ( _req, res ) => {
    res.sendFile( path.join( distPath, 'index.html' ) );
  } );
}

// Vercel requires a default export; standalone mode binds the port
if ( !process.env.VERCEL ) {
  app.listen( PORT, '0.0.0.0', () => {
    console.log( `AI Work Memory server listening on http://0.0.0.0:${PORT}` );
  } );
}

export default app;
