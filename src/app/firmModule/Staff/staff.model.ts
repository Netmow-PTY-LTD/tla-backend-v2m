import { Schema, model, Document, Types } from 'mongoose';

export interface IStaffProfile extends Document {
  fullName: string;
  designation: string;
  email: string;
  phone: string;
  password: string;
  image: { type: string; required: false };
  role: 'staff' | 'admin';
  status: 'active' | 'inactive';
  permissions?: Types.ObjectId[];
  lastLogin?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const staffProfileSchema = new Schema<IStaffProfile>(
  {
    fullName: { type: String, required: true, trim: true },
    designation: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    image: { type: String, required: false },
    role: { type: String, enum: ['staff', 'admin'], required: true },
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
