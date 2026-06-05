import express from "express";
import { searchTransactions } from "../../db/search";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const q = req.query.q as string;

    if (!q) {
      return res.status(400).json({ error: "Missing query" });
    }

    const results = await searchTransactions(q);

    // ✅ Clean JSON (fix jq issue)
    const safe = results.map((r) => ({
      ...r,
      similarity: Number.isFinite(r.similarity) ? r.similarity : 0,
    }));

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(safe));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;