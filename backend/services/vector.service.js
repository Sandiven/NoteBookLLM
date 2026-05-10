import { QdrantVectorStore } from "@langchain/qdrant";
import { embeddings } from "./embed.service.js";

export async function storeDocuments(processedDocs, collectionName) {
  await QdrantVectorStore.fromDocuments(
    processedDocs,
    embeddings,
    {
      url: process.env.QDRANT_BASE_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName
    }
  );

  console.log("Indexing Completed");
}

export async function searchDocuments(userQuery) {
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: process.env.QDRANT_BASE_URL,
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: global.currentCollection
    }
  );

  const retriever = vectorStore.asRetriever({ k: 3 });

  const retrievedChunks = await retriever.invoke(userQuery);

  return retrievedChunks;
}
