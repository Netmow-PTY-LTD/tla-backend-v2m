
import { Types } from "mongoose";
import { FirmLicense } from "./cirtificateLicese.model";
import { FirmProfile } from "../Firm/firm.model";
import { IFirmLicense } from "./cirtificateLicese.interface";
import FirmUser from "../FirmAuth/frimAuth.model";
import { sendNotFoundResponse } from "../../errors/custom.error";


// Create a new license
export const createFirmLicenseInDB = async (
    userId: string,
    data: {
        certificationId: string;
        licenseNumber: string;
        issuedBy: string;
        additionalNote: string;
        validUntil: Date;
    }
) => {

    const user = await FirmUser.findById(userId).select('firmProfileId')

    if (!user) {
        return sendNotFoundResponse("User not found");
    }

    // Include firmProfileId in the license data
    const licenseData = {
        ...data,
        firmProfileId: user.firmProfileId,
    };


    // Create the license
    const license = await FirmLicense.create(licenseData);
    return license;
};


// Get all licenses for a firm
const getFirmLicensesFromDB = async (userId: string) => {


    const user = await FirmUser.findById(userId).select('firmProfileId')

    if (!user) {
        return sendNotFoundResponse("User not found");
    }


    return await FirmLicense.find({ firmProfileId: user.firmProfileId })
        .populate("certificationId", "certificationName type logo") // populate certification info
        .exec();


};

// Get single license by ID
const getFirmLicenseById = async (licenseId: string) => {
    if (!Types.ObjectId.isValid(licenseId)) throw new Error("Invalid license ID");
    return await FirmLicense.findById(licenseId)
        .populate("certificationId", "certificationName type logo")
        .exec();
};

// Update license by ID
const updateFirmLicenseInDB = async (licenseId: string, updateData: Partial<IFirmLicense>) => {
    if (!Types.ObjectId.isValid(licenseId)) throw new Error("Invalid license ID");
    const updateResult = await FirmLicense.findByIdAndUpdate(licenseId, updateData, { new: true, runValidators: true });
    return updateResult;
};

// Delete license by ID
const deleteFirmLicenseFromDB = async (licenseId: string) => {
    if (!Types.ObjectId.isValid(licenseId)) throw new Error("Invalid license ID");
    return await FirmLicense.findByIdAndDelete(licenseId);
};



export const firmLicenseService = {
    createFirmLicenseInDB,
    getFirmLicensesFromDB,
    getFirmLicenseById,
    updateFirmLicenseInDB,
    deleteFirmLicenseFromDB

}