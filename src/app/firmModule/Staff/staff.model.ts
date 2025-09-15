import { Schema, model, Document } from "mongoose";

export enum StaffRole {
  LAWYER = "Lawyer",
  ADMIN = "Admin",
  ASSISTANT = "Assistant",
  OTHER = "Other",
}

export enum StaffStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export interface IStaffProfile extends Document {
  fullName: string;
  role: StaffRole;
  status: StaffStatus;
  permissions: string[];
  assignedCases?: Schema.Types.ObjectId[]; // Case IDs
  assignedDepartments?: Schema.Types.ObjectId[]; // Department IDs
  lastLogin?: Date;
}

const staffProfileSchema = new Schema<IStaffProfile>(
  {
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: Object.values(StaffRole), required: true },
    status: { type: String, enum: Object.values(StaffStatus), default: StaffStatus.ACTIVE },
    permissions: { type: [String], default: [] },
    assignedCases: [{ type: Schema.Types.ObjectId, ref: "Case" }],
    assignedDepartments: [{ type: Schema.Types.ObjectId, ref: "Department" }],
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const StaffProfile = model<IStaffProfile>("StaffProfile", staffProfileSchema);
