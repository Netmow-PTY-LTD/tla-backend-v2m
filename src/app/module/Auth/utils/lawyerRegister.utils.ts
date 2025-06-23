import mongoose, { Types } from 'mongoose';
import UserProfile from '../../User/models/user.model';
import { sendNotFoundResponse } from '../../../errors/custom.error';
import { validateObjectId } from '../../../utils/validateObjectId';
import ServiceWiseQuestion from '../../Question/models/ServiceWiseQuestion.model';
import Option from '../../Option/models/option.model';
import LeadService from '../../LeadSettings/models/leadService.model';

export const createLeadService = async (
  userId: string,
  serviceIds: Types.ObjectId[],
  session?: mongoose.ClientSession,
) => {
  // 1. Find user profile by userId
  const userProfile = await UserProfile.findOne({ user: userId })
    .select('_id serviceIds')
    .session(session || null);

  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }

  // 2. Validate all serviceIds
  serviceIds.forEach((id) => validateObjectId(id.toString(), 'service'));

  // 3. Compare with existing serviceIds in userProfile
  const existingServiceIds = new Set(
    (userProfile.serviceIds || []).map((id: Types.ObjectId) => id.toString()),
  );

  const newServiceIds = serviceIds.filter(
    (id) => !existingServiceIds.has(id.toString()),
  );

  // 4. If all services already exist, return conflict response
  if (newServiceIds.length === 0) {
    throw {
      status: 409,
      message: 'All selected services already exist for this user',
      duplicates: Array.from(existingServiceIds),
    };
  }

  // 5. Append and save new serviceIds
  userProfile.serviceIds = userProfile.serviceIds || [];
  userProfile.serviceIds.push(...newServiceIds);
  await userProfile.save({ session });

  // 6. Create lead service entries
  for (const serviceId of newServiceIds) {
    const questions = await ServiceWiseQuestion.find({ serviceId }).session(
      session ?? null,
    );

    for (const question of questions) {
      const options = await Option.find({
        questionId: question._id,
        serviceId,
      }).session(session ?? null);

      const leadServiceInserts = options.map((option) => ({
        userProfileId: userProfile._id,
        serviceId,
        questionId: question._id,
        optionId: option._id,
        isSelected: true,
      }));

      if (leadServiceInserts.length) {
        await LeadService.insertMany(leadServiceInserts, { session });
      }
    }
  }

  return {
    userProfileId: userProfile._id,
    newServiceIds,
  };
};
