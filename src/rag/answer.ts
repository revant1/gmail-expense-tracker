// import OpenAI from "openai";
import { searchTransactions } from "../db/search";

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export async function answerQuery(userQuery: string) {
  const transactions = await searchTransactions(userQuery);

  const context = transactions
    .map(
      (t) =>
        `₹${t.amount} at ${t.merchant} on ${t.date} via ${t.mode}`
    )
    .join("\n");

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3",
      prompt: `
You are a finance assistant.

User question: ${userQuery}

Transactions:
${context}

Give a clear answer with totals if needed.
`,
      stream: false,
    }),
  });

  const data = await response.json();

  return data.response;
}