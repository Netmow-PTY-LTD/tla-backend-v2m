import mongoose, { Schema } from 'mongoose';
import { IExperience } from '../interfaces/experience.interface';

const experienceSchema = new Schema(
  {
    userProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    // organization: { type: String },
    // position: { type: String },
    // startDate: { type: String },
    // endDate: { type: String },
    // description: { type: String },
    years: { type: String },
    months: { type: String },
    experience: {
      type: String,
      default: '',
    },
    experienceHighlight: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
const Experience = mongoose.model<IExperience>('Experience', experienceSchema);
export default Experience;
