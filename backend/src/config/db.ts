import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import { ENV } from "./env";
import BOARDS from "../models/BOARDS";
import CONNECTIONS from "../models/CONNECTIONS";
import NOTES from "../models/NOTES";
import USER_PREFERENCES from "../models/USER_PREFERENCES";
import NEXT_TIME_NOTES from "../models/NEXT_TIME_NOTES";
import ACTIVITY_LOG from "../models/ACTIVITY_LOG";

const isProduction = process.env.NODE_ENV === "production";

const ALL_MODELS = [BOARDS, CONNECTIONS, NOTES, USER_PREFERENCES, NEXT_TIME_NOTES, ACTIVITY_LOG];

// Railway provides DATABASE_URL, use it if available
const sequelizeConfig: SequelizeOptions = ENV.DATABASE_URL
  ? {
      dialect: "postgres",
      logging: false,
      models: ALL_MODELS,
      dialectOptions: isProduction
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    }
  : {
      host: ENV.DB_HOST,
      port: Number(ENV.DB_PORT),
      username: ENV.DB_USERNAME,
      password: ENV.DB_PASSWORD,
      database: ENV.DB_NAME,
      dialect: "postgres",
      logging: false,
      models: ALL_MODELS,
    };

export const sequelize = ENV.DATABASE_URL
  ? new Sequelize(ENV.DATABASE_URL, sequelizeConfig)
  : new Sequelize(sequelizeConfig);
export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    throw error;
  }
}