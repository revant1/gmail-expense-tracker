import dotenv from "dotenv";
import * as gmailService from "./services/gmailService";
import { parseTransaction } from "./parser/transactionParser";
import { insertTransaction } from "./db/queries";
import { getLastMessageId, saveLastMessageId } from "./db/sync";

dotenv.config();

console.log("ENV KEY:", process.env.OPENAI_API_KEY);

async function main() {
  console.log("🚀 Starting incremental sync...");

  const auth = await gmailService.authorize();
  const messages = await gmailService.fetchEmails(auth);

  const lastMessageId = await getLastMessageId();

  console.log("📌 Last processed:", lastMessageId);

  let newLastId: string | null = null;

  for (const msg of messages) {
    // if (msg.id === lastMessageId) {
    //   console.log("⏹️ Reached old emails, stopping...");
    //   break;
    // }

    try {
      const email = await gmailService.getEmail(auth, msg.id!);

      const rawBody = gmailService.getEmailBody(email);
      const cleanBody = gmailService.cleanEmailBody(rawBody);

      console.log("RAW BODY:", rawBody.slice(0, 200));
      console.log("BODY LENGTH:", cleanBody.length);

      console.log("📨 BODY LENGTH:", cleanBody.length); // debug

      const parsed = parseTransaction(cleanBody);

      console.log("🧠 Parsed:", parsed);

      if (parsed.amount && parsed.date) {
        await insertTransaction(parsed, cleanBody); // ✅ FIXED
        console.log("✅ Inserted");
      }

      if (!newLastId) {
        newLastId = msg.id!;
      }

    } catch (err) {
      console.error("❌ Error:", err);
    }
  }

  if (newLastId) {
    await saveLastMessageId(newLastId);
    console.log("💾 Updated sync state:", newLastId);
  }

  console.log("🎉 Incremental sync complete");
}

main().catch(console.error);