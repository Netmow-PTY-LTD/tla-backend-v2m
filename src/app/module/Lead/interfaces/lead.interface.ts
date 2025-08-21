import { Model, Types } from 'mongoose';
import { ILeadServiceAnswer } from './leadServiceAnswer.interface';
import { LeadStatus, PriorityOption } from '../constant/lead.constant';

// export interface ILead {
//   _id: Types.ObjectId;
//   userProfileId: Types.ObjectId;
//   countryId: Types.ObjectId;
//   serviceId: Types.ObjectId;
//   additionalDetails: string;
//   locationId: Types.ObjectId;
//   budgetAmount: number;
//   credit?: number;
//   deletedAt?: Date | null;
//   status: LeadStatus,
//   leadPriority: PriorityOption;
//   responders?:Types.ObjectId[]
//   isHired:boolean;
//   leadClosedReason?:string;
//   leadAnswers?: ILeadServiceAnswer[];
// }




//  new logic -1
// export interface ILead {
//   _id?: Types.ObjectId;

//   // Lead owner (client)
//   userProfileId: Types.ObjectId; // Ref -> UserProfile

//   // Basic lead info
//   countryId: Types.ObjectId;     // Ref -> Country
//   serviceId: Types.ObjectId;     // Ref -> Service
//   locationId: Types.ObjectId;    // Ref -> ZipCode
//   additionalDetails?: string;
//   budgetAmount?: number;
//   credit?: number;

//   // Lead lifecycle status
//   status: "approved" | "hire_requested" | "hired" | "closed" | "cancelled";

//   // Priority info
//   leadPriority: PriorityOption;

//   // Responders list (lawyers who responded)
//   responders: Types.ObjectId[];

//   // Hiring info
//   isHired: boolean;
//   hiredLawyerId?: Types.ObjectId | null; // Which lawyer was hired
//   hiredBy?: Types.ObjectId | null;       // Who initiated the hire (client or lawyer)
//   hiredAt?: Date | null;

//   // Lead closure info
//   isClosed: boolean;
//   closedBy?: Types.ObjectId | null;  // Who closed the lead
//   leadClosedReason?: string | null;
//   closedAt?: Date | null;

//   // Soft delete
//   deletedAt?: Date | null;
//   leadAnswers?: ILeadServiceAnswer[];

// }






export interface ILead {
  _id?: Types.ObjectId;

  /** -------------------------------
   *  BASIC LEAD INFO
   * ------------------------------- **/
  userProfileId: Types.ObjectId; // Client who created the lead
  countryId: Types.ObjectId;
  serviceId: Types.ObjectId;
  locationId: Types.ObjectId;

  additionalDetails?: string;
  budgetAmount?: number;
  credit?: number;

  /** -------------------------------
   *  LEAD STATUS
   * ------------------------------- **/
  status: "approved" | "hire_requested" | "hired" | "closed" | "cancelled";

  /** -------------------------------
   *  LEAD PRIORITY
   * ------------------------------- **/
  leadPriority: PriorityOption;

  /** -------------------------------
   *  RESPONDERS INFO
   * ------------------------------- **/
  responders: Types.ObjectId[]; // Lawyers who responded

  /** -------------------------------
   *  HIRING STATUS & INFO
   * ------------------------------- **/
  hireStatus: "not_requested" | "requested" | "hired" | "rejected";
  isHired: boolean;
  hiredLawyerId?: Types.ObjectId | null; // Lawyer who was hired
  hiredBy?: Types.ObjectId | null;       // Who initiated the hire
  hiredAt?: Date | null;

  /** -------------------------------
   *  CLOSURE STATUS & INFO
   * ------------------------------- **/
  closeStatus: "open" | "closed";
  isClosed: boolean;
  closedBy?: Types.ObjectId | null;      // Who closed the lead
  leadClosedReason?: string | null;
  closedAt?: Date | null;

  /** -------------------------------
   *  SOFT DELETE & TIMESTAMPS
   * ------------------------------- **/
  deletedAt?: Date | null;

}










export interface LeadModel extends Model<ILead> {
  // eslint-disable-next-line no-unused-vars
  isLeadExists(id: string): Promise<ILead>;
}
