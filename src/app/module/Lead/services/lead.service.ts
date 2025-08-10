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

import QueryBuilder from '../../../builder/QueryBuilder';
import LeadResponse from '../../LeadResponse/models/response.model';
import { IUserProfile } from '../../User/interfaces/user.interface';
import { buildCreditFilter } from '../utils/buildCreditFilter';
import Service from '../../Service/models/service.model';
import config from '../../../config';
import { sendEmail } from '../../../emails/email.service';
import { IUser } from '../../Auth/interfaces/auth.interface';
import ServiceWiseQuestion from '../../Question/models/ServiceWiseQuestion.model';
import Option from '../../Option/models/option.model';


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
    } = payload;

    const creditInfo = await CountryWiseServiceWiseField.findOne({
      countryId,
      serviceId,
      deletedAt: null,
    }).select('baseCredit');

    let formattedAnswers = '';
    const [leadUser] = await Lead.create(
      [
        {
          userProfileId: userProfile._id,
          countryId,
          serviceId,
          additionalDetails,
          budgetAmount,
          locationId,
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
      dashboardUrl: `${config.client_url}/client/dashboard/my-leads`,
      appName: 'The Law App',
      email: 'support@yourdomain.com',
    };



    await sendEmail({
      to: (userProfile.user as IUser).email,
      subject: "We've received your legal request — Awaiting approval",
      data: emailData,
      emailTemplate: 'welcome_Lead_submission',
    });



    return leadUser;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating lead with transaction:', error);
    throw error;
  }
};




// ------------------ Get all Lead for admin dahsobard ------------------

const getAllLeadForAdminDashboardFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {

  const user = await UserProfile.findOne({ user: userId }).select(
    '_id serviceIds',
  );
  if (!user) return null;

  const leadQuery = new QueryBuilder(
    Lead.find({})
      .populate({
        path: 'userProfileId',
        populate: { path: 'user' },
      })
      .populate('serviceId')
      .lean(),
    query,
  )
    // .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await leadQuery.countTotal();
  let data = await leadQuery.modelQuery;

  const result = await Promise.all(
    data.map(async (lead) => {
      const existingResponse = await LeadResponse.exists({
        leadId: lead._id,
      });

      return {
        ...lead,
        credit: customCreditLogic(lead?.credit as number),
        isContact: !!existingResponse,
      };
    }),
  );

  return {
    meta,
    data: result,
  };
};




//  --------------  Get all lead for lawyer dashboard ----------


// const getAllLeadFromDB = async (
//   userId: string,
//   query: Record<string, unknown>,
// ) => {
//   const user = await UserProfile.findOne({ user: userId }).select(
//     '_id serviceIds',
//   );
//   if (!user) return null;


//   const conditionalExcludeFields = [
//     'credits',
//     'keyword',
//     'leadSubmission',
//     'location',
//     'services',
//     'spotlight',
//     'view',
//     'sort',
//   ];

//   let parsedKeyword: any = {};
//   try {
//     if (typeof query.searchKeyword === 'string') {
//       parsedKeyword = JSON.parse(query.searchKeyword);
//     }
//   } catch (err) {
//     console.error('Invalid JSON in searchKeyword:', err);
//   }

//   //  --------------- dont remove it , it will use next time -------------------------
//   const isKeywordEmpty =
//     !parsedKeyword || typeof parsedKeyword !== 'object' || !Object.keys(parsedKeyword).length;

//   const filteredQuery = Object.fromEntries(
//     Object.entries(query).filter(([key]) => {
//       if (key === 'searchKeyword') return false;
//       return !conditionalExcludeFields.includes(key) || !(key in parsedKeyword);
//     }),
//   );

//   if (parsedKeyword?.sort) {
//     filteredQuery.sort = parsedKeyword.sort;
//   }

//   let services: any[] = [];

//   if (
//     Array.isArray(parsedKeyword?.services) &&
//     parsedKeyword.services.length > 0
//   ) {
//     services = parsedKeyword.services;
//   } else if (Array.isArray(user.serviceIds) && user.serviceIds.length > 0) {
//     services = user.serviceIds;
//   }

//   const userObjectId = new mongoose.Types.ObjectId(user._id.toString());

//   const baseFilter: any = {
//     deletedAt: null,
//     serviceId: { $in: services.length ? services : user.serviceIds },
//     status: "approved",
//     userProfileId: { $ne: userObjectId },
//     responders: { $ne: userObjectId }, // exclude leads where 

//   };


//   // ---------------- CREDIT RANGE FILTER -----------------

//   if (Array.isArray(parsedKeyword?.credits) && parsedKeyword.credits.length > 0) {
//     const creditFilter = buildCreditFilter(parsedKeyword.credits);
//     Object.assign(baseFilter, creditFilter);
//   }


//   // ---------------- LEAD SUBMISSION FILTER -----------------

//   if (parsedKeyword?.['leadSubmission']) {
//     const now = new Date();
//     const submissionRanges: Record<string, number> = {
//       last_1_hour: 1,
//       last_24_hours: 24,
//       last_48_hours: 48,
//       last_3_days: 72,
//       last_7_days: 168,
//       last_14_days: 336,
//     };

//     const hours = submissionRanges[parsedKeyword['leadSubmission']];
//     if (hours) {
//       baseFilter.createdAt = { $gte: new Date(now.getTime() - hours * 60 * 60 * 1000) };
//     }
//   }

//   const leadQuery = new QueryBuilder(
//     Lead.find({
//     ...baseFilter,
//     responders: { $ne: userObjectId }, // Exclude leads where current user has already responded
//   })
//       // .populate('userProfileId')
//       .populate({
//         path: 'userProfileId',
//         populate: 'user'
//       })
//       .populate('serviceId')
//       .populate('responders')
//       .lean(),
//     filteredQuery,
//   )
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   let meta = await leadQuery.countTotal();
//   let data = await leadQuery.modelQuery;


//   if (parsedKeyword?.keyword?.trim()) {
//     const keyword = parsedKeyword.keyword.trim().toLowerCase();
//     data = data?.filter((lead) => {
//       const profile = lead?.userProfileId as unknown as IUserProfile;
//       return profile?.name?.toLowerCase().includes(keyword);
//     });

//     // Recalculate pagination meta based on filtered data
//     const page = Number(leadQuery?.query?.page) || 1;
//     const limit = Number(leadQuery?.query?.limit) || 10;
//     const total = data.length;
//     const totalPage = Math.ceil(total / limit);

//     meta = {
//       page,
//       limit,
//       total,
//       totalPage,
//     };

//     // Paginate filtered data manually
//     const startIndex = (page - 1) * limit;
//     const endIndex = startIndex + limit;
//     data = data.slice(startIndex, endIndex);

//   }


//   const result = await Promise.all(
//     data.map(async (lead) => {
//       // const existingResponse = await LeadResponse.exists({
//       //   leadId: lead._id,
//       //   responseBy: user._id,
//       // });

//       return {
//         ...lead,
//         credit: customCreditLogic(lead?.credit as number),
//         // isContact: !!existingResponse,
//       };
//     }),
//   );

//   // const result = (
//   //   await Promise.all(
//   //     data.map(async (lead) => {
//   //       const existingResponse = await LeadResponse.exists({
//   //         leadId: lead._id,
//   //         responseBy: user._id,
//   //       });

//   //       if (existingResponse) return null; // ❌ Exclude this lead

//   //       return {
//   //         ...lead,
//   //         credit: customCreditLogic(lead?.credit as number),
//   //         isContact: false,
//   //       };
//   //     }),
//   //   )
//   // ).filter(Boolean); // ✅ Remove all `null` entries


//   // // Recalculate pagination meta based on filtered data
//   // const page = Number(leadQuery?.query?.page) || 1;
//   // const limit = Number(leadQuery?.query?.limit) || 10;
//   // const total = result.length;
//   // const totalPage = Math.ceil(total / limit);

//   // meta = {
//   //   page,
//   //   limit,
//   //   total,
//   //   totalPage,
//   // };

//   // // Paginate filtered data manually
//   // const startIndex = (page - 1) * limit;
//   // const endIndex = startIndex + limit;
//   // const paginatedResult = result.slice(startIndex, endIndex);


//   return {
//     meta,
//     // data: paginatedResult,
//     data: result,
//   };
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
 leadCount?: {
    urgent: number;
  };
};



/// ------------------------------- search query -----------------------


  //  keyword: parsedKeyword.keyword || '',
  //   spotlight: parsedKeyword.spotlight || '',
  //   view: parsedKeyword.view || '',
  //   leadSubmission: parsedKeyword.leadSubmission || '',
  //   location: parsedKeyword.location || '',
  //   services: parsedKeyword.services || [],
  //   credits: parsedKeyword.credits || [],


/// ------------------------------- search query -----------------------








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
//   const userProfile = await UserProfile.findOne({ user: userId }).select('_id serviceIds');
//   if (!userProfile) {
//     return {
//       data: [],
//       pagination: {
//         total: 0,
//         page: options.page,
//         limit: options.limit,
//         totalPage: 0,
//       },
//     };
//   }

//   const page = options.page || 1;
//   const limit = options.limit || 10;
//   const skip = (page - 1) * limit;
//   const sortField = options.sortBy || 'createdAt';
//   const sortOrder = options.sortOrder === 'asc' ? 1 : -1;

//   const matchStage: any = {
//     deletedAt: null,
//     userProfileId: { $ne: userProfile._id },
//     responders: { $ne: userProfile._id },
//     serviceId: { $in: userProfile.serviceIds },
//   };


//   if (filters.keyword) {
//   const keywordRegex = new RegExp(filters.keyword, 'i');
//   matchStage.$or = [
//     { 'userProfileId.name': { $regex: keywordRegex } },
//     { additionalDetails: { $regex: keywordRegex } },
//   ];
// }

//   // Spotlight (leadPriority)
//   if (filters.spotlight?.length) {
//     matchStage.leadPriority = { $in: filters.spotlight };
//   }



//   // Services
//   if (filters.services?.length) {
//     matchStage.serviceId = {
//       $in: filters.services.map((id: string) => new mongoose.Types.ObjectId(id)),
//     };
//   }


// // Credits
// if (filters.credits?.length) {
//   const creditConditions = filters.credits.map((range: string) => {
//     switch (range) {
//       case 'Free':
//         return { credit: 0 };
//       case '1-5 credits':
//         return { credit: { $gte: 1, $lte: 5 } };
//       case '5-10 credits':
//         return { credit: { $gte: 5, $lte: 10 } };
//       case '10-20 credits':
//         return { credit: { $gte: 10, $lte: 20 } };
//       case '20-30 credits':
//         return { credit: { $gte: 20, $lte: 30 } };
//       case '30-40 credits':
//         return { credit: { $gte: 30, $lte: 40 } };
//       case '40-50 credits':
//         return { credit: { $gte: 40, $lte: 50 } };
//       case '50-100 credits':
//         return { credit: { $gte: 50, $lte: 100 } };
//       default:
//         return null;
//     }
//   }).filter(Boolean);

//   if (creditConditions.length) {
//     matchStage.$or = [...(matchStage.$or || []), ...creditConditions];
//   }
// }


//   // Location
//   if (filters.location?.length) {
//     matchStage.locationId = {
//       $in: filters.location.map((id: string) => new mongoose.Types.ObjectId(id)),
//     };
//   }


//   if (filters.leadSubmission) {
//   const now = new Date();
//   let startDate: Date | null = null;

//   switch (filters.leadSubmission) {
//     case 'last_1_hour':
//       startDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
//       break;
//     case 'last_24_hours':
//       startDate = new Date();
//       startDate.setHours(0, 0, 0, 0); // today at 00:00
//       break;
//     case 'last_48_hours':
//       startDate = new Date();
//       startDate.setDate(startDate.getDate() - 1); // yesterday
//       break;
//     case 'last_3_days':
//       startDate = new Date();
//       startDate.setDate(startDate.getDate() - 3);
//       break;
//     case 'last_7_days':
//       startDate = new Date();
//       startDate.setDate(startDate.getDate() - 7);
//       break;
//     case 'last_14_days':
//       startDate = new Date();
//       startDate.setDate(startDate.getDate() - 14);
//       break;
//     // Add more if you add them on frontend
//   }

//   if (startDate) {
//     matchStage.createdAt = { $gte: startDate };
//   }
// }


//   //  View will be next time add logic
//   if(filters.view){
//     console.log('view')
//   }


//   const aggregationPipeline: any[] = [
//     { $match: matchStage },

//     // Lookups
//     {
//       $lookup: {
//         from: 'userprofiles',
//         localField: 'userProfileId',
//         foreignField: '_id',
//         as: 'userProfileId',
//       },
//     },
//     { $unwind: { path: '$userProfileId', preserveNullAndEmptyArrays: true } },


//     {
//       $lookup: {
//         from: 'services',
//         localField: 'serviceId',
//         foreignField: '_id',
//         as: 'serviceId',
//       },
//     },
//     { $unwind: { path: '$serviceId', preserveNullAndEmptyArrays: true } },

//     {
//       $lookup: {
//         from: 'locations',
//         localField: 'locationId',
//         foreignField: '_id',
//         as: 'locationId',
//       },
//     },
//     { $unwind: { path: '$locationId', preserveNullAndEmptyArrays: true } },

//     // ✅ Lookup responders array (NEW)
//     {
//       $lookup: {
//         from: 'userprofiles',
//         localField: 'responders',
//         foreignField: '_id',
//         as: 'responders',
//       },
//     },

//     // Sort, skip, limit
//     { $sort: { [sortField]: sortOrder } },
//     { $skip: skip },
//     { $limit: limit },
//   ];

//   const [data, totalCountResult] = await Promise.all([
//     Lead.aggregate(aggregationPipeline),
//     Lead.aggregate([
//       { $match: matchStage },
//       { $count: 'total' },
//     ]),
//   ]);

//   const total = totalCountResult[0]?.total || 0;

//   return {
//     pagination: {
//       total,
//       page,
//       limit,
//       totalPage: Math.ceil(total / limit),
//     },
//     data,
//   };
// };



const getAllLeadFromDB = async (
  userId: string,
  filters: any = {},
  options: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }
): Promise<PaginatedResult<any>> => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id serviceIds');
  if (!userProfile) {
    return {
      data: [],
      pagination: { total: 0, page: options.page, limit: options.limit, totalPage: 0 },
    };
  }

 
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  const sortField = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder === 'asc' ? 1 : -1;




  const matchStage: any = {
    deletedAt: null,
    userProfileId: { $ne: userProfile._id },
    responders: { $ne: userProfile._id },
    serviceId: { $in: userProfile.serviceIds },
    status:'approved'
  };

  // Spotlight
  if (filters.spotlight?.length) {
    matchStage.leadPriority = { $in: filters.spotlight };
  }

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
    if (creditConditions.length) {
      matchStage.$or = [...(matchStage.$or || []), ...creditConditions];
    }
  }

  // Location
  if (filters.location?.length) {
    matchStage.locationId = { $in: filters.location.map((id: string) => new mongoose.Types.ObjectId(id)) };
  }

  // Lead submission time filter
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

  // Build pipeline with keyword filter AFTER lookup
  const aggregationPipeline: any[] = [
    { $match: matchStage },

    { $lookup: { from: 'userprofiles', localField: 'userProfileId', foreignField: '_id', as: 'userProfileId' } },
    { $unwind: { path: '$userProfileId', preserveNullAndEmptyArrays: true } },

    { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'serviceId' } },
    { $unwind: { path: '$serviceId', preserveNullAndEmptyArrays: true } },

    { $lookup: { from: 'locations', localField: 'locationId', foreignField: '_id', as: 'locationId' } },
    { $unwind: { path: '$locationId', preserveNullAndEmptyArrays: true } },

    { $lookup: { from: 'userprofiles', localField: 'responders', foreignField: '_id', as: 'responders' } },

    // Keyword match here (AFTER we have userProfileId.name)
    ...(filters.keyword
      ? [{ $match: { $or: [
          { 'userProfileId.name': { $regex: new RegExp(filters.keyword, 'i') } },
          { additionalDetails: { $regex: new RegExp(filters.keyword, 'i') } },
        ] } }]
      : []),

    { $sort: { [sortField]: sortOrder } },

    // One DB call for data + total
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
        ],
        totalCount: [
          { $count: 'total' }
        ],
         urgentCount: [
          { $match: { leadPriority: 'urgent' } },
          { $count: 'total' }
        ]
      }
    }
  ];

  const result = await Lead.aggregate(aggregationPipeline);

  const data = result[0]?.data || [];
  const total = result[0]?.totalCount[0]?.total || 0;
  const urgentCount = result[0]?.urgentCount[0]?.total || 0;

  return {
    pagination: { total, page, limit, totalPage: Math.ceil(total / limit) },
    data,
   leadCount:{
      urgent: urgentCount,
    }
  };
};



//   ------------------ GET ALL MY LEAD -----------------------------
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
      .populate({
        path: 'responders',
        select: 'profilePicture name'
      })
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
    .populate('responders')
    .lean(); // Convert to plain JS object

  if (!leadDoc) return null;



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
  getAllLeadForAdminDashboardFromDB
};
