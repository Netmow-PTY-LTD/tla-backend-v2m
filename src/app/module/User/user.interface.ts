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

  // case related fields
  totalCases?: number;
  openCases?: number;
  closedCases?: number;
  hiredCases?: number;
  responseCases?: number;

  // Stripe identifiers (safe)
  subscriptionId: Types.ObjectId | null;
  eliteProSubscriptionId: Types.ObjectId | null;

  isElitePro?: boolean;
  // Regular subscription period
  subscriptionPeriodStart?: Date | null;
  subscriptionPeriodEnd?: Date | null;
  // Elite Pro subscription period
  eliteProPeriodStart?: Date | null;
  eliteProPeriodEnd?: Date | null;


  paymentMethods: Types.ObjectId[];
  autoTopUp?: boolean;
  serviceIds?: Types.ObjectId[];
  //  rating
  totalRatings?: number,
  avgRating?: number

  //   firm related fields
  firmProfileId?: Types.ObjectId | null; // the firm the lawyer belongs to
  firmMembershipStatus: "pending" | "approved" | "rejected" | "left" | "cancelled";
  joinedAt?: Date | null;
  leftAt?: Date | null;
  isFirmMemberRequest: boolean;
  activeFirmRequestId: Types.ObjectId | null;
  isAccessibleByOtherUsers?: boolean;

  deletedAt?: Date | null;
}
