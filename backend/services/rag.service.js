import OpenAI from "openai";

const groqClient = new OpenAI({
  apiKey: process.env.GROQ_SECRET_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export async function generateAnswer(userQuery, retrievedChunks) {
  const systemPrompt = `
You are an AI Assistant who helps resolving
the user query based on the available context
provided from uploaded documents.

Rules:

1. ONLY answer from the provided context.

2. Do NOT hallucinate.

3. If answer is not found in context,
say:
"Answer not found in uploaded document."

4. Keep answer clean and structured.

5. If possible provide bullet points.

6. Mention examples if present in context.

Context:
${JSON.stringify(retrievedChunks)}
`;

  const response = await groqClient.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userQuery
      }
    ]
  });

  return response.choices[0].message.content;
}
