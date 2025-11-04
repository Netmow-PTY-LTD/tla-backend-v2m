import mongoose, { Types } from "mongoose";
import { AppError } from "../../errors/error";
import { HTTP_STATUS } from "../../constant/httpStatus";
import User from "../../module/Auth/auth.model";
import { IUser } from "../../module/Auth/auth.interface";
import ZipCode from "../../module/Country/zipcode.model";
import UserProfile from "../../module/User/user.model";
import { REGISTER_USER_TYPE, USER_STATUS } from "../../module/Auth/auth.constant";
import { LawyerServiceMap } from "../../module/User/lawyerServiceMap.model";
import { LocationType } from "../../module/UserLocationServiceMap/userLocationServiceMap.interface";
import { UserLocationServiceMap } from "../../module/UserLocationServiceMap/UserLocationServiceMap.model";
import { createLeadService } from "../../module/Auth/lawyerRegister.utils";
import FirmUser from "../FirmAuth/frimAuth.model";
import { FirmProfile } from "../Firm/firm.model";
import { redisClient } from "../../config/redis.config";
import { CacheKeys } from "../../config/cacheKeys";
import { validateObjectId } from "../../utils/validateObjectId";
import config from "../../config";
import { Firm_USER_ROLE } from "../FirmAuth/frimAuth.constant";
import { SsoToken } from "../FirmAuth/SsoToken.model";


const addLawyer = async (userId: string, payload: any) => {
    // Start a database session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const firmUser = await FirmUser.findById(userId).select('firmProfileId').session(session);

        const firm = await FirmProfile.findById(firmUser?.firmProfileId).select('lawyers').session(session);

        if (!firm) {
            throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Firm is not verified to add lawyer. Please contact support team.');
        }

        // Check if the user already exists by email
        const existingUser = await User.isUserExistsByEmail(payload.email);
        if (existingUser) {
            throw new AppError(HTTP_STATUS.CONFLICT, 'Account alredy exists with the email. Please! login with existing email or use new email');
        }

        // Separate the profile data from the user data
        const { profile, lawyerServiceMap, ...userData } = payload;

        // Create the user document in the database
        const [newUser] = await User.create([userData], { session });
        const addressInfo = lawyerServiceMap?.addressInfo

        let zipCode;

        if (addressInfo?.zipcode && addressInfo.postalCode && addressInfo?.countryCode && addressInfo?.countryId) {

            try {
                const query = {
                    zipcode: addressInfo.zipcode,
                    postalCode: addressInfo.postalCode,
                    countryCode: addressInfo.countryCode,
                    countryId: new mongoose.Types.ObjectId(addressInfo.countryId),
                };

                zipCode = await ZipCode.findOne(query).session(session);

                if (!zipCode) {
                    zipCode = await ZipCode.create([{
                        zipcode: addressInfo.zipcode,
                        postalCode: addressInfo.postalCode,
                        countryId: new mongoose.Types.ObjectId(addressInfo.countryId),
                        zipCodeType: addressInfo.zipCodeType || 'custom',
                        countryCode: addressInfo.countryCode,
                        latitude: addressInfo.latitude,
                        longitude: addressInfo.longitude,
                    }], { session }).then((res) => res[0]);

                }
            } catch (err: unknown) {
                console.error("ZipCode save error:", err);
            }
        }


        // Prepare the profile data with a reference to the user
        const profileData = {
            ...profile,
            user: newUser._id,
            address: zipCode?.zipcode,
            zipCode: zipCode?._id,
            lawyerContactEmail: newUser?.email,
            isAccessibleByOtherUsers: true,

        };

        // Create the user profile document in the database
        const [newProfile] = await UserProfile.create([profileData], { session });

        // Link the profile to the newly created user
        newUser.profile = new Types.ObjectId(newProfile._id);
        newUser.accountStatus = USER_STATUS.APPROVED;
        await newUser.save({ session });



        // lawyer service map create

        if (newUser.regUserType === REGISTER_USER_TYPE.LAWYER) {
            const lawyerServiceMapData = {
                ...lawyerServiceMap,
                zipCode: zipCode?._id,
                userProfile: newProfile._id,
            };

            await LawyerServiceMap.create([lawyerServiceMapData], { session });
        }


        // Create location service maps for default and distance-wise locations
        const defaultLocation = await ZipCode.findOne({
            countryId: newProfile.country,
            zipCodeType: 'default',
        }).session(session);

        const locationMaps = [
            {
                userProfileId: newProfile._id,
                locationGroupId: defaultLocation?._id,
                locationType: LocationType.NATION_WIDE,
                serviceIds: lawyerServiceMap.services || [],
            },
            {
                userProfileId: newProfile._id,
                locationGroupId: zipCode?._id,
                locationType: LocationType.DISTANCE_WISE,
                rangeInKm: lawyerServiceMap.rangeInKm,
                serviceIds: lawyerServiceMap.services || [],
            },
        ];

        await UserLocationServiceMap.insertMany(locationMaps, { session });


        //  Create lead service entries using session
        await createLeadService(newUser?._id, lawyerServiceMap.services, session);


        // added  firm reference in lawyer user profile 

        newProfile.firmProfileId = firm._id as mongoose.Types.ObjectId;
        firm.lawyers.push(newProfile._id as unknown as mongoose.Types.ObjectId);
        await Promise.all([newProfile.save({ session }), firm.save({ session })]);


        // Commit the transaction (save changes to the database)
        await session.commitTransaction();
        session.endSession();

        // Return the generated tokens and user data
        return newUser;



    } catch (error) {
        // If an error occurs, abort the transaction to avoid incomplete data
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};




/**
 * Generate one-time SSO token for staff to log in as a lawyer
 */
const requestLawyerAccess = async (userId: string, lawyerId?: string) => {
    const firmUser = await FirmUser.findById(userId).populate({
        path: 'permissions',
        populate: { path: 'pageId', model: 'Page' }
    });

    if (!firmUser) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Firm user not found');

    // Check admin or permission
    const hasAccess = firmUser.role === Firm_USER_ROLE.ADMIN || firmUser.permissions?.some(
        (p: any) => p.pageId?.slug === 'you-are-permitted-to-log-in-to-the-lawyer-panel' && p.permission
    );

    if (!hasAccess) throw new AppError(HTTP_STATUS.FORBIDDEN, 'No permission');

    if (!lawyerId) throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Missing lawyerId');

    const lawyer = await User.findOne({ profile: lawyerId }).populate({
        path: 'profile',
        model: 'UserProfile', // Replace with your actual lawyer profile model name
    });
    if (!lawyer) throw new AppError(HTTP_STATUS.NOT_FOUND, 'Lawyer not found');

    if ([lawyer.deletedAt, 'SUSPENDED', 'ARCHIVED', 'REJECTED'].includes(lawyer.accountStatus)) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, `You are not allowed to access this lawyer because the account is ${lawyer.accountStatus}`);
    }

    // Ensure lawyer.profile is populated and has isAccessibleByOtherUsers property
    if (!lawyer.profile || !(lawyer.profile as any).isAccessibleByOtherUsers) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'You are not allowed to login to this lawyer');
    }

    // Generate random token
    const tokenValue = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 18)}`;


    // Save token in DB with short expiry (2 minutes)
    await SsoToken.create({
        token: tokenValue,
        lawyerId: lawyer._id,
        adminId: firmUser.role === Firm_USER_ROLE.ADMIN ? firmUser._id : undefined, // <-- add admin reference if admin
        staffId: firmUser.role === Firm_USER_ROLE.STAFF ? firmUser._id : undefined,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
        used: false
    });

    // Build redirect URL
    const redirectUrl = `${config.client_url}/sso-login?token=${tokenValue}`;

    return { status: 'granted', redirectUrl, expiresIn: 120 };
};



//  lawyer remove from firm
const lawyerRemoveFromFirm = async (userId: string, lawyerProfileId: string) => {
    // Validate IDs
    validateObjectId(userId, "User");
    validateObjectId(lawyerProfileId, "Lawyer");

    // Start a session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find firm user
        const firmUser = await FirmUser.findById(userId).session(session);
        if (!firmUser) throw new AppError(HTTP_STATUS.NOT_FOUND, "Firm user not found");

        // Find firm profile
        const firm = await FirmProfile.findById(firmUser.firmProfileId).session(session);
        if (!firm) throw new AppError(HTTP_STATUS.NOT_FOUND, "Firm not found");

        // Find lawyer profile
        const lawyerProfile = await UserProfile.findById(lawyerProfileId).session(session);
        if (!lawyerProfile) throw new AppError(HTTP_STATUS.NOT_FOUND, "Lawyer not found");

        // Remove lawyer from firm using $pull
        await FirmProfile.updateOne(
            { _id: firm._id },
            { $pull: { lawyers: lawyerProfile._id } },
            { session }
        );

        // Update lawyer’s firm-related fields
        await UserProfile.updateOne(
            { _id: lawyerProfile._id },
            {
                $set: {
                    firmProfileId: null,                 // remove firm reference
                    firmMembershipStatus: "removed",     // status reflects firm action
                    isFirmRemoved: true,                 // mark as removed
                    firmRemovedAt: new Date(),           // exact removal time
                    activeFirmRequestId: null,           // clear pending requests
                    isFirmMemberRequest: false,          // reset request flag
                    isAccessibleByOtherUsers: false,     // reset access
                },
            },
            { session }
        );

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        await redisClient.del(CacheKeys.USER_INFO(lawyerProfile.user.toString()));
        console.log(` Cache invalidated for user ${lawyerProfile.user.toString()}`);

        return {
            status: "success",
            message: "Lawyer successfully removed from firm",
            data: { firmId: firm._id, removedLawyerId: lawyerProfile._id },
        };
    } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        session.endSession();
        throw error; // propagate the error
    }
};













export const firmLawyerService = {
    addLawyer,
    requestLawyerAccess,
    lawyerRemoveFromFirm

};
