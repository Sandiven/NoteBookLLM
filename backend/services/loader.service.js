import path from "path";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";

export async function loadDocuments(filePath, originalFileName) {
  const fileExtension = path.extname(originalFileName);

  let documentLoader;

  // PDF
  if (fileExtension === ".pdf") {
    documentLoader = new PDFLoader(filePath);
  }

  // CSV
  else if (fileExtension === ".csv") {
    documentLoader = new CSVLoader(filePath);
  }

  // DOCX
  else if (fileExtension === ".docx") {
    documentLoader = new DocxLoader(filePath);
  }

  // DOC
  else if (fileExtension === ".doc") {
    documentLoader = new DocxLoader(filePath, { type: "doc" });
  }

  // JSON
  else if (fileExtension === ".json") {
    documentLoader = new JSONLoader(filePath);
  }

  // PPTX
  else if (fileExtension === ".pptx") {
    documentLoader = new PPTXLoader(filePath);
  }

  // TXT
  else if (fileExtension === ".txt") {
    documentLoader = new TextLoader(filePath);
  }

  else {
    throw new Error("Unsupported File Type");
  }

  const loadedDocs = await documentLoader.load();

  return loadedDocs;
}
