import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export async function chunkDocuments(docs) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  });

  const chunkedDocs = await textSplitter.splitDocuments(docs);

  return chunkedDocs;
}
