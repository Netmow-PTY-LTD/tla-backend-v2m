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

export interface IStaff extends Document {
  fullName: string;
  email: string;
  role: StaffRole;
  password?: string;
  temporaryLoginLink?: string;
  status: StaffStatus;
  permissions: string[];
  assignedCases?: Schema.Types.ObjectId[]; // Case IDs
  assignedDepartments?: Schema.Types.ObjectId[]; // Department IDs
  lastLogin?: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(StaffRole),
      required: true,
    },
    password: {
      type: String,
    },
    temporaryLoginLink: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(StaffStatus),
      default: StaffStatus.ACTIVE,
    },
    permissions: {
      type: [String], // e.g. ["CAN_VIEW_CASES", "CAN_MESSAGE_CLIENTS"]
      default: [],
    },
    assignedCases: [
      {
        type: Schema.Types.ObjectId,
        ref: "Case",
      },
    ],
    assignedDepartments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Department",
      },
    ],
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Staff = model<IStaff>("Staff", staffSchema);
