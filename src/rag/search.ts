import { pool } from "../config/db";
import { getEmbedding } from "./embedding";

export async function searchTransactions(query: string) {
  try {
    if (!query || query.trim().length === 0) {
      console.warn("Empty search query");
      return [];
    }

    // 🔹 1. Generate embedding
    const embeddingArray = await getEmbedding(query);

    if (!embeddingArray || !embeddingArray.length) {
      console.warn("Embedding failed");
      return [];
    }

    // 🔥 IMPORTANT FIX: use [] NOT {}
    const embedding = `[${embeddingArray.join(",")}]`;

    // 🔹 2. Run vector similarity search
    const sql = `
      SELECT 
        id,
        amount,
        merchant,
        category,
        date,
        bank,
        card_last4,
        mode,
        confidence,
        embedding <-> $1 AS distance
      FROM transactions
      ORDER BY embedding <-> $1
      LIMIT 5;
    `;

    const result = await pool.query(sql, [embedding]);

    return result.rows;

  } catch (err) {
    console.error("❌ searchTransactions ERROR:", err);
    return [];
  }
}