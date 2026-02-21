import cors from "cors";
import express from "express";
import { connectDB, sequelize } from "./config/db";
import { router } from "./routes/notes-route";
import { boardsRouter } from "./routes/boards-route";
import { preferencesRouter } from "./routes/preferences-route";
import { connectionRouter } from "./routes/connection-route";
import { nextTimeNotesRouter } from "./routes/next-time-notes-route";
import { activityLogRouter } from "./routes/activity-log-route";
import { resurfacingRouter } from "./routes/resurfacing-route";
import { analyticsRouter } from "./routes/analytics-route";
import { apiLimiter } from "./middleware/rateLimiter";

const app = express();

// Trust proxy for Railway (required for rate limiting and X-Forwarded-For header)
app.set('trust proxy', 1);

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

// Apply rate limiting to API routes (100 requests/min per IP)
app.use('/api', apiLimiter);

app.use("/api", router);
app.use("/api", boardsRouter);
app.use("/api", preferencesRouter);
app.use("/api", connectionRouter);
app.use("/api", nextTimeNotesRouter);
app.use("/api", activityLogRouter);
app.use("/api", resurfacingRouter);
app.use("/api", analyticsRouter);
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