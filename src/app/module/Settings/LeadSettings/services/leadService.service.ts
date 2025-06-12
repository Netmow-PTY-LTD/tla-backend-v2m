/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
import { sendNotFoundResponse } from '../../../../errors/custom.error';

import UserProfile from '../../../User/models/user.model';
import {
  ILeadService,
  IUpdateLeadServiceAnswers,
  LocationType,
} from '../interfaces/leadService.interface';
import LeadService from '../models/leadService.model';
import { validateObjectId } from '../../../../utils/validateObjectId';
import ServiceWiseQuestion from '../../../Service/Question/models/ServiceWiseQuestion.model';
import { UserLocationServiceMap } from '../models/UserLocationServiceMap.model';
import ZipCode from '../../../Geo/Country/models/zipcode.model';
import Option from '../../../Service/Option/models/option.model';

// const createLeadService = async (
//   userId: string,
//   payload: {
//     serviceIds: Types.ObjectId[];
//     locations: string[];
//     onlineEnabled: boolean;
//   },
// ) => {
//   const userProfile = await UserProfile.findOne({ user: userId }).select('_id');
//   if (!userProfile) sendNotFoundResponse('User profile not found');

//   payload.serviceIds.forEach((id) =>
//     validateObjectId(id.toString(), 'service'),
//   );

//   const objectServiceIds = payload.serviceIds.map(
//     (id) => new mongoose.Types.ObjectId(id),
//   );

//   const existing = await LeadService.find({
//     userProfileId: userProfile?._id,
//     serviceId: { $in: objectServiceIds },
//   }).select('serviceId');

//   const existingServiceIds = new Set(
//     existing.map((e) => e.serviceId.toString()),
//   );
//   const newServiceIds = objectServiceIds.filter(
//     (id) => !existingServiceIds.has(id.toString()),
//   );

//   if (newServiceIds.length === 0) {
//     throw {
//       status: 409,
//       message: 'All selected services already exist for this user',
//       duplicates: Array.from(existingServiceIds),
//     };
//   }

//   // Fetch questions for each new service and attach with empty selectedOptionIds
//   const allQuestions = await ServiceWiseQuestion.find({
//     serviceId: { $in: newServiceIds },
//     deletedAt: null,
//   }).select('_id serviceId');

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const groupedQuestions: Record<string, any[]> = {};
//   allQuestions.forEach((q) => {
//     const serviceIdStr = q.serviceId.toString();
//     if (!groupedQuestions[serviceIdStr]) groupedQuestions[serviceIdStr] = [];
//     groupedQuestions[serviceIdStr].push({
//       questionId: q._id,
//       selectedOptionIds: [],
//     });
//   });

//   const newLeadServices = newServiceIds.map((serviceId) => ({
//     serviceId,
//     userProfileId: userProfile?._id,
//     locations: payload.locations,
//     onlineEnabled: payload.onlineEnabled,
//     questions: groupedQuestions[serviceId.toString()] || [],
//   }));

//   const created = await LeadService.insertMany(newLeadServices);
//   return created;
// };

// const createLeadService = async (
//   userId: string,
//   payload: {
//     serviceIds: Types.ObjectId[];
//     onlineEnabled: boolean;
//   },
// ) => {
//   const userProfile = await UserProfile.findOne({ user: userId }).select(
//     '_id country',
//   );
//   if (!userProfile) sendNotFoundResponse('User profile not found');

//   payload.serviceIds.forEach((id) =>
//     validateObjectId(id.toString(), 'service'),
//   );

//   const objectServiceIds = payload.serviceIds.map(
//     (id) => new mongoose.Types.ObjectId(id),
//   );

//   const existing = await LeadService.find({
//     userProfileId: userProfile?._id,
//     serviceId: { $in: objectServiceIds },
//   }).select('serviceId');

//   const existingServiceIds = new Set(
//     existing.map((e) => e.serviceId.toString()),
//   );

//   const newServiceIds = objectServiceIds.filter(
//     (id) => !existingServiceIds.has(id.toString()),
//   );

//   if (newServiceIds.length === 0) {
//     throw {
//       status: 409,
//       message: 'All selected services already exist for this user',
//       duplicates: Array.from(existingServiceIds),
//     };
//   }

//   // ✅ 2. Get service-specific questions
//   const allQuestions = await ServiceWiseQuestion.find({
//     serviceId: { $in: newServiceIds },
//     deletedAt: null,
//   }).select('_id serviceId');

//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const groupedQuestions: Record<string, any[]> = {};
//   allQuestions.forEach((q) => {
//     const serviceIdStr = q.serviceId.toString();
//     if (!groupedQuestions[serviceIdStr]) groupedQuestions[serviceIdStr] = [];
//     groupedQuestions[serviceIdStr].push({
//       questionId: q._id,
//       selectedOptionIds: [],
//     });
//   });

//   //  Location logic
//   const locationGroup = await ZipCode.findOne({
//     countryId: userProfile?.country,
//     zipCodeType: 'default',
//   });

//   const existingLocationMap = await UserLocationServiceMap.findOne({
//     userProfileId: userProfile?._id,
//     locationGroupId: locationGroup?._id,
//     locationType: 'nation_wide',
//   });

//   if (existingLocationMap) {
//     // Filter only serviceIds that are NOT already in the map
//     const existingServiceIdSet = new Set(
//       (existingLocationMap.serviceIds || []).map((id) => id.toString()),
//     );

//     const newServiceIdsToAdd = objectServiceIds.filter(
//       (id) => !existingServiceIdSet.has(id.toString()),
//     );

//     if (newServiceIdsToAdd.length > 0) {
//       await UserLocationServiceMap.updateOne(
//         { _id: existingLocationMap._id },
//         { $addToSet: { serviceIds: { $each: newServiceIdsToAdd } } },
//       );
//     }
//   } else {
//     // No existing map — create new
//     await UserLocationServiceMap.create({
//       userProfileId: userProfile?._id,
//       locationGroupId: locationGroup?._id,
//       locationType: 'nation_wide',
//       serviceIds: objectServiceIds,
//     });
//   }

//   // ✅ 3. Create services with default location
//   const newLeadServices = newServiceIds.map((serviceId) => ({
//     serviceId,
//     userProfileId: userProfile?._id,
//     questions: groupedQuestions[serviceId.toString()] || [],
//   }));

//   const created = await LeadService.insertMany(newLeadServices);
//   return created;
// };

const createLeadService = async (
  userId: string,
  payload: {
    serviceIds: Types.ObjectId[];
  },
) => {
  // 1. Find user profile by userId
  const userProfile = await UserProfile.findOne({ user: userId }).select(
    '_id serviceIds',
  );
  if (!userProfile) {
    sendNotFoundResponse('User profile not found');
    return;
  }

  // 2. Validate all serviceIds
  payload.serviceIds.forEach((id) =>
    validateObjectId(id.toString(), 'service'),
  );

  // 3. Convert to ObjectId instances (if needed)
  const objectServiceIds = payload.serviceIds.map(
    (id) => new mongoose.Types.ObjectId(id),
  );

  // 4. Compare with existing serviceIds in userProfile
  const existingServiceIds = new Set(
    (userProfile.serviceIds || []).map((id: Types.ObjectId) => id.toString()),
  );

  const newServiceIds = objectServiceIds.filter(
    (id) => !existingServiceIds.has(id.toString()),
  );

  // 5. If all services already exist, return conflict response
  if (newServiceIds.length === 0) {
    throw {
      status: 409,
      message: 'All selected services already exist for this user',
      duplicates: Array.from(existingServiceIds),
    };
  }
  // 6. Append and save new serviceIds
  userProfile.serviceIds.push(...newServiceIds);
  await userProfile.save();

  // 7. Create lead service entries
  for (const serviceId of newServiceIds) {
    const questions = await ServiceWiseQuestion.find({ serviceId });

    for (const question of questions) {
      const options = await Option.find({
        questionId: question._id,
        serviceId,
      });

      for (const option of options) {
        await LeadService.create({
          userProfileId: userProfile._id,
          serviceId,
          questionId: question._id,
          optionId: option._id,
          isSelected: true,
        });
      }
    }
  }
  // ✅ New services can now be added to the profile or processed
  return {
    userProfileId: userProfile._id,
    newServiceIds,
  };
};

// const getLeadServicesWithQuestions = async (userId: string) => {
//   const userProfile = await UserProfile.findOne({ user: userId }).select('_id');
//   if (!userProfile) sendNotFoundResponse('User profile not found');

//   const leadServices = await LeadService.aggregate([
//     { $match: { userProfileId: userProfile?._id } },
//     {
//       $addFields: {
//         originalQuestions: '$questions', // preserve leadService.questions
//       },
//     },
//     {
//       $lookup: {
//         from: 'services',
//         localField: 'serviceId',
//         foreignField: '_id',
//         as: 'service',
//       },
//     },
//     { $unwind: '$service' },
//     {
//       $lookup: {
//         from: 'questions',
//         let: { serviceId: '$service._id' },
//         pipeline: [
//           {
//             $match: {
//               $expr: { $eq: ['$serviceId', '$$serviceId'] },
//               deletedAt: null,
//             },
//           },
//           {
//             $lookup: {
//               from: 'options',
//               localField: '_id',
//               foreignField: 'questionId',
//               as: 'options',
//             },
//           },
//           {
//             $project: {
//               _id: 1,
//               question: 1,
//               slug: 1,
//               questionType: 1,
//               options: { _id: 1, name: 1, slug: 1 },
//             },
//           },
//         ],
//         as: 'questions',
//       },
//     },
//     {
//       $addFields: {
//         questions: {
//           $map: {
//             input: '$questions',
//             as: 'q',
//             in: {
//               $mergeObjects: [
//                 '$$q',
//                 {
//                   selectedOptionIds: {
//                     $let: {
//                       vars: {
//                         matched: {
//                           $first: {
//                             $filter: {
//                               input: '$originalQuestions',
//                               as: 'oq',
//                               cond: {
//                                 $eq: ['$$oq.questionId', '$$q._id'],
//                               },
//                             },
//                           },
//                         },
//                       },
//                       in: {
//                         $ifNull: ['$$matched.selectedOptionIds', []],
//                       },
//                     },
//                   },
//                 },
//               ],
//             },
//           },
//         },
//       },
//     },
//     //  extra logic
//     // {
//     //   $lookup: {
//     //     from: 'userlocationservicemaps',
//     //     let: {
//     //       serviceId: '$service._id',
//     //       userProfileId: '$userProfileId',
//     //     },
//     //     pipeline: [
//     //       {
//     //         $match: {
//     //           $expr: {
//     //             $and: [
//     //               { $in: ['$$serviceId', '$serviceIds'] },
//     //               { $eq: ['$userProfileId', '$$userProfileId'] },
//     //             ],
//     //           },
//     //         },
//     //       },
//     //       {
//     //         $project: {
//     //           _id: 1,
//     //           locationGroupId: 1,
//     //           locationType: 1,
//     //         },
//     //       },
//     //     ],
//     //     as: 'locations',
//     //   },
//     // },

//     {
//       $lookup: {
//         from: 'userlocationservicemaps',
//         let: {
//           serviceId: '$service._id',
//           userProfileId: '$userProfileId',
//         },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $in: ['$$serviceId', '$serviceIds'] },
//                   { $eq: ['$userProfileId', '$$userProfileId'] },
//                 ],
//               },
//             },
//           },
//           {
//             $project: {
//               _id: 1,
//               serviceIds: 1,
//               locationGroupId: 1,
//               locationType: 1,
//             },
//           },
//         ],
//         as: 'locations',
//       },
//     },
//     // {
//     //   $addFields: {
//     //     locations: {
//     //       $map: {
//     //         input: '$locations',
//     //         as: 'loc',
//     //         in: {
//     //           $mergeObjects: [
//     //             '$$loc',
//     //             {
//     //               SelectedLocationId: {
//     //                 $let: {
//     //                   vars: {
//     //                     matched: {
//     //                       $first: {
//     //                         $filter: {
//     //                           input: '$locations', // this refers to the populated locations
//     //                           as: 'originalLoc',
//     //                           cond: {
//     //                             $eq: ['$$originalLoc._id', '$$loc._id'],
//     //                           },
//     //                         },
//     //                       },
//     //                     },
//     //                   },
//     //                   in: '$$matched._id',
//     //                 },
//     //               },
//     //             },
//     //           ],
//     //         },
//     //       },
//     //     },
//     //   },
//     // },
//     {
//       $addFields: {
//         locationCount: { $size: '$locations' },
//       },
//     },
//     {
//       $project: {
//         serviceName: '$service.name',
//         serviceId: '$service._id',
//         locations: 1,
//         locationCount: 1,
//         onlineEnabled: 1,
//         questions: 1,
//       },
//     },
//   ]);

//   return leadServices;
// };

const getLeadServicesWithQuestions = async (userId: string) => {
  // 1. Fetch user profile
  const userProfile = await UserProfile.findOne({ user: userId }).select(
    '_id serviceIds',
  );
  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }

  // 2. Fetch relevant lead services
  const leadServices = await LeadService.find({
    userProfileId: userProfile._id,
    serviceId: { $in: userProfile.serviceIds },
  })
    .populate('serviceId')
    .populate('questionId')
    .populate('optionId');

  // 3. Organize data
  const grouped: Record<
    string,
    {
      service: any;
      questionsMap: Record<string, { question: any; options: any[] }>;
    }
  > = {};

  for (const item of leadServices) {
    const serviceId = (item.serviceId as any)._id.toString();
    const questionId = (item.questionId as any)._id.toString();

    // Initialize service group
    if (!grouped[serviceId]) {
      grouped[serviceId] = {
        service: item.serviceId,
        questionsMap: {},
      };
    }

    // Initialize question group
    if (!grouped[serviceId].questionsMap[questionId]) {
      grouped[serviceId].questionsMap[questionId] = {
        question: item.questionId,
        options: [],
      };
    }

    // Push the option
    grouped[serviceId].questionsMap[questionId].options.push({
      option: item.optionId,
      isSelected: item.isSelected,
      idExtraData: item.idExtraData,
    });
  }

  // 4. Convert grouped object to array structure
  const service = Object.values(grouped).map(({ service, questionsMap }) => ({
    service,
    questions: Object.values(questionsMap).map(({ question, options }) => ({
      question,
      options,
    })),
  }));

  const locations = await UserLocationServiceMap.find({
    userProfileId: userProfile._id,
  });

  return {
    service,
    locations,
  };
};

const updateLocations = async (
  leadServiceId: string,
  locations: {
    _id: string;
    locationGroupId: string;
    locationType: LocationType;
  }[],
) => {
  validateObjectId(leadServiceId, 'lead Service ID');

  const leadService = await LeadService.findById(leadServiceId);
  if (!leadService) return sendNotFoundResponse('Lead service not found');

  // Update locations inside LeadService
  leadService.locations = locations;
  await leadService.save();

  // Step 1: Remove old mappings for the user+service
  const oldMaps = await UserLocationServiceMap.find({
    userProfileId: leadService.userProfileId,
  });

  // For each old map, remove the serviceId from `serviceIds` array
  for (const map of oldMaps) {
    map.serviceIds = map.serviceIds.filter(
      (id) => id.toString() !== leadService.serviceId.toString(),
    );

    if (map.serviceIds.length === 0) {
      await map.deleteOne(); // delete map if no service remains
    } else {
      await map.save(); // otherwise save updated list
    }
  }

  // Step 2: Insert or update new mappings
  for (const { locationGroupId, locationType } of locations) {
    const existingMap = await UserLocationServiceMap.findOne({
      userProfileId: leadService.userProfileId,
      locationGroupId,
      locationType,
    });

    if (existingMap) {
      // Add serviceId if not already present
      if (
        !existingMap.serviceIds.some(
          (id) => id.toString() === leadService.serviceId.toString(),
        )
      ) {
        existingMap.serviceIds.push(leadService.serviceId);
        await existingMap.save();
      }
    } else {
      // Create new mapping
      await UserLocationServiceMap.create({
        userProfileId: leadService.userProfileId,
        locationGroupId,
        locationType,
        serviceIds: [leadService.serviceId],
      });
    }
  }

  return leadService;
};

const toggleOnlineEnabled = async (
  leadServiceId: string,
  onlineEnabled: boolean,
): Promise<ILeadService | null> => {
  // Validate ObjectId format
  validateObjectId(leadServiceId, 'lead Service ID');
  return await LeadService.findByIdAndUpdate(
    leadServiceId,
    { onlineEnabled },
    { new: true },
  );
};

export const deleteLeadService = async (leadServiceId: string) => {
  // Validate ObjectId format
  validateObjectId(leadServiceId, 'lead Service ID');

  // Check if the service exists
  const service = await LeadService.findById(leadServiceId);
  if (!service) {
    sendNotFoundResponse('Lead service not found');
  }

  // Delete the service
  const result = await LeadService.findByIdAndDelete(leadServiceId);
  return result;
};

//  update api

// const updateLeadServiceAnswersIntoDB = async (
//   leadServiceId: string,
//   answers: IUpdateLeadServiceAnswers[],
// ) => {
//   // console.log('leadServiceId,answers', leadServiceId, answers);
//   const leadService = await LeadService?.findById(leadServiceId);
//   if (!leadService) {
//     return sendNotFoundResponse('Lead service not found');
//   }

//   // Update answers
//   leadService.questions = answers?.map((q) => ({
//     questionId: q.questionId,
//     selectedOptionIds: q.selectedOptionIds,
//   }));

//   await leadService.save();
//   return leadService;
// };

// const updateLeadServiceAnswersIntoDB = async (
//   leadServiceId: string,
//   answers: IUpdateLeadServiceAnswers[],
//   selectedLocationIds?: string[], // optional now
// ) => {
//   console.log('answers',answers)
//   const leadService = await LeadService?.findById(leadServiceId);
//   if (!leadService) {
//     return sendNotFoundResponse('Lead service not found');
//   }

//   console.log('answers',answers)
//   // ✅ Update answers
//   leadService.questions = answers?.map((q) => ({
//     questionId: q.questionId,
//     selectedOptionIds: q.selectedOptionIds,
//   }));

//   // ✅ Only update locations if selectedLocationIds is provided and not empty
//   if (Array.isArray(selectedLocationIds) && selectedLocationIds.length > 0) {
//     const locationDocs = await UserLocationServiceMap.find({
//       _id: { $in: selectedLocationIds },
//     }).select('_id locationGroupId locationType');

//     leadService.locations = locationDocs.map((loc) => ({
//       _id: loc._id,
//       locationGroupId: loc.locationGroupId,
//       locationType: loc.locationType,
//       SelectedLocationId: loc._id,
//     }));
//   }

//   await leadService.save();
//   return leadService;
// };
const updateLeadServiceAnswersIntoDB = async (
  userId: string,
  serviceId: string,
  answers: IUpdateLeadServiceAnswers[],
) => {
  // ✅ Get userProfileId from userId
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }

  // ✅ Build a Map of selected options for each question
  const selectedOptionMap = new Map<string, Set<string>>();
  for (const answer of answers) {
    selectedOptionMap.set(answer.questionId, new Set(answer.selectedOptionIds));
  }

  // ✅ Fetch all existing LeadService records for this user & service
  const allRecords = await LeadService.find({
    userProfileId: userProfile._id,
    serviceId,
  });

  // ✅ Prepare bulk update operations
  const bulkOps = allRecords.map((record) => {
    const qId = record.questionId.toString();
    const oId = record.optionId.toString();
    const isSelected =
      selectedOptionMap.has(qId) && selectedOptionMap.get(qId)!.has(oId);

    return {
      updateOne: {
        filter: { _id: record._id },
        update: { isSelected },
      },
    };
  });

  // ✅ Execute bulk update if needed
  if (bulkOps.length > 0) {
    await LeadService.bulkWrite(bulkOps);
  }

  return { message: 'Lead service answers updated successfully' };
};

export const LeadServiceService = {
  createLeadService,
  getLeadServicesWithQuestions,
  updateLocations,
  toggleOnlineEnabled,
  deleteLeadService,
  updateLeadServiceAnswersIntoDB,
};
