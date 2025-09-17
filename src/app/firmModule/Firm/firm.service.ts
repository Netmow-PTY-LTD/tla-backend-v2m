import mongoose from "mongoose";
import { IFirmProfile } from "./firm.interface";
import { FirmProfile } from "./firm.model";
import { Firm_USER_ROLE } from "../FirmAuth/frimAuth.constant";
import { AppError } from "../../errors/error";
import { HTTP_STATUS } from "../../constant/httpStatus";
import FirmUser from "../FirmAuth/frimAuth.model";


// ✅ Create
// helper: normalize date
const normalizeValidUntil = (date: string | Date) => {
    return new Date(date);
};

// ✅ Create Firm with transaction (FirmUser + FirmProfile)
export const createFirm = async (payload: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            email,
            password,
            firmName,
            role = Firm_USER_ROLE.FIRM,
            registrationNumber,
            yearEstablished,
            contactInfo,
            licenseDetails, // required
        } = payload;

        // 🔹 Guard for required license details
        if (
            !licenseDetails?.licenseType ||
            !licenseDetails?.licenseNumber ||
            !licenseDetails?.issuedBy ||
            !licenseDetails?.validUntil
        ) {
            throw new AppError(
                HTTP_STATUS.BAD_REQUEST,
                "License details are required (licenseType, licenseNumber, issuedBy, validUntil)."
            );
        }

        // 🔹 Ensure email not already taken
        const existingUser = await FirmUser.isUserExistsByEmail(email);
        if (existingUser) {
            throw new AppError(
                HTTP_STATUS.CONFLICT,
                "Account already exists with this email. Please login or use a new email."
            );
        }

        // 🔹 Create FirmUser
        const [newUser] = await FirmUser.create(
            [
                {
                    email,
                    password,
                    role,
                    regUserType: "firm",
                },
            ],
            { session }
        );

        // 🔹 Create FirmProfile
        const [newProfile] = await FirmProfile.create(
            [
                {
                    firmUser: newUser._id,
                    firmName,
                    registrationNumber,
                    yearEstablished,

                    contactInfo: {
                        officeAddress: contactInfo?.officeAddress,
                        country: contactInfo?.country,
                        city: contactInfo?.city,
                        phone: contactInfo?.phone,
                        email: contactInfo?.email ?? email,
                        officialWebsite: contactInfo?.officialWebsite,
                    },

                    licenseDetails: {
                        licenseType: licenseDetails.licenseType,
                        licenseNumber: licenseDetails.licenseNumber,
                        issuedBy: licenseDetails.issuedBy,
                        validUntil: normalizeValidUntil(licenseDetails.validUntil),
                    },

                    createdBy: newUser._id,
                },
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return {
            user: newUser,
            profile: newProfile,
        };
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};


// ✅ List
const listFirms = async () => {
    return await FirmProfile.find().populate("firmUser createdBy updatedBy");
};

// ✅ Get by ID
const getFirmById = async (id: string) => {
    return await FirmProfile.findById(id).populate("firmUser createdBy updatedBy");
};

// ✅ Update
const updateFirm = async (id: string, data: Partial<IFirmProfile>) => {
    return await FirmProfile.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
};


// ✅ Delete Firm (and associated FirmUser) transactionally
export const deleteFirm = async (id: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1️⃣ Find the firm profile
        const firm = await FirmProfile.findById(id).session(session);
        if (!firm) {
            throw new AppError(HTTP_STATUS.NOT_FOUND, "Firm not found");
        }

        // 2️⃣ Delete associated FirmUser
        await FirmUser.findByIdAndDelete(firm.firmUser, { session });

        // 3️⃣ Delete the FirmProfile
        await FirmProfile.findByIdAndDelete(id, { session });

        await session.commitTransaction();
        session.endSession();

        return { message: "Firm and associated user deleted successfully" };
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};;


export const firmService = {
    createFirm,
    listFirms,
    getFirmById,
    updateFirm,
    deleteFirm
}