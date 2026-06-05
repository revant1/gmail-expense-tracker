import { Router, Request, Response } from "express";
import { pool } from "../../config/db";

const router = Router();

// ✅ GET /transactions
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const search = (req.query.search as string) || "";
    const bank = (req.query.bank as string) || "";
    const mode = (req.query.mode as string) || "";

    let query = `
      SELECT * FROM transactions
      WHERE 1=1
    `;

    const values: any[] = [];

    // 🔍 Search (merchant)
    if (search) {
      values.push(`%${search}%`);
      query += ` AND merchant ILIKE $${values.length}`;
    }

    // 🏦 Filter by bank
    if (bank) {
      values.push(bank);
      query += ` AND bank = $${values.length}`;
    }

    // 💳 Filter by mode
    if (mode) {
      values.push(mode);
      query += ` AND mode = $${values.length}`;
    }

    // 📄 Pagination
    values.push(limit);
    values.push(offset);

    query += `
      ORDER BY date DESC
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `;

    const result = await pool.query(query, values);

    res.json({
      page,
      limit,
      count: result.rows.length,
      data: result.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;