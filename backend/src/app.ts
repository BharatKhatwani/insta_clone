import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./router/ auth.routes";
import followRoutes from "./router/follow.routes";
import postRoutes from "./router/post.route";
import likeRoutes from "./router/like.route";
import feedRoutes from "./router/feed.routes";
import commentRoutes from "./router/comment.route";

import { connectDB } from "./config/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


app.use("/api/auth", authRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts", likeRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/comments", commentRoutes);

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
