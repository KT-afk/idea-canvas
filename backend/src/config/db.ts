import { Sequelize, SequelizeOptions } from "sequelize-typescript";
import { ENV } from "./env";

const isProduction = process.env.NODE_ENV === "production";

// Railway provides DATABASE_URL, use it if available
const sequelizeConfig: SequelizeOptions = ENV.DATABASE_URL
  ? {
      dialect: "postgres",
      logging: false,
      models: [__dirname + "/../models"],
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
      models: [__dirname + "/../models"],
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