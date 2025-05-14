import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
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
    deletedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

//creating a custom static method
serviceSchema.statics.isServiceExists = async function (id: string) {
  const existingService = await Service.findById(id);
  return existingService;
};

const Service = mongoose.model('Service', serviceSchema);

export default Service;
