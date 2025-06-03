import mongoose from 'mongoose';
import { sendNotFoundResponse } from '../../../errors/custom.error';
import { IServiceWiseQuestion } from '../../Service/Question/interfaces/ServiceWiseQuestion.interface';
import ServiceWiseQuestion from '../../Service/Question/models/ServiceWiseQuestion.model';
import UserProfile from '../../User/models/user.model';
import { ILeadService } from '../interfaces/leadService.interface';
import LeadService from '../models/leadService.model';

// Create a new lead service
const createLeadService = async (
  userId: string,
  payload: ILeadService,
): Promise<ILeadService> => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');
  if (!userProfile) sendNotFoundResponse('User profile not found');
  const exists = await LeadService.findOne({
    userProfileId: userProfile?._id,
    serviceId: payload.serviceId,
  });
  if (exists) throw new Error('Service already exists');

  return await LeadService.create({
    ...payload,
    userProfileId: userProfile?._id,
  });
};

const getLeadServicesWithQuestions = async (userId: string) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');
  if (!userProfile) sendNotFoundResponse('User profile not found');

  const leadServices = await LeadService.aggregate([
    {
      $match: {
        userProfileId: new mongoose.Types.ObjectId(userProfile?._id),
      },
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
    {
      $lookup: {
        from: 'questions',
        let: { serviceId: '$serviceId._id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$serviceId', '$$serviceId'] },
              deletedAt: null,
            },
          },
          {
            $lookup: {
              from: 'options', // Assuming options are stored in a separate collection
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
              order: 1,
              options: {
                _id: 1,
                name: 1,
                slug: 1,
              },
            },
          },
        ],
        as: 'serviceId.questions',
      },
    },
    {
      $project: {
        _id: 1,
        userProfileId: 1,
        serviceName: 1,
        locations: 1,
        onlineEnabled: 1,
        serviceId: {
          _id: 1,
          name: 1,
          slug: 1,
          questions: 1,
          defaultSelectedOptions: 1,
        },
      },
    },
  ]);

  return leadServices;
};

// Update service locations
const updateLocations = async (
  serviceId: string,
  locations: string[],
): Promise<ILeadService | null> => {
  return await LeadService.findByIdAndUpdate(
    serviceId,
    { locations },
    { new: true },
  );
};

// Toggle online status
const toggleOnlineEnabled = async (
  serviceId: string,
  onlineEnabled: boolean,
): Promise<ILeadService | null> => {
  return await LeadService.findByIdAndUpdate(
    serviceId,
    { onlineEnabled },
    { new: true },
  );
};

// Delete service and soft-delete its questions
const deleteLeadService = async (
  serviceId: string,
): Promise<{ message: string }> => {
  await LeadService.findByIdAndDelete(serviceId);
  await ServiceWiseQuestion.updateMany(
    { serviceId },
    { $set: { deletedAt: new Date() } },
  );
  return { message: 'Service and its questions removed' };
};

export const LeadServiceService = {
  createLeadService,
  getLeadServicesWithQuestions,
  updateLocations,
  toggleOnlineEnabled,
  deleteLeadService,
};
