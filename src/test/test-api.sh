#!/bin/bash

BASE_URL="http://localhost:3000"

echo "🚀 Testing Expense API..."

echo -e "\n📌 Transactions:"
curl -s $BASE_URL/transactions | jq

echo -e "\n📌 Monthly Expenses:"
curl -s $BASE_URL/expenses/monthly | jq

echo -e "\n📌 Category Expenses:"
curl -s $BASE_URL/expenses/category | jq

echo -e "\n📌 Daily Expenses:"
curl -s $BASE_URL/expenses/daily | jq

echo -e "\n📌 Filtered (May groceries):"
curl -s "$BASE_URL/transactions?from=2026-05-01&to=2026-05-31&category=groceries" | jq

echo -e "\n📌 Pagination (2 records):"
curl -s "$BASE_URL/transactions?limit=2&offset=0" | jq

echo -e "\n📌 Search (mart):"
curl -s "$BASE_URL/transactions?merchant=mart" | jq

echo -e "\n📌 Full filter combo:"
curl -s "$BASE_URL/transactions?category=groceries&merchant=mart&limit=5" | jq

echo -e "\n✅ Done"