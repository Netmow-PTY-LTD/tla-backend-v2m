/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { validateObjectId } from '../../../utils/validateObjectId';

import { ILead } from '../interfaces/lead.interface';
import Lead from '../models/lead.model';
import { LeadServiceAnswer } from '../models/leadServiceAnswer.model';
import UserProfile from '../../User/models/user.model';
import { sendNotFoundResponse } from '../../../errors/custom.error';
import CountryWiseServiceWiseField from '../../CountryWiseMap/models/countryWiseServiceWiseFields.model';
import { customCreditLogic } from '../utils/customCreditLogic';

import { calculateLawyerBadge } from '../../User/utils/getBadgeStatus';
import QueryBuilder from '../../../builder/QueryBuilder';
import LeadResponse from '../../LeadResponse/models/response.model';
import { IUserProfile } from '../../User/interfaces/user.interface';

const CreateLeadIntoDB = async (userId: string, payload: any) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userProfile = await UserProfile.findOne({ user: userId })
      .select('_id')
      .session(session);

    if (!userProfile) {
      await session.abortTransaction();
      session.endSession();
      return sendNotFoundResponse('User profile not found');
    }

    const {
      questions,
      serviceId,
      additionalDetails,
      budgetAmount,
      locationId,
      countryId,
    } = payload;

    const [leadUser] = await Lead.create(
      [
        {
          userProfileId: userProfile._id,
          countryId,
          serviceId,
          additionalDetails,
          budgetAmount,
          locationId,
        },
      ],
      { session },
    );

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

    await session.commitTransaction();
    session.endSession();

    return leadUser;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating lead with transaction:', error);
    throw error;
  }
};

// const getAllLeadFromDB = async (userId: string) => {

//   const userProfile = await UserProfile.findOne({ user: userId }).select('_id serviceIds');
//   if (!userProfile) {
//     // return sendNotFoundResponse('User profile not found');
//     return null
//   }
//   try {
//     const pipeline = [
//       // Stage 1: Filter active leads
//       { $match: { deletedAt: null, serviceId: { $in: userProfile.serviceIds } } },

//       // Stage 2: Lookup userProfile data (replaces populate)
//       {
//         $lookup: {
//           from: 'userprofiles',
//           localField: 'userProfileId',
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

//     const result = await Lead.aggregate(pipeline);

//     // const combineCredit = await Promise.all(
//     //   result.map(async (lead) => {
//     //     const plainLead = lead.toObject ? lead.toObject() : lead; // <- Fix

//     //     const badge = plainLead?.userProfileId?.user
//     //       ? await getLawyerBadges(plainLead.userProfileId.user)
//     //       : null;

//     //     return {
//     //       ...plainLead,
//     //       credit: customCreditLogic(plainLead.credit),
//     //       badge,
//     //     };
//     //   })
//     // );
//     const combineCredit = await Promise.all(
//       result.map(async (lead) => {
//         const badge = lead?.userProfileId?.user
//           ? await calculateLawyerBadge(lead.userProfileId.user)
//           : null;

//         return {
//           ...lead,
//           credit: customCreditLogic(lead.credit),
//           badge,
//         };
//       })
//     );

//     return combineCredit;
//   } catch (error) {
//     console.error('Aggregation error:', error);
//     throw error;
//   }
// };

const getAllLeadFromDB_ = async (
  userId: string,
  query: Record<string, any>,
) => {
  const user = await UserProfile.findOne({ user: userId }).select(
    '_id serviceIds',
  );
  if (!user) return null;

  let parsedKeyword: any = {};
  try {
    if (typeof query.searchKeyword === 'string') {
      parsedKeyword = JSON.parse(query.searchKeyword);
    }
  } catch (err) {
    console.error('Invalid JSON in searchKeyword:', err);
  }

  if (parsedKeyword) {
  } else {
    // Build Mongoose query using QueryBuilder
    const leadQuery = new QueryBuilder(
      Lead.find({
        deletedAt: null,
        serviceId: { $in: user.serviceIds || [] },
      })
        .populate('userProfileId') // populate lawyer profile
        .populate('serviceId') // populate service info
        .lean(), // return plain JS objects instead of Mongoose docs
      query,
    )
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await leadQuery.countTotal();
    const data = await leadQuery.modelQuery;

    // Enrich each lead
    const result = await Promise.all(
      data.map(async (lead) => {
        const userProfile = lead?.userProfileId;
        const service = lead?.serviceId;

        let credit = 0;
        let creditSource = 'Default';

        if (
          userProfile &&
          'country' in userProfile &&
          service &&
          '_id' in service
        ) {
          const creditInfo = await CountryWiseServiceWiseField.findOne({
            countryId: userProfile.country,
            serviceId: service._id,
            deletedAt: null,
          }).select('baseCredit');

          if (creditInfo) {
            credit = creditInfo.baseCredit || 0;
            creditSource = 'CountryServiceField';
          }
        }

        const badge =
          userProfile && 'user' in userProfile
            ? await calculateLawyerBadge(
                userProfile.user as mongoose.Types.ObjectId,
              )
            : null;

        const existingResponse = await LeadResponse.exists({
          leadId: lead._id,
          responseBy: user._id,
        });

        return {
          ...lead,
          credit: customCreditLogic(credit),
          creditSource,
          badge,
          isContact: !!existingResponse,
        };
      }),
    );

    return {
      meta,
      data: result,
    };
  }
};

const getAllLeadFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const user = await UserProfile.findOne({ user: userId }).select(
    '_id serviceIds',
  );
  if (!user) return null;

  console.log('query', query);

  // Parse searchKeyword JSON
  let parsedKeyword: any = {};
  try {
    if (typeof query.searchKeyword === 'string') {
      parsedKeyword = JSON.parse(query.searchKeyword);
    }
  } catch (err) {
    console.error('Invalid JSON in searchKeyword:', err);
  }

  //console.log('parsedKeyword', parsedKeyword);

  if (parsedKeyword && typeof parsedKeyword === 'object') {
    const keywordLength = Object.keys(parsedKeyword).length;

    //console.log('parsedKeyword length:', keywordLength);

    if (keywordLength > 0) {
      // Do something with parsedKeyword

      const conditionalExcludeFields = [
        'credits',
        'keyword',
        'leadSubmission',
        'location',
        'services',
        'spotlight',
        'view',
        'sort',
      ];

      // Build filteredQuery:
      // - Exclude searchKeyword always
      // - Exclude conditional fields if present in parsedKeyword
      // - Manually inject sort from parsedKeyword (if exists)
      const filteredQuery = Object.fromEntries(
        Object.entries(query).filter(([key]) => {
          if (key === 'searchKeyword') return false;
          return (
            !conditionalExcludeFields.includes(key) || !(key in parsedKeyword)
          );
        }),
      );

      // Add sort from parsedKeyword if it exists
      if (parsedKeyword?.sort) {
        filteredQuery.sort = parsedKeyword.sort;
      }

      let service = [];

      if (
        Array.isArray(parsedKeyword?.services) &&
        parsedKeyword.services.length > 0
      ) {
        service = parsedKeyword.services;
      } else if (Array.isArray(user.serviceIds) && user.serviceIds.length > 0) {
        service = user.serviceIds;
      }

      // Build base Mongo filter
      const baseFilter: any = {
        deletedAt: null,
        serviceId: { $in: service },
      };

      // Add createdAt filter based on leadSubmission
      if (parsedKeyword?.['leadSubmission']) {
        const now = new Date();
        let timeThreshold: Date | undefined;

        switch (parsedKeyword['leadSubmission']) {
          case 'last_1_hour':
            timeThreshold = new Date(now.getTime() - 1 * 60 * 60 * 1000);
            break;
          case 'last_24_hours':
            timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case 'last_48_hours':
            timeThreshold = new Date(now.getTime() - 48 * 60 * 60 * 1000);
            break;
          case 'last_3_days':
            timeThreshold = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
            break;
          case 'last_7_days':
            timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'last_14_days':
            timeThreshold = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
            break;
          default:
            timeThreshold = undefined;
        }

        if (timeThreshold) {
          baseFilter.createdAt = {
            $gte: timeThreshold, // timeThreshold is already a Date object
          };
        }
      }

      // console.log('filteredQuery', filteredQuery);
      // console.log('baseFilter', baseFilter);

      // Build Mongoose query using QueryBuilder
      const leadQuery = new QueryBuilder(
        Lead.find(baseFilter)
          .populate('userProfileId') // populate lawyer profile
          .populate('serviceId') // populate service info
          .lean(), // return plain JS objects instead of Mongoose docs
        filteredQuery,
      )
        .filter()
        .sort()
        .paginate()
        .fields();

      // Pagination metadata
      const meta = await leadQuery.countTotal();

      //console.log('leadQuery meta', meta);

      // Get final data
      // const data = await leadQuery.modelQuery;
      let data = await leadQuery.modelQuery;

      if (parsedKeyword?.keyword?.trim()) {
        const keyword = parsedKeyword.keyword.trim().toLowerCase();
        data = data?.filter((lead) => {
          const profile = lead?.userProfileId as unknown as IUserProfile;
          return profile?.name?.toLowerCase().includes(keyword);
        });
      }

      const result = await Promise.all(
        data.map(async (lead) => {
          const userProfile = lead?.userProfileId;
          const service = lead?.serviceId;

          let credit = 0;
          let creditSource = 'Default';

          if (
            userProfile &&
            'country' in userProfile &&
            service &&
            '_id' in service
          ) {
            const creditInfo = await CountryWiseServiceWiseField.findOne({
              countryId: userProfile.country,
              serviceId: service._id,
              deletedAt: null,
            }).select('baseCredit');

            if (creditInfo) {
              credit = creditInfo.baseCredit || 0;
              creditSource = 'CountryServiceField';
            }
          }

          const badge =
            userProfile && 'user' in userProfile
              ? await calculateLawyerBadge(
                  userProfile.user as mongoose.Types.ObjectId,
                )
              : null;
          const existingResponse = await LeadResponse.exists({
            leadId: lead._id,
            responseBy: user._id,
          });

          return {
            ...lead,
            credit: customCreditLogic(credit),
            creditSource,
            badge,
            isContact: !!existingResponse,
          };
        }),
      );

      return {
        meta,
        data: result,
      };
    } else {
      console.log('parsedKeyword is empty');
      // Fields to conditionally exclude if present in parsedKeyword
      const conditionalExcludeFields = [
        'credits',
        'keyword',
        'leadSubmission',
        'location',
        'services',
        'spotlight',
        'view',
        'sort',
      ];

      // Build filteredQuery:
      // - Exclude searchKeyword always
      // - Exclude conditional fields if present in parsedKeyword
      // - Manually inject sort from parsedKeyword (if exists)
      const filteredQuery = Object.fromEntries(
        Object.entries(query).filter(([key]) => {
          if (key === 'searchKeyword') return false;
          return (
            !conditionalExcludeFields.includes(key) || !(key in parsedKeyword)
          );
        }),
      );

      // Build Mongoose query using QueryBuilder
      const leadQuery = new QueryBuilder(
        Lead.find({
          deletedAt: null,
          serviceId: { $in: user.serviceIds },
        })
          .populate('userProfileId') // populate lawyer profile
          .populate('serviceId') // populate service info
          .lean(), // return plain JS objects instead of Mongoose docs
        filteredQuery,
      )
        .filter()
        .sort()
        .paginate()
        .fields();

      // Pagination metadata
      const meta = await leadQuery.countTotal();

      // Get final data
      const data = await leadQuery.modelQuery;

      const result = await Promise.all(
        data.map(async (lead) => {
          const userProfile = lead?.userProfileId;
          const service = lead?.serviceId;

          let credit = 0;
          let creditSource = 'Default';

          if (
            userProfile &&
            'country' in userProfile &&
            service &&
            '_id' in service
          ) {
            const creditInfo = await CountryWiseServiceWiseField.findOne({
              countryId: userProfile.country,
              serviceId: service._id,
              deletedAt: null,
            }).select('baseCredit');

            if (creditInfo) {
              credit = creditInfo.baseCredit || 0;
              creditSource = 'CountryServiceField';
            }
          }

          const badge =
            userProfile && 'user' in userProfile
              ? await calculateLawyerBadge(
                  userProfile.user as mongoose.Types.ObjectId,
                )
              : null;
          const existingResponse = await LeadResponse.exists({
            leadId: lead._id,
            responseBy: user._id,
          });

          return {
            ...lead,
            credit: customCreditLogic(credit),
            creditSource,
            badge,
            isContact: !!existingResponse,
          };
        }),
      );

      return {
        meta,
        data: result,
      };
    }
  }
};

//
//   if (parsedKeyword) {
//     // Fields to conditionally exclude if present in parsedKeyword

//   } else {

// };

const getMyAllLeadFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select(
    '_id serviceIds',
  );
  if (!userProfile) {
    // return sendNotFoundResponse('User profile not found');
    return null;
  }

  const leadQuery = new QueryBuilder(
    Lead.find({
      userProfileId: userProfile?._id,
      deletedAt: null,
      // serviceId: { $in: userProfile.serviceIds },
    })
      .populate('userProfileId')
      .populate('serviceId')
      .lean(),
    query,
  )
    // .search(leadSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await leadQuery.countTotal();
  const data = await leadQuery.modelQuery;

  return {
    meta,
    data,
  };
};

const getSingleLeadFromDB = async (userId: string, leadId: string) => {
  const user = await UserProfile.findOne({ user: userId });
  if (!user) {
    return sendNotFoundResponse('user not found!');
  }

  validateObjectId(leadId, 'Lead');
  const leadDoc = await Lead.findOne({ _id: leadId, deletedAt: null })
    .populate({
      path: 'userProfileId',
      populate: {
        path: 'user',
      },
    })
    .populate({
      path: 'serviceId',
    })
    .lean(); // Convert to plain JS object

  if (!leadDoc) return null;

  // 2. Fetch credit information in parallel
  const [creditInfo] = await Promise.all([
    CountryWiseServiceWiseField.findOne({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      countryId: (leadDoc.userProfileId as any).country,
      serviceId: leadDoc.serviceId._id,
      deletedAt: null,
    }).lean(),

    // Add other parallel queries here if needed
  ]);

  const leadAnswers = await LeadServiceAnswer.aggregate([
    {
      $match: {
        leadId: new mongoose.Types.ObjectId(leadId),
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

    // Sort by question.order before grouping
    {
      $sort: {
        'question.order': 1,
      },
    },

    // Group by question and collect selected options
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

    // Filter out non-selected (null) options
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

    // Sort options inside each question by option.order
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

    // Format final options and remove internal `order`
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

    // ✅ Final sort to ensure question order is preserved
    {
      $sort: {
        order: 1,
      },
    },

    // Optionally, remove order from final output
    {
      $project: {
        questionId: 1,
        question: 1,
        options: 1,
      },
    },
  ]);

  // ✅ 3. Calculate lawyer badge
  const lawyerUserId = (leadDoc.userProfileId as any)?.user?._id;
  const badge = lawyerUserId ? await calculateLawyerBadge(lawyerUserId) : null;

  // ✅ 3. check alredy contact this lead current user
  const existingResponse = await LeadResponse.exists({
    leadId: leadId,
    responseBy: user._id,
  });

  // ✅ 5. Return final result
  return {
    ...leadDoc,
    badge,
    leadAnswers,
    credit: creditInfo?.baseCredit ?? 0,
    creditSource: creditInfo ? 'CountryServiceField' : 'Default',
    isContact: !!existingResponse,
  };
};

// maksud bro code

// const getSingleLeadFromDB = async (userId: string, leadId: string) => {
//   const user = await UserProfile.findOne({ user: userId }).lean();
//   if (!user) return sendNotFoundResponse('user not found!');

//   validateObjectId(leadId, 'Lead');

//   // Run in parallel: leadDoc, creditInfo, existingResponse
//   const [leadDoc, existingResponse] = await Promise.all([
//     Lead.findOne({ _id: leadId, deletedAt: null })
//       .populate({
//         path: 'userProfileId',
//         populate: { path: 'user', select: '_id' },
//         select: 'country user',
//       })
//       .populate({
//         path: 'serviceId',
//         select: '_id',
//       })
//       .lean(),

//     LeadResponse.findOne({ leadId, responseBy: user._id }).lean()
//   ]);

//   if (!leadDoc) return null;

//   // Get credit info
//   const creditInfo = await CountryWiseServiceWiseField.findOne({
//     countryId: (leadDoc.userProfileId as any).country,
//     serviceId: leadDoc.serviceId._id,
//     deletedAt: null,
//   }).lean();

//   // Get answers using aggregation
//   const leadAnswers = await LeadServiceAnswer.aggregate([
//     {
//       $match: {
//         leadId: new mongoose.Types.ObjectId(leadId),
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
//     {
//       $match: {
//         isSelected: true,
//       },
//     },
//     {
//       $sort: {
//         'question.order': 1,
//         'option.order': 1,
//       },
//     },
//     {
//       $group: {
//         _id: '$question._id',
//         questionId: { $first: '$question._id' },
//         question: { $first: '$question.question' },
//         order: { $first: '$question.order' },
//         options: {
//           $push: {
//             optionId: '$option._id',
//             option: '$option.name',
//             isSelected: '$isSelected',
//             idExtraData: '$idExtraData',
//             order: '$option.order',
//           },
//         },
//       },
//     },
//     {
//       $project: {
//         questionId: 1,
//         question: 1,
//         options: {
//           $map: {
//             input: {
//               $sortArray: {
//                 input: '$options',
//                 sortBy: { order: 1 },
//               },
//             },
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
//     {
//       $sort: { order: 1 },
//     },
//   ]);

//   // Calculate badge only if lead has a lawyer
//   const lawyerUserId = (leadDoc.userProfileId as any)?.user?._id;
//   const badge = lawyerUserId ? await calculateLawyerBadge(lawyerUserId) : null;

//   return {
//     ...leadDoc,
//     badge,
//     leadAnswers,
//     credit: creditInfo?.baseCredit ?? 0,
//     creditSource: creditInfo ? 'CountryServiceField' : 'Default',
//     isContact: !!existingResponse,
//   };
// };

const updateLeadIntoDB = async (id: string, payload: Partial<ILead>) => {
  validateObjectId(id, 'Lead');
  const result = await Lead.findOneAndUpdate(
    { _id: id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteLeadFromDB = async (id: string) => {
  validateObjectId(id, 'Lead');
  const deletedAt = new Date().toISOString();

  const result = await Lead.findByIdAndUpdate(
    id,
    { deletedAt: deletedAt },
    {
      new: true,
    },
  );
  return result;
};

export const leadService = {
  CreateLeadIntoDB,
  getAllLeadFromDB,
  getSingleLeadFromDB,
  updateLeadIntoDB,
  deleteLeadFromDB,
  getMyAllLeadFromDB,
};
