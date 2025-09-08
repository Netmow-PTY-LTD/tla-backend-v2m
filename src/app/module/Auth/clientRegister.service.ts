/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import UserProfile from '../User/user.model';
import { AppError } from '../../errors/error';
import { HTTP_STATUS } from '../../constant/httpStatus';
import User from './auth.model';
import ZipCode from '../Country/zipcode.model';
import { UserLocationServiceMap } from '../LeadSettings/UserLocationServiceMap.model';
import { createToken } from './auth.utils';
import config from '../../config';
import { StringValue } from 'ms';
import { USER_ROLE } from '../../constant';
import Lead from '../Lead/lead.model';

import { LeadServiceAnswer } from '../Lead/leadServiceAnswer.model';
import { Types } from 'mongoose';
import { REGISTER_USER_TYPE } from './auth.constant';
import { sendEmail } from '../../emails/email.service';
import Service from '../Service/service.model';
import CountryWiseServiceWiseField from '../CountryWiseMap/countryWiseServiceWiseFields.model';
import Option from '../Option/option.model';
import ServiceWiseQuestion from '../Question/question.model';
import { generateRandomPassword } from './generateRandomPassword';


const clientRegisterUserIntoDB = async (payload: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let leadUser: any = null;


  try {
    const { leadDetails, addressInfo, countryId, serviceId, questions } = payload;

    // findout existing user
    const existingUser = await User.isUserExistsByEmail(payload.email);
    if (existingUser) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'Account alredy exists with the email. Please! login with existing email or use new email');
    }

    const defaultPassword = generateRandomPassword(8);

    const userData = {
      email: leadDetails.email,
      role: USER_ROLE.USER,
      regUserType: REGISTER_USER_TYPE.CLIENT,
      // password: config.default_password,
      password: defaultPassword,
    };

    // create new user
    const [newUser] = await User.create([userData], { session });

    // get zipcode detail
    // const address = await ZipCode.findById(leadDetails.zipCode);

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


    // create new userProfile
    const profileData = {
      user: newUser._id,
      country: countryId,
      name: leadDetails.name,
      phone: leadDetails.phone,
      address: leadDetails.zipCode,
      zipCode: zipCode?._id
    };
    const [newProfile] = await UserProfile.create([profileData], { session });

    newUser.profile = new Types.ObjectId(newProfile._id);
    await newUser.save({ session });

    // ✅ if registration user type is client then create lead 

    const creditInfo = await CountryWiseServiceWiseField.findOne({
      countryId,
      serviceId,
    }).select('baseCredit');

    let formattedAnswers = '';
    if (newUser.regUserType === REGISTER_USER_TYPE.CLIENT) {
      [leadUser] = await Lead.create(
        [
          {
            userProfileId: newProfile._id,
            countryId,
            serviceId,
            additionalDetails: leadDetails.additionalDetails || '',
            budgetAmount: leadDetails.budgetAmount ?? 0,
            locationId: zipCode?._id,
            credit: creditInfo?.baseCredit,
            leadPriority: leadDetails?.leadPriority
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


        //  --------------------  Lead Answer Format for Email sending

        const questionIds = [...new Set(questions.map((q: any) => q.questionId))];
        const optionIds = [
          ...new Set(
            questions.flatMap((q: any) =>
              q.checkedOptionsDetails.map((opt: any) => opt.id),
            ),
          ),
        ];

        const questionDocs = await ServiceWiseQuestion.find({
          _id: { $in: questionIds },
        })
          .select('question')
          .session(session)
          .lean();

        const optionDocs = await Option.find({ _id: { $in: optionIds } })
          .select('name')
          .session(session)
          .lean();

        const questionMap = new Map(questionDocs.map(q => [q._id.toString(), q.question]));
        const optionMap = new Map(optionDocs.map(opt => [opt._id.toString(), opt.name]));

        formattedAnswers = questions
          .map((q: any) => {
            const questionText = questionMap.get(q.questionId) || 'Unknown Question';
            const selectedOptions = q.checkedOptionsDetails
              .filter((opt: any) => opt.is_checked)
              .map((opt: any) => optionMap.get(opt.id) || 'Unknown Option')
              .join(', ');

            return `
          <p style="margin-bottom: 8px;">
               <strong>${questionText}</strong><br/>
           <span>${selectedOptions || 'No selection'}</span>
          </p>`;
          })
          .join('');

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

    const service = await Service.findById(serviceId).select('name').session(session);


    // -------------------------------------   send email -------------------------------------------

    const leadData = {
      name: newProfile?.name,
      caseType: service?.name || 'Not specified',
      leadAnswer: formattedAnswers,
      preferredContactTime: leadDetails?.leadPriority || 'not sure',
      additionalDetails: leadDetails.additionalDetails || '',
      dashboardUrl: `${config.client_url}/client/dashboard/my-cases`,
      appName: 'The Law App',
      email: 'support@yourdomain.com',
    };

    await sendEmail({
      to: newUser.email,
      subject: "We've received your legal request — Awaiting approval",
      data: leadData,
      emailTemplate: 'welcome_Lead_submission',
    });
    const clientData = {
      name: newProfile?.name,
      email: newUser?.email,
      // defaultPassword: config.default_password,
      defaultPassword: defaultPassword,
      dashboardUrl: `${config.client_url}/client/dashboard`,
    };

    await sendEmail({
      to: newUser.email,
      subject: 'Thank you for Registering',
      data: clientData,
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



    // ------------------------- token genrator ----------------------------------------
    const jwtPayload = {
      userId: newUser._id,
      email: newUser.email,
      country: newProfile.country,
      role: newUser.role,
      regUserType: newUser.regUserType,
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

    //  Save accessToken in DB for email verification
    newUser.verifyToken = accessToken;
    await newUser.save({ session });
    //  Send Email Verification Email
    const emailVerificationUrl = `${config.client_url}/verify-email?code=${accessToken}`;
    await sendEmail({
      to: newUser.email,
      subject: 'Verify your account – TheLawApp',
      data: {
        name: newProfile?.name,
        verifyUrl: emailVerificationUrl,
        role: 'Client'
      },
      emailTemplate: 'verify_email',
    });

    await session.commitTransaction();
    session.endSession();


    return {
      accessToken,
      refreshToken,
      userData: newUser,
      leadUser,

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



