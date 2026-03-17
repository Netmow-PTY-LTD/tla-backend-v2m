import { Document, Types } from 'mongoose';

export interface IAgreement extends Document {
  userProfileId: Types.ObjectId;
  agreement?: string;
}
