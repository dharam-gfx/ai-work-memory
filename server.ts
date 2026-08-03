import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

// API Route: Healthcheck
app.get( '/api/health', ( req, res ) => {
  res.json( {
    status: 'ok',
    geminiEnabled: !!ai,
    totalDocuments: serverDocuments.length,
    timestamp: new Date().toISOString(),
  } );
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

      const response = await ai.models.generateContent( {
        model: 'gemini-3.6-flash',
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
${strictGrounding
  ? '4. STRICT MODE: Only use information from the provided context. If the information is not present, explicitly say so — do not invent or infer beyond the documents.'
  : '4. You may supplement with general knowledge if the context is insufficient, but always prioritize the provided documents.'}${roleLine}`;

      const userPrompt = `GROUNDING CONTEXT FROM RETRIEVED KNOWLEDGE BASE:
${contextSnippet || 'No relevant document chunks found.'}

USER QUESTION:
"${query}"

Please provide a clear, accurate, and structured answer:`;

      const response = await ai.models.generateContent( {
        model: 'gemini-3.6-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      } );

      aiResponseText = response.text || 'I analyzed your documents but could not format a response.';
    } else if ( citations.length > 0 ) {
      aiResponseText = `Based on your ingested files (${citations.map( c => c.docTitle ).join( ', ' )}):\n\n${citations[0].snippet.substring( 0, 300 )}...`;
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
  const keywords = queryLower.replace( /[^a-z0-9]/g, ' ' ).split( /\s+/ ).filter( w => w.length > 2 );

  const matchedChunks: any[] = [];

  docs.forEach( ( doc: any ) => {
    const raw = doc.rawText || '';
    const paragraphs = raw.split( /\n\s*\n/ ).filter( ( p: string ) => p.trim().length > 0 );

    paragraphs.forEach( ( p: string, idx: number ) => {
      const pLower = p.toLowerCase();
      let score = 0;

      keywords.forEach( kw => {
        if ( pLower.includes( kw ) ) score += 1;
        if ( doc.title?.toLowerCase().includes( kw ) ) score += 1.5;
        if ( doc.tags?.some( ( t: string ) => t.toLowerCase().includes( kw ) ) ) score += 2;
      } );

      if ( score > 0 || keywords.length === 0 ) {
        matchedChunks.push( {
          docId: doc.id,
          docTitle: doc.title,
          fileType: doc.fileType || 'pdf',
          snippet: p.trim(),
          chunkIndex: idx,
          matchScore: Math.min( 0.5 + score * 0.15, 0.98 ),
        } );
      }
    } );
  } );

  matchedChunks.sort( ( a, b ) => b.matchScore - a.matchScore );
  const topCitations = matchedChunks.slice( 0, 4 );

  const contextSnippet = topCitations
    .map( ( c, i ) => `[Source ${i + 1}: ${c.docTitle}]\n${c.snippet}` )
    .join( '\n\n' );

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
} else {
  const distPath = path.join( process.cwd(), 'dist' );
  app.use( express.static( distPath ) );
  app.get( '*', ( req, res ) => {
    res.sendFile( path.join( distPath, 'index.html' ) );
  } );
}

app.listen( PORT, '0.0.0.0', () => {
  console.log( `AI Work Memory server listening on http://0.0.0.0:${PORT}` );
} );
