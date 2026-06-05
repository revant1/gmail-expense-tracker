import { Router, Request, Response } from "express";
import { pool } from "../../config/db";

const router = Router();

// ✅ GET /summary
router.get("/", async (_req: Request, res: Response) => {
  try {
    const total = await pool.query(`
      SELECT SUM(amount) as total_spent FROM transactions
    `);

    const byCategory = await pool.query(`
      SELECT category, SUM(amount) as total
      FROM transactions
      GROUP BY category
    `);

    const byBank = await pool.query(`
      SELECT bank, SUM(amount) as total
      FROM transactions
      GROUP BY bank
    `);

    const byMode = await pool.query(`
      SELECT mode, SUM(amount) as total
      FROM transactions
      GROUP BY mode
    `);

    res.json({
      total_spent: total.rows[0].total_spent || 0,
      by_category: byCategory.rows,
      by_bank: byBank.rows,
      by_mode: byMode.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;