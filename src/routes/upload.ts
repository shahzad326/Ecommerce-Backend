import express, { Request, Response } from "express";
import { uploadImage } from "../services/fileUpload";

import multer from "multer";
import createError from "http-errors";
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "video/mp4"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        createError(
          400,
          "Only image (jpeg, png) and video (mp4) files are allowed"
        )
      );
    }
  },
});

const router = express.Router();

router.post(`/`, upload.single("file"), async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return createError(400, "No image file provided");
  const result = await uploadImage(file);

  res.json({ imageUrl: result });
});

export default router;
