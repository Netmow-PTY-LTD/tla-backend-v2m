import { Model, Types } from 'mongoose';
import { ILeadServiceAnswer } from '../Lead/leadServiceAnswer.interface';


// type LeadStatus = 'pending' | 'hired' | 'archive';
// export interface ILeadResponse {
//   _id?: Types.ObjectId;
//   // userProfileId: Types.ObjectId;
//   responseBy: Types.ObjectId;
//   leadId: Types.ObjectId;
//   serviceId: Types.ObjectId;
//   deletedAt?: Date | null;
//   status: LeadStatus
//   leadAnswers?: ILeadServiceAnswer[];
// }




//  new logic -1

export interface ILeadResponse {
  _id?: Types.ObjectId;

  // Lawyer who responded to the lead
  responseBy: Types.ObjectId; // Ref -> UserProfile

  // Connected lead and service
  leadId: Types.ObjectId;     // Ref -> Lead
  serviceId: Types.ObjectId;  // Ref -> Service

  // Hire request details
  isHireRequested: boolean;   // Has someone requested to hire
  hireRequestedBy?: Types.ObjectId | null; // Ref -> UserProfile (client or lawyer who initiated request)
  hireAcceptedBy?: Types.ObjectId | null;  // Ref -> UserProfile (who accepted the hire)
  hireDecision?: "accepted" | "rejected" | null;
  isHireRequestedAt: Date | null;
  hireAcceptedAt: Date | null;
  // Status of this specific response
  status: "pending" | "hire_requested" | "hired" | "rejected" | "cancelled";
  hireMessage: string | null;
  clientRating?: Types.ObjectId | null;
  leadAnswers?: ILeadServiceAnswer[];

}







export interface ResponseModel extends Model<ILeadResponse> {
  // eslint-disable-next-line no-unused-vars
  isResponseExists(id: string): Promise<ILeadResponse>;
}
