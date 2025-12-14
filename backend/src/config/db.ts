import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

export const connectDB = async () => {
  try {
    if (!MONGODB_URL) {
      console.log("MONGODB_URL is not defined");
    }

    await mongoose.connect(MONGODB_URL!);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
