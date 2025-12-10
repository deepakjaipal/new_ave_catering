import multer from "multer";

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  // Check if file is an image
  console.log(`File upload attempt: ${file.originalname}, MIME: ${file.mimetype}, Size: ${file.size || 'unknown'}`);
  
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    console.error(`File rejected: Invalid MIME type ${file.mimetype}`);
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Create wrapper for better error handling
export const uploadSingle = (req: any, res: any, next: any) => {
  const uploadHandler = upload.single("image");
  
  uploadHandler(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ 
          message: "File size too large. Maximum size is 5MB" 
        });
      }
      return res.status(400).json({ 
        message: `Upload error: ${err.message}` 
      });
    } else if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ 
        message: err.message || "File upload failed" 
      });
    }
    
    // Log file info if present
    if (req.file) {
      console.log(`File received: ${req.file.originalname}, Buffer size: ${req.file.buffer?.length || 0} bytes`);
    } else {
      console.log("No file received in request");
    }
    
    next();
  });
};

export default upload;