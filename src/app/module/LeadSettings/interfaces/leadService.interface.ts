/* eslint-disable no-unused-vars */
import mongoose, { Model } from 'mongoose';
import { Types } from 'mongoose';

export enum LocationType {
  NATION_WIDE = 'nation_wide',
  DISTANCE_WISE = 'distance_wise',
  TRAVEL_TIME = 'travel_time',
  DRAW_ON_AREA = 'draw_on_area',
}

// export interface ILocation {
//   _id: mongoose.Types.ObjectId | string;
//   locationGroupId: mongoose.Types.ObjectId;
//   locationType: string;
//   SelectedLocationId: mongoose.Types.ObjectId;
// }

export type IUpdateLeadServiceAnswers = {
  questionId: mongoose.Types.ObjectId; // ObjectId string
  selectedOptionIds: mongoose.Types.ObjectId[]; // Array of ObjectId strings
};

export interface IUserLocationServiceMap {
  _id?: Types.ObjectId;
  userProfileId: Types.ObjectId;
  locationGroupId?: Types.ObjectId;
  locationType: LocationType;
  rangeInKm?:number;
  serviceIds: Types.ObjectId[];
}

export interface ILeadService {
  userProfileId: Types.ObjectId;
  serviceId: Types.ObjectId;
  questionId: Types.ObjectId;
  optionId: Types.ObjectId;
  isSelected?: boolean;
  idExtraData?: string;
}

export interface ILeadServiceModel extends Model<ILeadService> {
  isLeadServiceExists(id: string): Promise<ILeadService | null>;
}
