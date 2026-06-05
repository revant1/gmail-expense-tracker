import dotenv from "dotenv";
import path from "path";

// 🔥 FORCE load from root
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

console.log("Loaded KEY:", process.env.OPENAI_API_KEY);

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY not found");
}

export const ENV = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};