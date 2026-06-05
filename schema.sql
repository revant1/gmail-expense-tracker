-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    amount NUMERIC,
    merchant TEXT,
    category TEXT,
    date DATE,
    bank TEXT,
    card_last4 TEXT,
    mode TEXT,
    confidence FLOAT,
    embedding VECTOR(384)
);

-- Sync state table
CREATE TABLE IF NOT EXISTS sync_state (
    id INT PRIMARY KEY,
    last_message_id TEXT
);

INSERT INTO sync_state (id, last_message_id)
VALUES (1, NULL)
ON CONFLICT (id) DO NOTHING;