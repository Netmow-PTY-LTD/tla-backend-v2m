import { Types } from "mongoose";


// export interface ICity extends Document {
//   name: string;
//   countryId: Types.ObjectId;
//   region?: string; // e.g., state, province

// }


export interface ICity {
  _id?: Types.ObjectId;
  name: string;
  countryId: Types.ObjectId; // Reference to Country
  region?: string; // e.g., State or Province
  zipCode: Types.ObjectId; // Reference to ZipCode (single)
  areaNames?: string[]; // Optional neighborhoods or local areas
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  timezone?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
