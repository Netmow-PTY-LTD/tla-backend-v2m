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

import { logActivity } from '../../Activity/utils/logActivityLog';
import { ActivityLog } from '../../Activity/models/activityLog.model';
import { calculateLawyerBadge } from '../../User/utils/getBadgeStatus';

const CreateResponseIntoDB = async (userId: string, payload: any) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');

  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }
  const responseUser = await LeadResponse.create({
    leadId: payload.leadId,
    userProfileId: userProfile._id,
    serviceId: payload.serviceId,
  });

  return responseUser;
};


// const getAllResponseFromDB = async () => {
//   try {
//     const pipeline = [
//       // Stage 1: Filter active leads
//       { $match: { deletedAt: null } },

//       // Stage 2: Lookup userProfile data (replaces populate)
//       {
//         $lookup: {
//           from: 'userprofiles',
//           localField: 'leadId',
//           foreignField: '_id',
//           as: 'userProfileData',
//         },
//       },
//       { $unwind: '$userProfileData' },

//       // Stage 3: Lookup service data (replaces populate)
//       {
//         $lookup: {
//           from: 'services',
//           localField: 'serviceId',
//           foreignField: '_id',
//           as: 'serviceData',
//         },
//       },
//       { $unwind: '$serviceData' },

//       // Stage 4: Lookup credit information
//       {
//         $lookup: {
//           from: 'countrywiseservicewisefields',
//           let: {
//             countryId: '$userProfileData.country',
//             serviceId: '$serviceId',
//           },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ['$countryId', '$$countryId'] },
//                     { $eq: ['$serviceId', '$$serviceId'] },
//                     { $eq: ['$deletedAt', null] },
//                   ],
//                 },
//               },
//             },
//           ],
//           as: 'creditInfo',
//         },
//       },

//       // Stage 5: Shape the output to match your original format
//       {
//         $project: {
//           _id: 1,
//           userProfileId: {
//             _id: '$userProfileData._id',
//             user: '$userProfileData.user',
//             name: '$userProfileData.name',
//             activeProfile: '$userProfileData.activeProfile',
//             country: '$userProfileData.country',
//             deletedAt: '$userProfileData.deletedAt',
//             credits: '$userProfileData.credits',
//             paymentMethods: '$userProfileData.paymentMethods',
//             autoTopUp: '$userProfileData.autoTopUp',
//             serviceIds: '$userProfileData.serviceIds',
//             createdAt: '$userProfileData.createdAt',
//             updatedAt: '$userProfileData.updatedAt',
//             address: '$userProfileData.address',
//             bio: '$userProfileData.bio',
//             phone: '$userProfileData.phone',
//             profilePicture: '$userProfileData.profilePicture',
//           },
//           serviceId: {
//             _id: '$serviceData._id',
//             name: '$serviceData.name',
//             slug: '$serviceData.slug',
//             deletedAt: '$serviceData.deletedAt',
//             createdAt: '$serviceData.createdAt',
//             updatedAt: '$serviceData.updatedAt',
//           },
//           additionalDetails: 1,
//           deletedAt: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           credit: {
//             $ifNull: [{ $arrayElemAt: ['$creditInfo.baseCredit', 0] }, 0],
//           },
//           creditSource: {
//             $cond: {
//               if: { $gt: [{ $size: '$creditInfo' }, 0] },
//               then: 'CountryServiceField',
//               else: 'Default',
//             },
//           },
//         },
//       },
//     ];

//     const result = await LeadResponse.aggregate(pipeline);


//     const combineCredit = await Promise.all(
//       result.map(async (lead) => {
//         const plainLead = lead.toObject ? lead.toObject() : lead; // <- Fix

//         const badge = plainLead?.userProfileId?.user
//           ? await getLawyerBadges(plainLead.userProfileId.user)
//           : null;

//         return {
//           ...plainLead,
//           credit: customCreditLogic(plainLead.credit),
//           badge,
//         };
//       })
//     );
//     return combineCredit;


//     // const combineCredit = result.map((response) => ({
//     //   ...response,
//     //   credit: customCreditLogic(response.credit),
//     // }));
//     return combineCredit;
//   } catch (error) {
//     console.error('Aggregation error:', error);
//     throw error;
//   }
// };




export const getAllResponseFromDB = async () => {
  try {
    const pipeline = [
      { $match: { deletedAt: null } },

      // Lookup lawyer's userProfile (responder)
      {
        $lookup: {
          from: 'userprofiles',
          localField: 'userProfileId',
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

        const [lawyerBadge, leadBadge] = await Promise.all([
          plain?.lawyerProfile?.user
            ? calculateLawyerBadge(plain.lawyerProfile.user)
            : null,
          plain?.leadProfile?.user
            ? calculateLawyerBadge(plain.leadProfile.user)
            : null,
        ]);

        return {
          ...plain,
          credit: customCreditLogic(plain.credit),
          badges: {
            lawyer: lawyerBadge,
            lead: leadBadge,
          },
        };
      })
    );

    return combineCredit;
  } catch (error) {
    console.error('Aggregation error:', error);
    throw error;
  }
};



// const getMyAllResponseFromDB = async (userId: string) => {
//   const userProfile = await UserProfile.findOne({ user: userId }).select('_id');
//   if (!userProfile) {
//     return sendNotFoundResponse('User profile not found');
//   }

//   const responses = await LeadResponse.find({
//     userProfileId: userProfile?._id,
//     deletedAt: null,
//   })
//     .populate({
//       path: 'leadId',
//       populate: {
//         path: 'userProfileId',
//         populate: {
//           path: 'user',
//         },
//       },
//     })
//     .populate({
//       path: 'serviceId',
//     })
//     .populate('userProfileId')
//     .populate('serviceId');

//   return responses;
// };

const getMyAllResponseFromDB = async (userId: string) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');
  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }

  const responses = await LeadResponse.find({
    userProfileId: userProfile._id,
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
      path: 'userProfileId',
      populate: {
        path: 'user',
        select: '_id name email',
      },
    });

  const combineCredit = await Promise.all(
    responses.map(async (response) => {
      const plain = response.toObject ? response.toObject() : response;
      const lawyerUserId = (plain as any)?.userProfileId?.user?._id;
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



// const getSingleResponseFromDB = async (responseId: string) => {
//   validateObjectId(responseId, 'Response');

//   const responseDoc = await LeadResponse.findById(responseId)
//     .populate({
//       path: 'userProfileId',
//       populate: {
//         path: 'user',
//       },
//     })
//     .populate({
//       path: 'serviceId',
//     })
//     .populate({
//       path: 'leadId',
//       populate: {
//         path: 'userProfileId',
//         populate: {
//           path: 'user',
//         },
//       },
//     })
//     .lean(); // Convert to plain JS object

//   if (!responseDoc) return null;

//   // 2. Fetch credit information in parallel
//   const [creditInfo] = await Promise.all([
//     CountryWiseServiceWiseField.findOne({
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       countryId: (responseDoc.userProfileId as any).country,
//       serviceId: responseDoc.serviceId._id,
//       deletedAt: null,
//     }).lean(),

//     // Add other parallel queries here if needed
//   ]);


//   // Validate and extract leadId

//   // Ensure responseDoc exists
//   if (!responseDoc) {
//     throw new Error(`Response not found for ID: ${responseId}`);
//   }

//   // Ensure leadId exists and is populated
//   if (!responseDoc.leadId || typeof responseDoc.leadId !== 'object' || !responseDoc.leadId._id) {
//     throw new Error(`Lead ID is missing or not populated in response for ID: ${responseId}`);
//   }

//   const leadObjectId = new mongoose.Types.ObjectId(String(responseDoc.leadId._id));


//   const leadAnswers = await LeadServiceAnswer.aggregate([
//     {
//       $match: {
//         leadId: leadObjectId,
//         deletedAt: null,
//       },
//     },
//     {
//       $lookup: {
//         from: 'questions',
//         localField: 'questionId',
//         foreignField: '_id',
//         as: 'question',
//       },
//     },
//     { $unwind: '$question' },
//     {
//       $lookup: {
//         from: 'options',
//         localField: 'optionId',
//         foreignField: '_id',
//         as: 'option',
//       },
//     },
//     { $unwind: '$option' },

//     // Sort by question.order before grouping
//     {
//       $sort: {
//         'question.order': 1,
//       },
//     },

//     // Group by question and collect selected options
//     {
//       $group: {
//         _id: '$question._id',
//         questionId: { $first: '$question._id' },
//         question: { $first: '$question.question' },
//         order: { $first: '$question.order' },
//         options: {
//           $push: {
//             $cond: [
//               { $eq: ['$isSelected', true] },
//               {
//                 optionId: '$option._id',
//                 option: '$option.name',
//                 isSelected: '$isSelected',
//                 idExtraData: '$idExtraData',
//                 order: '$option.order',
//               },
//               null,
//             ],
//           },
//         },
//       },
//     },

//     // Filter out non-selected (null) options
//     {
//       $project: {
//         _id: 0,
//         questionId: 1,
//         question: 1,
//         order: 1,
//         options: {
//           $filter: {
//             input: '$options',
//             as: 'opt',
//             cond: { $ne: ['$$opt', null] },
//           },
//         },
//       },
//     },

//     // Sort options inside each question by option.order
//     {
//       $addFields: {
//         options: {
//           $sortArray: {
//             input: '$options',
//             sortBy: { order: 1 },
//           },
//         },
//       },
//     },

//     // Format final options and remove internal `order`
//     {
//       $project: {
//         questionId: 1,
//         question: 1,
//         order: 1,
//         options: {
//           $map: {
//             input: '$options',
//             as: 'opt',
//             in: {
//               optionId: '$$opt.optionId',
//               option: '$$opt.option',
//               isSelected: '$$opt.isSelected',
//               idExtraData: '$$opt.idExtraData',
//             },
//           },
//         },
//       },
//     },

//     // ✅ Final sort to ensure question order is preserved
//     {
//       $sort: {
//         order: 1,
//       },
//     },

//     // Optionally, remove order from final output
//     {
//       $project: {
//         questionId: 1,
//         question: 1,
//         options: 1,
//       },
//     },
//   ]);

//    const combineCredit = await Promise.all(
//   responseDoc.map(async (response) => {
//       const plain = response.toObject ? response.toObject() : response;
//       const lawyerUserId = (plain as any)?.userProfileId?.user?._id;
//       const leadUserId = (plain as any)?.leadId?.userProfileId?.user?._id;
//       const [lawyerBadge, leadBadge] = await Promise.all([
//         lawyerUserId ? getLawyerBadges(lawyerUserId) : [],
//         leadUserId ? getLawyerBadges(leadUserId) : [],
//       ]);

//       return {
//         ...plain,
//         lawyerBadge,
//         leadBadge,

//       };
//     })
//   );

//   return combineCredit;



//   return {
//     ...responseDoc,
//     leadAnswers,
//     credit: creditInfo?.baseCredit ?? 0,
//     creditSource: creditInfo ? 'CountryServiceField' : 'Default',
//   };
// };

const getSingleResponseFromDB = async (userId: string, responseId: string) => {
  validateObjectId(responseId, 'Response');

  const responseDoc = await LeadResponse.findById(responseId)
    .populate({
      path: 'userProfileId',
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
      countryId: (responseDoc.userProfileId as any).country,
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

  // Fetch lawyer and lead badges
  const plain = responseDoc as any;
  const lawyerUserId = plain?.userProfileId?.user?._id;
  const leadUserId = plain?.leadId?.userProfileId?.user?._id;

  const [lawyerBadge, leadBadge] = await Promise.all([
    lawyerUserId ? calculateLawyerBadge(lawyerUserId) : null,
    leadUserId ? calculateLawyerBadge(leadUserId) : null,
  ]);


  const activity = await ActivityLog.find({
    objectId: new mongoose.Types.ObjectId(responseId),   // cast if you have a string
    createdBy: new mongoose.Types.ObjectId(userId),
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
    lawyerBadge,
    leadBadge,
    activity
  };
};


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

  if (result) {
    await logActivity({
      createdBy: userId,
      activityNote: `Updated response status to "${status}"`,
      activityType: 'status',
      module: 'response',
      extraField: { leadId: result.leadId },
      objectId: responseId

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
};
