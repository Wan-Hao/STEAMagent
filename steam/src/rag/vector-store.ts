import { PgVector } from "@mastra/pg";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in the environment variables.");
}

export const vectorStore = new PgVector({
  connectionString: process.env.DATABASE_URL,
}); 