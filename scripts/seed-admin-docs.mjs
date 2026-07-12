/**
 * Seed admin documents into the database.
 * Run with: node scripts/seed-admin-docs.mjs
 */
import { readFileSync } from "fs";
import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const masterPlan = readFileSync("/home/ubuntu/sanctuary-master-plan.md", "utf-8");
const sparkConcept = readFileSync("/home/ubuntu/sanctuary-spark-concept.md", "utf-8");
const loungePlan = readFileSync("/home/ubuntu/sanctuary-lounge-plan.md", "utf-8");

const docs = [
  {
    slug: "sanctuary-master-plan",
    title: "Sanctuary Master Plan",
    content: masterPlan,
    category: "planning",
  },
  {
    slug: "spark-concept",
    title: "Spark Vessel Concept Document",
    content: sparkConcept,
    category: "creative",
  },
  {
    slug: "lounge-selection-plan",
    title: "Lounge Selection System Plan",
    content: loungePlan,
    category: "planning",
  },
];

const conn = await createConnection(process.env.DATABASE_URL);

for (const doc of docs) {
  await conn.execute(
    `INSERT INTO admin_documents (slug, title, content, category)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content), category = VALUES(category)`,
    [doc.slug, doc.title, doc.content, doc.category]
  );
  console.log(`✓ Seeded: ${doc.title}`);
}

await conn.end();
console.log("Done.");
