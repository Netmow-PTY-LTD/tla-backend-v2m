import { Types } from 'mongoose';
import { UserProfile } from '../constants/user.constant';

export interface IBillingAddress {
  contactName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postcode?: string;
  phoneNumber?: string;
  isVatRegistered?: boolean;
  vatNumber?: string;
}

export interface IUserProfile {
  _id: string;
  user: Types.ObjectId;
  name: string;
  slug?: string;
  designation?: string;
  activeProfile: UserProfile;
  country?: Types.ObjectId;
  profilePicture?: string;
  bio?: string;
  phone: string;
  address?: string;
  // new field
  businessName?: string;
  credits: number;
  billingAddress?: IBillingAddress;
  paymentMethods: Types.ObjectId[];
  autoTopUp?: boolean;
  serviceIds?: Types.ObjectId[];
  deletedAt?: Date | null;
}
