import { Schema, model, Document, Types } from 'mongoose';

export interface IStaffProfile extends Document {
  userId: Types.ObjectId;
  firmProfileId: Types.ObjectId;
  fullName: string;
  designation: string;
  phone: string;
  image: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}


const staffProfileSchema = new Schema<IStaffProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'FirmUser', required: true },
    firmProfileId: { type: Schema.Types.ObjectId, ref: 'FirmProfile', required: true }, // firm entity
    fullName: { type: String, required: true, trim: true },
    designation: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    image: { type: String, required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'FirmUser', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'FirmUser' },
  },
  { timestamps: true },
);

export const StaffProfile = model<IStaffProfile>(
  'StaffProfile',
  staffProfileSchema,
);
export default StaffProfile;
