import { Types } from "mongoose";


export interface ICity extends Document {
  name: string;
  countryId: Types.ObjectId;
  region?: string; // e.g., state, province

}