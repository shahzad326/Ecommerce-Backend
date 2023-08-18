import multer from "multer";
const upload = multer({ dest: "uploads/" });

export const multerUpload = () => upload.single("file");
