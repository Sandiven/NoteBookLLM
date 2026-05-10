# DocuMind — AI Document Assistant

A **RAG (Retrieval-Augmented Generation)** powered web application that lets you upload documents and ask questions about them in plain English. Answers are generated using **LLaMA 3-70B via Groq**, with context retrieved from a **Qdrant** vector database.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Variable Name Reference](#variable-name-reference)
- [Getting Started](#getting-started)
- [How It Works](#how-it-works)
- [Supported File Types](#supported-file-types)
- [API Endpoints](#api-endpoints)

---

## Features

- Upload PDF, DOCX, DOC, CSV, PPTX, JSON, or TXT files
- Automatic document chunking and embedding
- Semantic vector search via Qdrant
- Context-grounded answers from LLaMA 3 (no hallucinations)
- Clean, responsive light-theme UI (blue & white)
- Drag-and-drop file upload
- Suggestion chips for quick queries

---

## Tech Stack

| Layer       | Technology                              |
|-------------|------------------------------------------|
| Frontend    | Plain HTML, CSS, Vanilla JS              |
| Backend     | Node.js, Express.js                      |
| AI / LLM    | Groq API → LLaMA 3.3-70B Versatile      |
| Embeddings  | `@xenova/transformers` (all-MiniLM-L6-v2, runs locally) |
| Vector DB   | Qdrant                                   |
| RAG Framework | LangChain                              |
| File Parsing | PDFLoader, DocxLoader, CSVLoader, PPTXLoader, JSONLoader, TextLoader |

---

## Project Structure

```
final_project/
├── backend/
│   ├── .env                      # Environment variables (not committed)
│   ├── .gitignore
│   ├── package.json
│   ├── server.js                 # Express app entry point
│   ├── qdrant.js                 # Qdrant collection name export
│   ├── routes/
│   │   ├── upload.route.js       # POST /uploads — file upload & indexing
│   │   └── chat.route.js         # POST /chat   — query & answer
│   ├── services/
│   │   ├── loader.service.js     # Loads and parses uploaded files
│   │   ├── chunk.service.js      # Splits documents into chunks
│   │   ├── embed.service.js      # Local embedding via Xenova
│   │   ├── vector.service.js     # Qdrant store & search operations
│   │   └── rag.service.js        # Groq LLM call with context
│   └── utils/
│       └── supportedFiles.js     # List of accepted file extensions
└── frontend/
    ├── index.html                # Landing / home page
    └── chat.html                 # Chat interface
```

---

## Environment Variables

Create a `.env` file inside the `backend/` folder. See `.env` for the template.

| Variable           | Description                                             | Example                        |
|--------------------|---------------------------------------------------------|--------------------------------|
| `SERVER_PORT`      | Port the Express server runs on                         | `5000`                         |
| `QDRANT_BASE_URL`  | Base URL of your running Qdrant instance                | `http://localhost:6333`        |
| `QDRANT_COLLECTION`| Default Qdrant collection name (used as fallback)       | `gen_ai_assign_3`              |
| `GROQ_SECRET_KEY`  | Your Groq API key                                       | `gsk_...`                      |
| `HF_ACCESS_TOKEN`  | Hugging Face token (if needed for private models)       | `hf_...`                       |
| `OPENAI_SECRET_KEY`| OpenAI key placeholder (set to `dummy` if unused)       | `dummy`                        |

---

## Variable Name Reference

This table maps **old variable names** (original code) to the **new names** used in this version, so you can easily cross-reference.

### Environment Variables (.env)

| Old Name          | New Name            |
|-------------------|---------------------|
| `PORT`            | `SERVER_PORT`       |
| `QDRANT_URL`      | `QDRANT_BASE_URL`   |
| `COLLECTION_NAME` | `QDRANT_COLLECTION` |
| `GROQ_API_KEY`    | `GROQ_SECRET_KEY`   |
| `HF_TOKEN`        | `HF_ACCESS_TOKEN`   |
| `OPENAI_API_KEY`  | `OPENAI_SECRET_KEY` |

### Code-level Variables

| File                      | Old Name           | New Name              |
|---------------------------|--------------------|-----------------------|
| `qdrant.js`               | `COLLECTION_NAME`  | `QDRANT_COLLECTION`   |
| `server.js`               | `PORT`             | `SERVER_PORT`         |
| `rag.service.js`          | `client`           | `groqClient`          |
| `rag.service.js`          | `system_prompt`    | `systemPrompt`        |
| `rag.service.js`          | `searchedChunks`   | `retrievedChunks`     |
| `vector.service.js`       | `docs`             | `processedDocs`       |
| `vector.service.js`       | `searchedChunks`   | `retrievedChunks`     |
| `upload.route.js`         | `upload`           | `fileUploader`        |
| `upload.route.js`         | `filePath`         | `uploadedFilePath`    |
| `upload.route.js`         | `originalName`     | `originalFileName`    |
| `upload.route.js`         | `splittedDocs`     | `chunkedDocs`         |
| `upload.route.js`         | `docs`             | `loadedDocs`          |
| `chat.route.js`           | `searchedChunks`   | `retrievedChunks`     |
| `chunk.service.js`        | `splitter`         | `textSplitter`        |
| `chunk.service.js`        | `splittedDocs`     | `chunkedDocs`         |
| `embed.service.js`        | `embedder`         | `embeddingPipeline`   |
| `embed.service.js`        | `getEmbedder()`    | `getEmbeddingPipeline()` |
| `embed.service.js`        | `vectors`          | `embeddingVectors`    |
| `loader.service.js`       | `ext`              | `fileExtension`       |
| `loader.service.js`       | `loader`           | `documentLoader`      |
| `loader.service.js`       | `docs`             | `loadedDocs`          |

---

## Getting Started

### Prerequisites

- Node.js v18+
- Qdrant running locally (or a cloud instance)
- A valid Groq API key

### 1. Start Qdrant

```bash
docker run -p 6333:6333 qdrant/qdrant
```

### 2. Install dependencies

```bash
cd final_project/backend
npm install
```

### 3. Configure environment

```bash
# Copy the sample and fill in your values
cp .env .env.local
# Edit .env with your GROQ_SECRET_KEY, QDRANT_BASE_URL, etc.
```

### 4. Start the server

```bash
npm run dev
```

The server starts at `http://localhost:5000`. The frontend is served automatically.

### 5. Open the app

Navigate to `http://localhost:5000` in your browser.

---

## How It Works

```
User uploads file
      │
      ▼
loadDocuments()       ← Parses file by extension (PDF/DOCX/CSV/etc.)
      │
      ▼
chunkDocuments()      ← Splits into 1000-char chunks (200 overlap)
      │
      ▼
embeddings.embedDocuments()  ← Local Xenova MiniLM embeddings
      │
      ▼
QdrantVectorStore     ← Stores vectors in a new per-file collection
      │
      ▼
User asks a question
      │
      ▼
embeddings.embedQuery()      ← Embeds the query
      │
      ▼
vectorStore.asRetriever()    ← Top-3 semantically similar chunks
      │
      ▼
generateAnswer()      ← Groq LLaMA 3-70B with context → answer
      │
      ▼
Response sent to frontend
```

---

## Supported File Types

| Extension | Loader Used         |
|-----------|---------------------|
| `.pdf`    | PDFLoader           |
| `.csv`    | CSVLoader           |
| `.docx`   | DocxLoader          |
| `.doc`    | DocxLoader (doc mode)|
| `.json`   | JSONLoader          |
| `.pptx`   | PPTXLoader          |
| `.txt`    | TextLoader          |

---

## API Endpoints

### `POST /uploads`

Upload and index a document.

**Request:** `multipart/form-data` with field `file`

**Response:**
```json
{ "success": true, "message": "File Uploaded & Indexed Successfully" }
```

---

### `POST /chat`

Ask a question about the indexed document.

**Request:**
```json
{ "query": "What are the key findings?" }
```

**Response:**
```json
{ "success": true, "answer": "Based on the document, the key findings are..." }
```

---

## Notes

- Each file upload creates its own Qdrant collection (named `<filename>-<timestamp>`). Only the **most recently uploaded** file is active for chat at any time.
- The embedding model (`all-MiniLM-L6-v2`) runs **locally** via `@xenova/transformers` — no external API call needed for embeddings.
- Answers are strictly grounded in the uploaded document. If information is not present, the AI responds: *"Answer not found in uploaded document."*
