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






/* 
--------------------------------------------------

 Lead schema - new logic 

-----------------------------------------------------

*/


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
  hiredResponseId?: Types.ObjectId | null; // Response who was hired
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

  hiredLawyerRating?: Types.ObjectId | null;      // Who closed the lead
  repostedFrom?: Types.ObjectId | null;      // Who closed the lead
  /** -------------------------------
   *  SOFT DELETE & TIMESTAMPS
   * ------------------------------- **/
  deletedAt?: Date | null;

}







export interface LeadModel extends Model<ILead> {
  // eslint-disable-next-line no-unused-vars
  isLeadExists(id: string): Promise<ILead>;
}
