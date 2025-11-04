import dotenv from "dotenv";
dotenv.config();

if (!process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_USERNAME || !process.env.DB_PASSWORD || !process.env.DB_DATABASE) {
  throw new Error("❌ One or more database environment variables are missing in .env");
}

export const ENV = {
  AWS_REGION: process.env.AWS_REGION!,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME!,
  DB_HOST: process.env.DB_HOST!,
  DB_PORT: process.env.DB_PORT!,
  DB_USERNAME: process.env.DB_USERNAME!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  DB_DATABASE: process.env.DB_DATABASE!,
};