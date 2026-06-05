# Gmail Expense Tracker - README

## Project Startup

### 1. Start PostgreSQL

Check containers:

```bash
docker ps -a
```

Start PostgreSQL:

```bash
docker start expense-postgres
```

Verify:

```bash
docker ps
```

Connect to DB:

```bash
docker exec -it expense-postgres psql -U postgres
```

---

### 2. Start Ollama

Check installed models:

```bash
ollama list
```

Start Ollama server:

```bash
ollama serve
```

Verify Ollama:

```bash
curl http://localhost:11434/api/generate -d '{
  "model":"phi3",
  "prompt":"hello",
  "stream":false
}'
```

---

### 3. Start Email Ingestion

```bash
pnpm dev
```

This will:

* Read Gmail emails
* Parse transactions
* Generate embeddings
* Store transactions in PostgreSQL

---

### 4. Start API Server

Open a new terminal:

```bash
pnpm api
```

Expected output:

```text
🚀 Server running on http://localhost:3000
```

---

## Testing

### Vector Search

```bash
curl --get --data-urlencode "q=UPI" http://localhost:3000/search
```

Pretty output:

```bash
curl --get --data-urlencode "q=UPI" http://localhost:3000/search | jq
```

---

### Ask Endpoint (RAG)

```bash
curl --get --data-urlencode "q=how much did I spend on UPI?" http://localhost:3000/ask
```

---

## PostgreSQL Commands

Connect:

```bash
docker exec -it expense-postgres psql -U postgres
```

Show databases:

```sql
\l
```

Show tables:

```sql
\dt
```

View transactions:

```sql
SELECT * FROM transactions LIMIT 10;
```

Count transactions:

```sql
SELECT COUNT(*) FROM transactions;
```

Delete transactions:

```sql
DELETE FROM transactions;
```

View sync state:

```sql
SELECT * FROM sync_state;
```

Exit psql:

```sql
\q
```

---

## Ollama Commands

List installed models:

```bash
ollama list
```

Show loaded models:

```bash
ollama ps
```

Run model interactively:

```bash
ollama run phi3
```

Unload model from memory:

```bash
ollama stop phi3
```

Stop Ollama completely:

```bash
sudo pkill -f "ollama serve"
```

Verify stopped:

```bash
ps aux | grep ollama
```

Expected:

---

## Daily Startup

Terminal 1:

```bash
docker start expense-postgres
ollama serve
```

Terminal 2:

```bash
pnpm dev
```

Terminal 3:

```bash
pnpm api
```

---

## Daily Shutdown

Stop API:

```bash
Ctrl + C
```

Stop Email Sync:

```bash
Ctrl + C
```

Unload model:

```bash
ollama stop phi3
```

Stop Ollama:

```bash
sudo pkill -f "ollama serve"
```

Stop PostgreSQL:

```bash
docker stop expense-postgres
```

---

## Health Checks

Check PostgreSQL container:

```bash
docker ps
```

Check Ollama:

```bash
ollama ps
```

Check API:

```bash
curl http://localhost:3000/search?q=UPI
```

Check running processes:

```bash
ps aux | grep ollama
```

---

## Tech Stack

* Gmail API
* Node.js + TypeScript
* PostgreSQL
* pgvector
* Ollama
* Phi-3
* RAG (Retrieval Augmented Generation)
* Docker

---

## Architecture

```text
Gmail
  ↓
Email Parser
  ↓
Transaction Extraction
  ↓
Embeddings
  ↓
PostgreSQL + pgvector
  ↓
Vector Search
  ↓
Ollama (Phi3)
  ↓
Answer
```

1. Download OAuth credentials from Google Cloud Console.
2. Save them as credentials.json in the project root.
3. Run pnpm dev.