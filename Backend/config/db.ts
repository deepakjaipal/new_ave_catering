import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;;

    if (!mongoUri) {
      console.error("❌ MONGODB_URI not defined in environment variables");
      process.exit(1);
    }

    
    if (mongoose.connection.readyState >= 1) {
      console.log("✅ MongoDB already connected");
      return;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      tls: true, 
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(
      `❌ MongoDB Connection Error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    process.exit(1);
  }
};

export default connectDB;
