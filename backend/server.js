import express from "express";
import "dotenv/config";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import uploadRoute from "./routes/upload.route.js";
import chatRoute from "./routes/chat.route.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Allow requests from frontend (file:// or separate dev server)
app.use(cors({
  origin: [
    "http://localhost:5000",
    "http://localhost:3000",
    "https://notebookllmsandeep.netlify.app/"  
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

// API routes
app.use("/uploads", uploadRoute);
app.use("/chat", chatRoute);

// Fallback: serve index.html for any unmatched route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

const SERVER_PORT = process.env.SERVER_PORT || 5000;

app.listen(SERVER_PORT, () => {
  console.log(`Server Running on http://localhost:${SERVER_PORT}`);
  console.log(`Frontend available at http://localhost:${SERVER_PORT}`);
});
