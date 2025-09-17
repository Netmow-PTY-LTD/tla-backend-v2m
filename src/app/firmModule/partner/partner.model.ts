import { model, Schema } from "mongoose";
import { IPartner } from "./partner.interface";



const partnerSchema = new Schema<IPartner>(
  {
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    barAssociation: { type: String, required: true },
    licenseNo: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Partner = model<IPartner>("Partner", partnerSchema);
