import mongoose, { Types } from 'mongoose';
import UserProfile from '../User/user.model';
import { sendNotFoundResponse } from '../../errors/custom.error';
import { validateObjectId } from '../../utils/validateObjectId';
import ServiceWiseQuestion from '../Question/question.model';
import Option from '../Option/option.model';
import LeadService from '../LeadSettings/leadService.model';



export const createLeadService = async (
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
    countryId: userProfile.country,
    serviceId: { $in: newServiceIds },
  })
    .select('_id serviceId countryId')
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
    countryId: q.countryId
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
          countryId: userProfile.country,
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



export const updateLeadService = async (
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

  // 3. Determine Services to Add and Remove
  const currentServiceIds = new Set(
    (userProfile.serviceIds || []).map((id: Types.ObjectId) =>
      id.toString(),
    ),
  );

  const incomingServiceIds = new Set(
    serviceIds.map((id) => id.toString())
  );

  const servicesToAdd = serviceIds.filter(
    (id) => !currentServiceIds.has(id.toString())
  );

  const servicesToRemove = (userProfile.serviceIds || []).filter(
    (id: Types.ObjectId) => !incomingServiceIds.has(id.toString())
  );


  // 4. Remove Services
  if (servicesToRemove.length > 0) {
    await LeadService.deleteMany({
      userProfileId: userProfile._id,
      serviceId: { $in: servicesToRemove }
    }, { session });
  }

  // 5. Add New Services
  if (servicesToAdd.length > 0) {
    const successfulServiceIds: Types.ObjectId[] = [];

    // Get all questions for new services
    const allQuestions = await ServiceWiseQuestion.find({
      countryId: userProfile.country,
      serviceId: { $in: servicesToAdd },
    })
      .select('_id serviceId countryId')
      .session(session ?? null);

    // Group questions by serviceId
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

    // Build match pairs
    const matchPairs = allQuestions.map((q) => ({
      questionId: q._id,
      serviceId: q.serviceId,
      countryId: q.countryId
    }));

    // Get options by (questionId + serviceId)
    const allOptions = await Option.find({
      $or: matchPairs,
    })
      .select('_id questionId serviceId')
      .session(session ?? null);

    // Group options by questionId
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

    // Build LeadService docs and insert
    for (const serviceId of servicesToAdd) {
      const questions = questionsByServiceId.get(serviceId.toString()) || [];

      const docs = questions.flatMap((question) => {
        const options = optionsByQuestionId.get(question._id.toString()) || [];

        return options
          .filter((option) => option.serviceId.equals(serviceId))
          .map((option) => ({
            countryId: userProfile.country,
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
  }


  // 6. Update userProfile.serviceIds
  // We strictly set it to the incoming serviceIds to ensure sync
  userProfile.serviceIds = serviceIds;
  await userProfile.save({ session });


  return {
    userProfileId: userProfile._id,
    added: servicesToAdd,
    removed: servicesToRemove
  };

};
