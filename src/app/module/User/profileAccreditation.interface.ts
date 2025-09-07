import mongoose from 'mongoose';

export interface IAccreditation {
  companyId: mongoose.Types.ObjectId;
  institution?: string;
  address?: string;
  certificate_title?: string;
  attachment?: string;
}
