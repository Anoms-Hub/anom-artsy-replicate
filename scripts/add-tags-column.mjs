import mysql from "mysql2/promise";
import { readFileSync } from "fs";

// Load env from .env file manually
const envPath = "/home/ubuntu/anom-artsy-replicate/.env";
try {
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env may not exist, rely on injected env
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not found in environment");
  process.exit(1);
}

const conn = await mysql.createConnection(url);

try {
  // Check if column already exists
  const [rows] = await conn.query("SHOW COLUMNS FROM admin_documents LIKE 'tags'");
  if (rows.length > 0) {
    console.log("✓ tags column already exists in admin_documents");
  } else {
    await conn.query("ALTER TABLE admin_documents ADD COLUMN tags VARCHAR(1024) NOT NULL DEFAULT '[]'");
    console.log("✓ Added tags column to admin_documents");
  }
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
} finally {
  await conn.end();
}
