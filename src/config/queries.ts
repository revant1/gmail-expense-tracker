import { pool } from "../config/db";
import { Transaction } from "../parser/transactionParser";

export async function insertTransaction(tx: Transaction) {
  const query = `
    INSERT INTO transactions (amount, merchant, category, date, confidence)
    VALUES ($1, $2, $3, $4, $5)
  `;

  const values = [
    tx.amount,
    tx.merchant,
    tx.category,
    tx.date,
    tx.confidence,
  ];

  await pool.query(query, values);
}