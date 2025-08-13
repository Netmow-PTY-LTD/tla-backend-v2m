import mongoose, { Types } from 'mongoose';
import UserProfile from '../../User/models/user.model';
import { AppError } from '../../../errors/error';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import User from '../models/auth.model';
import CompanyProfile from '../../User/models/companyProfile.model';
import { LawyerServiceMap } from '../../User/models/lawyerServiceMap.model';
import ZipCode from '../../Country/models/zipcode.model';
import { UserLocationServiceMap } from '../../LeadSettings/models/UserLocationServiceMap.model';
import { createToken } from '../utils/auth.utils';
import config from '../../../config';
import { StringValue } from 'ms';
import { IUser } from '../interfaces/auth.interface';
import { REGISTER_USER_TYPE } from '../constant/auth.constant';
import { createLeadService } from '../utils/lawyerRegister.utils';
import { LocationType } from '../../LeadSettings/constant/UserWiseLocation.constant';
import { sendEmail } from '../../../emails/email.service';
import Service from '../../Service/models/service.model';


const lawyerRegisterUserIntoDB = async (payload: IUser) => {
  // Start a database session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the user already exists by email
    const existingUser = await User.isUserExistsByEmail(payload.email);
    if (existingUser) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'This user already exists!');
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


        const zipCodeExists = await ZipCode.findOne(query);


        if (!zipCodeExists) {
          zipCode = await ZipCode.create({
            zipcode: addressInfo.zipcode,
            postalCode: addressInfo.postalCode,
            countryId: new mongoose.Types.ObjectId(addressInfo.countryId),
            zipCodeType: addressInfo.zipCodeType || 'custom',
            countryCode: addressInfo.countryCode,
            latitude: addressInfo.latitude,
            longitude: addressInfo.longitude,
          });

        } else {
          // ✅ New logic: assign found record
          zipCode = zipCodeExists;
        }
      } catch (err: unknown) {
        console.error("ZipCode save error:", err);
      }
    }



    // const address = await ZipCode.findById(lawyerServiceMap?.zipCode);
    // Prepare the profile data with a reference to the user
    const profileData = {
      ...profile,
      user: newUser._id,
      address: lawyerServiceMap.zipCode ,
      zipCode: zipCode?._id,
      lawyerContactEmail: newUser?.email,

    };

    // Create the user profile document in the database
    const [newProfile] = await UserProfile.create([profileData], { session });

    // Link the profile to the newly created user
    newUser.profile = new Types.ObjectId(newProfile._id);
    await newUser.save({ session });

    // compnay profile map create

    if (companyInfo?.companyTeam) {
      const companyProfileMapData = {
        ...companyInfo,
        contactEmail: userData.email,
        userProfileId: newProfile._id,
      };

      await CompanyProfile.create([companyProfileMapData], { session });
    }

    // lawyer service map create


    if (newUser.regUserType === REGISTER_USER_TYPE.LAWYER) {
      const lawyerServiceMapData = {
        ...lawyerServiceMap,
        zipCode:zipCode?._id,
        userProfile: newProfile._id,
      };

      await LawyerServiceMap.create([lawyerServiceMapData], { session });
    }

    const locationGroup = await ZipCode.findOne({
      countryId: newProfile?.country,
      zipCodeType: 'default',
    });
    // adding nation wide user location 
    const userLocationServiceMapData = {
      userProfileId: newProfile._id,
      locationGroupId: locationGroup?._id,
      locationType: LocationType.NATION_WIDE,
      serviceIds: lawyerServiceMap.services || [],
    };

    await UserLocationServiceMap.create([userLocationServiceMapData], {
      session,
    });
    // user chooseable location 
    const userLocationServiceMapUserChoiceBase = {
      userProfileId: newProfile._id,
      locationGroupId: zipCode?._id,
      locationType: LocationType.DISTANCE_WISE,
      rangeInKm: lawyerServiceMap.rangeInKm,
      serviceIds: lawyerServiceMap.services || [],
    };

    await UserLocationServiceMap.create([userLocationServiceMapUserChoiceBase], {
      session,
    });

    // ✅ Create lead service entries using session
    await createLeadService(newUser?._id, lawyerServiceMap.services, session);

    // ----------------------  send email  -----------------------------------------------

    const serviceIds = lawyerServiceMap.services.map((id) =>
      new mongoose.Types.ObjectId(id)
    );

    const services = await Service.find({ _id: { $in: serviceIds } }).select('name');

    const paracticeArea = services.map((service) => service.name);


    const commonEmailData = {
      name: newProfile?.name || 'User',
      email: newUser.email,
      defaultPassword: userData.password,
      dashboardUrl: `${config.client_url}/lawyer/dashboard`,
      appName: 'TheLawApp',
      paracticeArea
    }

    await sendEmail({
      to: newUser.email,
      subject: 'Thank you for registering as a lawyer',
      data: commonEmailData,
      emailTemplate: "welcome_to_lawyer",
    });




    // const { subject, text, html } = generateRegistrationEmail({
    //   name: newProfile?.name || 'User',
    //   email: newUser.email,
    //   defaultPassword: userData.password,
    //   loginUILink: `${config.client_url}/login`,
    //   appName: 'The Law App',
    // });

    //  await sendEmail({
    //   to: newUser.email,
    //   subject,
    //   text,
    //   html,

    // });





    // -------------------------- Generate the access token for the user -----------------------------------
    const jwtPayload = {
      userId: newUser._id,
      email: newUser.email,
      // username: newUser.username,
      regUserType: newUser.regUserType,
      role: newUser.role,
      accountStatus: newUser.accountStatus,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as StringValue,
      config.jwt_access_expires_in as StringValue,
    );

    // Generate the refresh token for the user
    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as StringValue,
      config.jwt_refresh_expires_in as StringValue,
    );

    //  Save accessToken in DB for email verification
    newUser.verifyToken = accessToken;
    await newUser.save({ session });

    //  Send Email Verification Email
    const emailVerificationUrl = `${config.client_url}/verify-email?code=${accessToken}`;


    // Commit the transaction (save changes to the database)
    await session.commitTransaction();
    session.endSession();

    await sendEmail({
      to: newUser.email,
      subject: 'Verify your account – TheLawApp',
      data: {
        name: newProfile?.name,
        verifyUrl: emailVerificationUrl,
        role: 'Lawyer'
      },
      emailTemplate: 'verify_email',
    });

    // Return the generated tokens and user data
    return {
      accessToken,
      refreshToken,
      userData: newUser,
    };
  } catch (error) {
    // If an error occurs, abort the transaction to avoid incomplete data
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};




export const lawyerRegisterService = {
  lawyerRegisterUserIntoDB,
};
