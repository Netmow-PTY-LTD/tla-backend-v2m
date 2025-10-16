import { Types } from 'mongoose';





export enum LocationType {
    NATION_WIDE = 'nation_wide',
    DISTANCE_WISE = 'distance_wise',
    TRAVEL_TIME = 'travel_time',
    DRAW_ON_AREA = 'draw_on_area',
}





export type IUserLocationServiceMap = {
    _id?: Types.ObjectId;
    userProfileId: Types.ObjectId; // Reference to UserProfile
    locationGroupId?: Types.ObjectId | null; // Reference to ZipCode (optional)
    locationType: LocationType; // specific | nation_wide
    rangeInKm?: number; // Default 0
    traveltime?: string; // e.g. "15min"
    travelmode?: 'driving' | 'walking' | 'transit'; // Default 'driving'
    serviceIds: Types.ObjectId[]; // References to Service
    createdAt?: Date;
    updatedAt?: Date;
};
