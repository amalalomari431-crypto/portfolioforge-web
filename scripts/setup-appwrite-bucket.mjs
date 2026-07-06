// One-time setup: creates the dedicated Appwrite Storage bucket for this
// app's project media (PDFs, images, galleries). Run once after adding
// APPWRITE_ENDPOINT / APPWRITE_PROJECT_ID / APPWRITE_API_KEY to .env.local:
//
//   node scripts/setup-appwrite-bucket.mjs
//
// It prints the resulting bucket ID — add that to .env.local as
// APPWRITE_BUCKET_ID before uploading anything.

import { config } from "dotenv";
import { Client, Storage, Permission, Role, ID } from "node-appwrite";

// Plain `dotenv/config` only loads `.env` by default — the Appwrite vars
// live in `.env.local` (Next.js's own convention, not dotenv's), so load
// both explicitly, same precedence Next.js itself uses.
config({ path: ".env" });
config({ path: ".env.local", override: true });

const endpoint = process.env.APPWRITE_ENDPOINT;
const project = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !project || !apiKey) {
  console.error(
    "Missing APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, or APPWRITE_API_KEY in .env.local."
  );
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const storage = new Storage(client);

const bucketId = ID.unique();

const bucket = await storage.createBucket(
  bucketId,
  "PortfolioForge Web — Project Media",
  [Permission.read(Role.any())], // public read for published portfolio media; writes only ever happen via this app's server using the API key
  false, // fileSecurity: bucket-level permissions apply uniformly
  true, // enabled
  26214400, // 25MB max file size
  ["jpg", "jpeg", "png", "pdf"],
  "none", // compression
  false, // encryption
  false // antivirus
);

console.log("Created bucket:", bucket.$id);
console.log("\nAdd this to .env.local:");
console.log(`APPWRITE_BUCKET_ID="${bucket.$id}"`);
