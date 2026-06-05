import { pool } from "../config/db";
import { getEmbedding } from "../rag/embedding";

export async function searchTransactions(query: string) {
  try {
    const embeddingArray = await getEmbedding(query);

    // 🔥 CRITICAL FIX
    const embedding = `[${embeddingArray.join(",")}]`;

    const result = await pool.query(
      `
      SELECT 
        amount,
        merchant,
        category,
        date,
        bank,
        mode,
        (embedding <-> $1::vector) AS distance
      FROM transactions
      WHERE embedding IS NOT NULL
      ORDER BY embedding <-> $1::vector
      LIMIT 5
      `,
      [embedding]
    );

    const rows = result.rows.map((r) => {
      const similarity = 1 / (1 + r.distance);

      return {
        amount: r.amount,
        merchant: r.merchant,
        category: r.category,
        date: r.date,
        bank: r.bank,
        mode: r.mode,
        similarity: Number.isFinite(similarity) ? similarity : 0,
      };
    });

    return rows;
  } catch (err) {
    console.error("❌ Search error:", err);
    throw err;
  }
}