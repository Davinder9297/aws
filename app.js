import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

const app = express();
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
  });
  
  // Function to Generate Pre-Signed URL
  export const generatePresignedUrl = async (fileName, fileType) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
    };
  console.log(params);
  
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });
    return url;
  };
  app.get("/generate-presigned-url", async (req, res) => {
    try {
      const { fileName, fileType } = req.query;
      const url = await generatePresignedUrl(fileName, fileType);
      res.json({ url });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS
app.use(helmet()); // Security headers
app.use(morgan("dev")); // Logging

// Sample Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the AWS Tutorials" });
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));