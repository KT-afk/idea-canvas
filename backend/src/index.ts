import cors from "cors";
import express from "express";
import { connectDB, sequelize } from "./config/db";
import { router } from "./routes/notes-route";

const app = express();

// Configure CORS for production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      // Allow if origin is in allowed list
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Allow all Vercel preview deployments
      if (origin.includes("vercel.app")) return callback(null, true);

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint for Railway
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", router);
const port = process.env.PORT || 3000;


(async () => {
    try {
        await connectDB();
        await sequelize.sync({ alter: true });
        console.log("🚀 Server is running...");
        app.listen(port, () => {
            console.log(`🚀 Server is listening on port ${port}`);
        });
    } catch (error) {
        console.error("❌ Failed to start the server:", error);
        process.exit(1);
    }
})();