import fs from "fs";
import path from "path";
import readline from "readline";
import { google } from "googleapis";
// @ts-ignore
import { htmlToText } from "html-to-text";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
const TOKEN_PATH = "token.json";

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

export async function authorize() {
  const content = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
  const credentials = JSON.parse(content);

  const { client_secret, client_id, redirect_uris } =
    credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Load token if exists
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH, "utf-8");
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  }

  // Generate auth URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code: string = await new Promise((resolve) => {
    rl.question("Enter code: ", resolve);
  });

  rl.close();

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

  return oAuth2Client;
}

export async function fetchEmails(auth: any) {
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.list({
    userId: "me",
    q: "spent OR debited OR transaction",
    maxResults: 20,
  });

  return res.data.messages || [];
}

export async function getEmail(auth: any, messageId: string) {
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });

  return res.data;
}

function decodeBase64(data: string) {
  return Buffer.from(data, "base64").toString("utf-8");
}


export function getEmailBody(email: any): string {
  let body = "";

  function extract(parts: any[]) {
    for (const part of parts) {
      // ✅ Plain text
      if (part.mimeType === "text/plain" && part.body?.data) {
        body += Buffer.from(part.body.data, "base64").toString("utf-8");
      }

      // ✅ HTML (VERY IMPORTANT)
      if (part.mimeType === "text/html" && part.body?.data) {
        const html = Buffer.from(part.body.data, "base64").toString("utf-8");
        body += htmlToText(html, { wordwrap: false });
      }

      // 🔁 Recursive
      if (part.parts) {
        extract(part.parts);
      }
    }
  }

  if (email.payload?.parts) {
    extract(email.payload.parts);
  } else if (email.payload?.body?.data) {
    body = Buffer.from(email.payload.body.data, "base64").toString("utf-8");
  }

  return body;
}

export function cleanEmailBody(raw: string) {
  return htmlToText(raw, {
    wordwrap: false,
  });
}