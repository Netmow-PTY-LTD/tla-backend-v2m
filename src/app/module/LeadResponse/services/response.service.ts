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
import { createNotification } from '../../Notification/utils/createNotification';
import { USER_PROFILE, UserProfileEnum } from '../../User/constants/user.constant';
import config from '../../../config';
import { sendEmail } from '../../../emails/email.service';
import { IUser } from '../../Auth/interfaces/auth.interface';
import { logActivity } from '../../Activity/utils/logActivityLog';
import { getIO } from '../../../sockets';
import Lead from '../../Lead/models/lead.model';
import { IUserProfile } from '../../User/interfaces/user.interface';


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

// const getMyAllResponseFromDB = async (userId: string) => {
//   const userProfile = await UserProfile.findOne({ user: userId }).select('_id');
//   if (!userProfile) {
//     return sendNotFoundResponse('User profile not found');
//   }

//   const responses = await LeadResponse.find({
//     responseBy: userProfile._id,
//     deletedAt: null,
//   })
//     .populate({
//       path: 'leadId',
//       populate: {
//         path: 'userProfileId',
//         populate: {
//           path: 'user',
//           select: '_id name email',
//         },
//       },
//     })
//     .populate({
//       path: 'serviceId',
//     })
//     .populate({
//       path: 'responseBy',
//       populate: {
//         path: 'user',
//         select: '_id name email',
//       },
//     });

//   return responses;
// };

type TMeta = {
  total: number;     // Total number of documents
  page: number;      // Current page
  limit: number;     // Number of items per page
  totalPage: number; // Total pages (Math.ceil(total / limit))
};

type PaginatedResult<T> = {
  data: T[];
  pagination: TMeta;
  responseCount?: {
    hired: number;
    pending: number;
    archive: number;
    urgent: number;
  };
};


const getMyAllResponseFromDB = async (
  userId: string,
  filters: any = {},
  options: { page: number; limit: number; sortBy: string; sortOrder: 'asc' | 'desc' }
): Promise<PaginatedResult<any>> => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');


  // Pagination and Sorting Defaults
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sortField = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder === 'asc' ? 1 : -1;

  const pipeline: any[] = [
    {
      $match: {
        responseBy: userProfile?._id,
        deletedAt: null,
      },
    },
    {
      $lookup: {
        from: 'userprofiles',
        localField: 'responseBy',
        foreignField: '_id',
        as: 'responseBy',
      },
    },
    { $unwind: '$responseBy' },
    {
      $lookup: {
        from: 'users',
        localField: 'responseBy.user',
        foreignField: '_id',
        as: 'responseBy.user',
      },
    },
    { $unwind: '$responseBy.user' },
    {
      $lookup: {
        from: 'leads',
        localField: 'leadId',
        foreignField: '_id',
        as: 'leadId',
      },
    },
    { $unwind: '$leadId' },
    {
      $lookup: {
        from: 'userprofiles',
        localField: 'leadId.userProfileId',
        foreignField: '_id',
        as: 'leadId.userProfileId',
      },
    },
    { $unwind: '$leadId.userProfileId' },


    {
      $lookup: { from: 'users', localField: 'leadId.userProfileId.user', foreignField: '_id', as: 'leadId.userProfileId.user' }
    },
    {
      $unwind: { path: '$leadId.userProfileId.user', preserveNullAndEmptyArrays: true }
    },


    {
      $lookup: {
        from: 'services',
        localField: 'serviceId',
        foreignField: '_id',
        as: 'serviceId',
      },
    },
    { $unwind: '$serviceId' },
  ];

  // ---------- FILTERS ----------
  const match: any = {};

  // Keyword Search
  if (filters.keyword) {
    match.$or = [
      { 'leadId.additionalDetails': { $regex: filters.keyword, $options: 'i' } },
      { 'leadId.userProfileId.name': { $regex: filters.keyword, $options: 'i' } },
      { 'leadId.userProfileId.businessName': { $regex: filters.keyword, $options: 'i' } },
    ];
  }

  // Spotlight (leadPriority)
  if (filters.spotlight?.length) {
    match['leadId.leadPriority'] = { $in: filters.spotlight };
  }

  // Client Actions (e.g., status)
  if (filters.clientActions?.length) {
    match['leadId.status'] = { $in: filters.clientActions };
  }

  // Actions Taken (status in LeadResponse)
  if (filters.actionsTaken?.length) {
    match.status = { $in: filters.actionsTaken };
  }

  // Date Filter
  if (filters.leadSubmission) {
    const now = new Date();
    let startDate: Date | null = null;
    switch (filters.leadSubmission) {
      case 'last-hour': startDate = new Date(Date.now() - 60 * 60 * 1000); break;
      case 'today': startDate = new Date(now.setHours(0, 0, 0, 0)); break;
      case 'yesterday': startDate = new Date(now.setDate(now.getDate() - 1)); break;
      case '3days-ago': startDate = new Date(now.setDate(now.getDate() - 3)); break;
      case '7days-ago': startDate = new Date(now.setDate(now.getDate() - 7)); break;
      case '2weeks-ago': startDate = new Date(now.setDate(now.getDate() - 14)); break;
      case 'last-month': startDate = new Date(now.setMonth(now.getMonth() - 1)); break;
      case 'six-month': startDate = new Date(now.setMonth(now.getMonth() - 6)); break;
      case 'last-year': startDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
      case 'one-year-ago': startDate = new Date(0); break;
    }

    if (startDate) {
      match.createdAt = { $gte: startDate };
    }
  }

  if (Object.keys(match).length) {
    pipeline.push({ $match: match });
  }

  // ---------- PROJECTION ----------

  pipeline.push({
    $project: {
      _id: 1,
      status: 1,
      createdAt: 1,
      responseBy: 1,
      leadId: 1,
      serviceId: 1,
    },
  });


  // ---------- FACET: Data + Counts ----------
  pipeline.push({
    $facet: {
      data: [
        {
          $project: {
            _id: 1,
            status: 1,
            createdAt: 1,
            responseBy: 1,
            leadId: 1,
            serviceId: 1,
          }
        },
        { $sort: { [sortField]: sortOrder } },
        { $skip: skip },
        { $limit: limit },
      ],
      metaCounts: [
        {
          $group: {
            _id: null,
            totalHired: {
              $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] },
            },
            totalPending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
            totalArchive: {
              $sum: { $cond: [{ $eq: ['$status', 'archive'] }, 1, 0] },
            },
            totalUrgent: {
              $sum: { $cond: [{ $eq: ['$leadId.leadPriority', 'urgent'] }, 1, 0] },
            },
            total: { $sum: 1 },
          },
        },
      ],
    },
  });




  // ---------- SORTING ----------
  // pipeline.push({ $sort: { [sortField]: sortOrder } });

  // // ---------- PAGINATION ----------
  // pipeline.push({ $skip: skip });
  // pipeline.push({ $limit: limit });

  // ---------- EXECUTE ----------
  // const responses = await LeadResponse.aggregate(pipeline);

  // Total Count for pagination
  // const countPipeline = [...pipeline];
  // countPipeline.splice(countPipeline.findIndex(stage => stage.$skip), 2); // remove skip & limit
  // countPipeline.push({ $count: 'total' });
  // const totalResult = await LeadResponse.aggregate(countPipeline);
  // const total = totalResult[0]?.total || 0;



  // return {
  //   data: responses || [],
  //   pagination: {
  //     total,
  //     page,
  //     limit,
  //     totalPage: Math.ceil(total / limit),
  //   },
  // };



  // ---------- EXECUTE ----------
  const result = await LeadResponse.aggregate(pipeline);
  const totalResult = result[0]?.data || [];
  const meta = result[0]?.metaCounts?.[0] || {};

  return {
    data: totalResult,
    pagination: {
      total: meta.total || 0,
      page,
      limit,
      totalPage: Math.ceil((meta.total || 0) / limit),
    },
    responseCount: {
      hired: meta.totalHired || 0,
      pending: meta.totalPending || 0,
      archive: meta.totalArchive || 0,
      urgent: meta.totalUrgent || 0,
    },
  };





};




//  ---------------------------- GET SINGLE RESPONSE ------------------------------------
const getSingleResponseFromDB = async (userId: string, responseId: string) => {
  validateObjectId(responseId, 'Response');

  const responseDoc = await LeadResponse.findById(responseId)
    .populate({
      path: 'responseBy',
      populate: { path: 'user' },
    })
    .populate({
      path: 'serviceId',
    })
    .populate({
      path: 'leadId',
      populate: [
        {
          path: 'userProfileId',
          populate: { path: 'user' },
        },
        {
          path: 'hiredBy',
          populate: { path: 'user' },
        }
      ],
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
    throw new Error(`Case ID is missing or not populated in response for ID: ${responseId}`);
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


  // ----------------- 🔹 HARD-CODED ANSWER OBJECT BASE ONE LEAD PRIORITY ANSWER ---------------------------
  const hardCodedAnswer = {
    questionId: 'qqqqqqqqqqqqqqqqqqqqqqqq', // 24 'q' characters
    question: 'When are you looking to get started?',
    options: [
      {
        optionId: 'oooooooooooooooooooooooo', // 24 'o' characters
        option: (responseDoc?.leadId as any).leadPriority,
        isSelected: true,
        idExtraData: '',
      },
    ],
  };



  // Add hardcoded data into leadAnswers
  leadAnswers.push(hardCodedAnswer);


  const activity = await ActivityLog.find({
    objectId: new mongoose.Types.ObjectId(responseId),   // cast if you have a string
    // createdBy: new mongoose.Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 }).populate({
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
      populate: [
        {
          path: 'user',
          select: '_id name email',
        },
        {
          path: 'serviceIds',
        },
      ],
    });



  return responses;

};










//  --------------- update Response Status -------------------------------------



interface PopulatedLeadUser {
  responseBy: {
    user: IUser & { _id: Types.ObjectId };
  },
  leadId: {
    _id: Types.ObjectId
    userProfileId: {
      user: IUser & { _id: Types.ObjectId };
      _id: Types.ObjectId;
    };
  };
}





const updateResponseStatus = async (
  responseId: string,
  status: ILeadResponse['status'],
  userId: string
) => {
  const io = getIO();
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
      appName: 'TheLawApp',
    };


    await sendEmail({
      to: userEmail,
      subject: `🎉 Congrats! Your profile has been upgraded to ${roleLabel}.`,
      data: emailData,
      emailTemplate: 'lawyerPromotion',
    });




  }


  //  ------------ for Notifiction and Activity logic here --------------------------
  const leadUser = await LeadResponse.findById(responseId)
    .populate([
      {
        path: 'leadId',
        populate: {
          path: 'userProfileId',
          populate: {
            path: 'user',
            model: 'User',
            select: 'email role',
          },
        },
      },
      {
        path: 'responseBy',
        model: 'UserProfile',
      },
    ])
    .lean<PopulatedLeadUser>();

  const possibleToUser = leadUser?.leadId?.userProfileId?.user?._id?.toString();
  const leadId = leadUser?.leadId?._id
  const responseByUser = leadUser?.responseBy?.user?.toString();


  // ✅ Ensure current and other user are correctly identified
  let currentUserId: string | null = null;
  let otherUserId: string | null = null;

  if (userId === possibleToUser) {
    currentUserId = userId;
    otherUserId = responseByUser ?? null;
  } else {
    currentUserId = userId;
    otherUserId = possibleToUser ?? null;
  }

  // 🚫 Exit if either ID is missing
  if (!currentUserId || !otherUserId) return;



  if (!currentUserId || !otherUserId) return;

  await logActivity({
    createdBy: currentUserId,
    activityNote: `Response status updated to "${status}"`,
    activityType: status,
    module: 'response',
    objectId: responseId,
    extraField: {
      leadId: result.leadId,
      affectedUser: otherUserId,
    },
  });


  // 🔔 Notifications
  await createNotification({
    userId: currentUserId,
    toUser: otherUserId,
    title: `Response Status Changed`,
    message: `The status of your response has been updated to "${status}". Please check for details.`,
    module: 'response',
    type: status,
    link: `/lawyer/dashboard/my-responses?responseId=${responseId}`,
  });

  await createNotification({
    userId: otherUserId,
    toUser: currentUserId,
    title: `Response Status Changed`,
    message: `The response status has been successfully updated to "${status}".`,
    module: 'response',
    type: status,
    link: `/client/dashboard/my-cases/${leadId}`,
  });

  // 📡 Emit socket notifications
  io.to(`user:${currentUserId}`).emit('notification', {
    userId: currentUserId,
    toUser: otherUserId,
    title: `Response Status Changed`,
    message: `The status of your response has been updated to "${status}". Please check for details.`,
    module: 'response',
    type: status,
    link: `/lawyer/dashboard/my-responses?responseId=${responseId}`,
  });

  io.to(`user:${otherUserId}`).emit('notification', {
    userId: otherUserId,
    toUser: currentUserId,
    title: `Response Status Changed`,
    message: `The response status has been successfully updated to "${status}".`,
    module: 'response',
    type: status,
    link: `/client/dashboard/my-cases/${leadId}`,
  });


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





//  --------------------  send hire request ----------------------------

// const sendHireRequest = async (
//   responseId: string,
//   userId: string,
//   hireMessage?: string
// ) => {
//   const response = await LeadResponse.findById(responseId);
//   if (!response) {
//     return { success: false, message: "Response not found" };
//   }

//   if (response.isHireRequested) {
//     return { success: false, message: "Hire request already sent" };
//   }
//   const userProfile = await UserProfile.findOne({ user: userId }).populate('user');

//   if (!userProfile) {
//     return { success: false, message: "User profile not found!" };
//   }
//   response.isHireRequested = true;
//   response.hireRequestedBy = new Types.ObjectId(userProfile?._id);
//   response.status = "hire_requested";
//   response.hireMessage = hireMessage || null;
//   response.isHireRequestedAt = new Date();


//   await response.save();

//   return { success: true, message: "Hire request sent successfully", response };
// };
const sendHireRequest = async (
  responseId: string,
  userId: string,
  hireMessage?: string
) => {
  const response = await LeadResponse.findById(responseId);
  if (!response) {
    return { success: false, message: "Response not found" };
  }

  if (response.isHireRequested) {
    return { success: false, message: "Hire request already sent" };
  }
  const userProfile = await UserProfile.findOne({ user: userId }).populate('user');

  if (!userProfile) {
    return { success: false, message: "User profile not found!" };
  }
  response.isHireRequested = true;
  response.hireRequestedBy = new Types.ObjectId(userProfile?._id);
  response.status = "hire_requested";
  response.hireMessage = hireMessage || null;
  response.isHireRequestedAt = new Date();


  await response.save();

  // 5️⃣ Log activity
  await logActivity({
    createdBy: userProfile._id,
    activityNote: `Sent a hire request to the lawyer${hireMessage ? ` with message: "${hireMessage}"` : ""}`,
    activityType: "hire_request",
    module: "response",
    objectId: responseId,
    extraField: {
      hireMessage: hireMessage || null,
      responseId,
    },
  });

  // 6️⃣ Create notification
  await createNotification({
    userId: userProfile._id,
    toUser: response.responseBy, // send notification to the lawyer
    title: `New Hire Request`,
    message: hireMessage || `A client has requested to hire you.`,
    module: "response",
    type: "hire_request",
    link: `/lawyer/dashboard/my-responses?responseId=${responseId}`,
  });



  return { success: true, message: "Hire request sent successfully", response };
};


//  --------------------  change hire status ----------------------------

// const changeHireStatus = async (
//   responseId: string,
//   userId: string,
//   hireDecision: "accepted" | "rejected"
// ) => {
//   const response = await LeadResponse.findById(responseId);
//   if (!response) {
//     return { success: false, message: "Response not found" };
//   }

//   if (!response.isHireRequested) {
//     return { success: false, message: "No hire request to update" };
//   }

//   if (response.hireDecision) {
//     return { success: false, message: "Hire decision already made" };
//   }

//   const userProfile = await UserProfile.findOne({ user: userId }).populate('user');

//   if (!userProfile) {
//     return { success: false, message: "User profile not found!" };
//   }

//     // 🚫 Prevent the requester from changing their own hire request
//   if (response.hireRequestedBy?.toString() === userProfile?._id.toString())
//     return { success: false, message: "You cannot change your own hire request" };



//   // If hire accepted, check if the lead is already hired
//   if (hireDecision === "accepted") {
//     const lead = await Lead.findById(response.leadId);
//     if (!lead) {
//       return { success: false, message: "Associated case not found" };
//     }

//     if (lead.isHired) {
//       return { success: false, message: "Case is already hired" };
//     }

//     // Update lead hire info
//     lead.isHired = true;
//     lead.hireStatus = "hired"; // optional if you use this field
//     lead.hiredLawyerId = response.responseBy;
//     lead.hiredBy = new Types.ObjectId(userProfile._id); // Who accepted the hire
//     lead.hiredAt = new Date();
//     await lead.save();
//   }



//   response.hireDecision = hireDecision;
//   response.hireAcceptedBy =
//     hireDecision === "accepted" ? new Types.ObjectId(userProfile?._id) : null;
//   response.status = hireDecision === "accepted" ? "hired" : "rejected";

//   await response.save();




//   return { success: true, message: `Hire request ${hireDecision}`, response };
// };








//  new logic  of change hire 
export const changeHireStatus = async (
  responseId: string,
  userId: string,
  hireDecision: "accepted" | "rejected"
) => {
  validateObjectId(responseId, "Response");
  const io = getIO();

  // 1️⃣ Fetch the response
  const response = await LeadResponse.findById(responseId);
  if (!response) return { success: false, message: "Response not found" };

  if (!response.isHireRequested)
    return { success: false, message: "No hire request to update" };
  // 2️⃣ Fetch the user profile
  const userProfile = await UserProfile.findOne({ user: userId }).populate("user");
  if (!userProfile) return { success: false, message: "User profile not found!" };

  // 🚫 Prevent the requester from changing their own hire request
  if (response.hireRequestedBy?.toString() === userProfile?._id.toString())
    return { success: false, message: "You cannot change your own hire request" };

  if (response.hireDecision)
    return { success: false, message: "Hire decision already made" };


 
  // 3️⃣ If hire accepted, update Lead info
  if (hireDecision === "accepted") {
    const lead = await Lead.findById(response.leadId);
    if (!lead) return { success: false, message: "Associated case not found" };
    if (lead.isHired) return { success: false, message: "Case is already hired" };

    lead.isHired = true;
    lead.hireStatus = "hired";
    lead.hiredLawyerId = response.responseBy;
    lead.hiredBy = new Types.ObjectId(userProfile._id);
    lead.hiredAt = new Date();
    await lead.save();
  }

 


  // 4️⃣ Update response
  response.hireDecision = hireDecision;
  response.hireAcceptedBy =
    hireDecision === "accepted" ? new Types.ObjectId(userProfile._id) : null;
  response.status = hireDecision === "accepted" ? "hired" : "rejected";
  response.hireAcceptedAt = new Date();
  await response.save();

  // 5️⃣ Update user profile type for lawyer only
  const userEmail = (userProfile.user as any)?.email;
  if ((userProfile.user as any)?.role === "lawyer") {
    const hireCount = await LeadResponse.countDocuments({
      responseBy: userProfile._id,
      status: "hired",
    });

    let newProfileType: 'premium' | 'expert' | undefined;
    if (hireCount >= 10) newProfileType = USER_PROFILE.PREMIUM;
    else if (hireCount >= 5) newProfileType = USER_PROFILE.EXPERT;

    if (newProfileType && userProfile.profileType !== newProfileType) {
      userProfile.profileType = newProfileType;
      await userProfile.save();

      const roleLabel = newProfileType === "premium" ? "Premium Lawyer" : "Expert Lawyer";
      await sendEmail({
        to: userEmail,
        subject: `🎉 Congrats! Your profile has been upgraded to ${roleLabel}.`,
        data: {
          name: userProfile.name,
          role: roleLabel,
          dashboardUrl: `${config.client_url}/lawyer/dashboard`,
          appName: "TheLawApp",
        },
        emailTemplate: "lawyerPromotion",
      });
    }
  }

  
  //  ---------------  TYPE CHECKER -----------------------
  interface PopulatedLeadResponse {
    _id: string;
    leadId: {
      _id: string;
      userProfileId: IUserProfile & { user: IUser };
    };
    responseBy: IUserProfile & { user: IUser };
    hireDecision?: "accepted" | "rejected" | null;
    hireMessage?: string | null;
    status: ILeadResponse['status'];
    isHireRequested: boolean;
  }

  //  ---------------  TYPE CHECK WITH LEAD USER-----------------------
  const leadUser = await LeadResponse.findById(responseId)
    .populate<{
      leadId: {
        userProfileId: IUserProfile & { user: IUser };
      };
    }>({
      path: "leadId",
      populate: {
        path: "userProfileId",
        populate: {
          path: "user",
          model: "User",
        },
      },
    })
    .populate<{ responseBy: IUserProfile & { user: IUser } }>("responseBy")
    .lean<PopulatedLeadResponse>();

 
  const possibleToUser = leadUser?.leadId?.userProfileId?.user?._id?.toString();
  const leadId = leadUser?.leadId?._id;
  const responseByUser = leadUser?.responseBy?.user?.toString();

  let currentUserId: string | null = null;
  let otherUserId: string | null = null;

  if (userId === possibleToUser) {
    currentUserId = userId;
    otherUserId = responseByUser ?? null;
  } else {
    currentUserId = userId;
    otherUserId = possibleToUser ?? null;
  }





  if (!currentUserId || !otherUserId) return { success: true, message: `Hire request ${hireDecision}`, response };

  const activity = await logActivity({
    createdBy: currentUserId,
    activityNote: `Response status updated to "${response.status}"`,
    activityType: 'hired',
    module: "response",
    objectId: responseId,
    extraField: { leadId, affectedUser: otherUserId },
  });

  const notification1 = await createNotification({
    userId: currentUserId,
    toUser: otherUserId,
    title: `Response Status Changed`,
    message: `The status of your response has been updated to "${hireDecision}".`,
    module: "response",
    type: 'hired',
    link: `/lawyer/dashboard/my-responses?responseId=${responseId}`,
  });

  const notification2 = await createNotification({
    userId: otherUserId,
    toUser: currentUserId,
    title: `Response Status Changed`,
    message: `The response status has been successfully updated to "${hireDecision}".`,
    module: "response",
    type: 'hired',
    link: `/client/dashboard/my-cases/${leadId}`,
  });





  // 7️⃣ Emit socket notifications
  io.to(`user:${currentUserId}`).emit("notification", {
    userId: currentUserId,
    toUser: otherUserId,
    title: `Response Status Changed`,
    message: `The status of your response has been updated to "${hireDecision}".`,
    module: "response",
    type: 'hired',
    link: `/lawyer/dashboard/my-responses?responseId=${responseId}`,
  });

  io.to(`user:${otherUserId}`).emit("notification", {
    userId: otherUserId,
    toUser: currentUserId,
    title: `Response Status Changed`,
    message: `The response status has been successfully updated to "${hireDecision}".`,
    module: "response",
    type: 'hired',
    link: `/client/dashboard/my-cases/${leadId}`,
  });

  return { success: true, message: `Hire request ${hireDecision}`, response };
};









export const responseService = {
  CreateResponseIntoDB,
  getAllResponseFromDB,
  getSingleResponseFromDB,
  updateResponseStatus,
  deleteResponseFromDB,
  getMyAllResponseFromDB,
  getAllResponseLeadWiseFromDB,
  sendHireRequest,
  changeHireStatus
};
