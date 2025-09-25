import { Schema, Document, Types } from "mongoose";
import { IZipCode } from "../../module/Country/zipcode.interface";


export interface IFirmLocation extends Document {
  firmProfileId: Types.ObjectId;
  name: string;
  address: Types.ObjectId | IZipCode; // reference to ZipCode
}

export interface FirmLocationPayload {
  name: string;
  address: string; // ZipCode _id as string
}

export interface FirmLocationResponse {
  _id: string;
  firmProfileId: string;
  name: string;
  address: IZipCode; // populated ZipCode object
  createdAt: string;
  updatedAt: string;
}
