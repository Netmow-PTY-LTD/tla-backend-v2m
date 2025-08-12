import multer from 'multer';
import mime from 'mime-types';
import path from 'path';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

import config from './index';
import { s3Client } from './s3Client';

const allowedTypes = [
  'application/pdf', // PDF
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
];

// Multer memory storage (required for uploading to S3)
const storage = multer.memoryStorage();

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {

  if (file.mimetype.startsWith('image/') || allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files and PDFs are allowed'));
  }
  // if (allowedTypes.includes(file.mimetype)) {
  //   cb(null, true);
  // } else {
  //   cb(new Error('Only JPG, PNG, and PDF files are allowed'));
  // }
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
  const fileName = `profiles/${userId}/${uuidv4()}${fileExt}`; // 👈 File path with user folder
  // const fileName = `${folder}/${userId}/${uuidv4()}${fileExt}`;

  const command = new PutObjectCommand({
    Bucket: config.do_spaces_bucket!,
    Key: fileName,
    Body: fileBuffer,
    ACL: 'public-read',
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // 👇 Construct public URL
  const endpoint = config.do_spaces_endpoint!.replace(/^https?:\/\//, '');
  const publicUrl = `https://${config.do_spaces_bucket}.${endpoint}/${fileName}`;
  return publicUrl;
};

export const deleteFromSpaces = async (fileKey: string) => {
  const command = new DeleteObjectCommand({
    Bucket: config.do_spaces_bucket!,
    Key: fileKey,
  });
  await s3Client.send(command);
};
