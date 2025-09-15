

import mongoose from "mongoose";
import { AppError } from "../../errors/error";
import config from "../../config";
import { createToken } from "../../module/Auth/auth.utils";
import { Firm_USER_ROLE } from "./frimAuth.constant";
import { FirmUser } from "./frimAuth.model";

import { StringValue } from "ms";
import { HTTP_STATUS } from "../../constant/httpStatus";
import { StaffProfile } from "../Staff/staff.model";
import { FirmProfile } from "../Firm/firm.model";

export interface StaffRegisterPayload {
    email: string;
    password: string;
    fullName: string;
    role?: string; // optional, default to STAFF
}

export const staffRegisterUserIntoDB = async (payload: StaffRegisterPayload) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { email, password, fullName, role = Firm_USER_ROLE.STAFF } = payload;

        // 1️⃣ Check if user already exists
        const existingUser = await FirmUser.isUserExistsByEmail(email);
        if (existingUser) {
            throw new AppError(
                HTTP_STATUS.CONFLICT,
                "Account already exists with this email. Please login or use a new email."
            );
        }

        // 2️⃣ Create new FirmUser
        const [newUser] = await FirmUser.create(
            [
                {
                    email,
                    password,
                    role,
                    regUserType: "staff",
                },
            ],
            { session }
        );

        // 3️⃣ Create corresponding StaffProfile linked to FirmUser
        const [newProfile] = await StaffProfile.create(
            [
                {
                    fullName,
                    createdBy: newUser._id, // link creator
                },
            ],
            { session }
        );

        // Optionally link StaffProfile back to FirmUser if needed
        // newUser.profileId = newProfile._id;
        // await newUser.save({ session });

        // 4️⃣ Generate JWTs
        const jwtPayload = {
            userId: newUser._id,
            email: newUser.email,
            role: newUser.role,
            accountStatus: newUser.accountStatus,
        };

        const accessToken = createToken(
            jwtPayload,
            config.jwt_access_secret as StringValue,
            config.jwt_access_expires_in as StringValue
        );

        const refreshToken = createToken(
            jwtPayload,
            config.jwt_refresh_secret as StringValue,
            config.jwt_refresh_expires_in as StringValue
        );

        // 5️⃣ Save access token for verification
        newUser.verifyToken = accessToken;
        await newUser.save({ session });

        // 6️⃣ Commit transaction
        await session.commitTransaction();
        session.endSession();

        return {
            accessToken,
            refreshToken,
            userData: newUser,
            profileData: newProfile,
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};








//  firm Register api



export interface FirmLicenseDetailsPayload {
    licenseType: string;       // e.g. "Law Firm License"
    licenseNumber: string;     // e.g. "ABC1234567"
    issuedBy: string;          // e.g. "Queensland Law Society"
    validUntil: string | Date; // mm/dd/yyyy from UI or Date
}

export interface FirmContactInfoPayload {
    officeAddress?: string;    // Address / Zip
    country?: string;          // Country select
    city?: string;             // City select
    phone?: string;            // +1 (123) 456-7890
    email?: string;            // firm email (can be same as user, optional)
    officialWebsite?: string;  // https://example.com
}

/** Full payload for registration + profile creation */
export interface FirmRegisterPayload {
    email: string;                 // login email for FirmUser
    password: string;
    firmName: string;              // Law Firm Name
    role?: string;                 // defaults to ADMIN

    // --- FirmProfile fields from "List Your Law Firm" step ---
    registrationNumber?: string;   // e.g. 1234567890
    yearEstablished?: number;      // e.g. 2003
    contactInfo?: FirmContactInfoPayload;

    // --- FirmProfile fields from "License Details" step (REQUIRED by schema) ---
    licenseDetails: FirmLicenseDetailsPayload;
}

const normalizeValidUntil = (value: string | Date): Date => {
    if (value instanceof Date) return value;
    // Expecting mm/dd/yyyy from UI — fall back to Date parse
    // You can replace this with a stricter parser if needed.
    const d = new Date(value);
    if (isNaN(d.getTime())) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, "Invalid license expiry date.");
    }
    return d;
};

const firmRegisterUserIntoDB = async (payload: FirmRegisterPayload) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            email,
            password,
            firmName,
            role = Firm_USER_ROLE.ADMIN,

            registrationNumber,
            yearEstablished,
            contactInfo,
            licenseDetails, // required
        } = payload;

        // Basic guard for required license details (schema requires it)
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

        // 1) ensure user not exists
        const existingUser = await FirmUser.isUserExistsByEmail(email);
        if (existingUser) {
            throw new AppError(
                HTTP_STATUS.CONFLICT,
                "Account already exists with this email. Please login or use a new email."
            );
        }

        // 2) create FirmUser
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

        // 3) create FirmProfile (matches your schema)
        const [newProfile] = await FirmProfile.create(
            [
                {
                    // Firm details
                    firmName,
                    registrationNumber,
                    yearEstablished,
                    // Optional: if you collect VAT/GST later, map here:
                    // vatTaxId: payload.vatTaxId,
                    // legalFocusAreas: payload.legalFocusAreas ?? [],

                    // Contact info (nested)
                    contactInfo: {
                        officeAddress: contactInfo?.officeAddress,
                        country: contactInfo?.country,
                        city: contactInfo?.city,
                        phone: contactInfo?.phone,
                        email: contactInfo?.email ?? email, // default to account email if not provided
                        officialWebsite: contactInfo?.officialWebsite,
                    },

                    // License details (REQUIRED)
                    licenseDetails: {
                        licenseType: licenseDetails.licenseType,
                        licenseNumber: licenseDetails.licenseNumber,
                        issuedBy: licenseDetails.issuedBy,
                        validUntil: normalizeValidUntil(licenseDetails.validUntil),
                    },

                    // Permissions
                    createdBy: newUser._id,
                },
            ],
            { session }
        );

        // 4) tokens
        const jwtPayload = {
            userId: newUser._id,
            email: newUser.email,
            role: newUser.role,
            accountStatus: newUser.accountStatus,
        };

        const accessToken = createToken(
            jwtPayload,
            config.jwt_access_secret as StringValue,
            config.jwt_access_expires_in as StringValue
        );

        const refreshToken = createToken(
            jwtPayload,
            config.jwt_refresh_secret as StringValue,
            config.jwt_refresh_expires_in as StringValue
        );

        // 5) store verify token for email verification flow
        newUser.verifyToken = accessToken;
        await newUser.save({ session });

        // 6) commit
        await session.commitTransaction();
        session.endSession();

        return {
            accessToken,
            refreshToken,
            userData: newUser,
            profileData: newProfile,
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};













// Export service
export const firmAuthService = {
    staffRegisterUserIntoDB,
    firmRegisterUserIntoDB
};
