import multer from 'multer';
import mime from 'mime-types';
import path from 'path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { s3Client } from './s3Client';
import config from '.';

const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']; // Extend as needed

// Multer memory storage (required for uploading to S3)
const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and PDF files are allowed'));
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

export const upload = multer({
  storage,
  fileFilter,
  limits,
});

// Upload logic to S3

export const uploadToSpaces = async (
  fileBuffer: Buffer,
  originalName: string,
  userId: string, // 👈 Add userId to distinguish folders
): Promise<string> => {
  const fileExt = path.extname(originalName);
  const mimeType = mime.lookup(fileExt) || 'application/octet-stream';
  const fileName = `users/${userId}/${uuidv4()}${fileExt}`; // 👈 File path with user folder

  const command = new PutObjectCommand({
    Bucket: config.digitalocean_bucket!,
    Key: fileName,
    Body: fileBuffer,
    ACL: 'public-read',
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // 👇 Construct public URL
  return `https://thelawapp.syd1.digitaloceanspaces.com/${fileName}`;
};
