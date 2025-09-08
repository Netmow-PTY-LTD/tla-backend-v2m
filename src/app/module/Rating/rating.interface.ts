import { Types } from "mongoose";



export interface IRating {
    leadId: Types.ObjectId;
    responseId: Types.ObjectId;
    clientId: Types.ObjectId;
    lawyerId: Types.ObjectId;
    rating: number; // 1-5
    feedback?: string; // optional feedback

}