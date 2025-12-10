// server/config/cloudinary.ts
import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import dotenv from "dotenv";

dotenv.config();

// Validate environment variables
if (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET) {
  console.error("❌ Cloudinary environment variables missing.");
} else {
  console.log("✅ Cloudinary environment loaded.");
}

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

// Upload Function
export const uploadToCloudinary = async (
  buffer: Buffer,
  options: UploadApiOptions = {}
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      resource_type: "auto",
      folder: "ave-catering/products",
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error("No result from Cloudinary"));
        }
        resolve(result as CloudinaryUploadResult);
      }
    );

    stream.end(buffer);
  });
};

// Delete Function
export const deleteFromCloudinary = async (publicId: string) => {
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
