import { pool } from "../config/db";
import { getEmbedding } from "../rag/embedding";

// 🔹 Transaction type (IMPORTANT - fixes TS error)
export interface Transaction {
  amount: number | null;
  merchant: string | null;
  category: string;
  date: string | null;
  bank: string | null;
  card_last4: string | null;
  mode: string;
  confidence: number;
}

// 🔹 Insert transaction with embedding
export async function insertTransaction(
  tx: Transaction,
  rawText: string
) {
  try {
    // ⚠️ Skip if no useful text
    if (!rawText || rawText.trim().length === 0) {
      console.warn("⚠️ Skipping embedding: empty text");
      return;
    }

    // 🔹 Generate embedding
    const embeddingArray = await getEmbedding(rawText);

    if (!embeddingArray || !embeddingArray.length) {
      console.warn("⚠️ Embedding failed, skipping insert");
      return;
    }

    // 🔥 IMPORTANT: pgvector format MUST be []
    const embedding = `[${embeddingArray.join(",")}]`;

    // 🔹 Insert query
    const query = `
      INSERT INTO transactions 
      (amount, merchant, category, date, bank, card_last4, mode, confidence, embedding)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `;

    const values = [
      tx.amount,
      tx.merchant,
      tx.category,
      tx.date,
      tx.bank,
      tx.card_last4,
      tx.mode,
      tx.confidence,
      embedding,
    ];

    await pool.query(query, values);

    console.log("✅ Transaction inserted");

  } catch (err) {
    console.error("❌ insertTransaction ERROR:", err);
  }
}