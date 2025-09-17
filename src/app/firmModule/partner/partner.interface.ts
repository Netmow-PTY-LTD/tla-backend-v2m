import { Types } from "mongoose";

export interface IPartner extends Document {
  firmId: Types.ObjectId; // linked to firm
  name: string;
  position: string;
  email: string;
  phone: string;
  barAssociation: string;
  licenseNo: string;
}