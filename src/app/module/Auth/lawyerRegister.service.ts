import mongoose, { Types } from 'mongoose';
import UserProfile from '../User/user.model';
import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';
import User from './auth.model';
import { LawyerServiceMap } from '../User/lawyerServiceMap.model';
import ZipCode from '../Country/zipcode.model';
import { UserLocationServiceMap } from '../UserLocationServiceMap/UserLocationServiceMap.model';
import { createToken } from './auth.utils';
import config from '../../config';
import { StringValue } from 'ms';
import { IUser } from './auth.interface';
import { REGISTER_USER_TYPE } from './auth.constant';
import { createLeadService } from './lawyerRegister.utils';
import { LocationType } from '../LeadSettings/UserWiseLocation.constant';
import { sendEmail } from '../../emails/email.service';
import Service from '../Service/service.model';
import { LawyerRequestAsMember } from '../../firmModule/lawyerRequest/lawyerRequest.model';
import FirmUser from '../../firmModule/FirmAuth/frimAuth.model';
import { Firm_USER_ROLE } from '../../firmModule/FirmAuth/frimAuth.constant';
import { ILawyerRegistrationDraft, LawyerRegistrationDraft } from './LawyerRegistrationDraft.model';
import bcrypt from 'bcryptjs';
import { generateOtp } from './otp.utils';
import { EmailVerificationDraft } from './EmailVerificationDraft.model';





// const lawyerRegisterUserIntoDB = async (payload: IUser) => {
//   // Start a database session for the transaction
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // Check if the user already exists by email
//     const existingUser = await User.isUserExistsByEmail(payload.email);
//     if (existingUser) {
//       throw new AppError(HTTP_STATUS.CONFLICT, 'Account alredy exists with the email. Please! login with existing email or use new email');
//     }

//     // Separate the profile data from the user data
//     const { profile, lawyerServiceMap, companyInfo, ...userData } = payload;

//     // Create the user document in the database
//     const [newUser] = await User.create([userData], { session });
//     const addressInfo = lawyerServiceMap?.addressInfo

//     let zipCode;

//     if (addressInfo?.zipcode && addressInfo.postalCode && addressInfo?.countryCode && addressInfo?.countryId) {

//       try {
//         const query = {
//           zipcode: addressInfo.zipcode,
//           postalCode: addressInfo.postalCode,
//           countryCode: addressInfo.countryCode,
//           countryId: new mongoose.Types.ObjectId(addressInfo.countryId),
//         };

//         zipCode = await ZipCode.findOne(query).session(session);

//         if (!zipCode) {
//           zipCode = await ZipCode.create([{
//             zipcode: addressInfo.zipcode,
//             postalCode: addressInfo.postalCode,
//             countryId: new mongoose.Types.ObjectId(addressInfo.countryId),
//             zipCodeType: addressInfo.zipCodeType || 'custom',
//             countryCode: addressInfo.countryCode,
//             latitude: addressInfo.latitude,
//             longitude: addressInfo.longitude,
//           }], { session }).then((res) => res[0]);

//         }
//       } catch (err: unknown) {
//         // eslint-disable-next-line no-console
//         console.error("ZipCode save error:", err);
//       }
//     }


//     // const address = await ZipCode.findById(lawyerServiceMap?.zipCode);
//     // Prepare the profile data with a reference to the user
//     const profileData = {
//       ...profile,
//       user: newUser._id,
//       address: zipCode?.zipcode,
//       zipCode: zipCode?._id,
//       lawyerContactEmail: newUser?.email,

//     };

//     // Create the user profile document in the database
//     const [newProfile] = await UserProfile.create([profileData], { session });

//     // Link the profile to the newly created user
//     newUser.profile = new Types.ObjectId(newProfile._id);
//     await newUser.save({ session });

//     // compnay profile map create

//     if (companyInfo?.companyTeam) {


//       // const companyProfileMapData = {
//       //   ...companyInfo,
//       //   contactEmail: userData.email,
//       //   userProfileId: newProfile._id,
//       // };

//       // await CompanyProfile.create([companyProfileMapData], { session });

//       const [lawyerRequest] = await LawyerRequestAsMember.create([{
//         firmProfileId: companyInfo?.companyName,
//         lawyerId: newProfile._id,
//         status: 'pending',
//         message: `Lawyer ${newUser.email} requested to join this firm as a member.`,
//         isActive: true,
//       }], { session });

//       newProfile.isFirmMemberRequest = true;
//       newProfile.activeFirmRequestId = lawyerRequest._id as Types.ObjectId;
//       await newProfile.save({ session });


//     }

//     // lawyer service map create


//     if (newUser.regUserType === REGISTER_USER_TYPE.LAWYER) {
//       const lawyerServiceMapData = {
//         ...lawyerServiceMap,
//         zipCode: zipCode?._id,
//         userProfile: newProfile._id,
//       };

//       await LawyerServiceMap.create([lawyerServiceMapData], { session });
//     }

//     const locationGroup = await ZipCode.findOne({
//       countryId: newProfile?.country,
//       zipCodeType: 'default',
//     }).session(session);;
//     // adding nation wide user location 
//     const userLocationServiceMapData = {
//       userProfileId: newProfile._id,
//       locationGroupId: locationGroup?._id,
//       locationType: LocationType.NATION_WIDE,
//       serviceIds: lawyerServiceMap.services || [],
//     };

//     await UserLocationServiceMap.create([userLocationServiceMapData], {
//       session,
//     });
//     // user chooseable location 
//     const userLocationServiceMapUserChoiceBase = {
//       userProfileId: newProfile._id,
//       locationGroupId: zipCode?._id,
//       locationType: LocationType.DISTANCE_WISE,
//       rangeInKm: lawyerServiceMap.rangeInKm,
//       serviceIds: lawyerServiceMap.services || [],
//     };

//     await UserLocationServiceMap.create([userLocationServiceMapUserChoiceBase], {
//       session,
//     });

//     //  Create lead service entries using session
//     await createLeadService(newUser?._id, lawyerServiceMap.services, session);

//     // ----------------------  send email  -----------------------------------------------

//     const serviceIds = lawyerServiceMap.services.map((id) =>
//       new mongoose.Types.ObjectId(id)
//     );

//     const services = await Service.find({ _id: { $in: serviceIds } }).select('name');

//     const paracticeArea = services.map((service) => service.name);


//     const commonEmailData = {
//       name: newProfile?.name || 'User',
//       email: newUser.email,
//       defaultPassword: userData.password,
//       dashboardUrl: `${config.client_url}/lawyer/dashboard`,
//       appName: 'TheLawApp',
//       paracticeArea
//     }

//     await sendEmail({
//       to: newUser.email,
//       subject: 'Thank you for registering as a lawyer',
//       data: commonEmailData,
//       emailTemplate: "welcome_to_lawyer",
//     });



//     // const { subject, text, html } = generateRegistrationEmail({
//     //   name: newProfile?.name || 'User',
//     //   email: newUser.email,
//     //   defaultPassword: userData.password,
//     //   loginUILink: `${config.client_url}/login`,
//     //   appName: 'The Law App',
//     // });

//     //  await sendEmail({
//     //   to: newUser.email,
//     //   subject,
//     //   text,
//     //   html,

//     // });





//     // -------------------------- Generate the access token for the user -----------------------------------
//     const jwtPayload = {
//       userId: newUser._id,
//       email: newUser.email,
//       // username: newUser.username,
//       country: addressInfo.countryCode,
//       regUserType: newUser.regUserType,
//       role: newUser.role,
//       accountStatus: newUser.accountStatus,

//     };

//     const accessToken = createToken(
//       jwtPayload,
//       config.jwt_access_secret as StringValue,
//       config.jwt_access_expires_in as StringValue,
//     );

//     // Generate the refresh token for the user
//     const refreshToken = createToken(
//       jwtPayload,
//       config.jwt_refresh_secret as StringValue,
//       config.jwt_refresh_expires_in as StringValue,
//     );

//     //  Save accessToken in DB for email verification
//     newUser.verifyToken = accessToken;
//     await newUser.save({ session });

//     //  Send Email Verification Email
//     const emailVerificationUrl = `${config.client_url}/verify-email?code=${accessToken}`;


//     // Commit the transaction (save changes to the database)
//     await session.commitTransaction();
//     session.endSession();

//     await sendEmail({
//       to: newUser.email,
//       subject: 'Verify your account – TheLawApp',
//       data: {
//         name: newProfile?.name,
//         verifyUrl: emailVerificationUrl,
//         role: 'Lawyer'
//       },
//       emailTemplate: 'verify_email',
//     });



//     //  lawyer firm member request email notification to firm admin
//     if (companyInfo?.companyTeam) {




//       const firmAdmin = await FirmUser.findOne({ firmProfileId: companyInfo?.companyName, role: Firm_USER_ROLE.ADMIN, });


//       if (firmAdmin) {

//         await sendEmail({
//           to: firmAdmin.email,
//           subject: 'New Lawyer Registration Request',
//           data: {
//             lawyerName: newProfile?.name,
//             lawyerEmail: newUser.email,
//             role: 'Lawyer',
//             requestUrl: `${config.firm_client_url}/dashboard/requests`
//           },
//           emailTemplate: 'request_lawyer_as_firm_member',
//         });

//       }
//     }



//     // Return the generated tokens and user data
//     return {
//       accessToken,
//       refreshToken,
//       userData: newUser,
//     };
//   } catch (error) {
//     // If an error occurs, abort the transaction to avoid incomplete data
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };




















const lawyerRegisterUserIntoDB = async (payload: IUser, externalSession?: mongoose.ClientSession) => {
  // Use existing session or start a new one
  const session = externalSession || await mongoose.startSession();

  if (!externalSession) session.startTransaction();

  try {
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
        // eslint-disable-next-line no-console
        console.error("ZipCode save error:", err);
      }
    }


    // const address = await ZipCode.findById(lawyerServiceMap?.zipCode);
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
    newUser.createdBy = new Types.ObjectId(newUser._id);
    await newUser.save({ session });

    // compnay profile map create

    if (companyInfo?.companyTeam) {


      // const companyProfileMapData = {
      //   ...companyInfo,
      //   contactEmail: userData.email,
      //   userProfileId: newProfile._id,
      // };

      // await CompanyProfile.create([companyProfileMapData], { session });

      const [lawyerRequest] = await LawyerRequestAsMember.create([{
        firmProfileId: companyInfo?.companyName,
        lawyerId: newProfile._id,
        status: 'pending',
        message: `Lawyer ${newUser.email} requested to join this firm as a member.`,
        isActive: true,
      }], { session });

      newProfile.isFirmMemberRequest = true;
      newProfile.activeFirmRequestId = lawyerRequest._id as Types.ObjectId;
      await newProfile.save({ session });


    }

    // lawyer service map create

    // custom service create

    const otherService = await Service.findOne({ $or: [{ name: "Other" }, { name: "Others" }] })


    const withCustomService = [
      ...(lawyerServiceMap.services || []),
      otherService?._id,
    ]
      .filter(Boolean)
      .map((id) => String(id))      // convert to string first
      .filter((id, index, arr) => arr.indexOf(id) === index) // remove duplicates
      .map((id) => new Types.ObjectId(id));






    if (newUser.regUserType === REGISTER_USER_TYPE.LAWYER) {
      const lawyerServiceMapData = {
        ...lawyerServiceMap,
        zipCode: zipCode?._id,
        userProfile: newProfile._id,
        serviceIds: withCustomService,
      };

      await LawyerServiceMap.create([lawyerServiceMapData], { session });
    }

    const locationGroup = await ZipCode.findOne({
      countryId: newProfile?.country,
      zipCodeType: 'default',
    }).session(session);;
    // adding nation wide user location 
    const userLocationServiceMapData = {
      userProfileId: newProfile._id,
      locationGroupId: locationGroup?._id,
      locationType: LocationType.NATION_WIDE,
      serviceIds: withCustomService,
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
      serviceIds: withCustomService || [],
    };

    await UserLocationServiceMap.create([userLocationServiceMapUserChoiceBase], {
      session,
    });



    //  Create lead service entries using session
    await createLeadService(newUser._id as Types.ObjectId, withCustomService, session);

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








    // -------------------------- Generate the access token for the user -----------------------------------
    const jwtPayload = {
      userId: newUser._id,
      email: newUser.email,
      // username: newUser.username,
      country: addressInfo.countryCode,
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




    // Commit the transaction (save changes to the database)
    if (!externalSession) {
      await session.commitTransaction();
      session.endSession();
    }


    //  lawyer firm member request email notification to firm admin
    if (companyInfo?.companyTeam) {




      const firmAdmin = await FirmUser.findOne({ firmProfileId: companyInfo?.companyName, role: Firm_USER_ROLE.ADMIN, });


      if (firmAdmin) {

        await sendEmail({
          to: firmAdmin.email,
          subject: 'New Lawyer Registration Request',
          data: {
            lawyerName: newProfile?.name,
            lawyerEmail: newUser.email,
            role: 'Lawyer',
            requestUrl: `${config.firm_client_url}/dashboard/requests`
          },
          emailTemplate: 'request_lawyer_as_firm_member',
        });

      }
    }



    // Return the generated tokens and user data
    return {
      accessToken,
      refreshToken,
      userData: newUser,
    };
  } catch (error) {
    if (!externalSession) {
      await session.abortTransaction();
      session.endSession();
    }
    throw error;
  }
};






//  -----------------------  lawyer registration draft ----------------------





const lawyerRegistrationDraftInDB = async (payload: ILawyerRegistrationDraft) => {


  const existingUser = await User.isUserExistsByEmail(payload.email);
  if (existingUser) {
    throw new AppError(HTTP_STATUS.CONFLICT, 'Account alredy exists with the email. Please! login with existing email or use new email');
  }

  // 1. Create LawyerRegistrationDraft
  const result = await LawyerRegistrationDraft.create(payload);

  // 2. Generate OTP
  const otp = generateOtp();

  // 3. Hash OTP
  const hashedOtp = await bcrypt.hash(otp, Number(config.bcrypt_salt_rounds));

  // 4. Save OTP in EmailVerificationDraft and link it to the draft
  await EmailVerificationDraft.create({
    email: payload.email,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
    lawyerDraftId: result._id,
  });

  // 5. Send email
  const verifyUrl = `${config.client_url}/verify-lawyer-registration?email=${payload.email}&otp=${otp}&draftId=${result._id}`;

  await sendEmail({
    to: payload.email,
    subject: 'Verification Link for Lawyer Registration',
    data: {
      name: payload.profile?.name || 'User',
      verifyUrl: verifyUrl,
      role: 'Lawyer',
    },
    emailTemplate: 'verify_email',
  });

  return result;
};

const updateLawyerRegistrationDraftInDB = async (draftId: string, payload: Partial<ILawyerRegistrationDraft>) => {
  const result = await LawyerRegistrationDraft.findByIdAndUpdate(draftId, payload, { new: true });
  if (!result) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'Draft not found');
  }
  return result;
};

const verifyLawyerRegistrationEmail = async (draftId: string, code: string) => {
  const draft = await LawyerRegistrationDraft.findById(draftId);
  if (!draft) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'Draft not found');
  }

  const otpRecord = await EmailVerificationDraft.findOne({
    lawyerDraftId: draftId,
    isUsed: false,
  });

  if (!otpRecord) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'Verification record not found or already verified');
  }

  if (new Date(otpRecord.expiresAt) < new Date()) {
    throw new AppError(HTTP_STATUS.GONE, 'Verification code has expired');
  }

  if (otpRecord.attempts >= 5) {
    throw new AppError(HTTP_STATUS.TOO_MANY_REQUESTS, 'Too many failed attempts. please request a new code');
  }

  const isMatched = await bcrypt.compare(code, otpRecord.otp);
  if (!isMatched) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid verification code');
  }

  otpRecord.isUsed = true;
  await otpRecord.save();

  // Update draft verification status
  draft.verification.isEmailVerified = true;
  draft.verification.verifiedAt = new Date();
  await draft.save();

  return { message: 'Email verified successfully' };
};









const commitLawyerRegistration = async (draftId: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const draft = await LawyerRegistrationDraft
      .findById(draftId)
      .session(session);

    if (!draft) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Draft not found');
    }

    if (!draft.verification.isEmailVerified) {
      throw new AppError(
        HTTP_STATUS.FORBIDDEN,
        'Email is not verified. Please verify your email first'
      );
    }



    const registrationPayload = {
      email: draft.email,
      password: draft.password,
      role: draft.role,
      regUserType: draft.regUserType,
      profile: draft.profile,
      companyInfo: draft.companyInfo,
      lawyerServiceMap: draft.lawyerServiceMap,
      isVerifiedAccount: true, // Mark as verified because draft email was verified
    } as unknown as IUser;




    // ✅ Create real user (must accept session internally)
    const result = await lawyerRegisterUserIntoDB(
      registrationPayload,
      session
    );

    // ✅ Cleanup draft data
    await LawyerRegistrationDraft.findByIdAndDelete(draftId).session(session);
    await EmailVerificationDraft.deleteMany({
      lawyerDraftId: draftId
    }).session(session);

    await session.commitTransaction();
    session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};















export const lawyerRegisterService = {
  lawyerRegisterUserIntoDB,
  lawyerRegistrationDraftInDB,
  updateLawyerRegistrationDraftInDB,
  verifyLawyerRegistrationEmail,
  commitLawyerRegistration
};
