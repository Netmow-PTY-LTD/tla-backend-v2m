import { Model, Types } from 'mongoose';
import { PriorityOption } from './lead.constant';
import { ILeadServiceAnswer } from './leadServiceAnswer.interface';



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
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };

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
  isReposted: boolean;
 
  leadAnswers?: ILeadServiceAnswer[];

}





export interface LeadModel extends Model<ILead> {
  // eslint-disable-next-line no-unused-vars
  isLeadExists(id: string): Promise<ILead>;
}
