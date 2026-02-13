/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from "mongoose";
import User from "../Auth/auth.model";
import { AppError } from "../../errors/error";
import { HTTP_STATUS } from "../../constant/httpStatus";
import ZipCode from "../Country/zipcode.model";
import UserProfile from "../User/user.model";
import { LawyerRequestAsMember } from "../../firmModule/lawyerRequest/lawyerRequest.model";
import { REGISTER_USER_TYPE, USER_STATUS } from "../Auth/auth.constant";
import { LawyerServiceMap } from "../User/lawyerServiceMap.model";
import { LocationType } from "../UserLocationServiceMap/userLocationServiceMap.interface";
import { UserLocationServiceMap } from "../UserLocationServiceMap/UserLocationServiceMap.model";
import { createLeadService, updateLeadService } from "../Auth/lawyerRegister.utils";
import Service from "../Service/service.model";
import config from "../../config";
import { sendEmail } from "../../emails/email.service";
import { createToken } from "../Auth/auth.utils";
import { StringValue } from "ms";
import FirmUser from "../../firmModule/FirmAuth/frimAuth.model";
import { Firm_USER_ROLE } from "../../firmModule/FirmAuth/frimAuth.constant";
import { IUser } from "../Auth/auth.interface";





const lawyerRegisterUserIntoDB = async (userId: string, payload: IUser) => {
  // Start a database session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the user already exists by email
    const existingUser = await User.isUserExistsByEmail(payload.email);
    if (existingUser) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'Account alredy exists with the email. Please! login with existing email or use new email');
    }

    // Separate the profile data from the user data
    const { profile, lawyerServiceMap, companyInfo, ...userData } = payload;
    // Create the user document in the database
    const [newUser] = await User.create([{ ...userData, createdBy: userId }], { session });
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
        console.error("Zip Code save error:", err);
      }
    }


    // Prepare the profile data with a reference to the user
    const profileData = {
      ...profile,
      user: newUser._id,
      phone: userData?.phone || newUser?.phone,
      address: zipCode?.zipcode,
      zipCode: zipCode?._id,
      lawyerContactEmail: newUser?.email,
       bio:`<p>This is a sample profile description showing how your professional biography will appear on TheLawApp.</p><p>This section allows legal professionals to introduce their background, experience, and approach to client service. A clear and professional profile helps clients understand what to expect when seeking legal assistance and builds confidence before making contact.</p><p>Use this space to outline your qualifications, areas of experience, and how you support clients throughout the legal process. Clear communication, transparency, and professionalism are key to building trust.</p><p>Once updated, this demo content will be replaced by your own profile description and displayed publicly on your TheLawApp profile.</p><p>(This is placeholder text. Please replace it with your own professional biography.)</p>`
    };

    // Create the user profile document in the database
    const [newProfile] = await UserProfile.create([profileData], { session });

    // Link the profile to the newly created user
    newUser.profile = new Types.ObjectId(newProfile._id);
    await newUser.save({ session });

    // compnay profile map create

    if (companyInfo?.companyTeam) {



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


    if (newUser.regUserType === REGISTER_USER_TYPE.LAWYER) {
      const lawyerServiceMapData = {
        ...lawyerServiceMap,
        zipCode: zipCode?._id,
        userProfile: newProfile._id,
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

    //  Create lead service entries using session
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
      subject: 'Your Lawyer Account Has Been Activated on TheLawApp',
      data: commonEmailData,
      emailTemplate: "welcome_to_lawyer_by_marketer",
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
      userData: newUser,
    };
  } catch (error) {
    // If an error occurs, abort the transaction to avoid incomplete data
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};






const updateLawyerIntoDB = async (currentUserId: string, id: string, payload: IUser) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { profile, lawyerServiceMap, ...userData } = payload;

    const user = await User.findById(id).session(session);

    if (!user) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    // Update User
    if (Object.keys(userData).length > 0) {
      await User.findByIdAndUpdate(id, { ...userData, updatedBy: currentUserId }, { session, new: true });
    }

    // Update Profile
    if (profile) {
      await UserProfile.findOneAndUpdate({ user: id }, { ...profile, phone:userData.phone, updatedBy: currentUserId }, { session, new: true });
    }

    // Update LawyerServiceMap and Address
    if (lawyerServiceMap) {
      const addressInfo = lawyerServiceMap?.addressInfo;
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
          console.error("Zip Code save error:", err);
        }
      }

      // Update Profile with new address if zipCode changed or exists
      if (zipCode) {
        await UserProfile.findOneAndUpdate(
          { user: id },
          {
            address: zipCode.zipcode,
            zipCode: zipCode._id,
          },
          { session }
        );
      }

      // Update LawyerServiceMap
      const lawyerServiceMapData: any = { ...lawyerServiceMap };
      if (zipCode) {
        lawyerServiceMapData.zipCode = zipCode._id;
      }

   await LawyerServiceMap.findOneAndUpdate(
        { userProfile: user.profile },
        {
          ...lawyerServiceMapData, updatedBy: currentUserId
        },
        { session, new: true, upsert: true } // Upsert if somehow missing
      );


      // Update UserLocationServiceMap if services or range changed
      // We need default location group for nation wide
      // And finding existing location maps might be complex, so we can regeneration or update.
      // For simplicity and correctness with the complex create logic, let's update if present.

      if (user.profile) {
        // Update NATION_WIDE
        if (lawyerServiceMap.services) {
          await UserLocationServiceMap.findOneAndUpdate(
            { userProfileId: user.profile, locationType: LocationType.NATION_WIDE },
            { serviceIds: lawyerServiceMap.services },
            { session }
          );
        }

        // Update DISTANCE_WISE
        const distUpdate: any = {};
        if (lawyerServiceMap.rangeInKm) distUpdate.rangeInKm = lawyerServiceMap.rangeInKm;
        if (lawyerServiceMap.services) distUpdate.serviceIds = lawyerServiceMap.services;
        if (zipCode) distUpdate.locationGroupId = zipCode._id; // Update location center if address changed

        if (Object.keys(distUpdate).length > 0) {
          await UserLocationServiceMap.findOneAndUpdate(
            { userProfileId: user.profile, locationType: LocationType.DISTANCE_WISE },
            distUpdate,
            { session }
          );
        }
      }

      // Update Lead Service
      if (lawyerServiceMap.services) {
        await updateLeadService(user._id, lawyerServiceMap.services, session);
      }
    }

    // Company Info Update - if needed (Logic from create: LawyerRequestAsMember)
    // Assuming edit might not re-trigger request logic unless specified, 
    // but if they change companyName, maybe? 
    // Leaving out complex firm request logic for 'Edit' unless requested, as it implies state change (pending/etc).

    await session.commitTransaction();
    session.endSession();

    return await User.findById(id).populate('profile');

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};



const getLawyerFromDB = async (id: string) => {
  const user = await User.findById(id).populate('profile');

  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  const lawyerServiceMap = await LawyerServiceMap.findOne({ userProfile: user.profile }).populate('zipCode');

  // We might want to retrieve location service maps if they contain distinct info, 
  // but usually LawyerServiceMap holds the configuration.

  return {
    userData: user,
    profile: user.profile,
    lawyerServiceMap,
  };
};


const deleteLawyerFromDB = async (id: string, performBy: string) => {
  const user = await User.findById(id);

  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // Soft delete
  user.deletedAt = new Date();

  // Set deletedBy
  user.deletedBy = new mongoose.Types.ObjectId(performBy);

  // Optionally set status to archived if that's the business logic, but deletedAt is key.
  user.accountStatus = USER_STATUS.ARCHIVED;

  await user.save();

  return user;
};

export const marketingService = {
  lawyerRegisterUserIntoDB,
  updateLawyerIntoDB,
  getLawyerFromDB,
  deleteLawyerFromDB
};
