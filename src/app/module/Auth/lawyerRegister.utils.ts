import mongoose, { Types } from 'mongoose';
import UserProfile from '../User/models/user.model';
import { sendNotFoundResponse } from '../../errors/custom.error';
import { validateObjectId } from '../../utils/validateObjectId';
import ServiceWiseQuestion from '../Question/models/ServiceWiseQuestion.model';
import Option from '../Option/models/option.model';
import LeadService from '../LeadSettings/leadService.model';



export  const createLeadService = async (
  userId: Types.ObjectId,
  serviceIds: Types.ObjectId[],
  session?: mongoose.ClientSession,
) => {
  // 1. Find user profile
  const userProfile = await UserProfile.findOne({ user: userId })
    .select('_id serviceIds country')
    .session(session ?? null);

  if (!userProfile) {
    sendNotFoundResponse('User profile not found');
    return;
  }

  // 2. Validate service IDs
  serviceIds.forEach((id) =>
    validateObjectId(id.toString(), 'service'),
  );

  // 3. Filter only new service IDs
  const existingServiceIds = new Set(
    (userProfile.serviceIds || []).map((id: Types.ObjectId) =>
      id.toString(),
    ),
  );

  const newServiceIds = serviceIds.filter(
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

  // 4. Get all questions for new services
  const allQuestions = await ServiceWiseQuestion.find({
    serviceId: { $in: newServiceIds },
  })
    .select('_id serviceId')
    .session(session ?? null);

  // 5. Group questions by serviceId
  const questionsByServiceId = new Map<
    string,
    { _id: Types.ObjectId }[]
  >();

  for (const question of allQuestions) {
    const serviceIdStr = question.serviceId.toString();
    if (!questionsByServiceId.has(serviceIdStr)) {
      questionsByServiceId.set(serviceIdStr, []);
    }
    questionsByServiceId.get(serviceIdStr)!.push({ _id: question._id });
  }

  // 6. Build match pairs
  const matchPairs = allQuestions.map((q) => ({
    questionId: q._id,
    serviceId: q.serviceId,
  }));

  // 7. Get options by (questionId + serviceId)
  const allOptions = await Option.find({
    $or: matchPairs,
  })
    .select('_id questionId serviceId')
    .session(session ?? null);

  // 8. Group options by questionId (string-keyed map for consistency)
  const optionsByQuestionId = new Map<
    string,
    { _id: Types.ObjectId; serviceId: Types.ObjectId }[]
  >();

  for (const option of allOptions) {
    const questionIdStr = option.questionId.toString();
    if (!optionsByQuestionId.has(questionIdStr)) {
      optionsByQuestionId.set(questionIdStr, []);
    }
    optionsByQuestionId.get(questionIdStr)!.push({
      _id: option._id,
      serviceId: option.serviceId,
    });
  }

  // 9. Build LeadService docs and insert
  for (const serviceId of newServiceIds) {
    const questions = questionsByServiceId.get(serviceId.toString()) || [];

    const docs = questions.flatMap((question) => {
      const options = optionsByQuestionId.get(question._id.toString()) || [];

      return options
        .filter((option) => option.serviceId.equals(serviceId))
        .map((option) => ({
          userProfileId: userProfile._id,
          serviceId,
          questionId: question._id,
          optionId: option._id,
          isSelected: true,
        }));
    });

    if (docs.length > 0) {
      await LeadService.insertMany(docs, { session });
      successfulServiceIds.push(serviceId);

    }
  }

  // . Update userProfile.serviceIds
  if (successfulServiceIds.length > 0) {
    userProfile.serviceIds = [
      ...(userProfile.serviceIds || []),
      ...successfulServiceIds,
    ];
    await userProfile.save({ session });
  }



  return {
    userProfileId: userProfile._id,
    newServiceIds,
  };

};
