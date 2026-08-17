# aiworkmemory

**[aiworkmemory](https://aiworkmemory.vercel.app)** — AI Work Memory is a personal knowledge graph and RAG assistant. Upload PDFs, emails, notes, and spreadsheets, then ask questions in plain English and get instant AI-grounded answers with exact source citations.

🔗 Live app: https://aiworkmemory.vercel.app

A full-stack RAG (Retrieval-Augmented Generation) platform for managing your personal knowledge vault. Upload documents, query them with Google Gemini AI, and sync across devices — with strict per-user data isolation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 6, TypeScript 5.8, Tailwind CSS v4 |
| Backend | Node.js + Express (unified dev/prod server via `tsx` / `esbuild`) |
| AI Engine | Google Gemini (`@google/genai`) — server-side proxy only |
| Auth & DB | Supabase (PostgreSQL + RLS + OAuth + Magic Link + Phone OTP) |
| UI Components | shadcn/ui (Radix primitives), Lucide Icons, Framer Motion |
| Graph / Charts | D3 v7 |
| Routing | React Router v7 |

---

## Features

- **RAG Chat** — queries grounded in your documents with source citations and Markdown rendering
- **Document Vault** — PDF, TXT, MD, JSON, image (PNG/JPG/WEBP), email (.eml), CSV — 1 MB limit per file; AI extracts metadata and summary via Gemini
- **Staged Upload Queue** — review, rename, and attach context notes before committing to vault
- **Duplicate Detection** — filename / title / content hash check before ingestion; overwrite or keep-both options
- **Secrets & Credentials** — AES-256-GCM encryption via server-side `VAULT_ENCRYPTION_KEY`; backward-compatible with legacy Base64 `ENC[v1]:` format; decryption happens server-side only so plaintext never touches the browser storage
- **Knowledge Graph** — interactive D3 node-edge visualizer linking documents and concepts
- **Timeline** — chronological view of ingested knowledge events
- **Auth** — Google OAuth, GitHub OAuth, Magic Link, Phone OTP, Email+Password (all via Supabase)
- **Cross-Device Sync** — Supabase `vault_data` table with Row-Level Security; localStorage used as offline cache
- **User Preferences** — Strict Source Grounding, Auto-Duplicate Prevention, Real-Time Sync — all persisted per user

---

## Project Structure

```text
├── server.ts                      # Express server: Gemini proxy, RAG endpoint, Vite dev middleware
├── supabase-setup.sql             # Creates vault_data table + RLS policies — run once in Supabase SQL Editor
├── vite.config.ts                 # Vite config with @tailwindcss/vite plugin and @ path alias
├── tsconfig.json                  # TypeScript config (moduleResolution: bundler, jsx: react-jsx)
├── src/
│   ├── main.tsx                   # React DOM entry point
│   ├── App.tsx                    # Root: routing, vault sync, auth guards, global state
│   ├── index.css                  # Tailwind CSS v4 global styles + phone input dark theme
│   ├── types.ts                   # Shared TypeScript interfaces (DocumentItem, Citation, ChatMessage…)
│   ├── vite-env.d.ts              # /// <reference types="vite/client" /> — CSS import declarations
│   ├── components/
│   │   ├── AuthModal.tsx          # Auth flows: Google, GitHub, Magic Link, Phone OTP, Email/Password
│   │   ├── ChatModule.tsx         # RAG chat UI: query input, AI response, citation drawers
│   │   ├── DocumentLibraryModule.tsx  # Vault list, search/filter, preview modal, delete
│   │   ├── UploadModule.tsx       # Staged file queue, text notes, secrets, credentials
│   │   ├── KnowledgeGraphModule.tsx   # D3 force-directed graph
│   │   ├── TimelineModule.tsx     # Chronological document event feed
│   │   ├── SettingsModule.tsx     # User preferences, account info, system status
│   │   ├── LandingPage.tsx        # Public marketing page
│   │   ├── LoadingScreen.tsx      # Auth session restore spinner
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── PersonaExplorerModule.tsx
│   │   ├── PrivacyPolicyModule.tsx
│   │   └── ui/                    # shadcn/ui: button, card, dialog, input, tabs, tooltip…
│   ├── context/
│   │   └── AuthContext.tsx        # Supabase session, onAuthStateChange, Magic Link handling
│   ├── data/
│   │   └── seedData.ts            # Demo documents shown to first-time / unauthenticated users
│   └── utils/
│       ├── supabase.ts            # Supabase browser client (reads VITE_ env vars)
│       ├── vaultStorage.ts        # read/write vault_data rows in Supabase; mirrors to localStorage
│       └── vectorEngine.ts        # Client-side hybrid keyword + cosine-similarity vector search
```

---

## API Routes (server.ts)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness check; returns `geminiEnabled` flag |
| `POST` | `/api/gemini/parse` | Parses uploaded file — extracts summary, tags, category, text via `gemini-2.0-flash` |
| `POST` | `/api/rag/query` | RAG query — retrieves relevant chunks, synthesizes answer with citations via `gemini-2.0-flash-lite` |
| `POST` | `/api/vault/encrypt` | AES-256-GCM encrypt a plaintext value server-side; falls back to Base64 if `VAULT_ENCRYPTION_KEY` is not set |

All Gemini calls are server-side only. The `GEMINI_API_KEY` is never sent to the browser. Both endpoints fall back gracefully when `GEMINI_API_KEY` is missing.

---

## Getting Started

### Prerequisites

- Node.js v20+
- npm

### 1. Install

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

```env
# Server-side only — never exposed to browser
GEMINI_API_KEY=your_google_gemini_api_key

# 32-byte hex key for AES-256-GCM vault encryption
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
VAULT_ENCRYPTION_KEY=your_64_char_hex_key

# Browser-safe Supabase credentials (VITE_ prefix required by Vite)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. **SQL Editor** → run `supabase-setup.sql` to create `vault_data` + RLS policies
3. **Authentication → Providers** → enable Google and/or GitHub OAuth
4. **Authentication → URL Configuration** → set Site URL to `http://localhost:3000`, add `http://localhost:3000/**` to Redirect URLs
5. *(Optional)* **Project Settings → Auth → SMTP** → configure Resend or another SMTP provider for Magic Link and email confirmation

### 4. Dev

```bash
npm run dev
# → http://localhost:3000
```

`tsx server.ts` starts Express which injects Vite as middleware — HMR, single port, no proxy config needed.

### 5. Production Build

```bash
npm run build
# Vite builds frontend to dist/
# esbuild bundles server.ts → dist/server.cjs

npm start
# node dist/server.cjs serves static dist/ + API routes
```

### 6. Type Check

```bash
npm run lint
# tsc --noEmit
```

---

## Data Flow

```
Browser → POST /api/rag/query
  → server.ts retrieves relevant doc chunks
    → Gemini generates grounded answer
      → citations returned with matchScore, snippet, docTitle
        → ChatModule renders Markdown + expandable citation drawers
```

```
File selected → UploadModule stages file (rawText = placeholder for binary, base64Data stored separately)
  → "Upload All" → POST /api/gemini/parse per file
    → Gemini returns extractedText, summary, tags, category
      → DocumentItem saved to localStorage + Supabase vault_data
        → vectorEngine indexes rawText chunks for client-side fallback search
```

---

## Isolated Vault — How Per-User Data Isolation Works

Every row in `vault_data` has a `user_id` column. Supabase RLS policies enforce:

```sql
-- Users can only SELECT/INSERT/UPDATE/DELETE their own rows
USING (auth.uid() = user_id)
```

This is enforced **inside PostgreSQL** — not in application code. Even a bug in the API cannot return another user's data. The Supabase anon key used in the browser has no elevated privileges; RLS applies on every query.

---

## Authentication Methods

| Method | Notes |
|---|---|
| Google OAuth | Requires Google Cloud OAuth app configured in Supabase |
| GitHub OAuth | Requires GitHub OAuth app configured in Supabase |
| Magic Link | Passwordless email link — requires custom SMTP for reliable delivery |
| Phone OTP | Requires Twilio enabled in Supabase Auth settings |
| Email + Password | Email confirmation on signup — requires custom SMTP |

---

## Security Notes for Developers

- `GEMINI_API_KEY` lives only in `.env` and is read by `server.ts` — never bundled into the frontend
- `VAULT_ENCRYPTION_KEY` is a 32-byte hex secret used for AES-256-GCM credential encryption — server-side only, never sent to browser
- `VITE_SUPABASE_ANON_KEY` is intentionally public-safe — RLS makes it safe to expose
- New credentials are encrypted as `ENC[v2]:iv.authTag.ciphertext` (AES-256-GCM). Legacy `ENC[v1]:base64` entries remain readable via the backward-compatible decoder
- Decryption happens only on the server at query time — plaintext is never stored in localStorage or Supabase
- File upload limit: **1 MB per file** (enforced in `UploadModule` before read)
- Binary files (images, PDFs, XLSX) store a readable placeholder in `rawText`; actual binary goes in `base64Data` for Gemini and is never chunked into the vector index
- Gemini 429 quota exhaustion is detected immediately — daily-limit errors skip retries and fall back to the structured retrieval answer within milliseconds

---

## License

© 2026 AI Work Memory. All rights reserved.

