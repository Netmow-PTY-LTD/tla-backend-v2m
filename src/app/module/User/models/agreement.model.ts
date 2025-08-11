import mongoose, { Document, Schema, Model, model } from 'mongoose';

export interface IAgreement extends Document {
  userProfileId: mongoose.Types.ObjectId;
  agreement?: string;
}

const agreementSchema = new Schema<IAgreement>({
  userProfileId: {
    type: Schema.Types.ObjectId,
    ref: 'UserProfile',
    required: true,
  },
  agreement: { type: String },
 
});

const Agreement: Model<IAgreement> = model<IAgreement>('Agreement', agreementSchema);

export default Agreement;
