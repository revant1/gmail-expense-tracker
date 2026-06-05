import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost", // try 127.0.0.1 if fails
  database: "postgres",
  password: "postgres",
  port: 5432,
});