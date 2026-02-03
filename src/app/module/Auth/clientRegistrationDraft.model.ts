import { Schema, model, Types, Document } from 'mongoose';


// ================= Address =================
export interface AddressInfo {
  countryId: string;
  countryCode: string;
  zipcode: string;
  postalCode: string;
  latitude: string;
  longitude: string;
}

// ================= Lead Details =================
export interface LeadDetails {
  name: string;
  email: string;
  phone: string;
  zipCode: string;
  budgetAmount: string;
  leadPriority: string;
  additionalDetails?: string;
}

// ================= Question Option =================
export interface CheckedOptionDetail {
  optionId: string;
  label: string;
  is_checked: boolean;
  idExtraData: string;
}

// ================= Question =================
export interface LeadQuestion {
  questionId: string;
  question: string;
  order: number;
  step: number;
  checkedOptionsDetails: CheckedOptionDetail[];
}

// ================= Main Payload =================
export interface CreateLeadPayload {
  countryId: string;
  serviceId: string;
  addressInfo: AddressInfo;
  leadDetails: LeadDetails;
  questions: LeadQuestion[];
}

export interface IClientRegistrationDraft extends Document {
  countryId: Types.ObjectId;
  serviceId: Types.ObjectId;
  addressInfo: AddressInfo;
  leadDetails: LeadDetails;
  questions: LeadQuestion[];
  verification: {
    isEmailVerified: boolean;
    verifiedAt: Date | null;
  };
}





// ================= Sub Schemas =================

const addressInfoSchema = new Schema(
  {
    countryId: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
    countryCode: { type: String, required: true },
    zipcode: { type: String, required: true },
    postalCode: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true }
  },
  { _id: false }
);

const leadDetailsSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    zipCode: { type: String, required: true },
    budgetAmount: { type: String, required: true },
    leadPriority: {
      type: String,
      required: true
    },
    additionalDetails: { type: String }
  },
  { _id: false }
);

const checkedOptionDetailSchema = new Schema(
  {
    optionId: { type: String, },
    name: { type: String, required: true },
    idExtraData: { type: String, },
    is_checked: { type: Boolean, default: false }

  },
  { _id: false }
);

const leadQuestionSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    question: { type: String, required: true },
    order: { type: Number, },
    step: { type: Number, },
    checkedOptionsDetails: {
      type: [checkedOptionDetailSchema],
      required: true
    }
  },
  { _id: false }
);

// ================= Main Lead Schema =================

const clientRegistrationDraftSchema = new Schema<IClientRegistrationDraft>(
  {
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    addressInfo: {
      type: addressInfoSchema,
      required: true
    },
    leadDetails: {
      type: leadDetailsSchema,
      required: true
    },
    questions: {
      type: [leadQuestionSchema],
      required: true
    },
    verification: {
      isEmailVerified: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null }
    }
  },
  {
    timestamps: true,
    collection: 'client_registration_temp_data'
  }
);

export const ClientRegistrationDraft = model<IClientRegistrationDraft>('ClientRegistrationDraft', clientRegistrationDraftSchema);
