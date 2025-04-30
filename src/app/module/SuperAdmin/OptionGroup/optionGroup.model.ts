import mongoose from 'mongoose';

const optionGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    respondAt: [
      {
        type: Date,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const OptionGroup = mongoose.model('OptionGroup', optionGroupSchema);

export default OptionGroup;
