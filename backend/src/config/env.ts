import dotenv from "dotenv";
dotenv.config();

// Railway provides DATABASE_URL, local dev uses individual vars
const hasDbUrl = !!process.env.DATABASE_URL;
const hasIndividualVars = process.env.DB_HOST && process.env.DB_PORT && process.env.DB_USERNAME && process.env.DB_PASSWORD && process.env.DB_NAME;

if (!hasDbUrl && !hasIndividualVars) {
  throw new Error("❌ Database configuration missing. Provide DATABASE_URL or individual DB_* variables in .env");
}

export const ENV = {
  DATABASE_URL: process.env.DATABASE_URL,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  NODE_ENV: process.env.NODE_ENV || "development",
};