import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import cloudinary from "./config/cloudinary.js";

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import subSubcategoryRoutes from "./routes/subSubcategoryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import importRoutes from "./routes/importRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import logger from "./utils/logger.js";

const app = express();


// ======================================================
// ✅ Correct Allowed Origins
// ======================================================
const allowedOrigins: string[] = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "https://ave-catering.vercel.app",
  "https://ave-catering1.vercel.app",
  "https://new-ave-catering.vercel.app",
  process.env.FRONTEND_URL || "",
].filter(Boolean);


// ======================================================
// ✅ Correct CORS Middleware
// ======================================================
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow mobile apps/Postman

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked:", origin);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ======================================================
// Body Parsing
// ======================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


// ======================================================
// Database
// ======================================================
connectDB();


// ======================================================
// Cloudinary Setup
// ======================================================
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("❌ Cloudinary env missing!");
} else {
  console.log("✅ Cloudinary ENV loaded");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// ======================================================
// Health Check
// ======================================================
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});


// ======================================================
// API Routes
// ======================================================
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/subsubcategories", subSubcategoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/import", importRoutes);
app.use("/api/banners", bannerRoutes);


// ======================================================
// Error Middleware
// ======================================================
app.use(notFound);
app.use(errorHandler);


// ======================================================
// Server Start
// ======================================================
const PORT = parseInt(process.env.PORT || "5001");

const server = app.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Health check → /health`);
});


// ======================================================
// Graceful Shutdown
// ======================================================
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Shutting down...`);
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
