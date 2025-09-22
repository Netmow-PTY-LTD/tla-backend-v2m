import { model, Schema } from 'mongoose';
import { IPartner } from './partner.interface';

const partnerSchema = new Schema<IPartner>(
  {
    firmProfileId: { type: Schema.Types.ObjectId, ref: 'Firm', required: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    image: { type: String, required: false },
  },
  { timestamps: true },
);

export const FirmPartner = model<IPartner>('FirmPartner', partnerSchema);
