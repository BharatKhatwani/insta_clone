import express from "express";
import dotenv from "dotenv";
import authRoutes from "./router/ auth.routes";
import followRoutes from "./router/follow.routes";
import postRoutes from "./router/post.route";
import { connectDB } from "./config/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/posts", postRoutes);

// health check
app.get("/", (_req, res) => {
  res.send("Backend is running");
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
