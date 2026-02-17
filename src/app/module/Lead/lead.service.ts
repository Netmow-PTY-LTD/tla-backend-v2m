/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
import { validateObjectId } from '../../utils/validateObjectId';

import { ILead } from './lead.interface';
import Lead from './lead.model';
import { LeadServiceAnswer } from './leadServiceAnswer.model';
import UserProfile from '../User/user.model';
import { sendNotFoundResponse } from '../../errors/custom.error';
import CountryWiseServiceWiseField from '../CountryWiseMap/countryWiseServiceWiseFields.model';
import { customCreditLogic } from './customCreditLogic';
import QueryBuilder from '../../builder/QueryBuilder';
import LeadResponse from '../LeadResponse/response.model';
import Service from '../Service/service.model';
import config from '../../config';
import { sendEmail } from '../../emails/email.service';
import { IUser } from '../Auth/auth.interface';
import ServiceWiseQuestion from '../Question/question.model';
import Option from '../Option/option.model';
import ZipCode from '../Country/zipcode.model';
import { getBatchTravelInfo } from './lead.utils';
import { UserLocationServiceMap } from '../UserLocationServiceMap/UserLocationServiceMap.model';
import { LocationType } from '../UserLocationServiceMap/userLocationServiceMap.interface';
import { findLeadsWithinTravelTime } from './filterTravelTime';
import { IZipCode } from '../Country/zipcode.interface';
import { redisClient } from '../../config/redis.config';
import { CacheKeys, TTL } from '../../config/cacheKeys';
import { clearAllCache, deleteKeysByPattern } from '../../utils/cacheManger';





const CreateLeadIntoDB = async (userId: string, payload: any) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userProfile = await UserProfile.findOne({ user: userId }).populate('user')
      .select('name user')
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
      leadPriority,
      addressInfo
    } = payload;


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

    const creditInfo = await CountryWiseServiceWiseField.findOne({
      countryId,
      serviceId,
    }).select('baseCredit').session(session);

    let formattedAnswers = '';
    const [leadUser] = await Lead.create(
      [
        {
          userProfileId: userProfile._id,
          countryId,
          serviceId,
          additionalDetails,
          budgetAmount,
          // locationId: locationId ? locationId : zipCode?._id,
          locationId: zipCode?._id,
          credit: creditInfo?.baseCredit,
          leadPriority
        },
      ],
      { session },
    );

    // update case count in user profile
    await UserProfile.findByIdAndUpdate(userProfile._id, {
      $inc: {
        totalCases: 1,
        openCases: 1,
      },
    }, { session });

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
  </p>
    `

        })
        .join('');


    }
    const service = await Service.findById(serviceId).select('name').session(session);
    await session.commitTransaction();
    session.endSession();

    // -------------------------------------   send email -------------------------------------------


    const emailData = {
      name: userProfile?.name,
      caseType: service?.name || 'Not specified',
      leadAnswer: formattedAnswers,
      preferredContactTime: leadPriority || 'not sure',
      additionalDetails: additionalDetails || '',
      dashboardUrl: `${config.client_url}/client/dashboard/my-cases`,
      appName: 'The Law App',
      email: 'support@yourdomain.com',
    };



    await sendEmail({
      to: (userProfile.user as IUser).email,
      subject: "We've received your legal request — Awaiting approval",
      data: emailData,
      emailTemplate: 'welcome_Lead_submission',
    });


    const leadDetails = {
      leadId: leadUser._id?.toString?.() || null,
      user: {
        userId: (userProfile.user as IUser)?._id?.toString?.() || '',
        userProfileId: userProfile._id?.toString?.() || '',
        name: userProfile.name,
        email: (userProfile.user as IUser)?.email || '',
        regUserType: (userProfile.user as IUser)?.regUserType || '',
      },
      service: service ? { id: service._id?.toString?.() || '', name: service.name } : null,
      location: zipCode
        ? {
          _id: zipCode._id?.toString?.() || '',
          zipcode: zipCode.zipcode,
          postalCode: zipCode.postalCode,
          countryId: zipCode.countryId?.toString?.() || '',
          countryCode: zipCode.countryCode,
          latitude: zipCode.latitude,
          longitude: zipCode.longitude,
        }
        : null,
      budgetAmount: budgetAmount ?? 0,
      credit: creditInfo?.baseCredit ?? null,
      priority: leadPriority ?? null,
      details: additionalDetails || '',
      answersHtml: formattedAnswers
    };

    //  -------------------  Clear relevant caches -----------------------

    await deleteKeysByPattern(CacheKeys.ALL_LEADS());

    return { leadUser, leadDetails };



    // return leadUser;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating case with transaction:', error);
    throw error;
  }
};







// ------------------ Get all Lead for admin dahsobard ------------------

// const getAllLeadForAdminDashboardFromDB = async (
//   userId: string,
//   query: Record<string, unknown>,
// ) => {

//   const user = await UserProfile.findOne({ user: userId }).select(
//     '_id serviceIds',
//   );
//   if (!user) return null;

//   const leadQuery = new QueryBuilder(
//     Lead.find({})
//       .populate({
//         path: 'userProfileId',
//         populate: { path: 'user' },
//       })
//       .populate('serviceId')
//       .lean(),
//     query,
//   )
//     // .search([''])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const meta = await leadQuery.countTotal();
//   let data = await leadQuery.modelQuery;

//   const result = await Promise.all(
//     data.map(async (lead) => {
//       const existingResponse = await LeadResponse.exists({
//         leadId: lead._id,
//       });

//       return {
//         ...lead,
//         credit: customCreditLogic(lead?.credit as number),
//         isContact: !!existingResponse,
//       };
//     }),
//   );

//   return {
//     meta,
//     data: result,
//   };
// };




const getAllLeadForAdminDashboardFromDB = async (
  userId: string,
  query: Record<string, any>,
) => {
  const user = await UserProfile.findOne({ user: userId }).select('_id serviceIds');
  if (!user) return null;

  const { sortBy, sortOrder = 'desc', search, filters } = query;

  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit as string, 10) || 10);
  const skip = (page - 1) * limit;

  const matchStage: Record<string, any> = {};

  // Apply filters dynamically (other fields)
  if (filters) {
    Object.keys(filters).forEach((key) => {
      matchStage[key] = filters[key];
    });
  }

  // Build aggregation pipeline
  const pipeline: any[] = [
    { $match: matchStage },

    // Nested population for userProfileId -> user
    {
      $lookup: {
        from: 'userprofiles',
        localField: 'userProfileId',
        foreignField: '_id',
        as: 'userProfileId',
      },
    },
    { $unwind: { path: '$userProfileId', preserveNullAndEmptyArrays: true } },

    // Populate user inside userProfile
    {
      $lookup: {
        from: 'users',
        localField: 'userProfileId.user',
        foreignField: '_id',
        as: 'userProfileId.user',
      },
    },
    { $unwind: { path: '$userProfileId.user', preserveNullAndEmptyArrays: true } },

    // Populate serviceId
    {
      $lookup: {
        from: 'services',
        localField: 'serviceId',
        foreignField: '_id',
        as: 'serviceId',
      },
    },
    { $unwind: { path: '$serviceId', preserveNullAndEmptyArrays: true } },

    // Populate countryId
    {
      $lookup: {
        from: 'countries',
        localField: 'countryId',
        foreignField: '_id',
        as: 'countryId',
      },
    },
    { $unwind: { path: '$countryId', preserveNullAndEmptyArrays: true } },

    // Add isContact field
    {
      $lookup: {
        from: 'leadresponses',
        let: { leadId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$leadId', '$$leadId'] } } },
          { $limit: 1 },
        ],
        as: 'responses',
      },
    },
    {
      $addFields: {
        isContact: { $gt: [{ $size: '$responses' }, 0] },
        credit: { $ifNull: ['$credit', 0] },
      },
    },
  ];

  // Search after userProfileId is populated
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { additionalDetails: { $regex: search, $options: 'i' } },
          { 'userProfileId.name': { $regex: search, $options: 'i' } },
          { 'userProfileId.phone': { $regex: search, $options: 'i' } },
          { 'userProfileId.address': { $regex: search, $options: 'i' } },
          { 'userProfileId.user.email': { $regex: search, $options: 'i' } },
          { 'serviceId.name': { $regex: search, $options: 'i' } },
        ],
      },
    });
  }

  // Sorting
  if (sortBy) {
    const sortStage: Record<string, any> = {};
    sortStage[sortBy] = sortOrder === 'asc' ? 1 : -1;
    pipeline.push({ $sort: sortStage });
  }

  // // Pagination
  // const skip = (page - 1) * limit;
  // pipeline.push({ $skip: skip }, { $limit: limit });

  // // Execute aggregation
  // const data = await Lead.aggregate(pipeline);

  // // Total count
  // const totalMeta = await Lead.aggregate([{ $match: matchStage }, { $count: 'total' }]);
  // const total = totalMeta[0]?.total || 0;
  // const totalPage = Math.ceil(total / limit);

  // const meta = {
  //   total,
  //   page,
  //   limit,
  //   totalPage,
  // };

  // const result = data.map((lead) => ({
  //   ...lead,
  //   credit: customCreditLogic(lead.credit),
  // }));

  // return { meta, data: result };



  // Use $facet for pagination + total count in one query
  const facetPipeline = [
    ...pipeline,
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
        ],
        totalCount: [
          { $count: 'total' },
        ],
      },
    },
  ];

  const [aggResult] = await Lead.aggregate(facetPipeline);
  const data = aggResult.data || [];
  const total = aggResult.totalCount[0]?.total || 0;
  const totalPage = Math.ceil(total / limit);

  const meta = {
    total,
    page,
    limit,
    totalPage,
  };

  // Apply custom credit logic
  const result = data.map((lead: { credit: number; }) => ({
    ...lead,
    credit: customCreditLogic(lead.credit),
  }));

  return { meta, data: result };

};




const getAllClientWiseLeadFromDB = async (
  clientId: string,
  query: Record<string, any>
) => {
  // Find the client's profile to get its _id and serviceIds
  const clientProfile = await UserProfile.findOne({ user: clientId }).select(
    "_id serviceIds"
  );

  // If no profile found, return empty data
  if (!clientProfile) {
    return {
      meta: { total: 0, page: 1, limit: 10, totalPage: 0 },
      data: [],
    };
  }

  const { sortBy, sortOrder = "desc", search, filters } = query;

  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit as string, 10) || 10);
  const skip = (page - 1) * limit;

  // Match only leads where userProfileId belongs to this client's profile
  const matchStage: Record<string, any> = {
    userProfileId: clientProfile._id,
  };

  // Add dynamic filters if provided
  if (filters) {
    Object.keys(filters).forEach((key) => {
      matchStage[key] = filters[key];
    });
  }

  // Numeric search handling
  const numericSearch = !isNaN(Number(search)) ? Number(search) : null;

  // Build aggregation pipeline
  const pipeline: any[] = [
    { $match: matchStage },

    // Lookup userProfile
    {
      $lookup: {
        from: "userprofiles",
        localField: "userProfileId",
        foreignField: "_id",
        as: "userProfileId",
      },
    },
    { $unwind: { path: "$userProfileId", preserveNullAndEmptyArrays: true } },

    // Lookup user inside userProfile
    {
      $lookup: {
        from: "users",
        localField: "userProfileId.user",
        foreignField: "_id",
        as: "userProfileId.user",
      },
    },
    { $unwind: { path: "$userProfileId.user", preserveNullAndEmptyArrays: true } },

    // Lookup service
    {
      $lookup: {
        from: "services",
        localField: "serviceId",
        foreignField: "_id",
        as: "serviceId",
      },
    },
    { $unwind: { path: "$serviceId", preserveNullAndEmptyArrays: true } },

    // Lookup country
    {
      $lookup: {
        from: "countries",
        localField: "countryId",
        foreignField: "_id",
        as: "countryId",
      },
    },
    { $unwind: { path: "$countryId", preserveNullAndEmptyArrays: true } },

    // Lookup location (ZipCode)
    {
      $lookup: {
        from: "zipcodes",
        localField: "locationId",
        foreignField: "_id",
        as: "locationId",
      },
    },
    { $unwind: { path: "$locationId", preserveNullAndEmptyArrays: true } },

    // Lookup lead responses for isContact flag
    {
      $lookup: {
        from: "leadresponses",
        let: { leadId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$leadId", "$$leadId"] } } },
          { $limit: 1 },
        ],
        as: "responses",
      },
    },
    {
      $addFields: {
        isContact: { $gt: [{ $size: "$responses" }, 0] },
        credit: { $ifNull: ["$credit", 0] },
      },
    },

    // Search filter
    ...(search
      ? [
        {
          $match: {
            $or: [
              { additionalDetails: { $regex: search, $options: "i" } },
              { status: { $regex: search, $options: "i" } },
              { leadPriority: { $regex: search, $options: "i" } },
              { hireStatus: { $regex: search, $options: "i" } },
              { closeStatus: { $regex: search, $options: "i" } },
              { "serviceId.name": { $regex: search, $options: "i" } },
              { "countryId.name": { $regex: search, $options: "i" } },
              { "locationId.zipCode": { $regex: search, $options: "i" } },
              { "locationId.city": { $regex: search, $options: "i" } },
              ...(numericSearch !== null ? [{ budgetAmount: numericSearch }] : []),
            ],
          },
        },
      ]
      : []),

    // Facet for data & total count in one query
    {
      $facet: {
        data: [
          { $sort: sortBy ? { [sortBy]: sortOrder === "asc" ? 1 : -1 } : { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $addFields: {
              credit: { $ifNull: ["$credit", 0] },
            },
          },
        ],
        meta: [{ $count: "total" }],
      },
    },
    {
      $addFields: {
        meta: {
          $arrayElemAt: ["$meta", 0],
        },
      },
    },
    {
      $addFields: {
        "meta.page": page,
        "meta.limit": limit,
        "meta.totalPage": {
          $ceil: { $divide: ["$meta.total", limit] },
        },
      },
    },
  ];

  // Execute single aggregation
  const result = await Lead.aggregate(pipeline);

  return {
    meta: result[0]?.meta || { total: 0, page, limit, totalPage: 0 },
    data: result[0]?.data.map((lead: any) => ({
      ...lead,
      credit: customCreditLogic(lead.credit),
    })) || [],
  };
};




//  --------------  Get all lead for lawyer dashboard ----------



type TMeta = {
  total: number;     // Total number of documents
  page: number;      // Current page
  limit: number;     // Number of items per page
  totalPage: number; // Total pages (Math.ceil(total / limit))
};

type PaginatedResult<T> = {
  data: T[];
  pagination: TMeta;
  leadCount?: {
    urgent: number;
  };
};


//  ------------------------------------------- previous logic of get all lead for lawyer dashboard  ------------------------------------------

// const getAllLeadFromDB = async (
//   userId: string,
//   filters: any = {},
//   options: {
//     page: number;
//     limit: number;
//     sortBy: string;
//     sortOrder: 'asc' | 'desc';
//   }
// ): Promise<PaginatedResult<any>> => {
//   const userProfile = await UserProfile.findOne({ user: userId }).select('_id serviceIds country');
//   if (!userProfile) {
//     return {
//       data: [],
//       pagination: { total: 0, page: options.page, limit: options.limit, totalPage: 0 },
//     };
//   }


// // const coordinates= { coord: [151.2093, -33.8688], maxMinutes: 15, mode: 'driving', }; --- this  coridinates example

// const coordinates=filters.coordinates || null;

//   const page = options.page || 1;
//   const limit = options.limit || 10;
//   const skip = (page - 1) * limit;
//   const sortField = options.sortBy || 'createdAt';
//   const sortOrder = options.sortOrder === 'asc' ? 1 : -1;




//   const matchStage: any = {

//     countryId: new mongoose.Types.ObjectId(userProfile.country),
//     userProfileId: { $ne: userProfile._id },
//     responders: { $ne: userProfile._id },
//     serviceId: { $in: userProfile.serviceIds },
//     status: 'approved',

//   };

//   // Spotlight
//   if (filters.spotlight?.length) {
//     matchStage.leadPriority = { $in: filters.spotlight };
//   }

//   // Services
//   if (filters.services?.length) {
//     matchStage.serviceId = { $in: filters.services.map((id: string) => new mongoose.Types.ObjectId(id)) };
//   }

//   // Credits
//   if (filters.credits?.length) {
//     const creditConditions = filters.credits.map((range: string) => {
//       switch (range) {
//         case 'Free': return { credit: 0 };
//         case '1-5 credits': return { credit: { $gte: 1, $lte: 5 } };
//         case '5-10 credits': return { credit: { $gte: 5, $lte: 10 } };
//         case '10-20 credits': return { credit: { $gte: 10, $lte: 20 } };
//         case '20-30 credits': return { credit: { $gte: 20, $lte: 30 } };
//         case '30-40 credits': return { credit: { $gte: 30, $lte: 40 } };
//         case '40-50 credits': return { credit: { $gte: 40, $lte: 50 } };
//         case '50-100 credits': return { credit: { $gte: 50, $lte: 100 } };
//         default: return null;
//       }
//     }).filter(Boolean);
//     if (creditConditions.length) {
//       matchStage.$or = [...(matchStage.$or || []), ...creditConditions];
//     }
//   }

//   // Location
//   if (filters.location?.length) {
//     matchStage.locationId = { $in: filters.location.map((id: string) => new mongoose.Types.ObjectId(id)) };
//   }

//   // Lead submission time filter
//   if (filters.leadSubmission) {
//     let startDate: Date | null = null;
//     switch (filters.leadSubmission) {
//       case 'last_1_hour': startDate = new Date(Date.now() - 60 * 60 * 1000); break;
//       case 'last_24_hours': startDate = new Date(); startDate.setHours(0, 0, 0, 0); break;
//       case 'last_48_hours': startDate = new Date(); startDate.setDate(startDate.getDate() - 1); break;
//       case 'last_3_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 3); break;
//       case 'last_7_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 7); break;
//       case 'last_14_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 14); break;
//     }
//     if (startDate) matchStage.createdAt = { $gte: startDate };
//   }

//   // Build pipeline with keyword filter AFTER lookup
//   const aggregationPipeline: any[] = [
//     { $match: matchStage },

//     { $lookup: { from: 'userprofiles', localField: 'userProfileId', foreignField: '_id', as: 'userProfileId' } },
//     { $unwind: { path: '$userProfileId', preserveNullAndEmptyArrays: true } },

//     {
//       $lookup: { from: 'users', localField: 'userProfileId.user', foreignField: '_id', as: 'userProfileId.user' }
//     },
//     {
//       $unwind: { path: '$userProfileId.user', preserveNullAndEmptyArrays: true }
//     },

//     { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'serviceId' } },
//     { $unwind: { path: '$serviceId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'locations', localField: 'locationId', foreignField: '_id', as: 'locationId' } },
//     { $unwind: { path: '$locationId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'userprofiles', localField: 'responders', foreignField: '_id', as: 'responders' } },

//     // //  ---------------------------- match current user and same country lead user -----------------
//     // {
//     //   $match: {
//     //     'userProfileId.country': new mongoose.Types.ObjectId(userProfile.country)

//     //   }
//     // },
//     // Keyword match here (AFTER we have userProfileId.name)
//     ...(filters.keyword
//       ? [{
//         $match: {
//           $or: [
//             { 'userProfileId.name': { $regex: new RegExp(filters.keyword, 'i') } },
//             { additionalDetails: { $regex: new RegExp(filters.keyword, 'i') } },
//           ]
//         }
//       }]
//       : []),

//     { $sort: { [sortField]: sortOrder } },

//     // One DB call for data + total
//     {
//       $facet: {
//         data: [
//           { $skip: skip },
//           { $limit: limit },
//         ],
//         totalCount: [
//           { $count: 'total' }
//         ],
//         urgentCount: [
//           { $match: { leadPriority: 'urgent' } },
//           { $count: 'total' }
//         ]
//       }
//     }
//   ];

//   const result = await Lead.aggregate(aggregationPipeline);

//   const data = result[0]?.data || [];
//   const total = result[0]?.totalCount[0]?.total || 0;
//   const urgentCount = result[0]?.urgentCount[0]?.total || 0;

//   return {
//     pagination: { total, page, limit, totalPage: Math.ceil(total / limit) },
//     data,
//     leadCount: {
//       urgent: urgentCount,
//     }
//   };
// };







//  ----------------- GET ALL MY LEAD FOR LAWYER PANEL --------------------




// final revised function with location based filtering

// const getAllLeadForLawyerPanel = async (
//   userId: string,
//   filters: any = {},
//   options: {
//     page: number;
//     limit: number;
//     sortBy: string;
//     sortOrder: 'asc' | 'desc';
//   }
// ): Promise<any> => {
//   const userProfile = await UserProfile.findOne({ user: userId }).select('_id serviceIds country');
//   if (!userProfile) {
//     return {
//       data: [],
//       pagination: { total: 0, page: options.page, limit: options.limit, totalPage: 0 },
//       leadCount: {},
//     };
//   }

//   const page = options.page || 1;
//   const limit = options.limit || 10;
//   const skip = (page - 1) * limit;
//   const sortField = options.sortBy || 'createdAt';
//   const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
//   // ----------------------- FETCH USER LOCATION SERVICE MAPPINGS -----------------------
//   const userLocationService = await UserLocationServiceMap.find({ userProfileId: userProfile._id });



//   // ----------------------- SEPARATE BY LOCATION TYPE -----------------------
//   const locationServiceByType: Record<string, mongoose.Types.ObjectId[]> = {
//     [LocationType.NATION_WIDE]: [],
//     [LocationType.DISTANCE_WISE]: [],
//     [LocationType.TRAVEL_TIME]: [],
//     [LocationType.DRAW_ON_AREA]: [],
//   };


//   // Fill service IDs by location type, remove duplicates
//   userLocationService.forEach(loc => {
//     if (loc.serviceIds && loc.serviceIds.length > 0) {
//       const type = loc.locationType as keyof typeof locationServiceByType;
//       const currentSet = new Set(locationServiceByType[type].map(id => id.toString()));
//       loc.serviceIds.forEach((id: any) => currentSet.add(id.toString()));
//       locationServiceByType[type] = Array.from(currentSet).map(id => new mongoose.Types.ObjectId(id));
//     }
//   });



//   // service IDs by location type
//   const nationwideServiceIds = locationServiceByType[LocationType.NATION_WIDE];
//   const distanceWiseServiceIds = locationServiceByType[LocationType.DISTANCE_WISE];
//   const travelTimeServiceIds = locationServiceByType[LocationType.TRAVEL_TIME];
//   const drawOnAreaServiceIds = locationServiceByType[LocationType.DRAW_ON_AREA];






//   // // ----------------------- MATCH STAGE -----------------------
//   const matchStage: any = {
//     countryId: new mongoose.Types.ObjectId(userProfile.country),
//     userProfileId: { $ne: userProfile._id },
//     responders: { $ne: userProfile._id },
//     status: 'approved',
//   };




//   // ----------------------- BUILD MATCH CONDITIONS -----------------------
//   const conditions: any[] = [];




//   if (!filters.coordinates) {


//     // 1 Nationwide (ignore locationId)
//     if (nationwideServiceIds.length > 0) {
//       conditions.push({ serviceId: { $in: nationwideServiceIds } });
//     }

//     // 2 Distance-wise

//     if (distanceWiseServiceIds.length > 0) {
//       // Array to hold all locationIds that are nearby
//       let nearbyLocationIds: mongoose.Types.ObjectId[] = [];

//       for (const loc of userLocationService.filter(l => l.locationType === LocationType.DISTANCE_WISE)) {
//         if (!loc.locationGroupId) continue;
//         // Fetch the coordinates from the ZipCode
//         const zip = await ZipCode.findById(loc.locationGroupId).select('location');
//         if (!zip || !zip.location) continue;

//         const radiusInMeters = (loc.rangeInKm || 5) * 1000; // convert km to meters

//         const nearby = await ZipCode.aggregate([
//           {
//             $geoNear: {
//               near: { type: "Point", coordinates: [zip.location.coordinates[0], zip.location.coordinates[1]] },
//               distanceField: "distance",
//               maxDistance: radiusInMeters,
//               spherical: true,
//             },
//           },
//           { $project: { _id: 1 } },
//         ]);

//         nearbyLocationIds.push(...nearby.map(z => z._id));
//       }

//       // Remove duplicates
//       nearbyLocationIds = Array.from(new Set(nearbyLocationIds.map(id => id.toString()))).map(id => new mongoose.Types.ObjectId(id));

//       // If we found nearby location IDs, add them to the conditions

//       if (nearbyLocationIds.length > 0) {
//         conditions.push({
//           serviceId: { $in: distanceWiseServiceIds },
//           locationId: { $in: nearbyLocationIds },
//         });
//       }



//     }



//     // 3 Travel-time

//     if (travelTimeServiceIds.length > 0) {
//       // Fetch all zip codes once
//       const allZips = await ZipCode.find({ countryId: userProfile.country }).select('location');


//       // Prepare destinations for travel API
//       const destinations = allZips.map(z => ({
//         lat: z.location?.coordinates?.[1],
//         lng: z.location?.coordinates?.[0],
//         zipCodeId: z._id
//       }));

//       let validLocationIds: mongoose.Types.ObjectId[] = [];

//       const travelTimeMappings = userLocationService.filter(l => l.locationType === LocationType.TRAVEL_TIME);

//       for (const loc of travelTimeMappings) {
//         if (!loc.locationGroupId) continue;

//         // Get coordinates of user's reference location
//         const zip = await ZipCode.findById(loc.locationGroupId).select('location');
//         if (!zip || !zip.location) continue;

//         const userLat = zip.location.coordinates[1];
//         const userLng = zip.location.coordinates[0];

//         const travelMode = loc.travelmode || 'driving';
//         const maxTravelTime = typeof loc.traveltime === 'number'
//           ? loc.traveltime
//           : Number(loc.traveltime) || 15; // default 15 minutes if NaN




//         // Fetch batch travel info
//         const travelResults = await getBatchTravelInfo(
//           { lat: userLat, lng: userLng },
//           destinations,
//           travelMode,
//           25 // batch size
//         );


//         // Filter destinations within maxTravelTime
//         const nearbyIds = travelResults
//           .filter(r => r.durationSeconds <= maxTravelTime * 60)
//           .map(r => r.zipCodeId);


//         validLocationIds.push(...nearbyIds);
//       }

//       // Remove duplicates and convert to ObjectId
//       validLocationIds = Array.from(new Set(validLocationIds.map(id => id.toString())))
//         .map(id => new mongoose.Types.ObjectId(id));

//       if (validLocationIds.length > 0) {
//         conditions.push({
//           serviceId: { $in: travelTimeServiceIds },
//           locationId: { $in: validLocationIds },
//         });
//       }
//     }

//     // 4 Draw-on-area
//     if (drawOnAreaServiceIds.length > 0) {
//       const locationIds = userLocationService
//         .filter(loc => loc.locationType === LocationType.DRAW_ON_AREA)
//         .map(loc => loc.locationGroupId)
//         .filter(Boolean)
//         .map((loc: any) => loc._id);

//       if (locationIds.length > 0) {
//         conditions.push({
//           serviceId: { $in: drawOnAreaServiceIds },
//           locationId: { $in: locationIds },
//         });
//       }
//     }



//   }






//   if (filters.coordinates) {
//     const { locationType, coord, rangeInKm = 5 } = filters.coordinates;


//     if (!Array.isArray(coord) || coord.length !== 2 || isNaN(coord[0]) || isNaN(coord[1])) {
//       throw new Error("Invalid coordinates provided for location filtering");
//     }

//     const supportedTypes = ["draw_on_area", "travel_time", "nation_wide", "distance_wise"];

//     if (locationType && supportedTypes.includes(locationType)) {
//       let nearbyLocationIds: Types.ObjectId[] = [];

//       // ------------------ CASE: DISTANCE BASED ------------------
//       if (locationType === "distance_wise") {
//         const radiusInMeters = rangeInKm * 1000;

//         const nearbyZips = await ZipCode.aggregate([
//           {
//             $geoNear: {
//               near: { type: "Point", coordinates: [coord[0], coord[1]] },
//               distanceField: "distance",
//               maxDistance: radiusInMeters,
//               spherical: true,
//             },
//           },
//           { $project: { _id: 1 } },
//         ]);

//         nearbyLocationIds = nearbyZips.map((z) => new mongoose.Types.ObjectId(z._id));
//       }

//       // ------------------ CASE: DRAW-ON-AREA (Polygon) ------------------
//       else if (locationType === "draw_on_area" && filters.coordinates.polygon) {
//         const { polygon } = filters.coordinates;
//         const nearbyZips = await ZipCode.find({
//           location: {
//             $geoWithin: {
//               $geometry: polygon,
//             },
//           },
//         }).select("_id");

//         nearbyLocationIds = nearbyZips.map((z) => new mongoose.Types.ObjectId(z._id));
//       }

//       // ------------------ CASE: TRAVEL-TIME BASED ------------------
//       else if (locationType === "travel_time") {
//         const { travelmode = "driving", traveltime = 15, coord } = filters.coordinates;

//         console.log('Travel-time filter params:', { travelmode, traveltime, coord });
//         // Fetch all zip codes once
//         const allZips = await ZipCode.find({ countryId: userProfile.country }).select('location');

//         // Prepare destinations for travel API
//         const destinations = allZips.map(z => ({
//           lat: z.location?.coordinates?.[1],
//           lng: z.location?.coordinates?.[0],
//           zipCodeId: z._id
//         }));


//         console.log(`Fetching travel info from (${coord[1]}, ${coord[0]}) using mode: ${travelmode}`);

//         // Fetch batch travel info
//         const travelResults = await getBatchTravelInfo(
//           { lat: coord[1], lng: coord[0] },
//           destinations,
//           travelmode,
//           25 // batch size
//         );

//         console.log('Travel Results fetched:', travelResults.length);

//         // Filter destinations within TravelTime
//         nearbyLocationIds = travelResults
//           .filter(r => r.durationSeconds <= traveltime * 60)
//           .map(r => r.zipCodeId);

//         console.log(`Found ${nearbyLocationIds.length} nearby locations within ${traveltime} minutes for travel-time filter`);


//       }

//       // ------------------ CASE: NATION-WIDE ------------------
//       else if (locationType === "nation_wide") {
//         // No filtering
//       }


//       //  Deduplicate as ObjectIds safely
//       const uniqueIds = Array.from(
//         new Set(nearbyLocationIds.map((id) => id.toString()))
//       ).map((idStr) => new mongoose.Types.ObjectId(idStr));

//       if (uniqueIds.length > 0) {
//         conditions.push({ locationId: { $in: uniqueIds } });
//       }
//     }
//   }





//   // 5 If no mappings, prevent match
//   if (conditions.length === 0) {
//     matchStage._id = { $exists: false };
//   } else {
//     matchStage.$or = conditions;
//   }



//   // ----------------------- ADDITIONAL FILTERS -----------------------
//   if (filters.spotlight?.length) matchStage.leadPriority = { $in: filters.spotlight };
//   if (filters.services?.length) {
//     matchStage.serviceId = { $in: filters.services.map((id: string) => new mongoose.Types.ObjectId(id)) };
//   }
//   if (filters.credits?.length) {
//     const creditConditions = filters.credits.map((range: string) => {
//       switch (range) {
//         case 'Free': return { credit: 0 };
//         case '1-5 credits': return { credit: { $gte: 1, $lte: 5 } };
//         case '5-10 credits': return { credit: { $gte: 5, $lte: 10 } };
//         case '10-20 credits': return { credit: { $gte: 10, $lte: 20 } };
//         case '20-30 credits': return { credit: { $gte: 20, $lte: 30 } };
//         case '30-40 credits': return { credit: { $gte: 30, $lte: 40 } };
//         case '40-50 credits': return { credit: { $gte: 40, $lte: 50 } };
//         case '50-100 credits': return { credit: { $gte: 50, $lte: 100 } };
//         default: return null;
//       }
//     }).filter(Boolean);
//     if (creditConditions.length) matchStage.$or = [...(matchStage.$or || []), ...creditConditions];
//   }
//   if (filters.location?.length) {
//     matchStage.locationId = { $in: filters.location.map((id: string) => new mongoose.Types.ObjectId(id)) };
//   }
//   if (filters.leadSubmission) {
//     let startDate: Date | null = null;
//     switch (filters.leadSubmission) {
//       case 'last_1_hour': startDate = new Date(Date.now() - 60 * 60 * 1000); break;
//       case 'last_24_hours': startDate = new Date(); startDate.setHours(0, 0, 0, 0); break;
//       case 'last_48_hours': startDate = new Date(); startDate.setDate(startDate.getDate() - 1); break;
//       case 'last_3_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 3); break;
//       case 'last_7_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 7); break;
//       case 'last_14_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 14); break;
//     }
//     if (startDate) matchStage.createdAt = { $gte: startDate };
//   }











//   // ----------------------- AGGREGATION PIPELINE -----------------------
//   const aggregationPipeline: any[] = [
//     { $match: matchStage },

//     // Apply sorting
//     { $sort: { [sortField]: sortOrder } }, // <- Add this line
//     // Lookups
//     { $lookup: { from: 'zipcodes', localField: 'locationId', foreignField: '_id', as: 'locationId' } },
//     { $unwind: { path: '$locationId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'userprofiles', localField: 'userProfileId', foreignField: '_id', as: 'userProfileId' } },
//     { $unwind: { path: '$userProfileId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'users', localField: 'userProfileId.user', foreignField: '_id', as: 'userProfileId.user' } },
//     { $unwind: { path: '$userProfileId.user', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'serviceId' } },
//     { $unwind: { path: '$serviceId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'userprofiles', localField: 'responders', foreignField: '_id', as: 'responders' } },
//   ];

//   if (filters.keyword) {
//     aggregationPipeline.push({
//       $match: {
//         $or: [
//           { 'userProfileId.name': { $regex: new RegExp(filters.keyword, 'i') } },
//           { additionalDetails: { $regex: new RegExp(filters.keyword, 'i') } },
//         ],
//       },
//     });
//   }

//   let leads = await Lead.aggregate(aggregationPipeline);


//   // ----------------------- PAGINATION -----------------------
//   const total = leads.length;
//   const paginatedLeads = leads.slice(skip, skip + limit);

//   return {
//     data: paginatedLeads,
//     pagination: { total, page, limit, totalPage: Math.ceil(total / limit) },
//     leadCount: { urgent: paginatedLeads.filter(l => l.leadPriority === 'urgent').length },
//   };
// };



// final revised function with location based filtering
// const getAllLeadForLawyerPanel = async (
//   userId: string,
//   filters: any = {},
//   options: {
//     page: number;
//     limit: number;
//     sortBy: string;
//     sortOrder: 'asc' | 'desc';
//   }
// ): Promise<any> => {
//   const userProfile = await UserProfile.findOne({ user: userId }).select('_id serviceIds country');
//   if (!userProfile) {
//     return {
//       data: [],
//       pagination: { total: 0, page: options.page, limit: options.limit, totalPage: 0 },
//       leadCount: {},
//     };
//   }

//   const page = options.page || 1;
//   const limit = options.limit || 10;
//   const skip = (page - 1) * limit;
//   const sortField = options.sortBy || 'createdAt';
//   const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
//   // ----------------------- FETCH USER LOCATION SERVICE MAPPINGS -----------------------
//   const userLocationService = await UserLocationServiceMap.find({ userProfileId: userProfile._id });



//   // ----------------------- SEPARATE BY LOCATION TYPE -----------------------
//   const locationServiceByType: Record<string, mongoose.Types.ObjectId[]> = {
//     [LocationType.NATION_WIDE]: [],
//     [LocationType.DISTANCE_WISE]: [],
//     [LocationType.TRAVEL_TIME]: [],
//     [LocationType.DRAW_ON_AREA]: [],
//   };


//   // Fill service IDs by location type, remove duplicates
//   userLocationService.forEach(loc => {
//     if (loc.serviceIds && loc.serviceIds.length > 0) {
//       const type = loc.locationType as keyof typeof locationServiceByType;
//       const currentSet = new Set(locationServiceByType[type].map(id => id.toString()));
//       loc.serviceIds.forEach((id: any) => currentSet.add(id.toString()));
//       locationServiceByType[type] = Array.from(currentSet).map(id => new mongoose.Types.ObjectId(id));
//     }
//   });



//   // service IDs by location type
//   const nationwideServiceIds = locationServiceByType[LocationType.NATION_WIDE];
//   const distanceWiseServiceIds = locationServiceByType[LocationType.DISTANCE_WISE];
//   const travelTimeServiceIds = locationServiceByType[LocationType.TRAVEL_TIME];
//   const drawOnAreaServiceIds = locationServiceByType[LocationType.DRAW_ON_AREA];






//   // // ----------------------- MATCH STAGE -----------------------
//   const matchStage: any = {
//     countryId: new mongoose.Types.ObjectId(userProfile.country),
//     userProfileId: { $ne: userProfile._id },
//     responders: { $ne: userProfile._id },
//     status: 'approved',
//   };




//   // ----------------------- BUILD MATCH CONDITIONS -----------------------
//   const conditions: any[] = [];


//   console.log('Filters received:', filters.coordinates);

//   if (!filters.coordinates) {


//     // 1 Nationwide (ignore locationId)
//     if (nationwideServiceIds.length > 0) {
//       conditions.push({ serviceId: { $in: nationwideServiceIds } });
//     }

//     // 2 Distance-wise

//     if (distanceWiseServiceIds.length > 0) {
//       // Array to hold all locationIds that are nearby
//       let nearbyLocationIds: mongoose.Types.ObjectId[] = [];

//       for (const loc of userLocationService.filter(l => l.locationType === LocationType.DISTANCE_WISE)) {
//         if (!loc.locationGroupId) continue;
//         // Fetch the coordinates from the ZipCode
//         const zip = await ZipCode.findById(loc.locationGroupId).select('location');
//         if (!zip || !zip.location) continue;

//         const radiusInMeters = (loc.rangeInKm || 5) * 1000; // convert km to meters

//         const nearby = await ZipCode.aggregate([
//           {
//             $geoNear: {
//               near: { type: "Point", coordinates: [zip.location.coordinates[0], zip.location.coordinates[1]] },
//               distanceField: "distance",
//               maxDistance: radiusInMeters,
//               spherical: true,
//             },
//           },
//           { $project: { _id: 1 } },
//         ]);

//         nearbyLocationIds.push(...nearby.map(z => z._id));
//       }

//       // Remove duplicates
//       nearbyLocationIds = Array.from(new Set(nearbyLocationIds.map(id => id.toString()))).map(id => new mongoose.Types.ObjectId(id));

//       // If we found nearby location IDs, add them to the conditions

//       if (nearbyLocationIds.length > 0) {
//         conditions.push({
//           serviceId: { $in: distanceWiseServiceIds },
//           locationId: { $in: nearbyLocationIds },
//         });
//       }



//     }



//     // 3 Travel-time

//     if (travelTimeServiceIds.length > 0) {
//       // Fetch all zip codes once
//       const allZips = await ZipCode.find({ countryId: userProfile.country }).select('location');


//       // Prepare destinations for travel API
//       const destinations = allZips.map(z => ({
//         lat: z.location?.coordinates?.[1],
//         lng: z.location?.coordinates?.[0],
//         zipCodeId: z._id
//       }));

//       let validLocationIds: mongoose.Types.ObjectId[] = [];

//       const travelTimeMappings = userLocationService.filter(l => l.locationType === LocationType.TRAVEL_TIME);

//       for (const loc of travelTimeMappings) {
//         if (!loc.locationGroupId) continue;

//         // Get coordinates of user's reference location
//         const zip = await ZipCode.findById(loc.locationGroupId).select('location');
//         if (!zip || !zip.location) continue;

//         const userLat = zip.location.coordinates[1];
//         const userLng = zip.location.coordinates[0];

//         const travelMode = loc.travelmode || 'driving';
//         const maxTravelTime = typeof loc.traveltime === 'number'
//           ? loc.traveltime
//           : Number(loc.traveltime) || 15; // default 15 minutes if NaN




//         // Fetch batch travel info
//         const travelResults = await getBatchTravelInfo(
//           { lat: userLat, lng: userLng },
//           destinations,
//           travelMode,
//           25 // batch size
//         );


//         // Filter destinations within maxTravelTime
//         const nearbyIds = travelResults
//           .filter(r => r.durationSeconds <= maxTravelTime * 60)
//           .map(r => r.zipCodeId);


//         validLocationIds.push(...nearbyIds);
//       }

//       // Remove duplicates and convert to ObjectId
//       validLocationIds = Array.from(new Set(validLocationIds.map(id => id.toString())))
//         .map(id => new mongoose.Types.ObjectId(id));

//       if (validLocationIds.length > 0) {
//         conditions.push({
//           serviceId: { $in: travelTimeServiceIds },
//           locationId: { $in: validLocationIds },
//         });
//       }
//     }

//     // 4 Draw-on-area
//     if (drawOnAreaServiceIds.length > 0) {
//       const locationIds = userLocationService
//         .filter(loc => loc.locationType === LocationType.DRAW_ON_AREA)
//         .map(loc => loc.locationGroupId)
//         .filter(Boolean)
//         .map((loc: any) => loc._id);

//       if (locationIds.length > 0) {
//         conditions.push({
//           serviceId: { $in: drawOnAreaServiceIds },
//           locationId: { $in: locationIds },
//         });
//       }
//     }



//   }






//   if (filters.coordinates) {
//     const { locationType, coord, rangeInKm = 5 } = filters.coordinates;


//     if (!Array.isArray(coord) || coord.length !== 2 || isNaN(coord[0]) || isNaN(coord[1])) {
//       throw new Error("Invalid coordinates provided for location filtering");
//     }

//     const supportedTypes = ["draw_on_area", "travel_time", "nation_wide", "distance_wise"];

//     if (locationType && supportedTypes.includes(locationType)) {
//       let nearbyLocationIds: Types.ObjectId[] = [];

//       // ------------------ CASE: DISTANCE BASED ------------------
//       if (locationType === "distance_wise") {
//         const radiusInMeters = rangeInKm * 1000;

//         const nearbyZips = await ZipCode.aggregate([
//           {
//             $geoNear: {
//               near: { type: "Point", coordinates: [coord[0], coord[1]] },
//               distanceField: "distance",
//               maxDistance: radiusInMeters,
//               spherical: true,
//             },
//           },
//           { $project: { _id: 1 } },
//         ]);

//         nearbyLocationIds = nearbyZips.map((z) => new mongoose.Types.ObjectId(z._id));
//       }

//       // ------------------ CASE: DRAW-ON-AREA (Polygon) ------------------
//       else if (locationType === "draw_on_area" && filters.coordinates.polygon) {
//         const { polygon } = filters.coordinates;
//         const nearbyZips = await ZipCode.find({
//           location: {
//             $geoWithin: {
//               $geometry: polygon,
//             },
//           },
//         }).select("_id");

//         nearbyLocationIds = nearbyZips.map((z) => new mongoose.Types.ObjectId(z._id));
//       }

//       // ------------------ CASE: TRAVEL-TIME BASED ------------------
//       else if (locationType === "travel_time") {
//         const { travelmode = "driving", traveltime = 15, coord } = filters.coordinates;

//         console.log('Travel-time filter params:', { travelmode, traveltime, coord });
//         // Fetch all zip codes once
//         const allZips = await ZipCode.find({ countryId: userProfile.country }).select('location');

//         // Prepare destinations for travel API
//         const destinations = allZips.map(z => ({
//           lat: z.location?.coordinates?.[1],
//           lng: z.location?.coordinates?.[0],
//           zipCodeId: z._id
//         }));


//         console.log(`Fetching travel info from (${coord[1]}, ${coord[0]}) using mode: ${travelmode}`);

//         // Fetch batch travel info
//         const travelResults = await getBatchTravelInfo(
//           { lat: coord[1], lng: coord[0] },
//           destinations,
//           travelmode,
//           25 // batch size
//         );

//         console.log('Travel Results fetched:', travelResults.length);

//         // Filter destinations within TravelTime
//         nearbyLocationIds = travelResults
//           .filter(r => r.durationSeconds <= traveltime * 60)
//           .map(r => r.zipCodeId);

//         console.log(`Found ${nearbyLocationIds.length} nearby locations within ${traveltime} minutes for travel-time filter`);


//       }

//       // ------------------ CASE: NATION-WIDE ------------------
//       else if (locationType === "nation_wide") {
//         // No filtering
//       }


//       //  Deduplicate as ObjectIds safely
//       const uniqueIds = Array.from(
//         new Set(nearbyLocationIds.map((id) => id.toString()))
//       ).map((idStr) => new mongoose.Types.ObjectId(idStr));

//       if (uniqueIds.length > 0) {
//         conditions.push({ locationId: { $in: uniqueIds } });
//       }
//     }
//   }





//   // 5 If no mappings, prevent match
//   if (conditions.length === 0) {
//     matchStage._id = { $exists: false };
//   } else {
//     matchStage.$or = conditions;
//   }



//   // ----------------------- ADDITIONAL FILTERS -----------------------
//   if (filters.spotlight?.length) matchStage.leadPriority = { $in: filters.spotlight };
//   if (filters.services?.length) {
//     matchStage.serviceId = { $in: filters.services.map((id: string) => new mongoose.Types.ObjectId(id)) };
//   }
//   if (filters.credits?.length) {
//     const creditConditions = filters.credits.map((range: string) => {
//       switch (range) {
//         case 'Free': return { credit: 0 };
//         case '1-5 credits': return { credit: { $gte: 1, $lte: 5 } };
//         case '5-10 credits': return { credit: { $gte: 5, $lte: 10 } };
//         case '10-20 credits': return { credit: { $gte: 10, $lte: 20 } };
//         case '20-30 credits': return { credit: { $gte: 20, $lte: 30 } };
//         case '30-40 credits': return { credit: { $gte: 30, $lte: 40 } };
//         case '40-50 credits': return { credit: { $gte: 40, $lte: 50 } };
//         case '50-100 credits': return { credit: { $gte: 50, $lte: 100 } };
//         default: return null;
//       }
//     }).filter(Boolean);
//     if (creditConditions.length) matchStage.$or = [...(matchStage.$or || []), ...creditConditions];
//   }
//   if (filters.location?.length) {
//     matchStage.locationId = { $in: filters.location.map((id: string) => new mongoose.Types.ObjectId(id)) };
//   }
//   if (filters.leadSubmission) {
//     let startDate: Date | null = null;
//     switch (filters.leadSubmission) {
//       case 'last_1_hour': startDate = new Date(Date.now() - 60 * 60 * 1000); break;
//       case 'last_24_hours': startDate = new Date(); startDate.setHours(0, 0, 0, 0); break;
//       case 'last_48_hours': startDate = new Date(); startDate.setDate(startDate.getDate() - 1); break;
//       case 'last_3_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 3); break;
//       case 'last_7_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 7); break;
//       case 'last_14_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 14); break;
//     }
//     if (startDate) matchStage.createdAt = { $gte: startDate };
//   }











//   // ----------------------- AGGREGATION PIPELINE -----------------------
//   const aggregationPipeline: any[] = [
//     { $match: matchStage },

//     // Apply sorting
//     { $sort: { [sortField]: sortOrder } }, // <- Add this line
//     // Lookups
//     { $lookup: { from: 'zipcodes', localField: 'locationId', foreignField: '_id', as: 'locationId' } },
//     { $unwind: { path: '$locationId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'userprofiles', localField: 'userProfileId', foreignField: '_id', as: 'userProfileId' } },
//     { $unwind: { path: '$userProfileId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'users', localField: 'userProfileId.user', foreignField: '_id', as: 'userProfileId.user' } },
//     { $unwind: { path: '$userProfileId.user', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'serviceId' } },
//     { $unwind: { path: '$serviceId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'userprofiles', localField: 'responders', foreignField: '_id', as: 'responders' } },
//   ];

//   if (filters.keyword) {
//     aggregationPipeline.push({
//       $match: {
//         $or: [
//           { 'userProfileId.name': { $regex: new RegExp(filters.keyword, 'i') } },
//           { additionalDetails: { $regex: new RegExp(filters.keyword, 'i') } },
//         ],
//       },
//     });
//   }

//   let leads = await Lead.aggregate(aggregationPipeline);


//   // ----------------------- PAGINATION -----------------------
//   const total = leads.length;
//   const paginatedLeads = leads.slice(skip, skip + limit);

//   return {
//     data: paginatedLeads,
//     pagination: { total, page, limit, totalPage: Math.ceil(total / limit) },
//     leadCount: { urgent: paginatedLeads.filter(l => l.leadPriority === 'urgent').length },
//   };
// };




// const getAllLeadForLawyerPanel = async (
//   userId: string,
//   filters: any = {},
//   options: {
//     page: number;
//     limit: number;
//     sortBy: string;
//     sortOrder: 'asc' | 'desc';
//   }
// ): Promise<any> => {
//   const userProfile = await UserProfile.findOne({ user: userId }).select('_id serviceIds country');
//   if (!userProfile) {
//     return {
//       data: [],
//       pagination: { total: 0, page: options.page, limit: options.limit, totalPage: 0 },
//       leadCount: {},
//     };
//   }

//   const page = options.page || 1;
//   const limit = options.limit || 10;
//   const skip = (page - 1) * limit;
//   const sortField = options.sortBy || 'createdAt';
//   const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
//   // ----------------------- FETCH USER LOCATION SERVICE MAPPINGS -----------------------
//   const userLocationService = await UserLocationServiceMap.find({ userProfileId: userProfile._id }).populate('locationGroupId');



//   // ----------------------- SEPARATE BY LOCATION TYPE -----------------------
//   const locationServiceByType: Record<string, mongoose.Types.ObjectId[]> = {
//     [LocationType.NATION_WIDE]: [],
//     [LocationType.DISTANCE_WISE]: [],
//     [LocationType.TRAVEL_TIME]: [],
//     [LocationType.DRAW_ON_AREA]: [],
//   };


//   // Fill service IDs by location type, remove duplicates
//   userLocationService.forEach(loc => {
//     if (loc.serviceIds && loc.serviceIds.length > 0) {
//       const type = loc.locationType as keyof typeof locationServiceByType;
//       const currentSet = new Set(locationServiceByType[type].map(id => id.toString()));
//       loc.serviceIds.forEach((id: any) => currentSet.add(id.toString()));
//       locationServiceByType[type] = Array.from(currentSet).map(id => new mongoose.Types.ObjectId(id));
//     }
//   });






//   // service IDs by location type
//   const nationwideServiceIds = locationServiceByType[LocationType.NATION_WIDE];
//   const distanceWiseServiceIds = locationServiceByType[LocationType.DISTANCE_WISE];
//   const travelTimeServiceIds = locationServiceByType[LocationType.TRAVEL_TIME];
//   const drawOnAreaServiceIds = locationServiceByType[LocationType.DRAW_ON_AREA];



//   console.log('Nationwide Service IDs:', nationwideServiceIds);
//   console.log('Distance-wise Service IDs:', distanceWiseServiceIds);
//   console.log('Travel-time Service IDs:', travelTimeServiceIds);
//   console.log('Draw-on-area Service IDs:', drawOnAreaServiceIds);



//   // // ----------------------- MATCH STAGE -----------------------
//   const matchStage: any = {
//     countryId: new mongoose.Types.ObjectId(userProfile.country),
//     userProfileId: { $ne: userProfile._id },
//     responders: { $ne: userProfile._id },
//     status: 'approved',
//   };




//   // ----------------------- BUILD MATCH CONDITIONS -----------------------
//   const conditions: any[] = [];


//   console.log('Filters received:', filters.coordinates);

//   if (!filters.coordinates) {


//     // 1 Nationwide (ignore locationId)
//     if (nationwideServiceIds.length > 0) {
//       conditions.push({ serviceId: { $in: nationwideServiceIds } });
//     }

//     // 2 Distance-wise

//     // if (distanceWiseServiceIds.length > 0) {
//     //   // Array to hold all locationIds that are nearby
//     //   let nearbyLocationIds: mongoose.Types.ObjectId[] = [];

//     //   for (const loc of userLocationService.filter(l => l.locationType === LocationType.DISTANCE_WISE)) {
//     //     if (!loc.locationGroupId) continue;
//     //     // Fetch the coordinates from the ZipCode
//     //     const zip = await ZipCode.findById(loc.locationGroupId).select('location');

//     //     if (!zip || !zip.location) continue;

//     //     const radiusInMeters = (loc.rangeInKm || 5) * 1000; // convert km to meters

//     //     const nearby = await ZipCode.aggregate([
//     //       {
//     //         $geoNear: {
//     //           near: { type: "Point", coordinates: [zip.location.coordinates[0], zip.location.coordinates[1]] },
//     //           distanceField: "distance",
//     //           maxDistance: radiusInMeters,
//     //           spherical: true,
//     //         },
//     //       },
//     //       { $project: { _id: 1 } },
//     //     ]);

//     //     nearbyLocationIds.push(...nearby.map(z => z._id));
//     //   }

//     //   // Remove duplicates
//     //   nearbyLocationIds = Array.from(new Set(nearbyLocationIds.map(id => id.toString()))).map(id => new mongoose.Types.ObjectId(id));

//     //   // If we found nearby location IDs, add them to the conditions

//     //   if (nearbyLocationIds.length > 0) {
//     //     conditions.push({
//     //       serviceId: { $in: distanceWiseServiceIds },
//     //       locationId: { $in: nearbyLocationIds },
//     //     });
//     //   }



//     // }


//     if (distanceWiseServiceIds.length > 0) {
//       // Step 1: Collect distance-wise location entries
//       const distanceWiseLocations = userLocationService.filter(
//         (l) => l.locationType === LocationType.DISTANCE_WISE
//       );

//       let nearbyLocationIds: mongoose.Types.ObjectId[] = [];

//       // Step 2: Loop through each location to find nearby zip codes
//       for (const loc of distanceWiseLocations) {
//         const locationGroup = loc.locationGroupId as IZipCode;
//         const coords = locationGroup.location?.coordinates;

//         if (!coords || coords.length < 2) continue;

//         const [lng, lat] = coords;
//         const rangeInKm = loc.rangeInKm || 5;
//         const radiusInMeters = rangeInKm * 1000;

//         // Step 3: Use $geoNear to find nearby zip codes within the range
//         const nearby = await ZipCode.aggregate([
//           {
//             $geoNear: {
//               near: { type: "Point", coordinates: [lng, lat] },
//               distanceField: "distance",
//               maxDistance: radiusInMeters,
//               spherical: true,
//             },
//           },
//           { $project: { _id: 1 } },
//         ]);

//         // Step 4: Push found IDs
//         nearbyLocationIds.push(...nearby.map((z) => z._id));
//       }

//       // Step 5: Deduplicate all nearby locations
//       nearbyLocationIds = Array.from(
//         new Set(nearbyLocationIds.map((id) => id.toString()))
//       ).map((id) => new mongoose.Types.ObjectId(id));

//       // Step 6: Add query condition
//       if (nearbyLocationIds.length > 0) {
//         conditions.push({
//           serviceId: { $in: distanceWiseServiceIds },
//           locationId: { $in: nearbyLocationIds },
//         });
//       }


//     }



//     // 3 Travel-time

//     // if (travelTimeServiceIds.length > 0) {
//     //   // Fetch all zip codes once
//     //   const allZips = await ZipCode.find({ countryId: userProfile.country }).select('location');


//     //   // Prepare destinations for travel API
//     //   const destinations = allZips.map(z => ({
//     //     lat: z.location?.coordinates?.[1],
//     //     lng: z.location?.coordinates?.[0],
//     //     zipCodeId: z._id
//     //   }));

//     //   let validLocationIds: mongoose.Types.ObjectId[] = [];

//     //   const travelTimeMappings = userLocationService.filter(l => l.locationType === LocationType.TRAVEL_TIME);

//     //   for (const loc of travelTimeMappings) {
//     //     if (!loc.locationGroupId) continue;

//     //     // Get coordinates of user's reference location
//     //     const zip = await ZipCode.findById(loc.locationGroupId).select('location');
//     //     if (!zip || !zip.location) continue;

//     //     const userLat = zip.location.coordinates[1];
//     //     const userLng = zip.location.coordinates[0];

//     //     const travelMode = loc.travelmode || 'driving';
//     //     const maxTravelTime = typeof loc.traveltime === 'number'
//     //       ? loc.traveltime
//     //       : Number(loc.traveltime) || 15; // default 15 minutes if NaN




//     //     // Fetch batch travel info
//     //     const travelResults = await getBatchTravelInfo(
//     //       { lat: userLat, lng: userLng },
//     //       destinations,
//     //       travelMode,
//     //       25 // batch size
//     //     );

//     //     // Filter destinations within maxTravelTime
//     //     const nearbyIds = travelResults
//     //       .filter(r => r.durationSeconds <= maxTravelTime * 60)
//     //       .map(r => r.zipCodeId);


//     //     validLocationIds.push(...nearbyIds);
//     //   }

//     //   // Remove duplicates and convert to ObjectId
//     //   validLocationIds = Array.from(new Set(validLocationIds.map(id => id.toString())))
//     //     .map(id => new mongoose.Types.ObjectId(id));

//     //   if (validLocationIds.length > 0) {
//     //     conditions.push({
//     //       serviceId: { $in: travelTimeServiceIds },
//     //       locationId: { $in: validLocationIds },
//     //     });
//     //   }
//     // }


//     if (travelTimeServiceIds.length > 0) {

//       const { condition: travelTimeCondition } = await findLeadsWithinTravelTime(
//         userProfile,
//         userLocationService,
//         travelTimeServiceIds
//       );

//       if (travelTimeCondition) {
//         conditions.push(travelTimeCondition);
//       }
//     }

//     // 4 Draw-on-area
//     if (drawOnAreaServiceIds.length > 0) {
//       const locationIds = userLocationService
//         .filter(loc => loc.locationType === LocationType.DRAW_ON_AREA)
//         .map(loc => loc.locationGroupId)
//         .filter(Boolean)
//         .map((loc: any) => loc._id);

//       if (locationIds.length > 0) {
//         conditions.push({
//           serviceId: { $in: drawOnAreaServiceIds },
//           locationId: { $in: locationIds },
//         });
//       }
//     }



//   }






//   if (filters.coordinates) {
//     const { locationType, coord, rangeInKm = 5 } = filters.coordinates;


//     if (!Array.isArray(coord) || coord.length !== 2 || isNaN(coord[0]) || isNaN(coord[1])) {
//       throw new Error("Invalid coordinates provided for location filtering");
//     }

//     const supportedTypes = ["draw_on_area", "travel_time", "nation_wide", "distance_wise"];

//     if (locationType && supportedTypes.includes(locationType)) {
//       let nearbyLocationIds: Types.ObjectId[] = [];

//       // ------------------ CASE: DISTANCE BASED ------------------
//       if (locationType === "distance_wise") {
//         const radiusInMeters = rangeInKm * 1000;

//         const nearbyZips = await ZipCode.aggregate([
//           {
//             $geoNear: {
//               near: { type: "Point", coordinates: [coord[0], coord[1]] },
//               distanceField: "distance",
//               maxDistance: radiusInMeters,
//               spherical: true,
//             },
//           },
//           { $project: { _id: 1 } },
//         ]);

//         nearbyLocationIds = nearbyZips.map((z) => new mongoose.Types.ObjectId(z._id));
//       }

//       // ------------------ CASE: DRAW-ON-AREA (Polygon) ------------------
//       else if (locationType === "draw_on_area" && filters.coordinates.polygon) {
//         const { polygon } = filters.coordinates;
//         const nearbyZips = await ZipCode.find({
//           location: {
//             $geoWithin: {
//               $geometry: polygon,
//             },
//           },
//         }).select("_id");

//         nearbyLocationIds = nearbyZips.map((z) => new mongoose.Types.ObjectId(z._id));
//       }

//       // ------------------ CASE: TRAVEL-TIME BASED ------------------
//       else if (locationType === "travel_time") {
//         const { travelmode = "driving", traveltime = 15, coord } = filters.coordinates;

//         console.log('Travel-time filter params:', { travelmode, traveltime, coord });
//         // Fetch all zip codes once
//         const allZips = await ZipCode.find({ countryId: userProfile.country }).select('location');

//         // Prepare destinations for travel API
//         const destinations = allZips.map(z => ({
//           lat: z.location?.coordinates?.[1],
//           lng: z.location?.coordinates?.[0],
//           zipCodeId: z._id
//         }));


//         console.log(`Fetching travel info from (${coord[1]}, ${coord[0]}) using mode: ${travelmode}`);

//         // Fetch batch travel info
//         const travelResults = await getBatchTravelInfo(
//           { lat: coord[1], lng: coord[0] },
//           destinations,
//           travelmode,
//           25 // batch size
//         );

//         console.log('Travel Results fetched:', travelResults.length);

//         // Filter destinations within TravelTime
//         nearbyLocationIds = travelResults
//           .filter(r => r.durationSeconds <= traveltime * 60)
//           .map(r => r.zipCodeId);

//         console.log(`Found ${nearbyLocationIds.length} nearby locations within ${traveltime} minutes for travel-time filter`);


//       }

//       // ------------------ CASE: NATION-WIDE ------------------
//       else if (locationType === "nation_wide") {
//         // No filtering
//       }


//       //  Deduplicate as ObjectIds safely
//       const uniqueIds = Array.from(
//         new Set(nearbyLocationIds.map((id) => id.toString()))
//       ).map((idStr) => new mongoose.Types.ObjectId(idStr));

//       if (uniqueIds.length > 0) {
//         conditions.push({ locationId: { $in: uniqueIds } });
//       }
//     }
//   }





//   // 5 If no mappings, prevent match

//   if (conditions.length === 0) {
//     matchStage._id = { $exists: false };
//   } else {
//     matchStage.$or = conditions;
//   }



//   // ----------------------- ADDITIONAL FILTERS -----------------------
//   if (filters.spotlight?.length) matchStage.leadPriority = { $in: filters.spotlight };
//   if (filters.services?.length) {
//     matchStage.serviceId = { $in: filters.services.map((id: string) => new mongoose.Types.ObjectId(id)) };
//   }
//   if (filters.credits?.length) {
//     const creditConditions = filters.credits.map((range: string) => {
//       switch (range) {
//         case 'Free': return { credit: 0 };
//         case '1-5 credits': return { credit: { $gte: 1, $lte: 5 } };
//         case '5-10 credits': return { credit: { $gte: 5, $lte: 10 } };
//         case '10-20 credits': return { credit: { $gte: 10, $lte: 20 } };
//         case '20-30 credits': return { credit: { $gte: 20, $lte: 30 } };
//         case '30-40 credits': return { credit: { $gte: 30, $lte: 40 } };
//         case '40-50 credits': return { credit: { $gte: 40, $lte: 50 } };
//         case '50-100 credits': return { credit: { $gte: 50, $lte: 100 } };
//         default: return null;
//       }
//     }).filter(Boolean);
//     if (creditConditions.length) matchStage.$or = [...(matchStage.$or || []), ...creditConditions];
//   }
//   if (filters.location?.length) {
//     matchStage.locationId = { $in: filters.location.map((id: string) => new mongoose.Types.ObjectId(id)) };
//   }
//   if (filters.leadSubmission) {
//     let startDate: Date | null = null;
//     switch (filters.leadSubmission) {
//       case 'last_1_hour': startDate = new Date(Date.now() - 60 * 60 * 1000); break;
//       case 'last_24_hours': startDate = new Date(); startDate.setHours(0, 0, 0, 0); break;
//       case 'last_48_hours': startDate = new Date(); startDate.setDate(startDate.getDate() - 1); break;
//       case 'last_3_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 3); break;
//       case 'last_7_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 7); break;
//       case 'last_14_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 14); break;
//     }
//     if (startDate) matchStage.createdAt = { $gte: startDate };
//   }



//   /* 

//   business logic:

//   **leadService

//   1. current logged-in lawyer leadservice 
//   2. based leadservice selected options true data filter 


//   **leadserviceanswers
//   1. leadserviceanswers filter by lead id
//   2. 


//   **lead serviceanswers and Leadservice 

//  1. match with leadservice selected options and leadserviceanswers selected options wise match data fetch

//  *finally

//   1. leadservice with leadserviceanswers array data fetch
//   2. based lead service and leadAnswer show lead data fetch
//   3. if no leadservice selected options true data means no lead show


//   */







//   // ----------------------- AGGREGATION PIPELINE -----------------------
//   const aggregationPipeline: any[] = [
//     { $match: matchStage },

//     // Apply sorting
//     { $sort: { [sortField]: sortOrder } }, // <- Add this line

//     // Lookups
//     { $lookup: { from: 'zipcodes', localField: 'locationId', foreignField: '_id', as: 'locationId' } },
//     { $unwind: { path: '$locationId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'userprofiles', localField: 'userProfileId', foreignField: '_id', as: 'userProfileId' } },
//     { $unwind: { path: '$userProfileId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'users', localField: 'userProfileId.user', foreignField: '_id', as: 'userProfileId.user' } },
//     { $unwind: { path: '$userProfileId.user', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'serviceId' } },
//     { $unwind: { path: '$serviceId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'userprofiles', localField: 'responders', foreignField: '_id', as: 'responders' } },



//     // ----------------------- LEAD SERVICE & ANSWERS -----------------------
//     {
//       $lookup: {
//         from: 'leadserviceanswers',
//         let: { leadId: '$_id' },
//         pipeline: [
//           { $match: { $expr: { $eq: ['$leadId', '$$leadId'] } } },
//           { $match: { isSelected: true } },
//         ],
//         as: 'leadServiceAnswers',
//       },
//     },
//     {
//       $lookup: {
//         from: 'userwiseservicewisequestionwiseoptions',
//         let: { serviceId: '$serviceId._id' },
//         pipeline: [
//           { $match: { $expr: { $and: [{ $eq: ['$userProfileId', userProfile._id] }, { $eq: ['$isSelected', true] }, { $eq: ['$countryId', new mongoose.Types.ObjectId(userProfile.country)] }] } } },
//         ],
//         as: 'lawyerLeadServices',
//       },
//     },
//     {
//       $addFields: {
//         matchedAnswers: {
//           $filter: {
//             input: '$leadServiceAnswers',
//             as: 'answer',
//             cond: {
//               $anyElementTrue: {
//                 $map: {
//                   input: '$lawyerLeadServices',
//                   as: 'lawyer',
//                   in: {
//                     $and: [
//                       { $eq: ['$$answer.serviceId', '$$lawyer.serviceId'] },
//                       { $eq: ['$$answer.questionId', '$$lawyer.questionId'] },
//                       { $eq: ['$$answer.optionId', '$$lawyer.optionId'] },
//                     ],
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },

//     // Only include leads with matched answers

//     { $match: { 'matchedAnswers.0': { $exists: true } } },


//     // ----------------------- REMOVE UNUSED FIELDS -----------------------
//     {
//       $project: {
//         leadServiceAnswers: 0,
//         lawyerLeadServices: 0,
//         matchedAnswers: 0,
//       },
//     },






//   ];

//   if (filters.keyword) {
//     aggregationPipeline.push({
//       $match: {
//         $or: [
//           { 'userProfileId.name': { $regex: new RegExp(filters.keyword, 'i') } },
//           { additionalDetails: { $regex: new RegExp(filters.keyword, 'i') } },
//         ],
//       },
//     });
//   }

//   let leads = await Lead.aggregate(aggregationPipeline);


//   // ----------------------- PAGINATION -----------------------
//   const total = leads.length;
//   const paginatedLeads = leads.slice(skip, skip + limit);

//   return {
//     data: paginatedLeads,
//     pagination: { total, page, limit, totalPage: Math.ceil(total / limit) },
//     leadCount: { urgent: paginatedLeads.filter(l => l.leadPriority === 'urgent').length },
//   };
// };





//   optimization code 


// Average speeds in meters/minute per travel mode
const TRAVEL_SPEEDS: Record<string, number> = {
  driving: 1000, // ~60 km/h
  walking: 83.33, // ~5 km/h
  cycling: 250, // ~15 km/h
  transit: 500, // ~30 km/h
};






// const getAllLeadForLawyerPanel = async (
//   userId: string,
//   filters: any = {},
//   options: {
//     page: number;
//     limit: number;
//     sortBy: string;
//     sortOrder: 'asc' | 'desc';
//   }
// ): Promise<any> => {
//   const userProfile = await UserProfile.findOne({ user: userId }).select('_id serviceIds country');
//   if (!userProfile) {
//     return {
//       data: [],
//       pagination: { total: 0, page: options.page, limit: options.limit, totalPage: 0 },
//       leadCount: {},
//     };
//   }

//   const page = options.page || 1;
//   const limit = options.limit || 10;
//   const skip = (page - 1) * limit;
//   const sortField = options.sortBy || 'createdAt';
//   const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
//   // ----------------------- FETCH USER LOCATION SERVICE MAPPINGS -----------------------
//   const userLocationService = await UserLocationServiceMap.find({ userProfileId: userProfile._id }).populate('locationGroupId');



//   // ----------------------- SEPARATE BY LOCATION TYPE -----------------------
//   const locationServiceByType: Record<string, mongoose.Types.ObjectId[]> = {
//     [LocationType.NATION_WIDE]: [],
//     [LocationType.DISTANCE_WISE]: [],
//     [LocationType.TRAVEL_TIME]: [],
//     [LocationType.DRAW_ON_AREA]: [],
//   };


//   // Fill service IDs by location type, remove duplicates
//   userLocationService.forEach(loc => {
//     if (loc.serviceIds && loc.serviceIds.length > 0) {
//       const type = loc.locationType as keyof typeof locationServiceByType;
//       const currentSet = new Set(locationServiceByType[type].map(id => id.toString()));
//       loc.serviceIds.forEach((id: any) => currentSet.add(id.toString()));
//       locationServiceByType[type] = Array.from(currentSet).map(id => new mongoose.Types.ObjectId(id));
//     }
//   });






//   // service IDs by location type
//   const nationwideServiceIds = locationServiceByType[LocationType.NATION_WIDE];
//   const distanceWiseServiceIds = locationServiceByType[LocationType.DISTANCE_WISE];
//   const travelTimeServiceIds = locationServiceByType[LocationType.TRAVEL_TIME];
//   const drawOnAreaServiceIds = locationServiceByType[LocationType.DRAW_ON_AREA];







//   // // ----------------------- MATCH STAGE -----------------------
//   const matchStage: any = {
//     countryId: new mongoose.Types.ObjectId(userProfile.country),
//     userProfileId: { $ne: userProfile._id },
//     responders: { $ne: userProfile._id },
//     status: 'approved',
//   };




//   // ----------------------- BUILD MATCH CONDITIONS -----------------------
//   const conditions: any[] = [];




//   if (!filters.coordinates) {


//     // 1 Nationwide (ignore locationId)
//     if (nationwideServiceIds.length > 0) {
//       conditions.push({ serviceId: { $in: nationwideServiceIds } });
//     }



//     if (distanceWiseServiceIds.length > 0) {
//       // Step 1: Collect distance-wise location entries
//       const distanceWiseLocations = userLocationService.filter(
//         (l) => l.locationType === LocationType.DISTANCE_WISE
//       );

//       let nearbyLeadIds: mongoose.Types.ObjectId[] = [];

//       // Step 2: Loop through each location to find nearby leads
//       for (const loc of distanceWiseLocations) {
//         const locationGroup = loc.locationGroupId as IZipCode;
//         const coords = locationGroup.location?.coordinates;

//         if (!coords || coords.length < 2) continue;

//         const [lng, lat] = coords;
//         const rangeInKm = loc.rangeInKm || 5;
//         const radiusInMeters = rangeInKm * 1000;

//         // Step 3: Use $geoNear to find nearby leads filtered by serviceIds
//         const nearbyLeads = await Lead.aggregate([
//           {
//             $geoNear: {
//               near: { type: 'Point', coordinates: [lng, lat] },
//               distanceField: 'distance',
//               maxDistance: radiusInMeters,
//               spherical: true,
//               query: { serviceId: { $in: distanceWiseServiceIds } }, // <-- filter by serviceIds
//             },
//           },
//           { $project: { _id: 1 } }, // only get lead IDs
//         ]);

//         // Step 4: Push found lead IDs
//         nearbyLeadIds.push(...nearbyLeads.map((l) => l._id));
//       }

//       // Step 5: Deduplicate all nearby lead IDs
//       nearbyLeadIds = Array.from(
//         new Set(nearbyLeadIds.map((id) => id.toString()))
//       ).map((id) => new mongoose.Types.ObjectId(id));

//       // Step 6: Add query condition
//       if (nearbyLeadIds.length > 0) {
//         conditions.push({
//           _id: { $in: nearbyLeadIds },
//         });
//       }
//     }





//     if (travelTimeServiceIds.length > 0) {
//       // Step 1: Collect travel-time locations
//       const travelTimeLocations = userLocationService.filter(
//         (l) => l.locationType === LocationType.TRAVEL_TIME
//       );

//       let travelTimeLeadIds: mongoose.Types.ObjectId[] = [];

//       // Step 2: Loop through each travel-time location
//       for (const loc of travelTimeLocations) {
//         const locationGroup = loc.locationGroupId as IZipCode;
//         const coords = locationGroup.location?.coordinates;

//         if (!coords || coords.length < 2) continue;

//         const [lng, lat] = coords;

//         // Step 2a: Determine max distance based on travel mode
//         const travelMode = loc.travelmode || 'driving'; // default driving
//         const travelTimeInMinutes = Number(loc.traveltime) || 30;
//         const speed = TRAVEL_SPEEDS[travelMode] || TRAVEL_SPEEDS['driving'];
//         const radiusInMeters = travelTimeInMinutes * speed; // approximate radius

//         // Step 3: Use $geoNear to find nearby leads within travel-time radius
//         const nearbyLeads = await Lead.aggregate([
//           {
//             $geoNear: {
//               near: { type: 'Point', coordinates: [lng, lat] },
//               distanceField: 'distance',
//               maxDistance: radiusInMeters,
//               spherical: true,
//               query: { serviceId: { $in: travelTimeServiceIds } },
//             },
//           },
//           { $project: { _id: 1 } },
//         ]);

//         // Step 4: Collect lead IDs
//         travelTimeLeadIds.push(...nearbyLeads.map((l) => l._id));
//       }

//       // Step 5: Deduplicate
//       travelTimeLeadIds = Array.from(
//         new Set(travelTimeLeadIds.map((id) => id.toString()))
//       ).map((id) => new mongoose.Types.ObjectId(id));

//       // Step 6: Add to conditions
//       if (travelTimeLeadIds.length > 0) {
//         conditions.push({
//           _id: { $in: travelTimeLeadIds },
//         });
//       }


//     }


//     // 4 Draw-on-area
//     if (drawOnAreaServiceIds.length > 0) {
//       // Step 1: Get all user locations of type DRAW_ON_AREA
//       const drawAreaLocations = userLocationService
//         .filter((loc) => loc.locationType === LocationType.DRAW_ON_AREA)
//         .map((loc) => loc.locationGroupId) // extract the location group (ZipCode)
//         .filter(Boolean); // remove null or undefined

//       // Step 2: Extract location IDs
//       const locationIds: mongoose.Types.ObjectId[] = drawAreaLocations
//         .map((loc: any) => loc._id)
//         .filter(Boolean);

//       // Step 3: Push query condition if any locations exist
//       if (locationIds.length > 0) {
//         conditions.push({
//           serviceId: { $in: drawOnAreaServiceIds },
//           locationId: { $in: locationIds },
//         });
//       }
//     }


//   }



//   if (filters.coordinates) {
//     const {
//       locationType,
//       coord,
//       rangeInKm = 5,
//       serviceIds = [],
//       polygon,
//       travelmode = "driving",
//       traveltime = 15,
//     } = filters.coordinates;

//     if (
//       coord &&
//       (!Array.isArray(coord) || coord.length !== 2 || isNaN(coord[0]) || isNaN(coord[1]))
//     ) {
//       throw new Error("Invalid coordinates provided for location filtering");
//     }

//     const supportedTypes = ["draw_on_area", "travel_time", "nation_wide", "distance_wise"];

//     if (locationType && supportedTypes.includes(locationType)) {
//       let nearbyLocationIds: Types.ObjectId[] = [];

//       // ------------------ DISTANCE-WISE ------------------
//       if (locationType === "distance_wise") {
//         const radiusInMeters = rangeInKm * 1000;

//         const nearbyLeads = await Lead.aggregate([
//           {
//             $geoNear: {
//               near: { type: "Point", coordinates: [coord[0], coord[1]] },
//               distanceField: "distance",
//               maxDistance: radiusInMeters,
//               spherical: true,
//               query: serviceIds.length > 0 ? { serviceId: { $in: serviceIds } } : {},
//             },
//           },
//           { $project: { _id: 1 } },
//         ]);

//         nearbyLocationIds = nearbyLeads.map((l) => l._id);
//       }

//       // ------------------ DRAW-ON-AREA ------------------
//       else if (locationType === "draw_on_area" && polygon) {
//         const nearbyZips = await ZipCode.find({
//           location: {
//             $geoWithin: { $geometry: polygon },
//           },
//         }).select("_id");

//         nearbyLocationIds = nearbyZips.map((z) => new mongoose.Types.ObjectId(z._id));
//       }

//       // ------------------ TRAVEL-TIME ------------------
//       else if (locationType === "travel_time") {
//         if (!coord || coord.length !== 2) {
//           throw new Error("Coordinates required for travel-time filter");
//         }

//         const speed = TRAVEL_SPEEDS[travelmode] || TRAVEL_SPEEDS["driving"];
//         const radiusInMeters = traveltime * speed;

//         const nearbyLeads = await Lead.aggregate([
//           {
//             $geoNear: {
//               near: { type: "Point", coordinates: [coord[0], coord[1]] },
//               distanceField: "distance",
//               maxDistance: radiusInMeters,
//               spherical: true,
//               query: serviceIds.length > 0 ? { serviceId: { $in: serviceIds } } : {},
//             },
//           },
//           { $project: { _id: 1 } },
//         ]);

//         nearbyLocationIds = nearbyLeads.map((l) => l._id);
//       }

//       // ------------------ NATION-WIDE ------------------
//       else if (locationType === "nation_wide") {
//         if (serviceIds.length > 0) {
//           conditions.push({ serviceId: { $in: serviceIds } });
//         }
//       }

//       // Deduplicate and add to conditions
//       if (nearbyLocationIds.length > 0) {
//         nearbyLocationIds = Array.from(
//           new Set(nearbyLocationIds.map((id) => id.toString()))
//         ).map((id) => new mongoose.Types.ObjectId(id));

//         conditions.push({ _id: { $in: nearbyLocationIds } });
//       }
//     }
//   }




//   // // 5 If no mappings, prevent match

//   if (conditions.length === 0) {
//     matchStage._id = { $exists: false };
//   } else {
//     matchStage.$or = conditions;
//   }








//   // ----------------------- ADDITIONAL FILTERS -----------------------
//   if (filters.spotlight?.length) matchStage.leadPriority = { $in: filters.spotlight };
//   if (filters.services?.length) {
//     matchStage.serviceId = { $in: filters.services.map((id: string) => new mongoose.Types.ObjectId(id)) };
//   }
//   if (filters.credits?.length) {
//     const creditConditions = filters.credits.map((range: string) => {
//       switch (range) {
//         case 'Free': return { credit: 0 };
//         case '1-5 credits': return { credit: { $gte: 1, $lte: 5 } };
//         case '5-10 credits': return { credit: { $gte: 5, $lte: 10 } };
//         case '10-20 credits': return { credit: { $gte: 10, $lte: 20 } };
//         case '20-30 credits': return { credit: { $gte: 20, $lte: 30 } };
//         case '30-40 credits': return { credit: { $gte: 30, $lte: 40 } };
//         case '40-50 credits': return { credit: { $gte: 40, $lte: 50 } };
//         case '50-100 credits': return { credit: { $gte: 50, $lte: 100 } };
//         default: return null;
//       }
//     }).filter(Boolean);
//     if (creditConditions.length) matchStage.$or = [...(matchStage.$or || []), ...creditConditions];
//   }
//   if (filters.location?.length) {
//     matchStage.locationId = { $in: filters.location.map((id: string) => new mongoose.Types.ObjectId(id)) };
//   }
//   if (filters.leadSubmission) {
//     let startDate: Date | null = null;
//     switch (filters.leadSubmission) {
//       case 'last_1_hour': startDate = new Date(Date.now() - 60 * 60 * 1000); break;
//       case 'last_24_hours': startDate = new Date(); startDate.setHours(0, 0, 0, 0); break;
//       case 'last_48_hours': startDate = new Date(); startDate.setDate(startDate.getDate() - 1); break;
//       case 'last_3_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 3); break;
//       case 'last_7_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 7); break;
//       case 'last_14_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 14); break;
//     }
//     if (startDate) matchStage.createdAt = { $gte: startDate };
//   }



//   /* 

//   business logic:

//   **leadService

//   1. current logged-in lawyer leadservice 
//   2. based leadservice selected options true data filter 


//   **leadserviceanswers
//   1. leadserviceanswers filter by lead id
//   2. 


//   **lead serviceanswers and Leadservice 

//  1. match with leadservice selected options and leadserviceanswers selected options wise match data fetch

//  *finally

//   1. leadservice with leadserviceanswers array data fetch
//   2. based lead service and leadAnswer show lead data fetch
//   3. if no leadservice selected options true data means no lead show


//   */







//   // ----------------------- AGGREGATION PIPELINE -----------------------
//   const aggregationPipeline: any[] = [
//     { $match: matchStage },

//     // Apply sorting
//     { $sort: { [sortField]: sortOrder } }, // <- Add this line

//     // Lookups
//     { $lookup: { from: 'zipcodes', localField: 'locationId', foreignField: '_id', as: 'locationId' } },

//     // {
//     //   $lookup: {
//     //     from: 'zipcodes',
//     //     let: { locationId: '$locationId' }, // Pass the lead's locationId
//     //     pipeline: [
//     //       { $match: { $expr: { $eq: ['$_id', '$$locationId'] } } },
//     //       { $project: { _id: 1, zipCode: 1 } }, // Only _id and zipCode
//     //     ],
//     //     as: 'locationId',
//     //   },
//     // },
//     { $unwind: { path: '$locationId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'userprofiles', localField: 'userProfileId', foreignField: '_id', as: 'userProfileId' } },
//     { $unwind: { path: '$userProfileId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'users', localField: 'userProfileId.user', foreignField: '_id', as: 'userProfileId.user' } },
//     { $unwind: { path: '$userProfileId.user', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'serviceId' } },
//     { $unwind: { path: '$serviceId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'userprofiles', localField: 'responders', foreignField: '_id', as: 'responders' } },

//     // ----------------------- LEAD SERVICE & ANSWERS -----------------------
//     {
//       $lookup: {
//         from: 'leadserviceanswers',
//         let: { leadId: '$_id' },
//         pipeline: [
//           { $match: { $expr: { $eq: ['$leadId', '$$leadId'] } } },
//           { $match: { isSelected: true } },
//         ],
//         as: 'leadServiceAnswers',
//       },
//     },
//     {
//       $lookup: {
//         from: 'userwiseservicewisequestionwiseoptions',
//         let: { serviceId: '$serviceId._id' },
//         pipeline: [
//           { $match: { $expr: { $and: [{ $eq: ['$userProfileId', userProfile._id] }, { $eq: ['$isSelected', true] }, { $eq: ['$countryId', new mongoose.Types.ObjectId(userProfile.country)] }] } } },
//         ],
//         as: 'lawyerLeadServices',
//       },
//     },
//     {
//       $addFields: {
//         matchedAnswers: {
//           $filter: {
//             input: '$leadServiceAnswers',
//             as: 'answer',
//             cond: {
//               $anyElementTrue: {
//                 $map: {
//                   input: '$lawyerLeadServices',
//                   as: 'lawyer',
//                   in: {
//                     $and: [
//                       { $eq: ['$$answer.serviceId', '$$lawyer.serviceId'] },
//                       { $eq: ['$$answer.questionId', '$$lawyer.questionId'] },
//                       { $eq: ['$$answer.optionId', '$$lawyer.optionId'] },
//                     ],
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },

//     // Only include leads with matched answers

//     { $match: { 'matchedAnswers.0': { $exists: true } } },


//     // ----------------------- REMOVE UNUSED FIELDS -----------
//     {
//       $project: {
//         leadServiceAnswers: 0,
//         lawyerLeadServices: 0,
//         matchedAnswers: 0,
//       },
//     },



//   ];

//   if (filters.keyword) {
//     aggregationPipeline.push({
//       $match: {
//         $or: [
//           { 'userProfileId.name': { $regex: new RegExp(filters.keyword, 'i') } },
//           { additionalDetails: { $regex: new RegExp(filters.keyword, 'i') } },
//         ],
//       },
//     });
//   }

//   let leads = await Lead.aggregate(aggregationPipeline);


//   // ----------------------- PAGINATION -----------------------
//   const total = leads.length;
//   const paginatedLeads = leads.slice(skip, skip + limit);

//   return {
//     data: paginatedLeads,
//     pagination: { total, page, limit, totalPage: Math.ceil(total / limit) },
//     leadCount: { urgent: paginatedLeads.filter(l => l.leadPriority === 'urgent').length },
//   };
// };





//  -------------------------------  finally optimization code ---------------------------

// const getAllLeadForLawyerPanel = async (
//   userId: string,
//   filters: any = {},
//   options: {
//     page: number;
//     limit: number;
//     sortBy: string;
//     sortOrder: 'asc' | 'desc';
//   }
// ): Promise<any> => {
//   const userProfile = await UserProfile.findOne({ user: userId }).select('_id serviceIds country');
//   if (!userProfile) {
//     return {
//       data: [],
//       pagination: { total: 0, page: options.page, limit: options.limit, totalPage: 0 },
//       leadCount: {},
//     };
//   }




//   const page = options.page || 1;
//   const limit = options.limit || 10;
//   const skip = (page - 1) * limit;
//   const sortField = options.sortBy || 'createdAt';
//   const sortOrder = options.sortOrder === 'asc' ? 1 : -1;




//   // ----------------------- CACHE KEY -----------------------

//   // const cacheKey = `leads_${userId}_${JSON.stringify(filters)}_${JSON.stringify(options)}`;
//   // Check if the data is cached in Redis

//   // Check cache
//   const cachedData = await redisClient.get(CacheKeys.LEAD_LIST_BY_USER_WITH_FILTERS(userId, filters, options));
//   if (cachedData) {
//     console.log('Cache hit of lawyer panel leads for key:',);
//     return JSON.parse(cachedData);
//   }






//   // ----------------------- FETCH USER LOCATION SERVICE MAPPINGS -----------------------
//   const userLocationService = await UserLocationServiceMap.find({ userProfileId: userProfile._id }).populate('locationGroupId');



//   // ----------------------- SEPARATE BY LOCATION TYPE -----------------------
//   const locationServiceByType: Record<string, mongoose.Types.ObjectId[]> = {
//     [LocationType.NATION_WIDE]: [],
//     [LocationType.DISTANCE_WISE]: [],
//     [LocationType.TRAVEL_TIME]: [],
//     [LocationType.DRAW_ON_AREA]: [],
//   };


//   // Fill service IDs by location type, remove duplicates
//   userLocationService.forEach(loc => {
//     if (loc.serviceIds && loc.serviceIds.length > 0) {
//       const type = loc.locationType as keyof typeof locationServiceByType;
//       const currentSet = new Set(locationServiceByType[type].map(id => id.toString()));
//       loc.serviceIds.forEach((id: any) => currentSet.add(id.toString()));
//       locationServiceByType[type] = Array.from(currentSet).map(id => new mongoose.Types.ObjectId(id));
//     }
//   });






//   // service IDs by location type
//   const nationwideServiceIds = locationServiceByType[LocationType.NATION_WIDE];
//   const distanceWiseServiceIds = locationServiceByType[LocationType.DISTANCE_WISE];
//   const travelTimeServiceIds = locationServiceByType[LocationType.TRAVEL_TIME];
//   const drawOnAreaServiceIds = locationServiceByType[LocationType.DRAW_ON_AREA];







//   // // ----------------------- MATCH STAGE -----------------------
//   const matchStage: any = {
//     countryId: new mongoose.Types.ObjectId(userProfile.country),
//     userProfileId: { $ne: userProfile._id },
//     responders: { $ne: userProfile._id },
//     status: 'approved',
//   };




//   // ----------------------- BUILD MATCH CONDITIONS -----------------------
//   const conditions: any[] = [];




//   if (!filters.coordinates) {


//     // 1 Nationwide (ignore locationId)
//     if (nationwideServiceIds.length > 0) {
//       conditions.push({ serviceId: { $in: nationwideServiceIds } });
//     }



//     if (distanceWiseServiceIds.length > 0) {
//       // Step 1: Collect distance-wise location entries
//       const distanceWiseLocations = userLocationService.filter(
//         (l) => l.locationType === LocationType.DISTANCE_WISE
//       );

//       let nearbyLeadIds: mongoose.Types.ObjectId[] = [];

//       // Step 2: Loop through each location to find nearby leads
//       for (const loc of distanceWiseLocations) {
//         const locationGroup = loc.locationGroupId as IZipCode;
//         const coords = locationGroup.location?.coordinates;

//         if (!coords || coords.length < 2) continue;

//         const [lng, lat] = coords;
//         const rangeInKm = loc.rangeInKm || 5;
//         const radiusInMeters = rangeInKm * 1000;

//         // Step 3: Use $geoNear to find nearby leads filtered by serviceIds
//         const nearbyLeads = await Lead.aggregate([
//           {
//             $geoNear: {
//               near: { type: 'Point', coordinates: [lng, lat] },
//               distanceField: 'distance',
//               maxDistance: radiusInMeters,
//               spherical: true,
//               query: { serviceId: { $in: distanceWiseServiceIds } }, // <-- filter by serviceIds
//             },
//           },
//           { $project: { _id: 1 } }, // only get lead IDs
//         ]);

//         // Step 4: Push found lead IDs
//         nearbyLeadIds.push(...nearbyLeads.map((l) => l._id));
//       }

//       // Step 5: Deduplicate all nearby lead IDs
//       nearbyLeadIds = Array.from(
//         new Set(nearbyLeadIds.map((id) => id.toString()))
//       ).map((id) => new mongoose.Types.ObjectId(id));

//       // Step 6: Add query condition
//       if (nearbyLeadIds.length > 0) {
//         conditions.push({
//           _id: { $in: nearbyLeadIds },
//         });
//       }
//     }





//     if (travelTimeServiceIds.length > 0) {
//       // Step 1: Collect travel-time locations
//       const travelTimeLocations = userLocationService.filter(
//         (l) => l.locationType === LocationType.TRAVEL_TIME
//       );

//       let travelTimeLeadIds: mongoose.Types.ObjectId[] = [];

//       // Step 2: Loop through each travel-time location
//       for (const loc of travelTimeLocations) {
//         const locationGroup = loc.locationGroupId as IZipCode;
//         const coords = locationGroup.location?.coordinates;

//         if (!coords || coords.length < 2) continue;

//         const [lng, lat] = coords;

//         // Step 2a: Determine max distance based on travel mode
//         const travelMode = loc.travelmode || 'driving'; // default driving
//         const travelTimeInMinutes = Number(loc.traveltime) || 30;
//         const speed = TRAVEL_SPEEDS[travelMode] || TRAVEL_SPEEDS['driving'];
//         const radiusInMeters = travelTimeInMinutes * speed; // approximate radius

//         // Step 3: Use $geoNear to find nearby leads within travel-time radius
//         const nearbyLeads = await Lead.aggregate([
//           {
//             $geoNear: {
//               near: { type: 'Point', coordinates: [lng, lat] },
//               distanceField: 'distance',
//               maxDistance: radiusInMeters,
//               spherical: true,
//               query: { serviceId: { $in: travelTimeServiceIds } },
//             },
//           },
//           { $project: { _id: 1 } },
//         ]);

//         // Step 4: Collect lead IDs
//         travelTimeLeadIds.push(...nearbyLeads.map((l) => l._id));
//       }

//       // Step 5: Deduplicate
//       travelTimeLeadIds = Array.from(
//         new Set(travelTimeLeadIds.map((id) => id.toString()))
//       ).map((id) => new mongoose.Types.ObjectId(id));

//       // Step 6: Add to conditions
//       if (travelTimeLeadIds.length > 0) {
//         conditions.push({
//           _id: { $in: travelTimeLeadIds },
//         });
//       }


//     }


//     // 4 Draw-on-area
//     if (drawOnAreaServiceIds.length > 0) {
//       // Step 1: Get all user locations of type DRAW_ON_AREA
//       const drawAreaLocations = userLocationService
//         .filter((loc) => loc.locationType === LocationType.DRAW_ON_AREA)
//         .map((loc) => loc.locationGroupId) // extract the location group (ZipCode)
//         .filter(Boolean); // remove null or undefined

//       // Step 2: Extract location IDs
//       const locationIds: mongoose.Types.ObjectId[] = drawAreaLocations
//         .map((loc: any) => loc._id)
//         .filter(Boolean);

//       // Step 3: Push query condition if any locations exist
//       if (locationIds.length > 0) {
//         conditions.push({
//           serviceId: { $in: drawOnAreaServiceIds },
//           locationId: { $in: locationIds },
//         });
//       }
//     }


//   }



//   if (filters.coordinates) {
//     const {
//       locationType,
//       coord,
//       rangeInKm = 5,
//       serviceIds = [],
//       polygon,
//       travelmode = "driving",
//       traveltime = 15,
//     } = filters.coordinates;

//     if (
//       coord &&
//       (!Array.isArray(coord) || coord.length !== 2 || isNaN(coord[0]) || isNaN(coord[1]))
//     ) {
//       throw new Error("Invalid coordinates provided for location filtering");
//     }

//     const supportedTypes = ["draw_on_area", "travel_time", "nation_wide", "distance_wise"];

//     if (locationType && supportedTypes.includes(locationType)) {
//       let nearbyLocationIds: Types.ObjectId[] = [];

//       // ------------------ DISTANCE-WISE ------------------
//       if (locationType === "distance_wise") {
//         const radiusInMeters = rangeInKm * 1000;

//         const nearbyLeads = await Lead.aggregate([
//           {
//             $geoNear: {
//               near: { type: "Point", coordinates: [coord[0], coord[1]] },
//               distanceField: "distance",
//               maxDistance: radiusInMeters,
//               spherical: true,
//               query: serviceIds.length > 0 ? { serviceId: { $in: serviceIds } } : {},
//             },
//           },
//           { $project: { _id: 1 } },
//         ]);

//         nearbyLocationIds = nearbyLeads.map((l) => l._id);
//       }

//       // ------------------ DRAW-ON-AREA ------------------
//       else if (locationType === "draw_on_area" && polygon) {
//         const nearbyZips = await ZipCode.find({
//           location: {
//             $geoWithin: { $geometry: polygon },
//           },
//         }).select("_id");

//         nearbyLocationIds = nearbyZips.map((z) => new mongoose.Types.ObjectId(z._id));
//       }

//       // ------------------ TRAVEL-TIME ------------------
//       else if (locationType === "travel_time") {
//         if (!coord || coord.length !== 2) {
//           throw new Error("Coordinates required for travel-time filter");
//         }

//         const speed = TRAVEL_SPEEDS[travelmode] || TRAVEL_SPEEDS["driving"];
//         const radiusInMeters = traveltime * speed;

//         const nearbyLeads = await Lead.aggregate([
//           {
//             $geoNear: {
//               near: { type: "Point", coordinates: [coord[0], coord[1]] },
//               distanceField: "distance",
//               maxDistance: radiusInMeters,
//               spherical: true,
//               query: serviceIds.length > 0 ? { serviceId: { $in: serviceIds } } : {},
//             },
//           },
//           { $project: { _id: 1 } },
//         ]);

//         nearbyLocationIds = nearbyLeads.map((l) => l._id);
//       }

//       // ------------------ NATION-WIDE ------------------
//       else if (locationType === "nation_wide") {
//         if (serviceIds.length > 0) {
//           conditions.push({ serviceId: { $in: serviceIds } });
//         }
//       }

//       // Deduplicate and add to conditions
//       if (nearbyLocationIds.length > 0) {
//         nearbyLocationIds = Array.from(
//           new Set(nearbyLocationIds.map((id) => id.toString()))
//         ).map((id) => new mongoose.Types.ObjectId(id));

//         conditions.push({ _id: { $in: nearbyLocationIds } });
//       }
//     }
//   }




//   // // 5 If no mappings, prevent match

//   if (conditions.length === 0) {
//     matchStage._id = { $exists: false };
//   } else {
//     matchStage.$or = conditions;
//   }








//   // ----------------------- ADDITIONAL FILTERS -----------------------
//   if (filters.spotlight?.length) matchStage.leadPriority = { $in: filters.spotlight };
//   if (filters.services?.length) {
//     matchStage.serviceId = { $in: filters.services.map((id: string) => new mongoose.Types.ObjectId(id)) };
//   }
//   if (filters.credits?.length) {



//     const creditConditions = filters.credits.map((range: string) => {
//       switch (range) {
//         case 'Free': return { credit: 0 };
//         case '1-5 credits': return { credit: { $gte: 1, $lte: 5 } };
//         case '5-10 credits': return { credit: { $gte: 5, $lte: 10 } };
//         case '10-20 credits': return { credit: { $gte: 10, $lte: 20 } };
//         case '20-30 credits': return { credit: { $gte: 20, $lte: 30 } };
//         case '30-40 credits': return { credit: { $gte: 30, $lte: 40 } };
//         case '40-50 credits': return { credit: { $gte: 40, $lte: 50 } };
//         case '50-100 credits': return { credit: { $gte: 50, $lte: 100 } };
//         default: return null;
//       }
//     }).filter(Boolean);
//     if (creditConditions.length) {
//       // matchStage.$or = [...(matchStage.$or || []), ...creditConditions];

//       matchStage.$or = matchStage.$or || [];
//       matchStage.$and = matchStage.$and || [];
//       matchStage.$and.push({ $or: creditConditions });


//     }
//   }
//   if (filters.location?.length) {
//     matchStage.locationId = { $in: filters.location.map((id: string) => new mongoose.Types.ObjectId(id)) };
//   }
//   if (filters.leadSubmission) {
//     let startDate: Date | null = null;
//     switch (filters.leadSubmission) {
//       case 'last_1_hour': startDate = new Date(Date.now() - 60 * 60 * 1000); break;
//       case 'last_24_hours': startDate = new Date(); startDate.setHours(0, 0, 0, 0); break;
//       case 'last_48_hours': startDate = new Date(); startDate.setDate(startDate.getDate() - 1); break;
//       case 'last_3_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 3); break;
//       case 'last_7_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 7); break;
//       case 'last_14_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 14); break;
//     }
//     if (startDate) matchStage.createdAt = { $gte: startDate };
//   }



//   /* 

//   business logic:

//   **leadService

//   1. current logged-in lawyer leadservice 
//   2. based leadservice selected options true data filter 


//   **leadserviceanswers
//   1. leadserviceanswers filter by lead id
//   2. 


//   **lead serviceanswers and Leadservice 

//  1. match with leadservice selected options and leadserviceanswers selected options wise match data fetch

//  *finally

//   1. leadservice with leadserviceanswers array data fetch
//   2. based lead service and leadAnswer show lead data fetch
//   3. if no leadservice selected options true data means no lead show


//   */







//   // ----------------------- AGGREGATION PIPELINE -----------------------
//   const aggregationPipeline: any[] = [
//     { $match: matchStage },

//     // Apply sorting
//     { $sort: { [sortField]: sortOrder } }, // <- Add this line

//     // Lookups
//     { $lookup: { from: 'zipcodes', localField: 'locationId', foreignField: '_id', as: 'locationId' } },

//     // {
//     //   $lookup: {
//     //     from: 'zipcodes',
//     //     let: { locationId: '$locationId' }, // Pass the lead's locationId
//     //     pipeline: [
//     //       { $match: { $expr: { $eq: ['$_id', '$$locationId'] } } },
//     //       { $project: { _id: 1, zipCode: 1 } }, // Only _id and zipCode
//     //     ],
//     //     as: 'locationId',
//     //   },
//     // },
//     { $unwind: { path: '$locationId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'userprofiles', localField: 'userProfileId', foreignField: '_id', as: 'userProfileId' } },
//     { $unwind: { path: '$userProfileId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'users', localField: 'userProfileId.user', foreignField: '_id', as: 'userProfileId.user' } },
//     { $unwind: { path: '$userProfileId.user', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'serviceId' } },
//     { $unwind: { path: '$serviceId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'userprofiles', localField: 'responders', foreignField: '_id', as: 'responders' } },

//     // ----------------------- LEAD SERVICE & ANSWERS -----------------------
//     {
//       $lookup: {
//         from: 'leadserviceanswers',
//         let: { leadId: '$_id' },
//         pipeline: [
//           { $match: { $expr: { $eq: ['$leadId', '$$leadId'] } } },
//           { $match: { isSelected: true } },
//         ],
//         as: 'leadServiceAnswers',
//       },
//     },
//     {
//       $lookup: {
//         from: 'userwiseservicewisequestionwiseoptions',
//         let: { serviceId: '$serviceId._id' },
//         pipeline: [
//           { $match: { $expr: { $and: [{ $eq: ['$userProfileId', userProfile._id] }, { $eq: ['$isSelected', true] }, { $eq: ['$countryId', new mongoose.Types.ObjectId(userProfile.country)] }] } } },
//         ],
//         as: 'lawyerLeadServices',
//       },
//     },
//     {
//       $addFields: {
//         matchedAnswers: {
//           $filter: {
//             input: '$leadServiceAnswers',
//             as: 'answer',
//             cond: {
//               $anyElementTrue: {
//                 $map: {
//                   input: '$lawyerLeadServices',
//                   as: 'lawyer',
//                   in: {
//                     $and: [
//                       { $eq: ['$$answer.serviceId', '$$lawyer.serviceId'] },
//                       { $eq: ['$$answer.questionId', '$$lawyer.questionId'] },
//                       { $eq: ['$$answer.optionId', '$$lawyer.optionId'] },
//                     ],
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },

//     // Only include leads with matched answers

//     { $match: { 'matchedAnswers.0': { $exists: true } } },


//     // ----------------------- REMOVE UNUSED FIELDS -----------
//     {
//       $project: {
//         leadServiceAnswers: 0,
//         lawyerLeadServices: 0,
//         matchedAnswers: 0,
//       },
//     },



//   ];

//   if (filters.keyword) {
//     aggregationPipeline.push({
//       $match: {
//         $or: [
//           { 'userProfileId.name': { $regex: new RegExp(filters.keyword, 'i') } },
//           { additionalDetails: { $regex: new RegExp(filters.keyword, 'i') } },
//         ],
//       },
//     });
//   }

//   let leads = await Lead.aggregate(aggregationPipeline);


//   // ----------------------- PAGINATION -----------------------
//   const total = leads.length;
//   const paginatedLeads = leads.slice(skip, skip + limit);

//   const result = {
//     data: paginatedLeads,
//     pagination: { total, page, limit, totalPage: Math.ceil(total / limit) },
//     leadCount: { urgent: paginatedLeads.filter(l => l.leadPriority === 'urgent').length },
//   };


//   // ----------------------- CACHE THE RESULT IN REDIS -----------------------
//   // Cache the result for future requests
//   // Cache in Redis for 10 minutes
//   await redisClient.set(CacheKeys.LEAD_LIST_BY_USER_WITH_FILTERS(userId, filters, options), JSON.stringify(result), { EX: TTL.MEDIUM_10M });



//   return result;
// };



//   --- try for optimize again -----------------------

const getAllLeadForLawyerPanel = async (
  userId: string,
  filters: any = {},
  options: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }
): Promise<any> => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id serviceIds country');
  if (!userProfile) {
    return {
      data: [],
      pagination: { total: 0, page: options.page, limit: options.limit, totalPage: 0 },
      leadCount: {},
    };
  }




  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  const sortField = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder === 'asc' ? 1 : -1;




  // ----------------------- CACHE KEY -----------------------

  // const cacheKey = `leads_${userId}_${JSON.stringify(filters)}_${JSON.stringify(options)}`;
  // Check if the data is cached in Redis

  // Check cache
  const cachedData = await redisClient.get(CacheKeys.LEAD_LIST_BY_USER_WITH_FILTERS(userId, filters, options));
  if (cachedData) {

    return JSON.parse(cachedData);
  }






  // ----------------------- FETCH USER LOCATION SERVICE MAPPINGS -----------------------
  const userLocationService = await UserLocationServiceMap.find({ userProfileId: userProfile._id }).populate('locationGroupId');



  // ----------------------- SEPARATE BY LOCATION TYPE -----------------------
  const locationServiceByType: Record<string, mongoose.Types.ObjectId[]> = {
    [LocationType.NATION_WIDE]: [],
    [LocationType.DISTANCE_WISE]: [],
    [LocationType.TRAVEL_TIME]: [],
    [LocationType.DRAW_ON_AREA]: [],
  };


  // Fill service IDs by location type, remove duplicates
  userLocationService.forEach(loc => {
    if (loc.serviceIds && loc.serviceIds.length > 0) {
      const type = loc.locationType as keyof typeof locationServiceByType;
      const currentSet = new Set(locationServiceByType[type].map(id => id.toString()));
      loc.serviceIds.forEach((id: any) => currentSet.add(id.toString()));
      locationServiceByType[type] = Array.from(currentSet).map(id => new mongoose.Types.ObjectId(id));
    }
  });






  // service IDs by location type
  const nationwideServiceIds = locationServiceByType[LocationType.NATION_WIDE];
  const distanceWiseServiceIds = locationServiceByType[LocationType.DISTANCE_WISE];
  const travelTimeServiceIds = locationServiceByType[LocationType.TRAVEL_TIME];
  const drawOnAreaServiceIds = locationServiceByType[LocationType.DRAW_ON_AREA];







  // // ----------------------- MATCH STAGE -----------------------
  const matchStage: any = {
    countryId: new mongoose.Types.ObjectId(userProfile.country),
    userProfileId: { $ne: userProfile._id },
    responders: { $ne: userProfile._id },
    status: 'approved',
  };




  // ----------------------- BUILD MATCH CONDITIONS -----------------------
  const conditions: any[] = [];




  if (!filters.coordinates) {


    // 1 Nationwide (ignore locationId)
    if (nationwideServiceIds.length > 0) {
      conditions.push({ serviceId: { $in: nationwideServiceIds } });
    }



    if (distanceWiseServiceIds.length > 0) {
      // Step 1: Collect distance-wise location entries
      const distanceWiseLocations = userLocationService.filter(
        (l) => l.locationType === LocationType.DISTANCE_WISE
      );

      let nearbyLeadIds: mongoose.Types.ObjectId[] = [];

      // Step 2: Loop through each location to find nearby leads
      for (const loc of distanceWiseLocations) {
        const locationGroup = loc.locationGroupId as IZipCode;
        const coords = locationGroup.location?.coordinates;

        if (!coords || coords.length < 2) continue;

        const [lng, lat] = coords;
        const rangeInKm = loc.rangeInKm || 5;
        const radiusInMeters = rangeInKm * 1000;

        // Step 3: Use $geoNear to find nearby leads filtered by serviceIds
        const nearbyLeads = await Lead.aggregate([
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [lng, lat] },
              distanceField: 'distance',
              maxDistance: radiusInMeters,
              spherical: true,
              query: { serviceId: { $in: distanceWiseServiceIds } }, // <-- filter by serviceIds
            },
          },
          { $project: { _id: 1 } }, // only get lead IDs
        ]);

        // Step 4: Push found lead IDs
        nearbyLeadIds.push(...nearbyLeads.map((l) => l._id));
      }

      // Step 5: Deduplicate all nearby lead IDs
      nearbyLeadIds = Array.from(
        new Set(nearbyLeadIds.map((id) => id.toString()))
      ).map((id) => new mongoose.Types.ObjectId(id));

      // Step 6: Add query condition
      if (nearbyLeadIds.length > 0) {
        conditions.push({
          _id: { $in: nearbyLeadIds },
        });
      }
    }





    if (travelTimeServiceIds.length > 0) {
      // Step 1: Collect travel-time locations
      const travelTimeLocations = userLocationService.filter(
        (l) => l.locationType === LocationType.TRAVEL_TIME
      );

      let travelTimeLeadIds: mongoose.Types.ObjectId[] = [];

      // Step 2: Loop through each travel-time location
      for (const loc of travelTimeLocations) {
        const locationGroup = loc.locationGroupId as IZipCode;
        const coords = locationGroup.location?.coordinates;

        if (!coords || coords.length < 2) continue;

        const [lng, lat] = coords;

        // Step 2a: Determine max distance based on travel mode
        const travelMode = loc.travelmode || 'driving'; // default driving
        const travelTimeInMinutes = Number(loc.traveltime) || 30;
        const speed = TRAVEL_SPEEDS[travelMode] || TRAVEL_SPEEDS['driving'];
        const radiusInMeters = travelTimeInMinutes * speed; // approximate radius

        // Step 3: Use $geoNear to find nearby leads within travel-time radius
        const nearbyLeads = await Lead.aggregate([
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [lng, lat] },
              distanceField: 'distance',
              maxDistance: radiusInMeters,
              spherical: true,
              query: { serviceId: { $in: travelTimeServiceIds } },
            },
          },
          { $project: { _id: 1 } },
        ]);

        // Step 4: Collect lead IDs
        travelTimeLeadIds.push(...nearbyLeads.map((l) => l._id));
      }

      // Step 5: Deduplicate
      travelTimeLeadIds = Array.from(
        new Set(travelTimeLeadIds.map((id) => id.toString()))
      ).map((id) => new mongoose.Types.ObjectId(id));

      // Step 6: Add to conditions
      if (travelTimeLeadIds.length > 0) {
        conditions.push({
          _id: { $in: travelTimeLeadIds },
        });
      }


    }


    // 4 Draw-on-area
    if (drawOnAreaServiceIds.length > 0) {
      // Step 1: Get all user locations of type DRAW_ON_AREA
      const drawAreaLocations = userLocationService
        .filter((loc) => loc.locationType === LocationType.DRAW_ON_AREA)
        .map((loc) => loc.locationGroupId) // extract the location group (ZipCode)
        .filter(Boolean); // remove null or undefined

      // Step 2: Extract location IDs
      const locationIds: mongoose.Types.ObjectId[] = drawAreaLocations
        .map((loc: any) => loc._id)
        .filter(Boolean);

      // Step 3: Push query condition if any locations exist
      if (locationIds.length > 0) {
        conditions.push({
          serviceId: { $in: drawOnAreaServiceIds },
          locationId: { $in: locationIds },
        });
      }
    }


  }



  if (filters.coordinates) {
    const {
      locationType,
      coord,
      rangeInKm = 5,
      serviceIds = [],
      polygon,
      travelmode = "driving",
      traveltime = 15,
    } = filters.coordinates;

    if (
      coord &&
      (!Array.isArray(coord) || coord.length !== 2 || isNaN(coord[0]) || isNaN(coord[1]))
    ) {
      throw new Error("Invalid coordinates provided for location filtering");
    }

    const supportedTypes = ["draw_on_area", "travel_time", "nation_wide", "distance_wise"];

    if (locationType && supportedTypes.includes(locationType)) {
      let nearbyLocationIds: Types.ObjectId[] = [];

      // ------------------ DISTANCE-WISE ------------------
      if (locationType === "distance_wise") {
        const radiusInMeters = rangeInKm * 1000;

        const nearbyLeads = await Lead.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [coord[0], coord[1]] },
              distanceField: "distance",
              maxDistance: radiusInMeters,
              spherical: true,
              query: serviceIds.length > 0 ? { serviceId: { $in: serviceIds } } : {},
            },
          },
          { $project: { _id: 1 } },
        ]);

        nearbyLocationIds = nearbyLeads.map((l) => l._id);
      }

      // ------------------ DRAW-ON-AREA ------------------
      else if (locationType === "draw_on_area" && polygon) {
        const nearbyZips = await ZipCode.find({
          location: {
            $geoWithin: { $geometry: polygon },
          },
        }).select("_id");

        nearbyLocationIds = nearbyZips.map((z) => new mongoose.Types.ObjectId(z._id));
      }

      // ------------------ TRAVEL-TIME ------------------
      else if (locationType === "travel_time") {
        if (!coord || coord.length !== 2) {
          throw new Error("Coordinates required for travel-time filter");
        }

        const speed = TRAVEL_SPEEDS[travelmode] || TRAVEL_SPEEDS["driving"];
        const radiusInMeters = traveltime * speed;

        const nearbyLeads = await Lead.aggregate([
          {
            $geoNear: {
              near: { type: "Point", coordinates: [coord[0], coord[1]] },
              distanceField: "distance",
              maxDistance: radiusInMeters,
              spherical: true,
              query: serviceIds.length > 0 ? { serviceId: { $in: serviceIds } } : {},
            },
          },
          { $project: { _id: 1 } },
        ]);

        nearbyLocationIds = nearbyLeads.map((l) => l._id);
      }

      // ------------------ NATION-WIDE ------------------
      else if (locationType === "nation_wide") {
        if (serviceIds.length > 0) {
          conditions.push({ serviceId: { $in: serviceIds } });
        }
      }

      // Deduplicate and add to conditions
      if (nearbyLocationIds.length > 0) {
        nearbyLocationIds = Array.from(
          new Set(nearbyLocationIds.map((id) => id.toString()))
        ).map((id) => new mongoose.Types.ObjectId(id));

        conditions.push({ _id: { $in: nearbyLocationIds } });
      }
    }
  }




  // // 5 If no mappings, prevent match

  if (conditions.length === 0) {
    matchStage._id = { $exists: false };
  } else {
    matchStage.$or = conditions;
  }








  // ----------------------- ADDITIONAL FILTERS -----------------------
  if (filters.spotlight?.length) matchStage.leadPriority = { $in: filters.spotlight };
  if (filters.services?.length) {
    matchStage.serviceId = { $in: filters.services.map((id: string) => new mongoose.Types.ObjectId(id)) };
  }
  if (filters.credits?.length) {



    const creditConditions = filters.credits.map((range: string) => {
      switch (range) {
        case 'Free': return { credit: 0 };
        case '1-5 credits': return { credit: { $gte: 1, $lte: 5 } };
        case '5-10 credits': return { credit: { $gte: 5, $lte: 10 } };
        case '10-20 credits': return { credit: { $gte: 10, $lte: 20 } };
        case '20-30 credits': return { credit: { $gte: 20, $lte: 30 } };
        case '30-40 credits': return { credit: { $gte: 30, $lte: 40 } };
        case '40-50 credits': return { credit: { $gte: 40, $lte: 50 } };
        case '50-100 credits': return { credit: { $gte: 50, $lte: 100 } };
        default: return null;
      }
    }).filter(Boolean);
    if (creditConditions.length) {
      // matchStage.$or = [...(matchStage.$or || []), ...creditConditions];

      matchStage.$or = matchStage.$or || [];
      matchStage.$and = matchStage.$and || [];
      matchStage.$and.push({ $or: creditConditions });


    }
  }
  if (filters.location?.length) {
    matchStage.locationId = { $in: filters.location.map((id: string) => new mongoose.Types.ObjectId(id)) };
  }
  if (filters.leadSubmission) {
    let startDate: Date | null = null;
    switch (filters.leadSubmission) {
      case 'last_1_hour': startDate = new Date(Date.now() - 60 * 60 * 1000); break;
      case 'last_24_hours': startDate = new Date(); startDate.setHours(0, 0, 0, 0); break;
      case 'last_48_hours': startDate = new Date(); startDate.setDate(startDate.getDate() - 1); break;
      case 'last_3_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 3); break;
      case 'last_7_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 7); break;
      case 'last_14_days': startDate = new Date(); startDate.setDate(startDate.getDate() - 14); break;
    }
    if (startDate) matchStage.createdAt = { $gte: startDate };
  }



  /* 
  
  business logic:
 
  **leadService
 
  1. current logged-in lawyer leadservice 
  2. based leadservice selected options true data filter 
  
  
  **leadserviceanswers
  1. leadserviceanswers filter by lead id
  2. 
 
 
  **lead serviceanswers and Leadservice 
 
 1. match with leadservice selected options and leadserviceanswers selected options wise match data fetch
 
 *finally
 
  1. leadservice with leadserviceanswers array data fetch
  2. based lead service and leadAnswer show lead data fetch
  3. if no leadservice selected options true data means no lead show
  
  
  */







  // ----------------------- AGGREGATION PIPELINE -----------------------
  const aggregationPipeline: any[] = [
    { $match: matchStage },

    // Apply sorting
    { $sort: { [sortField]: sortOrder } }, // <- Add this line

    // Lookups
    { $lookup: { from: 'zipcodes', localField: 'locationId', foreignField: '_id', as: 'locationId' } },

    // {
    //   $lookup: {
    //     from: 'zipcodes',
    //     let: { locationId: '$locationId' }, // Pass the lead's locationId
    //     pipeline: [
    //       { $match: { $expr: { $eq: ['$_id', '$$locationId'] } } },
    //       { $project: { _id: 1, zipCode: 1 } }, // Only _id and zipCode
    //     ],
    //     as: 'locationId',
    //   },
    // },
    { $unwind: { path: '$locationId', preserveNullAndEmptyArrays: true } },

    { $lookup: { from: 'userprofiles', localField: 'userProfileId', foreignField: '_id', as: 'userProfileId' } },
    { $unwind: { path: '$userProfileId', preserveNullAndEmptyArrays: true } },

    { $lookup: { from: 'users', localField: 'userProfileId.user', foreignField: '_id', as: 'userProfileId.user' } },
    { $unwind: { path: '$userProfileId.user', preserveNullAndEmptyArrays: true } },

    { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'serviceId' } },
    { $unwind: { path: '$serviceId', preserveNullAndEmptyArrays: true } },

    { $lookup: { from: 'userprofiles', localField: 'responders', foreignField: '_id', as: 'responders' } },

    // ----------------------- LEAD SERVICE & ANSWERS -----------------------
    {
      $lookup: {
        from: 'leadserviceanswers',
        let: { leadId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$leadId', '$$leadId'] } } },
          { $match: { isSelected: true } },
        ],
        as: 'leadServiceAnswers',
      },
    },
    {
      $lookup: {
        from: 'userwiseservicewisequestionwiseoptions',
        let: { serviceId: '$serviceId._id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$userProfileId', userProfile._id] }, { $eq: ['$isSelected', true] }, { $eq: ['$countryId', new mongoose.Types.ObjectId(userProfile.country)] }] } } },
        ],
        as: 'lawyerLeadServices',
      },
    },
    {
      $addFields: {
        matchedAnswers: {
          $filter: {
            input: '$leadServiceAnswers',
            as: 'answer',
            cond: {
              $anyElementTrue: {
                $map: {
                  input: '$lawyerLeadServices',
                  as: 'lawyer',
                  in: {
                    $and: [
                      { $eq: ['$$answer.serviceId', '$$lawyer.serviceId'] },
                      { $eq: ['$$answer.questionId', '$$lawyer.questionId'] },
                      { $eq: ['$$answer.optionId', '$$lawyer.optionId'] },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },

    // Only include leads with matched answers

    { $match: { 'matchedAnswers.0': { $exists: true } } },

    // {
    //   $facet: {
    //     data: [
    //       { $skip: skip },
    //       { $limit: limit },
    //       // Optionally: remove unused fields or reshape data
    //       {
    //         $project: {
    //           leadServiceAnswers: 0,
    //           lawyerLeadServices: 0,
    //           matchedAnswers: 0,
    //         },
    //       },
    //     ],
    //     totalCount: [{ $count: 'count' }],
    //   },
    // },
    // {
    //   $project: {
    //     data: 1,
    //     total: { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
    //   },
    // },


  ];

  if (filters.keyword) {
    aggregationPipeline.push({
      $match: {
        $or: [
          { 'userProfileId.name': { $regex: new RegExp(filters.keyword, 'i') } },
          { additionalDetails: { $regex: new RegExp(filters.keyword, 'i') } },
        ],
      },
    });
  }



  aggregationPipeline.push(

    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          // Optionally: remove unused fields or reshape data
          {
            $project: {
              leadServiceAnswers: 0,
              lawyerLeadServices: 0,
              matchedAnswers: 0,
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
    {
      $project: {
        data: 1,
        total: { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
      },
    }


  )

  const leadsResult = await Lead.aggregate(aggregationPipeline);
  const leads = leadsResult[0]?.data || [];
  const total = leadsResult[0]?.total || 0;

  const totalPage = Math.ceil(total / limit);

  const result = {
    data: leads,
    pagination: { total, page, limit, totalPage },
    leadCount: { urgent: leads.filter((l: any) => l.leadPriority === 'urgent').length },

  };


  // ----------------------- CACHE THE RESULT IN REDIS -----------------------
  // Cache the result for future requests
  // Cache in Redis for 10 minutes
  await redisClient.set(CacheKeys.LEAD_LIST_BY_USER_WITH_FILTERS(userId, filters, options), JSON.stringify(result), { EX: TTL.MEDIUM_10M });



  return result;
};







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

      // serviceId: { $in: userProfile.serviceIds },
    })
      .populate({
        path: 'userProfileId',
        populate: 'user'
      })
      .populate('serviceId')
      .populate({
        path: 'responders',
        select: 'profilePicture name user slug'
      }).populate('hiredLawyerRating')
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


//  --------------  SINGLE LEAD API WITH LEAD ANSWER AND RESPONSE TAG ----------

const getSingleLeadFromDB = async (userId: string, leadId: string) => {
  const user = await UserProfile.findOne({ user: userId });
  if (!user) {
    return sendNotFoundResponse('user not found!');
  }

  validateObjectId(leadId, 'Case');
  const leadDoc = await Lead.findOne({ _id: leadId })
    .populate({
      path: 'userProfileId',
      populate: {
        path: 'user',
      },
    })
    .populate({
      path: 'serviceId',
    })
    .populate('responders')
    .lean(); // Convert to plain JS object

  if (!leadDoc) return null;



  const leadAnswers = await LeadServiceAnswer.aggregate([
    {
      $match: {
        leadId: new mongoose.Types.ObjectId(leadId),

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

    //  Final sort to ensure question order is preserved
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


  // ----------------- 🔹 HARD-CODED ANSWER OBJECT BASE ONE LEAD PRIORITY ANSWER ---------------------------
  const hardCodedAnswer = {
    questionId: 'qqqqqqqqqqqqqqqqqqqqqqqq', // 24 'q' characters
    question: 'When are you looking to get started?',
    options: [
      {
        optionId: 'oooooooooooooooooooooooo', // 24 'o' characters
        option: leadDoc.leadPriority,
        isSelected: true,
        idExtraData: '',
      },
    ],
  };


  // Add hardcoded data into leadAnswers
  leadAnswers.push(hardCodedAnswer);

  //  -------------------- CHECK ANY RESPONSE THIS LEAD FOR CURRENT USER END ---------------
  const existingResponse = await LeadResponse.exists({
    leadId: leadId,
    responseBy: user._id,
  });

  // Define credit from leadDoc
  const credit = Number(leadDoc.credit) || 0;

  //  5. Return final result
  return {
    ...leadDoc,
    leadAnswers,
    credit: customCreditLogic(credit as number),
    isContact: !!existingResponse,
  };
};


const updateLeadIntoDB = async (id: string, payload: Partial<ILead>) => {
  validateObjectId(id, 'Case');
  const result = await Lead.findOneAndUpdate(
    { _id: id },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteLeadFromDB = async (id: string) => {
  validateObjectId(id, 'Case');


  const result = await Lead.findByIdAndDelete(id);
  return result;
};

//  lead closed


// export const leadClosedIntoDB = async (
//   userId: string,
//   leadId: string,
//   reason?: string
// ) => {
//   // Validate leadId
//   validateObjectId(leadId, "Case");

//   // Fetch the lead
//   const lead = await Lead.findById(leadId);
//   if (!lead) {

//     return { success: false, message: "Case not found" };
//   }

//   // Fetch user profile of the requester
//   const userProfile = await UserProfile.findOne({ user: userId }).select("_id");
//   if (!userProfile) {
//     return { success: false, message: "User profile not found" };
//   }

//   // Check if already closed
//   if (lead.isClosed) {
//     return { success: false, message: "Case is already closed" };
//   }

//   // Update closure fields
//   lead.isClosed = true;
//   lead.closeStatus = "closed";
//   lead.status = "closed"; // Overall lead status
//   lead.closedBy = new Types.ObjectId(userProfile._id);
//   lead.closedAt = new Date();
//   lead.leadClosedReason = reason || null;
//   await lead.save();

//   return {
//     success: true,
//     message: "Case closed successfully",
//     lead,
//   };
// };





export const leadClosedIntoDB = async (
  userId: string,
  leadId: string,
  reason?: string
) => {
  const session = await mongoose.startSession();

  let leadResponse: ILead | null = null;
  try {

    await session.withTransaction(async () => {
      // Validate leadId
      validateObjectId(leadId, "Case");

      // Fetch the lead
      const lead = await Lead.findById(leadId).session(session);
      if (!lead) {

        return { success: false, message: "Case not found" };
      }

      // Fetch user profile of the requester
      const userProfile = await UserProfile.findOne({ user: userId })
        .select("_id")
        .session(session);

      if (!userProfile) {
        return { success: false, message: "User profile not found" };
      }
      // Check if already closed
      if (lead.isClosed) {
        return { success: false, message: "Case is already closed" };
      }

      // Update closure fields
      lead.isClosed = true;
      lead.closeStatus = "closed";
      lead.status = "closed"; // Overall lead status
      lead.closedBy = new Types.ObjectId(userProfile._id);
      lead.closedAt = new Date();
      lead.leadClosedReason = reason || null;
      await lead.save({ session });

      // Update case count in user profile
      await UserProfile.findByIdAndUpdate(
        lead.userProfileId,
        {
          $inc: {
            closedCases: 1,
            openCases: -1,
          },
        },
        { session }
      );

      leadResponse = lead;
    });

    return {
      success: true,
      message: "Case closed successfully",
      lead: leadResponse,
    };
  } catch (error: any) {
    console.error(" Transaction failed:", error.message);
    return {
      success: false,
      message: error.message || "Failed to close case",
    };
  } finally {
    await session.endSession();
  }
};














//  repost data ---

// const repostLead = async (leadId: string) => {
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     // 1️ Fetch original lead
//     const originalLead = await Lead.findById(leadId).session(session);
//     if (!originalLead) {
//       await session.abortTransaction();
//       session.endSession();
//       throw new Error('Original lead not found');
//     }

//     // 2️ Duplicate Lead
//     const newLeadData = {
//       userProfileId: originalLead.userProfileId,
//       countryId: originalLead.countryId,
//       serviceId: originalLead.serviceId,
//       additionalDetails: originalLead.additionalDetails,
//       budgetAmount: originalLead.budgetAmount,
//       locationId: originalLead.locationId,
//       credit: originalLead.credit,
//       leadPriority: originalLead.leadPriority,
//       // reset statuses
//       status: 'approved',
//       hireStatus: 'not_requested',
//       isHired: false,
//       hiredLawyerId: null,
//       hiredResponseId: null,
//       hiredBy: null,
//       hiredAt: null,
//       closeStatus: 'open',
//       isClosed: false,
//       closedBy: null,
//       leadClosedReason: null,
//       closedAt: null,
//       hiredLawyerRating: null,
//       responders: [],
//       repostedFrom: originalLead._id,
//     };

//     const [newLead] = await Lead.create([newLeadData], { session });

//     // 3️ Duplicate LeadServiceAnswers
//     const leadAnswers = await LeadServiceAnswer.find({ leadId }).session(session);
//     if (leadAnswers.length > 0) {
//       const newAnswers = leadAnswers.map((ans) => ({
//         leadId: newLead._id,
//         serviceId: ans.serviceId,
//         questionId: ans.questionId,
//         optionId: ans.optionId,
//         isSelected: ans.isSelected,
//         idExtraData: ans.idExtraData || '',
//       }));

//       await LeadServiceAnswer.insertMany(newAnswers, { session });
//     }

//     await session.commitTransaction();
//     session.endSession();

//     return newLead;

//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error('Error reposting case:', err);
//     throw err;
//   }
// };





const repostLead = async (clientUserId: string, leadId: string,) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    // 1️ Fetch original lead and user profile
    const originalLead = await Lead.findById(leadId)
      .populate({
        path: 'userProfileId',
        populate: 'user'
      })
      .session(session);

    if (!originalLead) {

      throw new Error('Original case not found');
    }

    // 2️ Guard: only the client who created the lead can repost
    const leadOwnerId = (originalLead.userProfileId as any).user?._id?.toString?.();
    if (leadOwnerId !== clientUserId) {
      throw new Error('Unauthorized: Only the case owner can repost this lead');
    }

    // 3️ Duplicate Lead
    const newLeadData = {
      userProfileId: originalLead.userProfileId,
      countryId: originalLead.countryId,
      serviceId: originalLead.serviceId,
      additionalDetails: originalLead.additionalDetails,
      budgetAmount: originalLead.budgetAmount,
      locationId: originalLead.locationId,
      credit: originalLead.credit,
      leadPriority: originalLead.leadPriority,
      status: 'approved',
      hireStatus: 'not_requested',
      isHired: false,
      hiredLawyerId: null,
      hiredResponseId: null,
      hiredBy: null,
      hiredAt: null,
      closeStatus: 'open',
      isClosed: false,
      closedBy: null,
      leadClosedReason: null,
      closedAt: null,
      hiredLawyerRating: null,
      responders: [],
      repostedFrom: originalLead._id,

    };

    const [newLead] = await Lead.create([newLeadData], { session });

    //  4️ Mark original lead as requested
    await Lead.findByIdAndUpdate(
      leadId,
      { $set: { isReposted: true } }, // <-- FIXED HERE 
      { session, new: true }
    );



    // 4️ Duplicate LeadServiceAnswers
    const leadAnswers = await LeadServiceAnswer.find({ leadId }).session(session);
    let formattedAnswers = '';

    if (leadAnswers.length > 0) {
      const newAnswers = leadAnswers.map((ans) => ({
        leadId: newLead._id,
        serviceId: ans.serviceId,
        questionId: ans.questionId,
        optionId: ans.optionId,
        isSelected: ans.isSelected,
        idExtraData: ans.idExtraData || '',
      }));

      await LeadServiceAnswer.insertMany(newAnswers, { session });

      // Prepare formatted answers for email
      const questionIds = [...new Set(leadAnswers.map(a => a.questionId.toString()))];
      const optionIds = [...new Set(leadAnswers.map(a => a.optionId.toString()))];

      const questionDocs = await ServiceWiseQuestion.find({ _id: { $in: questionIds } })
        .select('question')
        .session(session)
        .lean();

      const optionDocs = await Option.find({ _id: { $in: optionIds } })
        .select('name')
        .session(session)
        .lean();

      const questionMap = new Map(questionDocs.map(q => [q._id.toString(), q.question]));
      const optionMap = new Map(optionDocs.map(opt => [opt._id.toString(), opt.name]));

      formattedAnswers = leadAnswers
        .filter(ans => ans.isSelected)
        .map(ans => {
          const questionText = questionMap.get(ans.questionId.toString()) || 'Unknown Question';
          const optionText = optionMap.get(ans.optionId.toString()) || 'Unknown Option';
          return `
            <p style="margin-bottom: 8px;">
              <strong>${questionText}</strong><br/>
              <span>${optionText}</span>
            </p>
          `;
        })
        .join('');
    }

    // 6️ Send email to client about reposted lead
    const service = await Service.findById(newLead.serviceId).select('name');
    const userProfile = originalLead.userProfileId as any;


    // 5️ Commit transaction
    await session.commitTransaction();
    session.endSession();

    if (userProfile?.user?.email) {



      const emailData = {
        name: userProfile?.name,
        caseType: service?.name || 'Not specified',
        leadAnswer: formattedAnswers || 'No selection',
        preferredContactTime: newLead.leadPriority || 'not sure',
        additionalDetails: newLead.additionalDetails || '',
        dashboardUrl: `${config.client_url}/client/dashboard/my-cases`,
        appName: 'The Law App',
        email: 'support@yourdomain.com',
      };

      await sendEmail({
        to: (userProfile.user as IUser)?.email,
        subject: "You've successfully reposted your legal request",
        data: emailData,
        emailTemplate: 'welcome_Lead_submission',
      });




    }

    return newLead;

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error reposting case:', err);
    throw err;
  }
};




















export const leadService = {
  CreateLeadIntoDB,
  // getAllLeadFromDB,
  getAllLeadForLawyerPanel,
  getSingleLeadFromDB,
  updateLeadIntoDB,
  deleteLeadFromDB,
  getMyAllLeadFromDB,
  getAllLeadForAdminDashboardFromDB,
  leadClosedIntoDB,
  repostLead,
  getAllClientWiseLeadFromDB
};
