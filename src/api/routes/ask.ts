import express from "express";
import { searchTransactions } from "../../rag/search";
import axios from "axios";

const router = express.Router();

router.get("/ask", async (req, res) => {
  try {
    const query = req.query.q as string;

    console.log("🔍 Query:", query);

    // 1. Get similar transactions
    const transactions = await searchTransactions(query);

    console.log("📊 Found:", transactions.length);

    if (!transactions.length) {
      return res.json({ response: "No transactions found" });
    }

    // 2. Build context
    const context = transactions
      .map(
        (t: any) =>
          `₹${t.amount} at ${t.merchant} via ${t.mode} on ${t.date}`
      )
      .join("\n");

    console.log("🧠 Context:", context);

    // 3. Call Ollama
    const ollamaRes = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "phi3",
        prompt: `
You are a finance assistant.

User question: ${query}

Transactions:
${context}

Answer clearly with totals or insights.
        `,
        stream: false,
      }
    );

    const answer = ollamaRes.data.response;

    console.log("🤖 Answer:", answer);

    res.json({ response: answer });

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;