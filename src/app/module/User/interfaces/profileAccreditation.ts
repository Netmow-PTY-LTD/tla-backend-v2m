import mongoose from 'mongoose';

export interface IAccreditation {
  companyId: mongoose.Types.ObjectId;
  name: string;
  attachment: string;
}
