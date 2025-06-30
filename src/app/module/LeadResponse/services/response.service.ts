/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { validateObjectId } from '../../../utils/validateObjectId';
import UserProfile from '../../User/models/user.model';
import { sendNotFoundResponse } from '../../../errors/custom.error';
import CountryWiseServiceWiseField from '../../CountryWiseMap/models/countryWiseServiceWiseFields.model';
import { customCreditLogic } from '../utils/customCreditLogic';
import { ILeadResponse } from '../interfaces/response.interface';

import { LeadServiceAnswer } from '../../Lead/models/leadServiceAnswer.model';
import LeadResponse from '../models/response.model';

const CreateResponseIntoDB = async (userId: string, payload: any) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userProfile = await UserProfile.findOne({ user: userId })
      .select('_id')
      .session(session);

    if (!userProfile) {
      await session.abortTransaction();
      session.endSession();
      return sendNotFoundResponse('User profile not found');
    }

    const { leadId, questions, serviceId, additionalDetails } = payload;

    const [responseUser] = await LeadResponse.create(
      [
        {
          leadId: leadId,
          userProfileId: userProfile._id,
          serviceId,
          additionalDetails,
        },
      ],
      { session },
    );

    const responseDocs: any[] = [];

    for (const q of questions) {
      const questionId = q.questionId;
      for (const opt of q.checkedOptionsDetails) {
        responseDocs.push({
          leadId: leadId,
          serviceId,
          questionId,
          optionId: opt.id,
          isSelected: opt.is_checked,
          idExtraData: opt.idExtraData || '',
        });
      }
    }

    if (responseDocs.length > 0) {
      await LeadServiceAnswer.insertMany(responseDocs, { session });
    }

    await session.commitTransaction();
    session.endSession();

    return responseUser;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating response with transaction:', error);
    throw error;
  }
};

const getAllResponseFromDB = async () => {
  try {
    const pipeline = [
      // Stage 1: Filter active leads
      { $match: { deletedAt: null } },

      // Stage 2: Lookup userProfile data (replaces populate)
      {
        $lookup: {
          from: 'userprofiles',
          localField: 'userProfileId',
          foreignField: '_id',
          as: 'userProfileData',
        },
      },
      { $unwind: '$userProfileData' },

      // Stage 3: Lookup service data (replaces populate)
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'serviceData',
        },
      },
      { $unwind: '$serviceData' },

      // Stage 4: Lookup credit information
      {
        $lookup: {
          from: 'countrywiseservicewisefields',
          let: {
            countryId: '$userProfileData.country',
            serviceId: '$serviceId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$countryId', '$$countryId'] },
                    { $eq: ['$serviceId', '$$serviceId'] },
                    { $eq: ['$deletedAt', null] },
                  ],
                },
              },
            },
          ],
          as: 'creditInfo',
        },
      },

      // Stage 5: Shape the output to match your original format
      {
        $project: {
          _id: 1,
          userProfileId: {
            _id: '$userProfileData._id',
            user: '$userProfileData.user',
            name: '$userProfileData.name',
            activeProfile: '$userProfileData.activeProfile',
            country: '$userProfileData.country',
            deletedAt: '$userProfileData.deletedAt',
            credits: '$userProfileData.credits',
            paymentMethods: '$userProfileData.paymentMethods',
            autoTopUp: '$userProfileData.autoTopUp',
            serviceIds: '$userProfileData.serviceIds',
            createdAt: '$userProfileData.createdAt',
            updatedAt: '$userProfileData.updatedAt',
            address: '$userProfileData.address',
            bio: '$userProfileData.bio',
            phone: '$userProfileData.phone',
            profilePicture: '$userProfileData.profilePicture',
          },
          serviceId: {
            _id: '$serviceData._id',
            name: '$serviceData.name',
            slug: '$serviceData.slug',
            deletedAt: '$serviceData.deletedAt',
            createdAt: '$serviceData.createdAt',
            updatedAt: '$serviceData.updatedAt',
          },
          additionalDetails: 1,
          deletedAt: 1,
          createdAt: 1,
          updatedAt: 1,
          credit: {
            $ifNull: [{ $arrayElemAt: ['$creditInfo.baseCredit', 0] }, 0],
          },
          creditSource: {
            $cond: {
              if: { $gt: [{ $size: '$creditInfo' }, 0] },
              then: 'CountryServiceField',
              else: 'Default',
            },
          },
        },
      },
    ];

    const result = await LeadResponse.aggregate(pipeline);

    const combineCredit = result.map((response) => ({
      ...response,
      credit: customCreditLogic(response.credit),
    }));
    return combineCredit;
  } catch (error) {
    console.error('Aggregation error:', error);
    throw error;
  }
};

const getMyAllResponseFromDB = async (userId: string) => {
  const userProfile = await UserProfile.findOne({ user: userId }).select('_id');
  if (!userProfile) {
    return sendNotFoundResponse('User profile not found');
  }

  const responses = await LeadResponse.find({
    userProfileId: userProfile?._id,
    deletedAt: null,
  })
    .populate('userProfileId')
    .populate('serviceId');
  return responses;
};

const getSingleResponseFromDB = async (leadId: string) => {
  validateObjectId(leadId, 'Response');

  const responseDoc = await LeadResponse.findOne({
    _id: leadId,
    deletedAt: null,
  })
    .populate({
      path: 'userProfileId',
      populate: {
        path: 'user',
      },
    })
    .populate({
      path: 'serviceId',
    })
    .lean(); // Convert to plain JS object

  if (!responseDoc) return null;

  // 2. Fetch credit information in parallel
  const [creditInfo] = await Promise.all([
    CountryWiseServiceWiseField.findOne({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      countryId: (responseDoc.userProfileId as any).country,
      serviceId: responseDoc.serviceId._id,
      deletedAt: null,
    }).lean(),

    // Add other parallel queries here if needed
  ]);

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

  return {
    ...responseDoc,
    leadAnswers,
    credit: creditInfo?.baseCredit ?? 0,
    creditSource: creditInfo ? 'CountryServiceField' : 'Default',
  };
};

const updateResponseIntoDB = async (
  id: string,
  payload: Partial<ILeadResponse>,
) => {
  validateObjectId(id, 'Response');
  const result = await LeadResponse.findOneAndUpdate(
    { _id: id, deletedAt: null },
    payload,
    {
      new: true,
    },
  );
  return result;
};

const deleteResponseFromDB = async (id: string) => {
  validateObjectId(id, 'Response');
  const deletedAt = new Date().toISOString();

  const result = await LeadResponse.findByIdAndUpdate(
    id,
    { deletedAt: deletedAt },
    {
      new: true,
    },
  );
  return result;
};

export const responseService = {
  CreateResponseIntoDB,
  getAllResponseFromDB,
  getSingleResponseFromDB,
  updateResponseIntoDB,
  deleteResponseFromDB,
  getMyAllResponseFromDB,
};
