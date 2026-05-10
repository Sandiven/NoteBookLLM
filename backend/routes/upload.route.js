import express from "express";
import path from "path";
import multer from "multer";

import { loadDocuments } from "../services/loader.service.js";
import { chunkDocuments } from "../services/chunk.service.js";
import { storeDocuments } from "../services/vector.service.js";

const router = express.Router();

const fileUploader = multer({
  dest: "uploads/",
});

router.post(
  "/",
  fileUploader.single("file"),

  async (req, res) => {
    try {
      const uploadedFilePath = req.file.path;
      const originalFileName = req.file.originalname;

      // load documents
      const loadedDocs = await loadDocuments(uploadedFilePath, originalFileName);

      // chunking
      const chunkedDocs = await chunkDocuments(loadedDocs);

      // embeddings + vector db
      const collectionName =
        path.parse(originalFileName).name + "-" + Date.now();

      await storeDocuments(chunkedDocs, collectionName);

      global.currentCollection = collectionName;

      res.json({
        success: true,
        message: "File Uploaded & Indexed Successfully",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
);

export default router;
