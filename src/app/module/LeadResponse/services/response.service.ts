/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
import { validateObjectId } from '../../../utils/validateObjectId';
import UserProfile from '../../User/models/user.model';
import { sendNotFoundResponse } from '../../../errors/custom.error';
import CountryWiseServiceWiseField from '../../CountryWiseMap/models/countryWiseServiceWiseFields.model';
import { customCreditLogic } from '../utils/customCreditLogic';
import { ILeadResponse } from '../interfaces/response.interface';
import { LeadServiceAnswer } from '../../Lead/models/leadServiceAnswer.model';
import LeadResponse from '../models/response.model';
import { ActivityLog } from '../../Activity/models/activityLog.model';
import { calculateLawyerBadge } from '../../User/utils/getBadgeStatus';
import { createNotification } from '../../Notification/utils/createNotification';
import { USER_PROFILE, UserProfileEnum } from '../../User/constants/user.constant';
import config from '../../../config';
import { sendEmail } from '../../../emails/email.service';
import { IUser } from '../../Auth/interfaces/auth.interface';


const CreateResponseIntoDB = async (userId: string, payload: any) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');

  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }
  const responseUser = await LeadResponse.create({
    leadId: payload.leadId,
    responseBy: userProfile._id,
    serviceId: payload.serviceId,
  });

  return responseUser;
};


//  ---------------------------- GET ALL  RESPONSE ------------------------------------

 const getAllResponseFromDB = async () => {
  try {
    const pipeline = [
      { $match: { deletedAt: null } },

      // Lookup lawyer's userProfile (responder)
      {
        $lookup: {
          from: 'userprofiles',
          localField: 'responseBy',
          foreignField: '_id',
          as: 'lawyerProfile',
        },
      },
      { $unwind: '$lawyerProfile' },

      // Lookup lead's userProfile
      {
        $lookup: {
          from: 'userprofiles',
          localField: 'leadId',
          foreignField: '_id',
          as: 'leadProfile',
        },
      },
      { $unwind: '$leadProfile' },

      // Lookup service info
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'serviceData',
        },
      },
      { $unwind: '$serviceData' },

      // Lookup credit info from CountryServiceField
      {
        $lookup: {
          from: 'countrywiseservicewisefields',
          let: {
            countryId: '$leadProfile.country',
            serviceId: '$serviceId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$countryId', '$$countryId'] },
                    { $eq: ['$serviceId', '$$serviceId'] },
                    { $eq: ['$deletedAt', null] },
                  ],
                },
              },
            },
          ],
          as: 'creditInfo',
        },
      },

      // Final output projection
      {
        $project: {
          _id: 1,
          additionalDetails: 1,
          deletedAt: 1,
          createdAt: 1,
          updatedAt: 1,
          credit: {
            $ifNull: [{ $arrayElemAt: ['$creditInfo.baseCredit', 0] }, 0],
          },
          creditSource: {
            $cond: {
              if: { $gt: [{ $size: '$creditInfo' }, 0] },
              then: 'CountryServiceField',
              else: 'Default',
            },
          },
          service: {
            _id: '$serviceData._id',
            name: '$serviceData.name',
            slug: '$serviceData.slug',
            createdAt: '$serviceData.createdAt',
            updatedAt: '$serviceData.updatedAt',
          },
          lawyerProfile: {
            _id: '$lawyerProfile._id',
            user: '$lawyerProfile.user',
            name: '$lawyerProfile.name',
            profilePicture: '$lawyerProfile.profilePicture',
            phone: '$lawyerProfile.phone',
            bio: '$lawyerProfile.bio',
            country: '$lawyerProfile.country',
          },
          leadProfile: {
            _id: '$leadProfile._id',
            user: '$leadProfile.user',
            name: '$leadProfile.name',
            country: '$leadProfile.country',
          },
        },
      },
    ];

    const result = await LeadResponse.aggregate(pipeline);

    const combineCredit = await Promise.all(
      result.map(async (response) => {
        const plain = response.toObject ? response.toObject() : response;

        return {
          ...plain,
          credit: customCreditLogic(plain.credit),
        };
      })
    );

    return combineCredit;
  } catch (error) {
    console.error('Aggregation error:', error);
    throw error;
  }
};




//  ---------------------------- GET ALL MY  RESPONSE ------------------------------------

const getMyAllResponseFromDB = async (userId: string) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');
  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }

  const responses = await LeadResponse.find({
    // userProfileId: userProfile._id,
    responseBy: userProfile._id,
    deletedAt: null,
  })
    .populate({
      path: 'leadId',
      populate: {
        path: 'userProfileId',
        populate: {
          path: 'user',
          select: '_id name email',
        },
      },
    })
    .populate({
      path: 'serviceId',
    })
    .populate({
      path: 'responseBy',
      populate: {
        path: 'user',
        select: '_id name email',
      },
    });

  return responses;
};




//  ---------------------------- GET SINGLE RESPONSE ------------------------------------
const getSingleResponseFromDB = async (userId: string, responseId: string) => {
  validateObjectId(responseId, 'Response');

  const responseDoc = await LeadResponse.findById(responseId)
    .populate({
      path: 'responseBy',
      // path: 'userProfileId',
      populate: { path: 'user' },
    })
    .populate({
      path: 'serviceId',
    })
    .populate({
      path: 'leadId',
      populate: {
        path: 'userProfileId',
        populate: { path: 'user' },
      },
    })
    .lean(); // Convert to plain JS object

  if (!responseDoc) return null;

  // Fetch credit info in parallel
  const [creditInfo] = await Promise.all([
    CountryWiseServiceWiseField.findOne({
      // countryId: (responseDoc.userProfileId as any).country,
      countryId: (responseDoc.responseBy as any).country,
      serviceId: responseDoc.serviceId._id,
      deletedAt: null,
    }).lean(),
  ]);

  // Validate leadId
  if (
    !responseDoc.leadId ||
    typeof responseDoc.leadId !== 'object' ||
    !responseDoc.leadId._id
  ) {
    throw new Error(`Lead ID is missing or not populated in response for ID: ${responseId}`);
  }

  const leadObjectId = new mongoose.Types.ObjectId(String(responseDoc.leadId._id));

  const leadAnswers = await LeadServiceAnswer.aggregate([
    {
      $match: {
        leadId: leadObjectId,
        deletedAt: null,
      },
    },
    {
      $lookup: {
        from: 'questions',
        localField: 'questionId',
        foreignField: '_id',
        as: 'question',
      },
    },
    { $unwind: '$question' },
    {
      $lookup: {
        from: 'options',
        localField: 'optionId',
        foreignField: '_id',
        as: 'option',
      },
    },
    { $unwind: '$option' },
    {
      $sort: {
        'question.order': 1,
      },
    },
    {
      $group: {
        _id: '$question._id',
        questionId: { $first: '$question._id' },
        question: { $first: '$question.question' },
        order: { $first: '$question.order' },
        options: {
          $push: {
            $cond: [
              { $eq: ['$isSelected', true] },
              {
                optionId: '$option._id',
                option: '$option.name',
                isSelected: '$isSelected',
                idExtraData: '$idExtraData',
                order: '$option.order',
              },
              null,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        questionId: 1,
        question: 1,
        order: 1,
        options: {
          $filter: {
            input: '$options',
            as: 'opt',
            cond: { $ne: ['$$opt', null] },
          },
        },
      },
    },
    {
      $addFields: {
        options: {
          $sortArray: {
            input: '$options',
            sortBy: { order: 1 },
          },
        },
      },
    },
    {
      $project: {
        questionId: 1,
        question: 1,
        order: 1,
        options: {
          $map: {
            input: '$options',
            as: 'opt',
            in: {
              optionId: '$$opt.optionId',
              option: '$$opt.option',
              isSelected: '$$opt.isSelected',
              idExtraData: '$$opt.idExtraData',
            },
          },
        },
      },
    },
    {
      $sort: {
        order: 1,
      },
    },
    {
      $project: {
        questionId: 1,
        question: 1,
        options: 1,
      },
    },
  ]);



  const activity = await ActivityLog.find({
    objectId: new mongoose.Types.ObjectId(responseId),   // cast if you have a string
    // createdBy: new mongoose.Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })                              // newest → oldest
    .populate({
      path: 'createdBy',                                  // 1️⃣ first‑level: User
      select: 'email role profile',                       //   pull only what you need
      populate: {
        path: 'profile',                                  // 2️⃣ nested: UserProfile
        select: 'name',                                   //   grab the lawyer/client name
      },
    })
    .lean();


  return {
    ...responseDoc,
    leadAnswers,
    credit: creditInfo?.baseCredit ?? 0,
    creditSource: creditInfo ? 'CountryServiceField' : 'Default',
    activity
  };
};


//  ------------- GET ALL RESPONE LEAD WISE ------------------------------------

const getAllResponseLeadWiseFromDB = async (userId: string, leadId: string) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');
  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }

  const responses = await LeadResponse.find({
    leadId: leadId,
    deletedAt: null,
  })
    .populate({
      path: 'leadId',
      populate: {
        path: 'userProfileId',
        populate: {
          path: 'user',
          select: '_id name email',
        },
      },
    })
    .populate({
      path: 'serviceId',
    })
    .populate({
      path: 'responseBy',
      populate: {
        path: 'user',
        select: '_id name email',
      },
    });

  const combineCredit = await Promise.all(
    responses.map(async (response) => {
      const plain = response.toObject ? response.toObject() : response;
      const lawyerUserId = (plain as any)?.responseBy?.user?._id;
      const leadUserId = (plain as any)?.leadId?.userProfileId?.user?._id;
      const [lawyerBadge, leadBadge] = await Promise.all([
        lawyerUserId ? calculateLawyerBadge(lawyerUserId) : null,
        leadUserId ? calculateLawyerBadge(leadUserId) : null,
      ]);

      return {
        ...plain,
        lawyerBadge,
        leadBadge,

      };
    })
  );

  return combineCredit;
};










//  --------------- update Response Status -------------------------------------

const updateResponseStatus = async (
  responseId: string,
  status: ILeadResponse['status'],
  userId: string
) => {
  validateObjectId(responseId, 'Response');

  const result = await LeadResponse.findOneAndUpdate(
    { _id: responseId, deletedAt: null },
    { status },
    { new: true }
  );

  if (!result) return;

  // 🔍 Populate UserProfile with linked user (to get email)
  const userProfile = await UserProfile.findOne({ user: userId }).populate('user');
  if (!userProfile) return sendNotFoundResponse('User profile not found');

  const userEmail = (userProfile.user as IUser).email;
  if (!userEmail) return sendNotFoundResponse('Associated user email not found');

  // Count hired responses for this user profile
  const hireCount = await LeadResponse.countDocuments({
    responseBy: userProfile._id,
    status: 'hired',
  });

  let newProfileType: UserProfileEnum | undefined;
  if (hireCount >= 10) newProfileType = USER_PROFILE.PREMIUM;
  else if (hireCount >= 5) newProfileType = USER_PROFILE.EXPERT;

  // Only update if newProfileType is defined and different
  if (newProfileType && userProfile.profileType !== newProfileType) {
    userProfile.profileType = newProfileType;
    await userProfile.save();

    const roleLabel =
      newProfileType === USER_PROFILE.PREMIUM
        ? 'Premium Lawyer'
        : 'Expert Lawyer';

    const emailData = {
      name: userProfile.name,
      role: roleLabel,
      dashboardUrl: `${config.client_url}/lawyer/dashboard`,
      appName: 'The Law App',
    };

    await sendEmail({
      to: userEmail,
      subject: `🎉 Congrats! You're now a ${roleLabel}`,
      data: emailData,
      emailTemplate: 'lawyerPromotion',
    });
  }

  return result;
};






const deleteResponseFromDB = async (id: string) => {

  validateObjectId(id, 'Response');
  const deletedAt = new Date().toISOString();

  const result = await LeadResponse.findByIdAndUpdate(
    id,
    { deletedAt: deletedAt },
    {
      new: true,
    },
  );
  return result;
};




export const responseService = {
  CreateResponseIntoDB,
  getAllResponseFromDB,
  getSingleResponseFromDB,
  updateResponseStatus,
  deleteResponseFromDB,
  getMyAllResponseFromDB,
  getAllResponseLeadWiseFromDB
};
