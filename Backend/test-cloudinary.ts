import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Load environment variables
dotenv.config();

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log("\n🧪 Testing Cloudinary Configuration...\n");

// Check if credentials are set
console.log("📋 Credentials Check:");
console.log(`   Cloud Name: ${cloudName ? '✅ ' + cloudName : '❌ Missing'}`);
console.log(`   API Key: ${apiKey ? '✅ ' + apiKey : '❌ Missing'}`);
console.log(`   API Secret: ${apiSecret ? '✅ ' + apiSecret.substring(0, 10) + '...' : '❌ Missing'}`);
console.log("");

if (!cloudName || !apiKey || !apiSecret) {
  console.error("❌ ERROR: Cloudinary credentials are not configured!");
  console.log("\n📝 To fix this:");
  console.log("   1. Run: chmod +x setup-cloudinary.sh");
  console.log("   2. Run: ./setup-cloudinary.sh");
  console.log("   3. Or manually add to .env file:");
  console.log("      CLOUDINARY_CLOUD_NAME=your-cloud-name");
  console.log("      CLOUDINARY_API_KEY=975461118425658");
  console.log("      CLOUDINARY_API_SECRET=4SdGHJknlmUqpgIltOyfRZMD9zc\n");
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Test connection by fetching account details
async function testConnection() {
  try {
    console.log("🔌 Testing connection to Cloudinary...");
    
    // Use the ping endpoint
    const result = await cloudinary.api.ping();
    console.log("✅ Connection successful!");
    console.log(`   Status: ${result.status}\n`);
    
    return true;
  } catch (error: any) {
    console.error("❌ Connection failed!");
    console.error(`   Error: ${error.message}\n`);
    return false;
  }
}

// Test image upload
async function testUpload() {
  try {
    console.log("📤 Testing image upload...");
    
    // Create a test image buffer (1x1 pixel PNG)
    const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');
    
    console.log(`   Uploading test image (${testImageBuffer.length} bytes)...`);
    
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            folder: "ave-catering/test",
            public_id: `test_${Date.now()}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(testImageBuffer);
    });
    
    console.log("✅ Upload successful!");
    console.log(`   URL: ${uploadResult.secure_url}`);
    console.log(`   Public ID: ${uploadResult.public_id}\n`);
    
    // Clean up test image
    console.log("🧹 Cleaning up test image...");
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log("✅ Test image deleted\n");
    
    return true;
  } catch (error: any) {
    console.error("❌ Upload failed!");
    console.error(`   Error: ${error.message}\n`);
    return false;
  }
}

// Run tests
async function runTests() {
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    const uploadOk = await testUpload();
    
    if (uploadOk) {
      console.log("🎉 All tests passed! Cloudinary is configured correctly.\n");
      console.log("✅ You can now:");
      console.log("   • Create products with image uploads");
      console.log("   • Upload category images");
      console.log("   • Upload banner images\n");
      process.exit(0);
    }
  }
  
  console.log("❌ Some tests failed. Please check your configuration.\n");
  process.exit(1);
}

runTests();

