import { pool } from "../config/db";

// Get last processed message
export async function getLastMessageId(): Promise<string | null> {
  const res = await pool.query(
    "SELECT last_message_id FROM sync_state ORDER BY id DESC LIMIT 1"
  );

  return res.rows[0]?.last_message_id || null;
}

// Save last processed message
export async function saveLastMessageId(messageId: string) {
  await pool.query(
    "INSERT INTO sync_state (last_message_id) VALUES ($1)",
    [messageId]
  );
}