import { Schema, model, Types } from 'mongoose';


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
  leadPriority: 'low' | 'normal' | 'urgent';
  additionalDetails?: string;
}

// ================= Question Option =================
export interface CheckedOptionDetail {
  optionId: string;
  label: string;
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





// ================= Sub Schemas =================

const addressInfoSchema = new Schema(
  {
    countryId: { type: Types.ObjectId, ref: 'Country', required: true },
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
      enum: ['low', 'normal', 'urgent'],
      required: true
    },
    additionalDetails: { type: String }
  },
  { _id: false }
);

const checkedOptionDetailSchema = new Schema(
  {
    optionId: { type: String, required: true },
    label: { type: String, required: true }
  },
  { _id: false }
);

const leadQuestionSchema = new Schema(
  {
    questionId: {
      type: Types.ObjectId,
      ref: 'Question',
      required: true
    },
    question: { type: String, required: true },
    order: { type: Number, required: true },
    step: { type: Number, required: true },
    checkedOptionsDetails: {
      type: [checkedOptionDetailSchema],
      required: true
    }
  },
  { _id: false }
);

// ================= Main Lead Schema =================

const clientRegistrationDraftSchema = new Schema(
  {
    countryId: {
      type: Types.ObjectId,
      ref: 'Country',
      required: true
    },
    serviceId: {
      type: Types.ObjectId,
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
    }
  },
  {
    timestamps: true
  }
);

export const ClientRegistrationDraft = model('ClientRegistrationDraft', clientRegistrationDraftSchema);
