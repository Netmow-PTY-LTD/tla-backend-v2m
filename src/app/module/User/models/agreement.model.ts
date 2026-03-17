import { Schema, Model, model } from 'mongoose';
import { IAgreement } from '../interfaces';

const agreementSchema = new Schema<IAgreement>({
  userProfileId: {
    type: Schema.Types.ObjectId,
    ref: 'UserProfile',
    required: true,
  },
  agreement: { type: String },
 
});

export const Agreement: Model<IAgreement> = model<IAgreement>('Agreement', agreementSchema);

export default Agreement;
