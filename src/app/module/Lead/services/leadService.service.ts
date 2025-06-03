import mongoose, { Types } from 'mongoose';
import { sendNotFoundResponse } from '../../../errors/custom.error';

import UserProfile from '../../User/models/user.model';
import { ILeadService } from '../interfaces/leadService.interface';
import LeadService from '../models/leadService.model';
import { validateObjectId } from '../../../utils/validateObjectId';

const createLeadService = async (
  userId: string,
  payload: {
    serviceIds: Types.ObjectId[];
    locations: string[];
    onlineEnabled: boolean;
  },
): Promise<ILeadService[]> => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');
  if (!userProfile) sendNotFoundResponse('User profile not found');

  // Validate each serviceId
  payload.serviceIds.forEach((id) =>
    validateObjectId(id.toString(), 'service'),
  );

  // Convert to ObjectId instances
  const objectServiceIds = payload.serviceIds.map(
    (id) => new mongoose.Types.ObjectId(id),
  );

  // Check for duplicates
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

  if (existingServiceIds.size > 0) {
    throw {
      status: 409,
      message: 'Some services already exist for this user',
      duplicates: Array.from(existingServiceIds),
    };
  }

  const newLeadServices = newServiceIds.map((serviceId) => ({
    serviceId,
    locations: payload.locations,
    onlineEnabled: payload.onlineEnabled,
    userProfileId: userProfile?._id,
  }));

  const created = await LeadService.insertMany(newLeadServices);
  return created as ILeadService[];
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
        serviceName: '$serviceId.name',
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

export const deleteLeadService = async (
  leadServiceId: string,
): Promise<{ message: string }> => {
  // Validate ObjectId format
  validateObjectId(leadServiceId, 'lead Service ID');

  // Check if the service exists
  const service = await LeadService.findById(leadServiceId);
  if (!service) {
    sendNotFoundResponse('Lead service not found');
  }

  // Delete the service
  await LeadService.findByIdAndDelete(leadServiceId);

  return { message: 'Lead service successfully deleted' };
};

export const LeadServiceService = {
  createLeadService,
  getLeadServicesWithQuestions,
  updateLocations,
  toggleOnlineEnabled,
  deleteLeadService,
};
