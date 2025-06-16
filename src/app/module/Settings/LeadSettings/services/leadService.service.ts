/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
import { sendNotFoundResponse } from '../../../../errors/custom.error';

import UserProfile from '../../../User/models/user.model';
import {
  ILeadService,
  IUpdateLeadServiceAnswers,
  IUserLocationServiceMap,
} from '../interfaces/leadService.interface';
import LeadService from '../models/leadService.model';
import { validateObjectId } from '../../../../utils/validateObjectId';
import ServiceWiseQuestion from '../../../Service/Question/models/ServiceWiseQuestion.model';
import { UserLocationServiceMap } from '../models/UserLocationServiceMap.model';

import Option from '../../../Service/Option/models/option.model';
import ZipCode from '../../../Geo/Country/models/zipcode.model';

const createLeadService = async (
  userId: string,
  payload: {
    serviceIds: Types.ObjectId[];
  },
) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // 1. Find user profile
      const userProfile = await UserProfile.findOne({ user: userId })
        .select('_id serviceIds country')
        .session(session);

      if (!userProfile) {
        sendNotFoundResponse('User profile not found');
        return;
      }

      // 2. Validate service IDs
      payload.serviceIds.forEach((id) =>
        validateObjectId(id.toString(), 'service'),
      );

      const objectServiceIds = payload.serviceIds.map(
        (id) => new mongoose.Types.ObjectId(id),
      );

      // 3. Filter only new service IDs
      const existingServiceIds = new Set(
        userProfile?.serviceIds?.map((id) => id.toString()),
      );

      const newServiceIds = objectServiceIds.filter(
        (id) => !existingServiceIds.has(id.toString()),
      );

      if (newServiceIds.length === 0) {
        throw {
          status: 409,
          message: 'All selected services already exist for this user',
          duplicates: Array.from(existingServiceIds),
        };
      }

      const successfulServiceIds: Types.ObjectId[] = [];

      // 4. Create LeadService documents for each new service
      for (const serviceId of newServiceIds) {
        const questions = await ServiceWiseQuestion.find({ serviceId }).session(
          session,
        );

        let totalCreated = 0;

        for (const question of questions) {
          const options = await Option.find({
            questionId: question._id,
            serviceId,
          }).session(session);

          if (options.length > 0) {
            const docs = options.map((option) => ({
              userProfileId: userProfile._id,
              serviceId,
              questionId: question._id,
              optionId: option._id,
              isSelected: true,
            }));

            const result = await LeadService.insertMany(docs, { session });
            totalCreated += result.length;
          }
        }

        if (totalCreated > 0) {
          successfulServiceIds.push(serviceId);
        }
      }

      // 5. Update userProfile.serviceIds
      if (successfulServiceIds.length > 0) {
        userProfile.serviceIds.push(...successfulServiceIds);
        await userProfile.save({ session });
      }

      // 6. Update UserLocationServiceMap
      const locationGroup = await ZipCode.findOne({
        countryId: userProfile.country,
        zipCodeType: 'default',
      }).session(session);

      if (!locationGroup) {
        throw {
          status: 404,
          message: 'Default location group not found',
        };
      }

      await UserLocationServiceMap.findOneAndUpdate(
        {
          userProfileId: userProfile._id,
          locationGroupId: locationGroup._id,
          locationType: 'nation_wide',
        },
        {
          $addToSet: {
            serviceIds: { $each: successfulServiceIds },
          },
        },
        {
          upsert: true,
          new: true,
          session,
        },
      );
    });

    return {
      success: true,
      message: 'Lead services created and profile updated successfully',
    };
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

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
  }).populate({
    path: 'locationGroupId',
    populate: {
      path: 'countryId',
      model: 'Country',
    },
  });

  return {
    service,
    locations,
  };
};

// const updateLocations = async (

const updateLocations = async (
  userId: string,
  locations: Partial<IUserLocationServiceMap>,
) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');
  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }

  if (!locations.locationGroupId || !locations.locationType) {
    throw new Error(
      'Both locationGroupId and locationType are required to update location',
    );
  }

  const result = await UserLocationServiceMap.findOneAndUpdate(
    {
      userProfileId: userProfile._id,
      locationGroupId: locations.locationGroupId,
      locationType: locations.locationType,
    },
    {
      $set: {
        ...locations,
        userProfileId: userProfile._id,
      },
    },
    {
      new: true,
      upsert: true, // create if not exists
      setDefaultsOnInsert: true,
    },
  );

  return result;
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

export const deleteLeadService = async (userId: string, serviceId: string) => {
  // ✅ Validate ObjectId format
  validateObjectId(serviceId, 'Service ID');

  // ✅ 1. Fetch user profile
  const userProfile = await UserProfile.findOne({ user: userId }).select(
    '_id serviceIds',
  );
  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }

  // ✅ 2. Delete all LeadService records for this user and service
  const deleteResult = await LeadService.deleteMany({
    userProfileId: userProfile._id,
    serviceId: new mongoose.Types.ObjectId(serviceId),
  });

  // ✅ 3. Check if any were deleted
  if (deleteResult.deletedCount === 0) {
    return sendNotFoundResponse(
      'No lead service entries found for this service.',
    );
  }

  // ✅ 4. Remove serviceId from userProfile.serviceIds array
  await UserProfile.updateOne(
    { _id: userProfile._id },
    { $pull: { serviceIds: new mongoose.Types.ObjectId(serviceId) } },
  );

  await UserLocationServiceMap.findOneAndUpdate(
    { userProfileId: userProfile._id },
    { $pull: { serviceIds: serviceId } },
  );
  return {
    message: `Deleted ${deleteResult.deletedCount} lead service record(s) and removed serviceId from user profile.`,
  };
};

const updateLeadServiceAnswersIntoDB = async (
  userId: string,
  serviceId: string,
  answers: IUpdateLeadServiceAnswers[],
  selectedLocationData: Array<{
    locationsId: string;
    serviceIds: string[];
  }>,
  selectedOptionExtraData: Array<{
    questionId: string;
    optionId: string;
    idExtraData: string;
  }>,
) => {
  // ✅ Find the associated user profile
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }

  const selectedOptionMap = new Map<string, Set<string>>();
  for (const answer of answers) {
    const questionIdStr = answer.questionId.toString(); // Convert ObjectId to string
    const selectedOptionIdsStr = answer.selectedOptionIds.map((id) =>
      id.toString(),
    ); // Convert all OptionIds to string

    selectedOptionMap.set(questionIdStr, new Set(selectedOptionIdsStr));
  }

  // ✅ Create a lookup map for extraData
  const extraDataMap = new Map<string, string>(); // key = `${questionId}_${optionId}`
  for (const extra of selectedOptionExtraData || []) {
    const key = `${extra.questionId}_${extra.optionId}`;
    extraDataMap.set(key, extra.idExtraData);
  }

  // ✅ Get all existing LeadService records for this user and service
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

    const updateData: any = { isSelected };

    // ✅ Check if extraData should be added
    const extraKey = `${qId}_${oId}`;
    if (extraDataMap.has(extraKey)) {
      updateData.idExtraData = extraDataMap.get(extraKey);
    }

    return {
      updateOne: {
        filter: { _id: record._id },
        update: updateData,
      },
    };
  });

  // ✅ Execute in bulk if there's anything to update
  if (bulkOps.length > 0) {
    await LeadService.bulkWrite(bulkOps);
  }

  // ✅ Update location-service mappings
  if (Array.isArray(selectedLocationData) && selectedLocationData.length > 0) {
    for (const location of selectedLocationData) {
      const { locationsId, serviceIds } = location;
      await UserLocationServiceMap.findOneAndUpdate(
        { _id: locationsId },
        { serviceIds },
        { new: true, upsert: false }, // Avoid creating new if not found
      );
    }
  }

  return { message: 'Lead service answers and locations updated successfully' };
};

export const LeadServiceService = {
  createLeadService,
  getLeadServicesWithQuestions,
  updateLocations,
  toggleOnlineEnabled,
  deleteLeadService,
  updateLeadServiceAnswersIntoDB,
};
