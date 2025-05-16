export type TUploadedFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer?: Buffer; // Present with memoryStorage
  path?: string; // Present with diskStorage
  filename?: string; // Present with diskStorage
};

export type TUploadedFilesMap = {
  [fieldname: string]: TUploadedFile[];
};

// Alternative approach
// type TUploadedFile = Express.Multer.File;
// type TUploadedFilesMap = { [key: string]: Express.Multer.File[] };
