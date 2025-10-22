import { Schema, model, Document, Types } from 'mongoose';


export interface IAdminProfile extends Document {
  userId: Types.ObjectId;
  firmProfileId: Types.ObjectId;
  fullName: string;
  designation: string;
  phone: string;
  image: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  isDeleted: boolean;
}



const adminProfileSchema = new Schema<IAdminProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'FirmUser', required: true },
    firmProfileId: { type: Schema.Types.ObjectId, ref: 'FirmProfile', required: true },
    fullName: { type: String, required: true, trim: true },
    designation: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    image: { type: String, required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'FirmUser', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'FirmUser' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);


export const AdminProfile = model<IAdminProfile>(
  'AdminProfile',
  adminProfileSchema,
);
export default AdminProfile;
