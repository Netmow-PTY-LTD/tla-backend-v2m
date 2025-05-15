import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create the uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files to /uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeName = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, safeName);
  },
});

// File filter
const fileFilter = (
  // eslint-disable-next-line no-undef
  req: Express.Request,
  // eslint-disable-next-line no-undef
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']; // will add more file type
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
  }
};

// Limits (e.g., max file size = 5MB)
const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

// Final upload middleware
export const upload = multer({
  storage,
  fileFilter,
  limits,
});
