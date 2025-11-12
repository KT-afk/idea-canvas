import cors from "cors";
import express from "express";
import { connectDB, sequelize } from "./config/db";
import { router } from "./routes/notes-route";

const app = express();
app.use(cors());
app.use(express.json());
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