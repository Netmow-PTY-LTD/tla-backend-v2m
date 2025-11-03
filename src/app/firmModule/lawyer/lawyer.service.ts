import mongoose, { Types } from "mongoose";
import { AppError } from "../../errors/error";
import { HTTP_STATUS } from "../../constant/httpStatus";
import User from "../../module/Auth/auth.model";
import { IUser } from "../../module/Auth/auth.interface";
import ZipCode from "../../module/Country/zipcode.model";
import UserProfile from "../../module/User/user.model";
import { REGISTER_USER_TYPE } from "../../module/Auth/auth.constant";
import { LawyerServiceMap } from "../../module/User/lawyerServiceMap.model";
import { LocationType } from "../../module/UserLocationServiceMap/userLocationServiceMap.interface";
import { UserLocationServiceMap } from "../../module/UserLocationServiceMap/UserLocationServiceMap.model";
import { createLeadService } from "../../module/Auth/lawyerRegister.utils";
import FirmUser from "../FirmAuth/frimAuth.model";
import { FirmProfile } from "../Firm/firm.model";


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
        const { profile, lawyerServiceMap, companyInfo, ...userData } = payload;

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

        };

        // Create the user profile document in the database
        const [newProfile] = await UserProfile.create([profileData], { session });

        // Link the profile to the newly created user
        newUser.profile = new Types.ObjectId(newProfile._id);
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
        return {

            userData: newUser,
        };



    } catch (error) {
        // If an error occurs, abort the transaction to avoid incomplete data
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};





export const firmLawyerService = {
    addLawyer,

};
