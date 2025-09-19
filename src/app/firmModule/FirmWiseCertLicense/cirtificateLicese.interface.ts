

import { Document, Types } from "mongoose";

export interface IFirmLicense extends Document {
  firmProfileId: Types.ObjectId;          // reference to FirmProfile
  certificationId: Types.ObjectId;        // reference to LawFirmCertification
  licenseNumber: string;                  // firm's license number
  issuedBy?: string;                      // issuing authority (optional, default '')
  additionalNote: string;                 // additional note
  validUntil: Date;                       // expiration date
  
}
