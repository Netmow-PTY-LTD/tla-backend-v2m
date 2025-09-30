import { Types } from "mongoose";

export interface IFirmMedia {
  _id?: string;
  firmProfileId: Types.ObjectId;     // Reference to FirmProfile _id
  photos: string[];          // Array of photo URLs
  videos: string[];          // Array of video URLs
  bannerImage?: string | null; // Single banner image URL
}
