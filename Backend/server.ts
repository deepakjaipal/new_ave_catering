import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";

// import helmet from "helmet";
// import compression from "compression";
// import rateLimit from "express-rate-limit";
// import morgan from "morgan";
import cloudinary from "./config/cloudinary.js"


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


// Security middleware
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         styleSrc: ["'self'", "'unsafe-inline'"],
//         scriptSrc: ["'self'"],
//         imgSrc: ["'self'", "data:", "https:"],
//       },
//     },
//     crossOriginEmbedderPolicy: false,
//   })
// );

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: "Too many requests from this IP, please try again later.",
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

// CORS configuration - Allow multiple origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "https://ave-catering.vercel.app",
  "https://ave-catering1.vercel.app",
  "https://ave-rg2r.onrender.com/",
  process.env.FRONTEND_URL,
].filter(Boolean); 
app.use(cors({
  origin: true,
  credentials: true
}));


// Check if environment variables are set
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("❌ Cloudinary environment variables are missing!");
} else {
  console.log("✅ Cloudinary ENV loaded successfully");
}


// ✅ If all env variables exist, configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary Loaded:", process.env.CLOUDINARY_CLOUD_NAME);







// Compression
// app.use(compression());

// Logging
// app.use(
//   morgan("combined", {
//     stream: { write: (message) => logger.info(message.trim()) },
//   })
// );



// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// Connect to database
connectDB();
// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
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

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || "5001");

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {

  logger.info(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
  logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown handler
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import connectDB from "./config/db.js";

// import productRoutes from "./routes/productRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";
// import categoryRoutes from "./routes/categoryRoutes.js";
// import subcategoryRoutes from "./routes/subcategoryRoutes.js";
// import subSubcategoryRoutes from "./routes/subSubcategoryRoutes.js";
// import uploadRoutes from "./routes/uploadRoutes.js";
// import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

// dotenv.config();
// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Connect to MongoDB
// connectDB();

// // Routes
// app.use("/api/products", productRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/subcategories", subcategoryRoutes);
// app.use("/api/subsubcategories", subSubcategoryRoutes);
// app.use("/api/upload", uploadRoutes);

// // Error Handling
// app.use(notFound);
// app.use(errorHandler);

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

// export default app;
