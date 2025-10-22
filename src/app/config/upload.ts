import multer from 'multer';
import mime from 'mime-types';
import path from 'path';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

import config from './index';
import { s3Client } from './s3Client';
import { FOLDERS, TFolder } from '../constant';

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

// export const uploadToSpaces = async (
//   fileBuffer: Buffer,
//   originalName: string,
//   userId: string, //  Add userId to distinguish folders
//   folder: string = 'profiles' // default folder if not provided
// ): Promise<string> => {
//   const fileExt = path.extname(originalName);
//   const mimeType = mime.lookup(fileExt) || 'application/octet-stream';
//   // const fileName = `  profiles/${userId}/${uuidv4()}${fileExt}`; // 👈 File path with user folder
//   const fileName = `thelawapp/${folder}/${userId}/${uuidv4()}${fileExt}`;

//   const command = new PutObjectCommand({
//     Bucket: config.do_spaces_bucket!,
//     Key: fileName,
//     Body: fileBuffer,
//     ACL: 'public-read',
//     ContentType: mimeType,
//   });

//   await s3Client.send(command);

//   //  Construct public URL
//   const endpoint = config.do_spaces_endpoint!.replace(/^https?:\/\//, '');
//   const publicUrl = `https://${config.do_spaces_bucket}.${endpoint}/${fileName}`;
//   return publicUrl;
// };



/**
 * Delete a single file from DigitalOcean Space using its public URL
 * Throws an error if deletion fails
 */
export const deleteFromSpace = async (fileUrl: string): Promise<void> => {
  const urlObj = new URL(fileUrl);
  const fileKey = urlObj.pathname.substring(1); // remove leading '/'

  console.log('Deleting file from Space with key:', fileKey);

  const command = new DeleteObjectCommand({
    Bucket: config.do_spaces_bucket!,
    Key: fileKey,
  });

  await s3Client.send(command);
};

/**
 * Delete multiple files from DigitalOcean Space using their public URLs
 */
export const deleteMultipleFromSpace = async (fileUrls: string[]): Promise<void> => {
  await Promise.all(fileUrls.map(url => deleteFromSpace(url)));
};





// ******* it will use thelawapp as the main bucket folder and then create subfolders based on entity type and ID - it use in future

interface UploadOptions {
  folder?: TFolder;        // Main folder (profiles, lawyer, client...)
  entityId?: string;       // userId, lawyerId, clientId, etc.
  subFolder?: string;      // Optional subfolder like 'documents', 'images'
}

export const uploadToSpaces = async (
  fileBuffer: Buffer,
  originalName: string,
  options: UploadOptions = {}
): Promise<string> => {
  const { folder = FOLDERS.PROFILES, entityId = 'unknown', subFolder } = options;

  const fileExt = path.extname(originalName);
  const mimeType = mime.lookup(fileExt) || 'application/octet-stream';

  // Construct folder path
  const parts = ['thelawapp', folder, entityId];
  if (subFolder) parts.push(subFolder);

  const filePath = `${parts.join('/')}/${uuidv4()}${fileExt}`;

  // Upload to S3 / DigitalOcean Spaces
  const command = new PutObjectCommand({
    Bucket: config.do_spaces_bucket!,
    Key: filePath,
    Body: fileBuffer,
    ACL: 'public-read',
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Construct public URL
  const endpoint = config.do_spaces_endpoint!.replace(/^https?:\/\//, '');
  return `https://${config.do_spaces_bucket}.${endpoint}/${filePath}`;
};



//  *** example uses in api controllers:

// import { FOLDERS } from '@/constants/folderNames';

// // Upload a client profile image
// const clientProfileUrl = await uploadToSpaces(file.buffer, file.originalname, {
//   folder: FOLDERS.CLIENT,
//   entityId: clientId,
//   subFolder: 'avatars'
// });

// // Upload a lawyer certification document
// const lawyerCertUrl = await uploadToSpaces(file.buffer, file.originalname, {
//   folder: FOLDERS.LAWYER,
//   entityId: lawyerId,
//   subFolder: 'certifications'
// });

// // Upload a marketing banner
// const bannerUrl = await uploadToSpaces(file.buffer, file.originalname, {
//   folder: FOLDERS.BANNERS,
//   entityId: 'homepage',
// });













