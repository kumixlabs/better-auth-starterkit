import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: [".env.local", ".env"] });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle", // Your migrations folder
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
