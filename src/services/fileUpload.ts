import AWS from "aws-sdk";
import { Request } from "express";
import fs from "fs";

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION;

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_BUCKET_REGION,
});

export const uploadImage = async (file: any) => {
  try {
    if (!file) {
      throw new Error("No file found");
    }

    const fileContent = fs.readFileSync(file.path);

    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: AWS_BUCKET_NAME!,
      Key: `images/${Date.now()}_${file.originalname}`,
      Body: fileContent,
      ContentType: file.mimetype,
    //   ACL: "public-read",
    };

    const data = await s3.upload(uploadParams).promise();

    // console.log("File uploaded successfully:", data.Location);

    return data.Location;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
