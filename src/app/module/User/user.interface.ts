import { Types } from 'mongoose';
import { UserProfileEnum } from './user.constant';
import { IUser } from '../Auth/auth.interface';

export type Gender = 'male' | 'female' | 'other';
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
  user: Types.ObjectId | IUser;
  name: string;
  slug?: string;
  designation?: string;
  gender?: Gender;
  lawyerContactEmail?: string;
  law_society_member_number?: string;
  practising_certificate_number?: string;
  profileType?: UserProfileEnum,
  country?: Types.ObjectId;
  zipCode?: Types.ObjectId;
  profilePicture?: string;
  bio?: string;
  phone: string;
  address?: string;
  languages?: string[];
  // new field
  businessName?: string;
  credits: number;
  billingAddress?: IBillingAddress;
  paymentMethods: Types.ObjectId[];
  autoTopUp?: boolean;
  serviceIds?: Types.ObjectId[];
  //  rating
  totalRatings?: number,
  avgRating?: number

  //   firm related fields
  firmProfileId?: Types.ObjectId | null; // the firm the lawyer belongs to
  firmMembershipStatus:  "pending" | "approved" | "rejected" | "left" | "cancelled";
  joinedAt?: Date | null;
  leftAt?: Date | null;

  deletedAt?: Date | null;
}
