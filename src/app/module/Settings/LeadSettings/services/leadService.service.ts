import mongoose, { Types } from 'mongoose';
import { sendNotFoundResponse } from '../../../../errors/custom.error';

import UserProfile from '../../../User/models/user.model';
import {
  ILeadService,
  IUpdateLeadServiceAnswers,
} from '../interfaces/leadService.interface';
import LeadService from '../models/leadService.model';
import { validateObjectId } from '../../../../utils/validateObjectId';
import ServiceWiseQuestion from '../../../Service/Question/models/ServiceWiseQuestion.model';

const createLeadService = async (
  userId: string,
  payload: {
    serviceIds: Types.ObjectId[];
    locations: string[];
    onlineEnabled: boolean;
  },
) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');
  if (!userProfile) sendNotFoundResponse('User profile not found');

  payload.serviceIds.forEach((id) =>
    validateObjectId(id.toString(), 'service'),
  );

  const objectServiceIds = payload.serviceIds.map(
    (id) => new mongoose.Types.ObjectId(id),
  );

  const existing = await LeadService.find({
    userProfileId: userProfile?._id,
    serviceId: { $in: objectServiceIds },
  }).select('serviceId');

  const existingServiceIds = new Set(
    existing.map((e) => e.serviceId.toString()),
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

  // Fetch questions for each new service and attach with empty selectedOptionIds
  const allQuestions = await ServiceWiseQuestion.find({
    serviceId: { $in: newServiceIds },
    deletedAt: null,
  }).select('_id serviceId');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupedQuestions: Record<string, any[]> = {};
  allQuestions.forEach((q) => {
    const serviceIdStr = q.serviceId.toString();
    if (!groupedQuestions[serviceIdStr]) groupedQuestions[serviceIdStr] = [];
    groupedQuestions[serviceIdStr].push({
      questionId: q._id,
      selectedOptionIds: [],
    });
  });

  const newLeadServices = newServiceIds.map((serviceId) => ({
    serviceId,
    userProfileId: userProfile?._id,
    locations: payload.locations,
    onlineEnabled: payload.onlineEnabled,
    questions: groupedQuestions[serviceId.toString()] || [],
  }));

  const created = await LeadService.insertMany(newLeadServices);
  return created;
};

const getLeadServicesWithQuestions = async (userId: string) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');
  if (!userProfile) sendNotFoundResponse('User profile not found');

  const leadServices = await LeadService.aggregate([
    { $match: { userProfileId: userProfile?._id } },
    {
      $addFields: {
        originalQuestions: '$questions', // preserve leadService.questions
      },
    },
    {
      $lookup: {
        from: 'services',
        localField: 'serviceId',
        foreignField: '_id',
        as: 'service',
      },
    },
    { $unwind: '$service' },
    {
      $lookup: {
        from: 'questions',
        let: { serviceId: '$service._id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$serviceId', '$$serviceId'] },
              deletedAt: null,
            },
          },
          {
            $lookup: {
              from: 'options',
              localField: '_id',
              foreignField: 'questionId',
              as: 'options',
            },
          },
          {
            $project: {
              _id: 1,
              question: 1,
              slug: 1,
              questionType: 1,
              options: { _id: 1, name: 1, slug: 1 },
            },
          },
        ],
        as: 'questions',
      },
    },
    {
      $addFields: {
        questions: {
          $map: {
            input: '$questions',
            as: 'q',
            in: {
              $mergeObjects: [
                '$$q',
                {
                  selectedOptionIds: {
                    $let: {
                      vars: {
                        matched: {
                          $first: {
                            $filter: {
                              input: '$originalQuestions',
                              as: 'oq',
                              cond: {
                                $eq: ['$$oq.questionId', '$$q._id'],
                              },
                            },
                          },
                        },
                      },
                      in: {
                        $ifNull: ['$$matched.selectedOptionIds', []],
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $project: {
        serviceName: '$service.name',
        serviceId: '$service._id',
        locations: 1,
        onlineEnabled: 1,
        questions: 1,
      },
    },
  ]);

  return leadServices;
};

const updateLocations = async (
  serviceId: string,
  locations: string[],
): Promise<ILeadService | null> => {
  // Validate ObjectId format
  validateObjectId(serviceId, 'lead Service ID');
  return await LeadService.findByIdAndUpdate(
    serviceId,
    { locations },
    { new: true },
  );
};

// Toggle online status
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

//  udate api

const updateLeadServiceAnswersIntoDB = async (
  leadServiceId: string,
  answers: IUpdateLeadServiceAnswers[],
) => {
  // console.log('leadServiceId,answers', leadServiceId, answers);
  const leadService = await LeadService.findById(leadServiceId);
  if (!leadService) {
    return sendNotFoundResponse('Lead service not found');
  }

  // Update answers
  leadService.questions = answers?.map((q) => ({
    questionId: q.questionId,
    selectedOptionIds: q.selectedOptionIds,
  }));

  await leadService.save();
  return leadService;
};

export const LeadServiceService = {
  createLeadService,
  getLeadServicesWithQuestions,
  updateLocations,
  toggleOnlineEnabled,
  deleteLeadService,
  updateLeadServiceAnswersIntoDB,
};
