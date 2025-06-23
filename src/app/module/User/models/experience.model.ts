import mongoose, { Schema } from 'mongoose';

const experienceSchema = new Schema(
  {
    userProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    organization: { type: String },
    position: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
const Experience = mongoose.model('Experience', experienceSchema);
export default Experience;
