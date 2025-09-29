import { Schema, model, Document, Types } from 'mongoose';

export interface IStaffProfile extends Document {
  userId: Types.ObjectId;
  firmProfileId: Types.ObjectId;
  fullName: string;
  designation: string;
  phone: string;
  image: string;
  status: 'active' | 'inactive';
  permissions?: Types.ObjectId[];
  lastLogin?: Date;
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
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    lastLogin: { type: Date },
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
