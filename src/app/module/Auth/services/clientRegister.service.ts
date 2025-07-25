/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import UserProfile from '../../User/models/user.model';
import { AppError } from '../../../errors/error';
import { HTTP_STATUS } from '../../../constant/httpStatus';
import User from '../models/auth.model';
import ZipCode from '../../Country/models/zipcode.model';
import { UserLocationServiceMap } from '../../LeadSettings/models/UserLocationServiceMap.model';
import { createToken } from '../utils/auth.utils';
import config from '../../../config';
import { StringValue } from 'ms';
import { USER_ROLE } from '../../../constant';
import Lead from '../../Lead/models/lead.model';

import { LeadServiceAnswer } from '../../Lead/models/leadServiceAnswer.model';
import { Types } from 'mongoose';
import { REGISTER_USER_TYPE } from '../constant/auth.constant';
import { generateRegistrationEmail } from '../../../emails/templates/registrationEmail';
import { sendEmail } from '../../../emails/email.service';
import Service from '../../Service/models/service.model';
import CountryWiseServiceWiseField from '../../CountryWiseMap/models/countryWiseServiceWiseFields.model';



const clientRegisterUserIntoDB = async (payload: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { leadDetails, countryId, serviceId, questions } = payload;

    // findout existing user
    const existingUser = await User.isUserExistsByEmail(payload.email);
    if (existingUser) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'This user already exists!');
    }

    const userData = {
      email: leadDetails.email,
      role: USER_ROLE.USER,
      regUserType: REGISTER_USER_TYPE.CLIENT,
      password: config.default_password,
    };

    // create new user
    const [newUser] = await User.create([userData], { session });

    // get zipcode detail
    const address = await ZipCode.findById(leadDetails.zipCode);

    // create new userProfile
    const profileData = {
      user: newUser._id,
      country: countryId,
      name: leadDetails.name,
      phone: leadDetails.phone,
      address: address ? address.zipcode : '',
      zipCode: leadDetails?.zipCode
    };
    const [newProfile] = await UserProfile.create([profileData], { session });

    newUser.profile = new Types.ObjectId(newProfile._id);
    await newUser.save({ session });

    // ✅ if registration user type is client then create lead 

    const creditInfo = await CountryWiseServiceWiseField.findOne({
      countryId,
      serviceId,
      deletedAt: null,
    }).select('baseCredit');

    if (newUser.regUserType === REGISTER_USER_TYPE.CLIENT) {
      const [leadUser] = await Lead.create(
        [
          {
            userProfileId: newProfile._id,
            countryId,
            serviceId,
            additionalDetails: leadDetails.additionalDetails || '',
            budgetAmount: leadDetails.budgetAmount || '',
            locationId: leadDetails.zipCode,
            credit: creditInfo?.baseCredit,
            leadPriority:leadDetails?.leadPriority
          },
        ],
        { session },
      );

      // ✅ Only insert selected answers from `questions` (frontend)
      const leadDocs: any[] = [];

      for (const q of questions) {
        const questionId = q.questionId;
        for (const opt of q.checkedOptionsDetails) {
          leadDocs.push({
            leadId: leadUser._id,
            serviceId,
            questionId,
            optionId: opt.id,
            isSelected: opt.is_checked,
            idExtraData: opt.idExtraData || '',
          });
        }
      }

      if (leadDocs.length > 0) {
        await LeadServiceAnswer.insertMany(leadDocs, { session });
      }
    }

    // ✅ location  realated 
    const locationGroup = await ZipCode.findOne({
      countryId: newProfile?.country,
      zipCodeType: 'default',
    });

    const userLocationServiceMapData = {
      userProfileId: newProfile._id,
      locationGroupId: locationGroup?._id,
      locationType: 'nation_wide',
      serviceIds: [],
    };
    await UserLocationServiceMap.create([userLocationServiceMapData], {
      session,
    });

    await session.commitTransaction();
    session.endSession();


    // -------------------------------------   send email -------------------------------------------


    const service = await Service.findById(serviceId).select('name');

    const emailData = {
      name: newProfile?.name,
      caseType: service?.name || 'Not specified',
      involvedMembers: leadDetails?.involvedMembers || 'Self',
      preferredServiceType: leadDetails?.preferredServiceType || 'Not specified',
      likelihoodOfHiring: leadDetails?.likelihoodOfHiring || 'Not sure',
      preferredContactTime: leadDetails?.preferredContactTime || 'Anytime',
      dashboardUrl: `${config.client_url}/client/dashboard/my-leads`,
      appName: 'The Law App',
      email: 'support@yourdomain.com',
    };

    await sendEmail({
      to: newUser.email,
      subject: 'Lead Registration & Submission Confirmation',
      data: emailData,
      emailTemplate: 'welcome_to_client',
    });



    //  -------------- send lead email for all valid user email ------


    // alert: ---- it will use next time ----

    //  const maskPhone = (phone: string) =>
    //     phone?.slice(0, 3) + '****' + phone?.slice(-2);

    //   const maskEmail = (email: string) => {
    //     const [user, domain] = email.split('@');
    //     const maskedUser = user.length <= 2 ? '*'.repeat(user.length) : user.slice(0, 2) + '*'.repeat(user.length - 2);
    //     return `${maskedUser}@${domain}`;
    //   };

    //   // Build new lead alert data
    //   const newLeadsAlertData = {
    //     name: newProfile?.name || 'No Name',
    //     service: service?.name || 'Unknown Service',
    //     location: address?.zipcode || 'Unknown Location',
    //     phoneMasked: maskPhone(newProfile?.phone || ''),
    //     emailMasked: maskEmail(newUser.email),
    //     creditsRequired: 1, // Or calculate dynamically based on your pricing logic
    //     contactUrl: `${config.client_url}/client/contact/${newUser._id}`, // Adjust if needed
    //     oneClickUrl: `${config.client_url}/client/contact/${newUser._id}?oneClick=true`, // Optional
    //     customResponseUrl: `${config.client_url}/client/respond/${newUser._id}`, // Optional
    //     appName: 'The Law App',
    //     projectDetails: leadDetails?.additionalDetails || 'No additional details provided.',
    //   };

    //   await sendEmail({
    //     to: newUser.email,
    //     subject: 'New Lead Registration and Submission',
    //     data: newLeadsAlertData,
    //     emailTemplate: 'new_lead_alert',
    //   });





    // const { subject, text, html } = generateRegistrationEmail({
    //   name: newProfile?.name || 'User',
    //   email: newUser.email,
    //   defaultPassword:config.default_password,
    //   loginUILink: `${config.client_url}/login`,
    //   appName: 'The Law App',
    // });

    // await sendEmail({
    //   to: newUser.email,
    //   subject,
    //   text,
    //   html,
    // });


    // ------------------------- token genrator ----------------------------------------
    const jwtPayload = {
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
      accountStatus: newUser.accountStatus,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as StringValue,
      config.jwt_access_expires_in as StringValue,
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as StringValue,
      config.jwt_refresh_expires_in as StringValue,
    );

    return {
      accessToken,
      refreshToken,
      userData: newUser,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const clientRegisterService = {
  clientRegisterUserIntoDB,
};



