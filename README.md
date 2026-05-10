# 📚 DocuAssist — AI Document Assistant

> A **RAG (Retrieval-Augmented Generation)** powered web application that lets you upload documents and ask questions about them in plain English. Answers are generated using **LLaMA 3.3-70B via Groq**, with context retrieved from a **Qdrant** vector database.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [How It Works](#how-it-works)
- [Supported File Types](#supported-file-types)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Run Commands](#run-commands)
- [Deployment](#deployment)
- [Notes & Caveats](#notes--caveats)

---

## 🧠 Overview

DocuAssist (repo: `NoteBookLLM`) is a full-stack AI assistant that allows users to upload documents of various formats and chat with them. It combines **local embeddings**, **vector search**, and a **hosted LLM** to deliver accurate, document-grounded answers — no hallucinations.

---

## ✨ Features

| Feature | Details |
|---|---|
| 📄 Multi-format Upload | Supports PDF, DOCX, DOC, CSV, PPTX, JSON, TXT |
| 🔪 Auto Chunking | Documents are split into 1000-char chunks (200 overlap) |
| 🧬 Local Embeddings | Uses `all-MiniLM-L6-v2` via `@xenova/transformers` — no API call |
| 🔍 Semantic Search | Top-3 relevant chunks retrieved via Qdrant vector DB |
| 🤖 LLM Answer Generation | LLaMA 3.3-70B Versatile via Groq API |
| 🚫 Grounded Answers | Strictly document-bound; returns "Answer not found" if absent |
| 🖱️ Drag-and-Drop Upload | Clean UI with drag-and-drop file support |
| 💡 Suggestion Chips | Quick query chips for common questions |
| 🎨 Responsive UI | Light-theme, blue & white, works on mobile and desktop |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Plain HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js (v18+), Express.js |
| **LLM** | Groq API → LLaMA 3.3-70B Versatile |
| **Embeddings** | `@xenova/transformers` — `all-MiniLM-L6-v2` (runs locally) |
| **Vector Database** | Qdrant (cloud or self-hosted) |
| **RAG Framework** | LangChain |
| **File Parsers** | PDFLoader, DocxLoader, CSVLoader, PPTXLoader, JSONLoader, TextLoader |

---

## 🗂️ Project Structure

```
NoteBookLLM/
├── backend/
│   ├── .env                        # Environment variables (not committed)
│   ├── .gitignore
│   ├── package.json
│   ├── server.js                   # Express app entry point — starts server, mounts routes
│   ├── qdrant.js                   # Exports QDRANT_COLLECTION name (used as fallback)
│   ├── routes/
│   │   ├── upload.route.js         # POST /uploads — handles file upload & vector indexing
│   │   └── chat.route.js           # POST /chat   — handles user query & answer generation
│   ├── services/
│   │   ├── loader.service.js       # Loads & parses uploaded files by extension
│   │   ├── chunk.service.js        # Splits documents into overlapping chunks
│   │   ├── embed.service.js        # Generates embeddings locally via Xenova pipeline
│   │   ├── vector.service.js       # Qdrant store & similarity search operations
│   │   └── rag.service.js          # Calls Groq LLM with retrieved context → answer
│   └── utils/
│       └── supportedFiles.js       # Whitelist of accepted file extensions
└── frontend/
    ├── index.html                  # Landing / home page
    └── chat.html                   # Chat interface (query input + answer display)
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory with the following variables:

```env
PORT=5000
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key
COLLECTION_NAME=gen_ai_assign_3
GROQ_API_KEY=your-groq-api-key
HF_TOKEN=your-huggingface-token
```

### Variable Reference Table

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the Express server listens on | `5000` |
| `QDRANT_URL` | Base URL of your Qdrant instance (cloud or local) | `https://your-cluster.qdrant.io` or `http://localhost:6333` |
| `QDRANT_API_KEY` | API key for authenticating with Qdrant cloud | `your-qdrant-api-key` |
| `COLLECTION_NAME` | Default Qdrant collection name (used as fallback) | `gen_ai_assign_3` |
| `GROQ_API_KEY` | Your Groq API key for LLaMA inference | `gsk_...` |
| `HF_TOKEN` | Hugging Face token (for private models, if needed) | `hf_...` |

> **Note:** Each file upload dynamically creates its own Qdrant collection named `<filename>-<timestamp>`. The `COLLECTION_NAME` env var acts as a fallback default.

---

## ⚙️ How It Works

```
User uploads a file
        │
        ▼
loader.service.js        ← Detects file extension, picks the right LangChain loader
        │
        ▼
chunk.service.js         ← Splits into 1000-char chunks with 200-char overlap
        │
        ▼
embed.service.js         ← Embeds each chunk locally using all-MiniLM-L6-v2 (Xenova)
        │
        ▼
vector.service.js        ← Stores vectors in a new per-file Qdrant collection
        │
        ▼
──────────────────── User asks a question ────────────────────
        │
        ▼
embed.service.js         ← Embeds the query locally
        │
        ▼
vector.service.js        ← Retrieves top-3 semantically similar chunks from Qdrant
        │
        ▼
rag.service.js           ← Builds prompt with context → calls Groq LLaMA 3.3-70B
        │
        ▼
Answer sent to frontend  ← Strictly grounded in the uploaded document
```

---

## 📂 Supported File Types

| Extension | LangChain Loader |
|---|---|
| `.pdf` | `PDFLoader` |
| `.csv` | `CSVLoader` |
| `.docx` | `DocxLoader` |
| `.doc` | `DocxLoader` (doc mode) |
| `.json` | `JSONLoader` |
| `.pptx` | `PPTXLoader` |
| `.txt` | `TextLoader` |

---

## 🔌 API Endpoints

### `POST /uploads`

Upload and index a document into the vector store.

**Request:** `multipart/form-data` with field name `file`

**Response:**
```json
{ "success": true, "message": "File Uploaded & Indexed Successfully" }
```

---

### `POST /chat`

Ask a question about the most recently indexed document.

**Request:**
```json
{ "query": "What are the key findings?" }
```

**Response:**
```json
{ "success": true, "answer": "Based on the document, the key findings are..." }
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **Qdrant** — either a cloud instance (qdrant.io) or Docker locally
- **Groq API Key** — get one at [console.groq.com](https://console.groq.com)
- **Hugging Face Token** (optional, for private models)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Sandiven/NoteBookLLM.git
cd NoteBookLLM
```

### Step 2 — Start Qdrant (if running locally)

```bash
docker run -p 6333:6333 qdrant/qdrant
```

> Skip this step if you're using Qdrant Cloud — just set `QDRANT_URL` to your cloud endpoint.

### Step 3 — Install Backend Dependencies

```bash
cd backend
npm install
```


### Step 4 — Start the Server

```bash
npm run dev
```

The server starts at `http://localhost:5000` and also serves the frontend automatically.

### Step 6 — Open in Browser

Navigate to:

```
http://localhost:5000
```

---

## 🏃 Run Commands

| Command | Description |
|---|---|
| `npm install` | Install all backend dependencies |
| `npm run dev` | Start the server in development mode (with hot reload if nodemon is configured) |
| `npm start` | Start the server in production mode |
| `docker run -p 6333:6333 qdrant/qdrant` | Start Qdrant locally via Docker |

---

## 🌐 Deployment

### Deploy Backend (Node.js)

The backend is a standard Express.js server and can be deployed to:

- **Render** — Connect GitHub repo, set Node.js environment, add env vars in dashboard, set build command `npm install` and start command `npm start`
- **Railway** — Push to GitHub, import repo, add env vars, auto-deploys
- **Heroku** — `git push heroku main` after setting config vars
- **VPS / EC2** — Clone, `npm install`, configure `.env`, run with `pm2 start server.js`

> Set all environment variables (`PORT`, `QDRANT_URL`, `QDRANT_API_KEY`, `COLLECTION_NAME`, `GROQ_API_KEY`, `HF_TOKEN`) in your deployment platform's environment settings.

### Deploy Qdrant

- **Qdrant Cloud** (recommended for production) — [cloud.qdrant.io](https://cloud.qdrant.io) — free tier available; get URL and API key, set in `.env`
- **Docker (self-hosted)** — `docker run -p 6333:6333 qdrant/qdrant`
- **Docker Compose** — add Qdrant as a service alongside your Node app

### Frontend

The frontend (`index.html` and `chat.html`) is served statically by the Express backend — no separate deployment needed. For standalone frontend hosting, you can serve the `frontend/` folder via Nginx, Vercel, or Netlify and update API base URLs accordingly.

---

## 📝 Notes & Caveats

- **Per-file collections:** Each uploaded file gets its own Qdrant collection named `<filename>-<timestamp>`. Only the **most recently uploaded** file is active for chat at any time.
- **Local embeddings:** The `all-MiniLM-L6-v2` model runs entirely on your server via `@xenova/transformers` — no external embedding API call is required.
- **Grounded answers:** The system prompt strictly constrains LLaMA to only answer from the retrieved context. If information isn't in the document, the AI responds: *"Answer not found in uploaded document."*
- **First-run model download:** On first run, `@xenova/transformers` will download the `all-MiniLM-L6-v2` model weights (~90MB). Subsequent runs use the local cache.
- **Node.js version:** Requires Node.js v18+ for ESM and top-level await compatibility used by `@xenova/transformers`.

---

## 📄 License

No license specified in the repository.

---

*Built with ❤️ using Node.js, LangChain, Groq, Qdrant, and Xenova Transformers.*
