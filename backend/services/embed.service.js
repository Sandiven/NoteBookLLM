import { pipeline } from "@xenova/transformers";

let embeddingPipeline = null;

async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embeddingPipeline;
}

export const embeddings = {
  async embedDocuments(texts) {
    const embedder = await getEmbeddingPipeline();
    const embeddingVectors = [];
    for (const text of texts) {
      if (!text || text.trim().length === 0) continue;
      const output = await embedder(text, { pooling: "mean", normalize: true });
      embeddingVectors.push(Array.from(output.data));
    }
    return embeddingVectors;
  },

  async embedQuery(text) {
    const embedder = await getEmbeddingPipeline();
    const output = await embedder(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }
};
