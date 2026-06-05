import "dotenv/config";
import express from "express";
import { pool } from "../config/db";
import transactionsRoute from "./routes/transactions";
import summaryRoute from "./routes/summary";
import searchRoute from "./routes/search";
import { searchTransactions } from "../db/search";
import askRoutes from "./routes/ask";





const app = express();
app.use(express.json());

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

app.use("/", askRoutes);
app.use("/transactions", transactionsRoute);
app.use("/summary", summaryRoute);
app.use("/search", searchRoute);


// app.get("/transactions", async (req, res) => {
//   try {
//     const {
//       from,
//       to,
//       category,
//       merchant,
//       limit = "10",
//       offset = "0",
//       sort = "date",
//       order = "desc"
//     } = req.query;

//     let query = "SELECT * FROM transactions WHERE 1=1";
//     const values: any[] = [];
//     let index = 1;

//     // 🔹 Filters
//     if (from) {
//       query += ` AND date >= $${index++}`;
//       values.push(from);
//     }

//     if (to) {
//       query += ` AND date <= $${index++}`;
//       values.push(to);
//     }

//     if (category) {
//       query += ` AND category = $${index++}`;
//       values.push(category);
//     }

//     // 🔍 Search (merchant partial match)
//     if (merchant) {
//       query += ` AND merchant ILIKE $${index++}`;
//       values.push(`%${merchant}%`);
//     }

//     // 🔃 Sorting (safe whitelist)
//     const allowedSort = ["date", "amount", "merchant"];
//     const sortField = allowedSort.includes(sort as string) ? sort : "date";
//     const sortOrder = order === "asc" ? "ASC" : "DESC";

//     query += ` ORDER BY ${sortField} ${sortOrder}`;

//     // 📄 Pagination
//     query += ` LIMIT $${index++} OFFSET $${index++}`;
//     values.push(parseInt(limit as string), parseInt(offset as string));

//     const result = await pool.query(query, values);

//     res.json({
//       count: result.rowCount,
//       data: result.rows
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error fetching transactions");
//   }
// });


app.get("/expenses/monthly", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE_TRUNC('month', date) AS month,
             SUM(amount) AS total
      FROM transactions
      GROUP BY month
      ORDER BY month;
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Error fetching monthly expenses");
  }
});

app.get("/expenses/category", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category,
             SUM(amount) AS total
      FROM transactions
      GROUP BY category;
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Error fetching category data");
  }
});

app.get("/expenses/daily", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT date,
             SUM(amount) AS total
      FROM transactions
      GROUP BY date
      ORDER BY date;
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Error fetching daily data");
  }
});