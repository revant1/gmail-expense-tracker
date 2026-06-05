import { searchTransactions } from "./db/search";

async function test() {
  const results = await searchTransactions("UPI food payment");

  console.log("🔍 Results:");
  console.table(results);
}

test();