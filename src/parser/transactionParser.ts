export interface Transaction {
  amount: number | null;
  merchant: string | null;
  date: string | null;
  category: string;
  bank: string | null;
  card_last4: string | null;
  mode: string | null;
  confidence: number;
}
// 🔹 Clean unwanted noise (links, extra spaces, etc.)
function cleanNoise(text: string): string {
  return text
    .replace(/\[https?:\/\/.*?\]/g, "") // remove [links]
    .replace(/https?:\/\/\S+/g, "")     // remove plain URLs
    .replace(/\s+/g, " ")               // normalize spaces
    .trim();
}

// 🔹 Extract amount (supports INR / Rs formats)
function extractAmount(message: string): number | null {
  let match = message.match(/INR\s?([\d,]+\.\d{2})/i);
  if (match) return parseFloat(match[1].replace(/,/g, ""));

  match = message.match(/Rs\.?\s?([\d,]+\.\d{2})/i);
  if (match) return parseFloat(match[1].replace(/,/g, ""));

  return null;
}

// 🔹 Extract date (multiple formats)
function extractDate(message: string): string | null {
  // ICICI format: May 31, 2026
  let match = message.match(/on ([A-Za-z]+ \d{1,2}, \d{4})/);
  if (match) {
    const parsed = new Date(match[1]);
    return parsed.toISOString().split("T")[0];
  }

  // Format: 30-05-26
  match = message.match(/on (\d{2}-\d{2}-\d{2})/);
  if (match) {
    const [day, month, year] = match[1].split("-");
    return `20${year}-${month}-${day}`;
  }

  return null;
}

// 🔹 Extract merchant (multi-bank support)
function extractMerchant(message: string): string | null {
  // ICICI format
  let match = message.match(/Info:\s(.+?)(\.|$)/);
  if (match) return match[1].trim();

  // HDFC format: (MERCHANT NAME)
  match = message.match(/\((.*?)\)/);
  if (match) return match[1].trim();

  // SBI format: at MERCHANT on
  match = message.match(/at ([A-Za-z0-9 &.-]+?) on/i);
  if (match) return match[1].trim();

  return null;
}

// 🔹 Categorization logic (basic rules)
function categorize(merchant: string | null): string {
  if (!merchant) return "unknown";

  const name = merchant.toLowerCase();

  if (name.includes("amazon") || name.includes("flipkart"))
    return "shopping";

  if (name.includes("swiggy") || name.includes("zomato"))
    return "food";

  if (name.includes("uber") || name.includes("ola"))
    return "travel";

  if (name.includes("hospital") || name.includes("clinic"))
    return "health";

  if (name.includes("groww") || name.includes("zerodha"))
    return "investment";

  return "others";
}

// 🔹 Main parser
export function parseTransaction(message: string) {
  const cleanMsg = cleanNoise(message);

  const amount = extractAmount(cleanMsg);
  const date = extractDate(cleanMsg);
  const merchant = extractMerchant(cleanMsg);
  const category = categorize(merchant);

  const bank = extractBank(cleanMsg);
  const card_last4 = extractCard(cleanMsg);
  const mode = extractMode(cleanMsg);

  let confidence = 0.5;

  if (amount && date && merchant) confidence = 1;
  else if (amount && date) confidence = 0.8;
  else if (amount) confidence = 0.7;

  return {
    amount,
    merchant,
    date,
    category,
    bank,
    card_last4,
    mode,
    confidence,
  };
}

function extractBank(message: string): string | null {
  const msg = message.toLowerCase();

  if (msg.includes("icici")) return "ICICI";
  if (msg.includes("hdfc")) return "HDFC";
  if (msg.includes("sbi")) return "SBI";
  if (msg.includes("axis")) return "AXIS";

  return null;
}

function extractCard(message: string): string | null {
  // ICICI: XX1021
  let match = message.match(/XX(\d{4})/);
  if (match) return match[1];

  // HDFC/SBI: ending with 4583
  match = message.match(/ending (with )?(\d{4})/i);
  if (match) return match[2];

  return null;
}

function extractMode(message: string): string | null {
  const msg = message.toLowerCase();

  if (msg.includes("upi")) return "UPI";

  if (msg.includes("credit card") || msg.includes("debit card"))
    return "CARD";

  if (msg.includes("net banking") || msg.includes("netbanking"))
    return "NETBANKING";

  if (msg.includes("atm"))
    return "ATM";

  return "OTHER";
}