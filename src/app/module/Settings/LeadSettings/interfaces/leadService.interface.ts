/* eslint-disable no-unused-vars */
import mongoose, { Model } from 'mongoose';
import { Types } from 'mongoose';

// Interface for the LeadService document
interface Question {
  questionId: mongoose.Types.ObjectId; // References ServiceQuestion
  selectedOptionIds: mongoose.Types.ObjectId[]; // Array of references to ServiceOption
}

export enum LocationType {
  NATION_WISE = 'nation_wide',
  DISTANCE_WISE = 'distance_wise',
  TRAVEL_TIME = 'travel_time',
  DRAW_ON_AREA = 'draw_on_area',
}

export interface ILocation {
  locationGroupId?: Types.ObjectId | string; // optional for 'custom' type
  locationType: LocationType;
  areaName?: string;
}

interface ISelectedLocations {
  _id: mongoose.Types.ObjectId;
  locationGroupId: mongoose.Types.ObjectId;
  locationType: string;
}
export interface ILeadService {
  userProfileId: mongoose.Types.ObjectId;
  serviceName: string;
  serviceId: mongoose.Types.ObjectId;
  selectedLocations: ISelectedLocations[];

  questions: Question[];
}

export type IUpdateLeadServiceAnswers = {
  questionId: mongoose.Types.ObjectId; // ObjectId string
  selectedOptionIds: mongoose.Types.ObjectId[]; // Array of ObjectId strings
};

export interface ILeadServiceModel extends Model<ILeadService> {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
  isServiceWiseStepExists(id: string): Promise<any>;
}

/* 
under this interface  model will be changeable just use if for test case

*/

export interface IUserLocationServiceMap {
  userProfileId: Types.ObjectId;
  locationGroupId: Types.ObjectId;
  locationType: LocationType;
  serviceIds: Types.ObjectId[];
}
