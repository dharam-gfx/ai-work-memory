# AI Work Memory — Personal Knowledge & RAG Assistant

AI Work Memory is a modern, full-stack personal knowledge management and Retrieval-Augmented Generation (RAG) platform. Upload documents (PDFs, emails, notes, spreadsheets), query your personal knowledge base using Google Gemini AI, explore interactive knowledge graphs, and sync your vault across devices — with complete data isolation per user.

---

## 🚀 Key Features

- **🧠 Smart RAG Chat Assistant**: Context-aware AI queries grounded in your personal document library with transparent source citations and rich Markdown parsing.
- **📚 Document Library & Ingestion**: Support for PDFs, Markdown, TXT, JSON, images, emails (.eml), and CSV/Excel with AI-powered metadata extraction via Gemini.
- **🕸️ Interactive Knowledge Graph**: Visual node-and-edge mapping linking core concepts, documents, and entities across your workspace.
- **📅 Timeline & Milestone Tracker**: Chronological organization of uploaded documents and knowledge events.
- **🔐 Real Authentication**: Google OAuth, GitHub OAuth, Magic Link (passwordless), Phone OTP, and Email/Password — all powered by Supabase Auth.
- **📱 Country Code Phone Input**: Phone OTP with auto-detected country flag and code picker (`react-phone-number-input`).
- **🔑 Password Strength Meter**: Real-time Weak / Good / Excellent indicator on signup; blocks submission on weak passwords.
- **✉️ Email Verification**: New accounts require email confirmation via Supabase (supports custom SMTP via Resend).
- **☁️ Cross-Device Sync**: Documents, chat history, and timeline sync across all devices via Supabase (`vault_data` table with Row-Level Security).
- **🔒 Absolute Privacy**: Per-user data isolation enforced at the database level via Supabase RLS. Local localStorage fallback when offline.
- **⚙️ User Preferences**: Toggleable Strict Source Grounding, Auto-Duplicate Prevention, and Real-Time Sync settings — all persisted per user.
- **🌐 URL-Based Routing**: React Router v6 with clean URLs (`/dashboard/chat`, `/dashboard/upload`, etc.), browser back/forward support, and auth-guarded routes.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, Lucide Icons, React Router v6, `react-markdown`, `react-phone-number-input`
- **Backend**: Node.js, Express (unified server with Vite middleware in dev, static serving in production)
- **AI Engine**: Google Gemini API (`@google/genai`) — server-side proxied via `/api/gemini/parse` and `/api/rag/query`
- **Auth & Database**: Supabase (PostgreSQL + Row Level Security + OAuth providers + Magic Link + Phone OTP)

---

## 📦 Project Structure

```text
├── server.ts                      # Express backend (Gemini proxy, RAG engine, static serving)
├── supabase-setup.sql             # SQL to create vault_data table with RLS
├── public/
│   └── favicon.svg                # App favicon (blue gradient brain-circuit icon)
├── src/
│   ├── App.tsx                    # Main app controller, routing, data sync, user preferences
│   ├── main.tsx                   # React DOM entry point
│   ├── index.css                  # Tailwind CSS global styles + phone input dark theme
│   ├── types.ts                   # Global TypeScript interfaces
│   ├── components/
│   │   ├── AuthModal.tsx          # Auth modal (Google, GitHub, Magic Link, Phone OTP, Email/Password)
│   │   ├── ChatModule.tsx         # AI RAG chat interface
│   │   ├── DocumentLibraryModule.tsx  # Document vault & management
│   │   ├── KnowledgeGraphModule.tsx   # Interactive D3 graph visualizer
│   │   ├── TimelineModule.tsx     # Chronological timeline view
│   │   ├── UploadModule.tsx       # File upload, notes, secrets, credentials (1 MB limit)
│   │   ├── SettingsModule.tsx     # Account, system status & user preferences
│   │   ├── LandingPage.tsx        # Marketing landing view
│   │   ├── LoadingScreen.tsx      # Auth restore loading screen
│   │   ├── PrivacyPolicyModule.tsx
│   │   └── ui/                    # shadcn/ui components
│   ├── context/
│   │   └── AuthContext.tsx        # Auth state, Supabase session management, Magic Link
│   ├── data/
│   │   └── seedData.ts            # Sample documents shown to first-time users
│   └── utils/
│       ├── supabase.ts            # Supabase client (browser-safe VITE_ env reading)
│       ├── vaultStorage.ts        # Cross-device Supabase read/write utilities
│       └── vectorEngine.ts        # Client-side vector search engine
├── .env                           # Local environment variables (not committed)
├── .env.example                   # Environment variable template
├── package.json
└── tsconfig.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v20+
- npm

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```env
# Required for AI parsing and RAG
GEMINI_API_KEY=your_google_gemini_api_key

# Required for real auth and cross-device sync
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** Variables must use the `VITE_` prefix to be accessible in the browser (Vite requirement).

### 3. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Enable **Google** and/or **GitHub** OAuth under **Authentication → Providers**
3. Set **Site URL** to `http://localhost:3000` and add `http://localhost:3000/**` to **Redirect URLs**
4. Run `supabase-setup.sql` in the **SQL Editor** to create the `vault_data` table
5. *(Optional)* Configure custom SMTP (e.g. [Resend](https://resend.com)) under **Project Settings → Auth → SMTP** to enable email confirmation and Magic Link delivery

### 4. Run in Development

```bash
npm run dev
```

Open `http://localhost:3000`.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 🔄 Data Sync Architecture

```
Login on any device
  → Auth via Supabase (Google / GitHub / Magic Link / Phone OTP / Email)
    → Load vault_data from Supabase DB (documents, messages, timeline)
      → localStorage used as fast local cache
        → Every change saved to both localStorage + Supabase
```

All data is scoped by `user_id` with Row-Level Security — no cross-user data leakage possible.

---

## 🔐 Authentication Methods

| Method | Provider | Notes |
|---|---|---|
| Google OAuth | Supabase + Google Cloud | Requires Google OAuth app |
| GitHub OAuth | Supabase + GitHub OAuth App | Requires GitHub OAuth app |
| Magic Link | Supabase email | Requires custom SMTP for reliable delivery |
| Phone OTP | Supabase + Twilio | Requires Twilio in Supabase |
| Email & Password | Supabase | Email confirmation requires custom SMTP |

---

## 🛡️ Privacy & Compliance

AI Work Memory is built with a zero-retention philosophy. All document data is processed within user-isolated sessions. Supabase RLS ensures each user can only access their own vault. Read the in-app Privacy Policy for full compliance disclosures.

---

## 📝 License

© 2026 AI Work Memory. All rights reserved.

