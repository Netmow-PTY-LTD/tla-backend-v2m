import { Types } from "mongoose";

export interface IPartner extends Document {
  firmProfileId: Types.ObjectId; // linked to firm
  name: string;
  position: string;
  email: string;
  phone: string;
  image?:string;

}