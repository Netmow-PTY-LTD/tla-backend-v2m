import { Schema, model, Document, Types } from "mongoose";

export interface IStaffProfile extends Document {
  fullName: string;
  assignedCases?: Types.ObjectId[];
  assignedDepartments?: Types.ObjectId[];
  lastLogin?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const staffProfileSchema = new Schema<IStaffProfile>(
  {
    fullName: { type: String, required: true, trim: true },
    assignedCases: [{ type: Schema.Types.ObjectId, ref: "Lead" }],
    assignedDepartments: [{ type: String, trim: true }],
    lastLogin: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "FirmUser", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "FirmUser" },
  },
  { timestamps: true }
);

export const StaffProfile = model<IStaffProfile>("StaffProfile", staffProfileSchema);
export default StaffProfile;
