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
import axios from 'axios';
import { filterByTravelTime } from './lead.utils';



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




//  ------------------------------------------  new logic of get all lead for lawyer dashboard  ----------------------------------


// export const getAllLeadFromDB = async (
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

//   // ----------------------- MATCH STAGE -----------------------
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

//   // Location IDs
//   if (filters.location?.length) {
//     matchStage.locationId = { $in: filters.location.map((id: string) => new mongoose.Types.ObjectId(id)) };
//   }

//   // Lead submission filter
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
//   const aggregationPipeline: any[] = [];

//   console.log('Filters received:', filters?.coordinates);
//   // ----------------------- DYNAMIC COORDINATE FILTER -----------------------
//   if (filters.coordinates) {
//     const { coord, maxMinutes = 15, mode = 'driving' } = filters.coordinates;

//     // Approximate speed in meters per minute
//     const speedMap: Record<string, number> = {
//       driving: 600,   // ~36 km/h
//       walking: 80,    // ~5 km/h
//       transit: 400,   // ~24 km/h
//     };
//     const speed = speedMap[mode] || 600;
//     const maxDistance = maxMinutes * speed; // meters

//     aggregationPipeline.push({
//       $geoNear: {
//         near: { type: 'Point', coordinates: coord },
//         distanceField: 'distanceFromOrigin',
//         spherical: true,
//         maxDistance,
//         query: matchStage, // existing filters applied
//       },
//     });
//   } else {
//     aggregationPipeline.push({ $match: matchStage });
//   }

//   // ----------------------- LOOKUPS -----------------------
//   aggregationPipeline.push(
//     { $lookup: { from: 'userprofiles', localField: 'userProfileId', foreignField: '_id', as: 'userProfileId' } },
//     { $unwind: { path: '$userProfileId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'users', localField: 'userProfileId.user', foreignField: '_id', as: 'userProfileId.user' } },
//     { $unwind: { path: '$userProfileId.user', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'serviceId' } },
//     { $unwind: { path: '$serviceId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'zipcodes', localField: 'locationId', foreignField: '_id', as: 'locationId' } },
//     { $unwind: { path: '$locationId', preserveNullAndEmptyArrays: true } },

//     { $lookup: { from: 'userprofiles', localField: 'responders', foreignField: '_id', as: 'responders' } }
//   );

//   // Keyword search
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

//   // Sort
//   if (filters.coordinates?.sortByDistance) {
//     aggregationPipeline.push({ $sort: { distanceFromOrigin: 1 } });
//   } else {
//     aggregationPipeline.push({ $sort: { [sortField]: sortOrder } });
//   }

//   // Pagination + total counts
//   aggregationPipeline.push({
//     $facet: {
//       data: [{ $skip: skip }, { $limit: limit }],
//       totalCount: [{ $count: 'total' }],
//       urgentCount: [{ $match: { leadPriority: 'urgent' } }, { $count: 'total' }],
//     },
//   });

//   const result = await Lead.aggregate(aggregationPipeline);

//   const data = result[0]?.data || [];
//   const total = result[0]?.totalCount[0]?.total || 0;
//   const urgentCount = result[0]?.urgentCount[0]?.total || 0;

//   return {
//     pagination: { total, page, limit, totalPage: Math.ceil(total / limit) },
//     data,
//     leadCount: { urgent: urgentCount },
//   };
// };





//  -------------------------------------  realtime approximate speed in meters per minute filtering  ----------------------------------




// Main function
export const getAllLeadFromDB = async (
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


  // ----------------------- MATCH STAGE -----------------------
  const matchStage: any = {
    countryId: new mongoose.Types.ObjectId(userProfile.country),
    userProfileId: { $ne: userProfile._id },
    responders: { $ne: userProfile._id },
    serviceId: { $in: userProfile.serviceIds },
    status: 'approved',
  };

  // Spotlight
  if (filters.spotlight?.length) matchStage.leadPriority = { $in: filters.spotlight };

  // Services
  if (filters.services?.length) {
    matchStage.serviceId = { $in: filters.services.map((id: string) => new mongoose.Types.ObjectId(id)) };
  }

  // Credits
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
    if (creditConditions.length) matchStage.$or = [...(matchStage.$or || []), ...creditConditions];
  }

  // Location IDs
  if (filters.location?.length) {
    matchStage.locationId = { $in: filters.location.map((id: string) => new mongoose.Types.ObjectId(id)) };
  }

  // Lead submission filter
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

  // ----------------------- AGGREGATION PIPELINE -----------------------
  const aggregationPipeline: any[] = [
    { $match: matchStage },

    // Lookups
    { $lookup: { from: 'zipcodes', localField: 'locationId', foreignField: '_id', as: 'locationId' } },
    { $unwind: { path: '$locationId', preserveNullAndEmptyArrays: true } },

    { $lookup: { from: 'userprofiles', localField: 'userProfileId', foreignField: '_id', as: 'userProfileId' } },
    { $unwind: { path: '$userProfileId', preserveNullAndEmptyArrays: true } },

    { $lookup: { from: 'users', localField: 'userProfileId.user', foreignField: '_id', as: 'userProfileId.user' } },
    { $unwind: { path: '$userProfileId.user', preserveNullAndEmptyArrays: true } },

    { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'serviceId' } },
    { $unwind: { path: '$serviceId', preserveNullAndEmptyArrays: true } },

    { $lookup: { from: 'userprofiles', localField: 'responders', foreignField: '_id', as: 'responders' } },
  ];

  // Keyword search
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

  // Execute initial aggregation
  let leads = await Lead.aggregate(aggregationPipeline);

  // ----------------------- DYNAMIC COORDINATE FILTER -----------------------
  if (filters.coordinates) {
    console.log('Filters received for coordinates:', filters.coordinates);
    const { coord, maxMinutes = 15, mode = 'driving' } = filters.coordinates;
    leads = await filterByTravelTime(coord, leads, maxMinutes, mode);


  }

  // Pagination after travel time filtering
  const total = leads.length;
  const paginatedLeads = leads.slice(skip, skip + limit);

  return {
    data: paginatedLeads,
    pagination: { total, page, limit, totalPage: Math.ceil(total / limit) },
    leadCount: { urgent: paginatedLeads.filter(l => l.leadPriority === 'urgent').length },
  };
};




// ------------------ GET ALL MY LEAD -----------------------------












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
        select: 'profilePicture name user'
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

  // ✅ 5. Return final result
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


export const leadClosedIntoDB = async (
  userId: string,
  leadId: string,
  reason?: string
) => {
  // Validate leadId
  validateObjectId(leadId, "Case");

  // Fetch the lead
  const lead = await Lead.findById(leadId);
  if (!lead) {

    return { success: false, message: "Case not found" };
  }

  // Fetch user profile of the requester
  const userProfile = await UserProfile.findOne({ user: userId }).select("_id");
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
  await lead.save();
  return {
    success: true,
    message: "Case closed successfully",
    lead,
  };
};




//  repost data ---

// const repostLead = async (leadId: string) => {
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     // 1️⃣ Fetch original lead
//     const originalLead = await Lead.findById(leadId).session(session);
//     if (!originalLead) {
//       await session.abortTransaction();
//       session.endSession();
//       throw new Error('Original lead not found');
//     }

//     // 2️⃣ Duplicate Lead
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

//     // 3️⃣ Duplicate LeadServiceAnswers
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
    // 1️⃣ Fetch original lead and user profile
    const originalLead = await Lead.findById(leadId)
      .populate({
        path: 'userProfileId',
        populate: 'user'
      })
      .session(session);

    if (!originalLead) {

      throw new Error('Original case not found');
    }

    // 2️⃣ Guard: only the client who created the lead can repost
    const leadOwnerId = (originalLead.userProfileId as any).user?._id?.toString?.();
    if (leadOwnerId !== clientUserId) {
      throw new Error('Unauthorized: Only the case owner can repost this lead');
    }

    // 3️⃣ Duplicate Lead
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

    // ✅ 4️⃣ Mark original lead as requested
    await Lead.findByIdAndUpdate(
      leadId,
      { $set: { isReposted: true } }, // <-- FIXED HERE ✅
      { session, new: true }
    );



    // 4️⃣ Duplicate LeadServiceAnswers
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

    // 6️⃣ Send email to client about reposted lead
    const service = await Service.findById(newLead.serviceId).select('name');
    const userProfile = originalLead.userProfileId as any;


    // 5️⃣ Commit transaction
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
  getAllLeadFromDB,
  getSingleLeadFromDB,
  updateLeadIntoDB,
  deleteLeadFromDB,
  getMyAllLeadFromDB,
  getAllLeadForAdminDashboardFromDB,
  leadClosedIntoDB,
  repostLead,
  getAllClientWiseLeadFromDB
};
